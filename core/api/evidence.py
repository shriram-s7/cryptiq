"""Read-only evidence exports. No keys, seed truth or decrypted fields are read."""
from contextlib import closing
from datetime import datetime, timezone
import json
import sqlite3
import uuid
from pathlib import Path

from fastapi import APIRouter, HTTPException, Query
from fastapi.responses import JSONResponse
import scan_jobs

router = APIRouter()

@router.get('/api/demo/activity')
def demo_activity():
    if (scan_jobs.SHOP.parent / '.migration.lock').exists():
        raise HTTPException(409, 'Shop maintenance in progress; activity resumes after migration')
    path = Path(__file__).resolve().parents[1] / '.runtime' / 'shop-events.json'
    try:
        events = json.loads(path.read_text(encoding='utf-8'))
    except (OSError, ValueError):
        events = []
    # Verification removes its temporary customer/order; do not offer deleted targets.
    if scan_jobs.SHOP.exists():
        with closing(sqlite3.connect(f'{scan_jobs.SHOP.as_uri()}?mode=ro', uri=True)) as conn:
            customers = {row[0] for row in conn.execute('SELECT id FROM customers')}
            orders = {row[0] for row in conn.execute('SELECT id FROM orders')}
        events = [event for event in events if event.get('customerId') in customers
                  and (event.get('kind') != 'checkout' or event.get('orderId') in orders)]
    else:
        events = []
    return JSONResponse({'events': events, 'demoData': True}, headers={'Cache-Control': 'no-store'})


def cbom(result):
    components = []
    seen = set()
    for asset in result['assets']:
        identity = json.dumps([asset['name'], asset['type'], asset['details'], asset['locations']], sort_keys=True)
        if identity in seen:
            continue
        seen.add(identity)
        name = asset['name']
        properties = [
            {'name': 'cryptiq:source-locations', 'value': json.dumps(asset['locations'])},
            {'name': 'cryptiq:quantum-vulnerable', 'value': str(asset['quantumVulnerable']).lower()},
        ]
        details = asset['details']
        crypto = {'assetType': 'algorithm', 'algorithmProperties': {
            'primitive': {'MD5': 'hash', 'RSA': 'pke', 'Argon2id': 'kdf', 'AES-256-GCM': 'ae', 'ML-KEM-768': 'kem'}.get(name, 'unknown')
        }}
        description = 'Source-pattern evidence; does not establish deployment or verification.'
        if name == 'RSA':
            crypto = {'assetType': 'related-crypto-material', 'relatedCryptoMaterialProperties': {'type': 'key'}}
            properties.append({'name': 'cryptiq:key-size-bits', 'value': str(details.get('keySize'))})
            description = 'Deliberately small textbook RSA demo key; classically breakable. No real key material included.'
        elif name == 'ML-KEM-768':
            crypto['algorithmProperties']['parameterSetIdentifier'] = '768'
            description = 'ML-KEM-768 import detected. 768 is the parameter-set identifier, not key length. Demo implementation is educational.'
        elif name == 'AES-256-GCM':
            crypto['algorithmProperties'].update(parameterSetIdentifier='256', mode='gcm')
        elif name == 'MD5':
            description = 'Weak password-storage hash detected. Quantum-vulnerable=false does not mean secure.'
        components.append({'type': 'cryptographic-asset', 'bom-ref': f"{result['id']}:crypto:{len(components)+1}",
                           'name': name, 'description': description, 'cryptoProperties': crypto, 'properties': properties})
    return {'$schema': 'https://cyclonedx.org/schema/bom-1.6.schema.json', 'bomFormat': 'CycloneDX',
            'specVersion': '1.6', 'serialNumber': 'urn:uuid:' + str(uuid.uuid5(uuid.NAMESPACE_URL, result['id'])),
            'version': 1, 'metadata': {'timestamp': result['finishedAt']}, 'components': components,
            'properties': [{'name': 'cryptiq:scan-id', 'value': result['id']},
                           {'name': 'cryptiq:verification', 'value': 'unverified candidate scan'},
                           {'name': 'cryptiq:coverage', 'value': 'Local Python pattern rules; partial inventory'}]}


@router.get('/api/scans/{scan_id}/cbom')
def export_cbom(scan_id: str):
    result = scan_jobs.get_scan(scan_id)
    if result['status'] != 'done':
        raise HTTPException(409, 'Inventory requires a completed scan')
    return JSONResponse(cbom(result), headers={'Content-Disposition': f'attachment; filename="cryptiq-{scan_id}.cdx.json"', 'Cache-Control': 'no-store'})


def read_leak(database, limit, customer_id=None):
    if not database.exists():
        raise HTTPException(409, 'Demo database is unavailable; seed the shop first')
    with closing(sqlite3.connect(f'{database.as_uri()}?mode=ro', uri=True)) as conn:
        conn.row_factory = sqlite3.Row
        conn.execute('BEGIN')
        mode = conn.execute("SELECT value FROM metadata WHERE key='mode'").fetchone()[0]
        total = conn.execute('SELECT count(*) FROM customers').fetchone()[0]
        rows = conn.execute('SELECT id,name,phone,email,password_hash,id_number,created_at FROM customers WHERE (? IS NULL OR id=?) ORDER BY id DESC LIMIT ?', (customer_id, customer_id, limit)).fetchall()
    return {'projectId': 'p_demo', 'demoData': True, 'mode': mode, 'total': total,
            'rows': [dict(row) for row in rows], 'newestCustomerId': rows[0]['id'] if rows else None,
            'capturedAt': datetime.now(timezone.utc).isoformat(),
            'notice': 'Actual fake demo records, exactly as stored. No decryption or password attack performed.'}


@router.get('/api/projects/{project_id}/leak-preview')
def leak_preview(project_id: str, limit: int = Query(default=8, ge=1, le=20), customer_id: int | None = Query(default=None, ge=1)):
    scan_jobs.project(project_id)
    if project_id != 'p_demo':
        raise HTTPException(422, 'Leak preview is only available for the local fake demo database')
    if (scan_jobs.SHOP.parent / '.migration.lock').exists():
        raise HTTPException(409, 'Migration in progress; refresh after it finishes')
    return JSONResponse(read_leak(scan_jobs.SHOP, limit, customer_id), headers={'Cache-Control': 'no-store'})
