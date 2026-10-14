"""C11/C12 acceptance: official schema, actual signup/storage and migrated representation."""
from pathlib import Path
import sys, json, re, tempfile
from contextlib import closing
import sqlite3
from jsonschema import Draft7Validator, FormatChecker
from engine.pipeline import scan
from evidence import cbom, read_leak
from scan_jobs import ROOT
sys.path.insert(0,str(ROOT/'core/demo-shop'))
from app import create_app
from migrate_to_after import migrate
from storage import connect

schema=json.loads((Path(__file__).parent/'schemas/bom-1.6.schema.json').read_text(encoding='utf-8'))
validator=Draft7Validator(schema,format_checker=FormatChecker())
for mode, expected in [('before', {'MD5','RSA'}),('after', {'Argon2id','AES-256-GCM','ML-KEM-768'})]:
    result=scan(ROOT/f'core/demo-shop/src_{mode}'); result['id']='acceptance-'+mode
    document=cbom(result); validator.validate(document)
    assert {c['name'] for c in document['components']}==expected
    assert len({c['bom-ref'] for c in document['components']})==len(document['components'])
    if mode=='after':
        kem=next(c for c in document['components'] if c['name']=='ML-KEM-768')
        assert kem['cryptoProperties']['algorithmProperties']['parameterSetIdentifier']=='768'
print('PASS: before/after actual source inventory validates against official CycloneDX 1.6 schema')
with tempfile.TemporaryDirectory(dir=ROOT/'core/.runtime',prefix='leak-acceptance-') as temp:
    db=Path(temp)/'shop.db'; client=create_app(db,testing=True).test_client()
    assert read_leak(db,8)['rows']==[]
    for i in range(2):
        token=re.search(r'name="csrf_token" value="([^"]+)"',client.get('/signup').get_data(as_text=True)).group(1)
        result=client.post('/signup',data={'csrf_token':token,'name':f'Preview Test {i}','phone':'9000000000','email':f'preview{i}@example.test','password':'test-only-123','id_number':'FAKE-ID','address':'Fake address'})
        assert result.status_code==302,result.status_code
    before=read_leak(db,8)
    assert before['rows'][0]['name']=='Preview Test 1' and before['total']==2
    with connect(db) as conn:
        row=dict(conn.execute('SELECT id,name,phone,email,password_hash,id_number,created_at FROM customers ORDER BY id DESC LIMIT 1').fetchone())
    assert before['rows'][0]==row
    assert len(read_leak(db,1)['rows'])==1
    migrate(db)
    after=read_leak(db,8)
    assert after['mode']=='after'
    assert after['rows'][0]['password_hash'].startswith('$argon2id$')
    assert all(after['rows'][0][k].startswith('pqc:v1:') for k in ('email','phone','id_number'))
    assert set(after['rows'][0])=={'id','name','phone','email','password_hash','id_number','created_at'}
print('PASS: fresh signup first, exact database fields, bounded/empty preview and actual migrated ciphertext')

if '--live' in sys.argv:
    import urllib.request
    project=json.load(urllib.request.urlopen('http://localhost:8000/api/projects/p_demo'))
    response=urllib.request.urlopen('http://localhost:8000/api/scans/'+project['scan']['id']+'/cbom')
    assert 'attachment' in response.headers['Content-Disposition']
    validator.validate(json.load(response))
    print('PASS: downloaded completed-scan export validates against official schema')
