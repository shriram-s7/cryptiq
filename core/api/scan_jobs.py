"""Persistent local scan jobs. Candidate scores do not imply verified remediation."""
from concurrent.futures import ThreadPoolExecutor
from contextlib import closing
from datetime import datetime, timezone
import io
import json
from pathlib import Path, PurePosixPath
import sqlite3
import stat
import threading
import uuid
import zipfile

from fastapi import APIRouter, HTTPException, Request
from engine.pipeline import scan

ROOT = Path(__file__).resolve().parents[2]
DATA = ROOT / 'core/.runtime/api'
DB = DATA / 'jobs.db'
SHOP = ROOT / 'core/demo-shop/data/shop.db'
POOL = ThreadPoolExecutor(max_workers=2, thread_name_prefix='scan')
LOCK = threading.Lock()
router = APIRouter()


def connection():
    DATA.mkdir(parents=True, exist_ok=True)
    conn = sqlite3.connect(DB, timeout=10)
    conn.row_factory = sqlite3.Row
    return conn


def initialize():
    with closing(connection()) as conn, conn:
        conn.executescript('''CREATE TABLE IF NOT EXISTS projects(id TEXT PRIMARY KEY, name TEXT NOT NULL, revision INTEGER NOT NULL DEFAULT 0, latest_scan TEXT);
        CREATE TABLE IF NOT EXISTS scans(id TEXT PRIMARY KEY, project_id TEXT NOT NULL, revision INTEGER NOT NULL, payload TEXT NOT NULL);
        INSERT OR IGNORE INTO projects(id,name) VALUES('p_demo','Chennai Organics');''')
        for row in conn.execute('SELECT id,payload FROM scans').fetchall():
            payload = json.loads(row['payload'])
            if payload['status'] == 'running':
                payload.update(status='error', error='Server restarted before the scan completed. Start a new scan.')
                conn.execute('UPDATE scans SET payload=? WHERE id=?', (json.dumps(payload), row['id']))


def project(project_id):
    with closing(connection()) as conn:
        row = conn.execute('SELECT * FROM projects WHERE id=?', (project_id,)).fetchone()
    if row is None: raise HTTPException(404, 'Project not found')
    return dict(row)


def get_scan(scan_id):
    with closing(connection()) as conn:
        row = conn.execute('SELECT payload FROM scans WHERE id=?', (scan_id,)).fetchone()
    if row is None: raise HTTPException(404, 'Scan not found')
    return json.loads(row['payload'])


def save(payload):
    with closing(connection()) as conn, conn:
        conn.execute('UPDATE scans SET payload=? WHERE id=?', (json.dumps(payload), payload['id']))


def active_mode():
    if not SHOP.exists(): raise ValueError('Seed the demo shop first: python core/demo-shop/seed.py')
    with closing(sqlite3.connect(f'{SHOP.as_uri()}?mode=ro', uri=True)) as conn:
        exists = conn.execute("SELECT name FROM sqlite_master WHERE name='metadata'").fetchone()
        value = conn.execute("SELECT value FROM metadata WHERE key='mode'").fetchone()[0] if exists else 'before'
    if value not in ('before','after'): raise ValueError('Unrecognized shop mode')
    return value


def work(scan_id, source_root, database):
    payload = get_scan(scan_id)
    try:
        def report(key, label, count):
            payload['stages'].append({'key': key, 'label': label, 'done': True, 'count': count})
            save(payload)
        result = scan(source_root, database, report)
        with LOCK:
            current = project(payload['projectId'])
            if current['revision'] != payload['revision']:
                raise ValueError('Project changed during scanning; run a new scan.')
            if database and (active_mode() != payload['mode'] or SHOP.stat().st_mtime_ns != payload['databaseVersion']):
                raise ValueError('Shop storage changed during scanning; run a new scan.')
            payload.update(result, status='done')
            save(payload)
            with closing(connection()) as conn, conn:
                # Do not let an older concurrent scan replace a newer project request.
                conn.execute('UPDATE projects SET latest_scan=? WHERE id=? AND revision=?',
                             (scan_id, payload['projectId'], payload['revision']))
    except Exception as error:
        payload.update(status='error', error=str(error), finishedAt=datetime.now(timezone.utc).isoformat())
        save(payload)


def extract_zip(content, scan_id):
    destination = DATA / 'uploads' / scan_id
    try:
        archive = zipfile.ZipFile(io.BytesIO(content))
    except zipfile.BadZipFile:
        raise HTTPException(400, 'Upload must be a valid ZIP archive')
    with archive:
        entries = archive.infolist()
        if len(entries) > 2000 or sum(e.file_size for e in entries) > 100 * 1024 * 1024:
            raise HTTPException(413, 'ZIP exceeds 2,000 files or 100 MB expanded size')
        for entry in entries:
            path = PurePosixPath(entry.filename.replace('\\', '/'))
            if path.is_absolute() or '..' in path.parts or ':' in str(path) or stat.S_ISLNK(entry.external_attr >> 16):
                raise HTTPException(400, 'Unsafe ZIP path or symbolic link')
            if entry.flag_bits & 1 or entry.file_size > 20 * 1024 * 1024:
                raise HTTPException(400, 'Encrypted archives and files larger than 20 MB are unsupported')
        destination.mkdir(parents=True, exist_ok=False)
        total = 0
        for entry in entries:
            if entry.is_dir(): continue
            target = destination.joinpath(*PurePosixPath(entry.filename.replace('\\','/')).parts)
            if not target.resolve().is_relative_to(destination.resolve()): raise HTTPException(400, 'Unsafe ZIP path')
            target.parent.mkdir(parents=True, exist_ok=True)
            with archive.open(entry) as source, target.open('wb') as output:
                while chunk := source.read(65536):
                    total += len(chunk)
                    if total > 100 * 1024 * 1024: raise HTTPException(413, 'Expanded archive too large')
                    output.write(chunk)
    return destination


@router.get('/api/projects/{project_id}')
def read_project(project_id: str):
    value = project(project_id)
    latest = get_scan(value['latest_scan']) if value['latest_scan'] else None
    from verify.checks import published
    verified = project_id == 'p_demo' and published() is not None
    return {'id': project_id, 'name': value['name'], 'revision': value['revision'], 'latestScanId': value['latest_scan'], 'scan': latest, 'verified': verified}


@router.post('/api/projects')
async def create_project(request: Request):
    try: body = await request.json()
    except Exception: raise HTTPException(400, 'Expected JSON project name')
    name = body.get('name', '') if isinstance(body, dict) else ''
    if not isinstance(name, str) or not 1 <= len(name.strip()) <= 100: raise HTTPException(422, 'Name must contain 1–100 characters')
    project_id = 'p_' + uuid.uuid4().hex[:12]
    with closing(connection()) as conn, conn:
        conn.execute('INSERT INTO projects(id,name) VALUES(?,?)', (project_id, name.strip()))
    return {'id': project_id, 'name': name.strip()}


@router.post('/api/projects/{project_id}/scans', status_code=202)
async def start_scan(project_id: str, request: Request):
    project(project_id)
    content = bytearray()
    async for chunk in request.stream():
        content.extend(chunk)
        if len(content) > 20 * 1024 * 1024: raise HTTPException(413, 'Maximum upload size is 20 MB')
    scan_id = 's_' + uuid.uuid4().hex
    is_zip = request.headers.get('content-type', '').split(';')[0] == 'application/zip'
    if is_zip:
        try: source_root = extract_zip(content, scan_id)
        except (zipfile.BadZipFile, RuntimeError, OSError): raise HTTPException(400, 'Could not safely extract ZIP')
        database, mode, source = None, 'before', 'zip'
    else:
        try: body = json.loads(content)
        except (ValueError, UnicodeDecodeError): raise HTTPException(400, 'Send JSON {"source":"demo"} or a ZIP with application/zip')
        if not isinstance(body, dict) or body.get('source') != 'demo': raise HTTPException(422, 'Unknown scan source')
        if project_id != 'p_demo': raise HTTPException(422, 'Demo scan belongs to p_demo; upload a ZIP for this project')
        if (SHOP.parent / '.migration.lock').exists(): raise HTTPException(409, 'Shop migration is active. Retry after it finishes.')
        try: mode = active_mode()
        except ValueError as error: raise HTTPException(409, str(error))
        source_root, database, source = ROOT / f'core/demo-shop/src_{mode}', SHOP, 'demo'
    with LOCK, closing(connection()) as conn, conn:
        # Incrementing the generation invalidates older concurrent scan results.
        conn.execute('UPDATE projects SET revision=revision+1 WHERE id=?', (project_id,))
        revision = conn.execute('SELECT revision FROM projects WHERE id=?', (project_id,)).fetchone()[0]
        payload = {'id': scan_id, 'projectId': project_id, 'revision': revision, 'mode': mode, 'source': source,
                   'databaseVersion': SHOP.stat().st_mtime_ns if database else None,
                   'status': 'running', 'stages': [], 'createdAt': datetime.now(timezone.utc).isoformat()}
        conn.execute('INSERT INTO scans VALUES(?,?,?,?)', (scan_id, project_id, revision, json.dumps(payload)))
        conn.execute('UPDATE projects SET latest_scan=? WHERE id=?', (scan_id, project_id))
    POOL.submit(work, scan_id, source_root, database)
    return {'scanId': scan_id}


@router.get('/api/scans/{scan_id}')
def read_scan(scan_id: str):
    return get_scan(scan_id)
