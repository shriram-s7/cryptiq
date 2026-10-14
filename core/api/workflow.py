"""Read model for frontend workflow state and implemented capabilities."""
from contextlib import closing
import json
from fastapi import APIRouter
from fastapi.responses import JSONResponse
import scan_jobs
from verify import checks
from attacks import dictionary

router = APIRouter()


def latest_for(table, project_id, kind=None):
    with closing(scan_jobs.connection()) as conn:
        rows = conn.execute(f'SELECT payload FROM {table} ORDER BY rowid DESC').fetchall()
    for row in rows:
        value = json.loads(row['payload'])
        if value.get('projectId') == project_id and (kind is None or value.get('kind') == kind):
            return value
    return None


@router.get('/api/projects/{project_id}/workflow')
def workflow(project_id: str):
    project = scan_jobs.project(project_id)
    scan = scan_jobs.get_scan(project['latest_scan']) if project['latest_scan'] else None
    demo = project_id == 'p_demo'
    review = latest_for('reviews', project_id) if demo else None
    verification = latest_for('verifications', project_id) if demo else None
    attacks = {kind: latest_for('attacks', project_id, kind) if demo else None for kind in ('dictionary', 'shor_sim')}
    for kind, attack in attacks.items():
        if attack:
            attacks[kind] = json.loads(dictionary.poll(attack['id']).body)
    mode = scan_jobs.active_mode() if demo else None
    published = checks.published() if demo else None
    maintenance = demo and (scan_jobs.SHOP.parent / '.migration.lock').exists()
    busy = bool(maintenance or (scan and scan['status'] == 'running') or (review and review['status'] == 'merging') or (verification and verification['status'] == 'running') or any(a and a['status'] == 'running' for a in attacks.values()))
    action = 'scan' if not scan else 'wait' if busy else 'report' if published else 'verify' if mode == 'after' else 'review' if any(a and a['status'] == 'done' for a in attacks.values()) else 'attack' if demo else 'findings'
    return JSONResponse({
        'project': {'id': project_id, 'name': project['name'], 'revision': project['revision'], 'mode': mode},
        'scan': scan, 'attacks': attacks, 'review': review, 'verification': verification,
        'verified': bool(published), 'busy': busy, 'nextAction': action,
        'capabilities': {'scan': True, 'sourceZip': True, 'leakPreview': demo, 'dictionary': demo,
            'rsaSimulation': demo, 'reviewFixes': demo and mode == 'before', 'merge': demo and mode == 'before',
            'verify': demo and mode == 'after', 'cbom': bool(scan and scan['status'] == 'done'),
            'evidencePdf': bool(published), 'resetDemo': demo},
        'subscription': {'enforced': False, 'billingAvailable': False},
        'scope': 'Local fake demo operations; uploaded ZIPs support source scanning and inventory only.'
    }, headers={'Cache-Control': 'no-store'})
