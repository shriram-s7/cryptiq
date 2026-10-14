from pathlib import Path
import sys
import tempfile
from engine.pipeline import scan
from engine.score import calculate

ROOT = Path(__file__).resolve().parents[2]
before = scan(ROOT / 'core/demo-shop/src_before', ROOT / 'core/demo-shop/data/shop.db')
after = scan(ROOT / 'core/demo-shop/src_after')
assert before['score'] == 38 and before['counts'] == {'critical':3,'high':2,'medium':0,'low':3}
assert after['score'] == 91 and after['counts'] == {'critical':0,'high':1,'medium':0,'low':2}
contradiction = scan(ROOT / 'core/demo-shop/src_after', ROOT / 'core/demo-shop/data/shop.db')
assert contradiction['score'] < 91 and any(f['file']=='data/shop.db' for f in contradiction['findings'])
assert calculate(before['findings'] * 2) == (38, before['counts'])
assert calculate([{'ruleId':str(i),'status':'open','severity':'critical'} for i in range(10)])[0] == 0
assert calculate([dict(f,status='fixed') for f in before['findings']])[0] == 100
assert {a['name'] for a in after['assets']} >= {'Argon2id','AES-256-GCM','ML-KEM-768'}
sys.path.insert(0, str(ROOT / 'core/demo-shop'))
from seed import seed
from storage import connect
from migrate_to_after import migrate
with tempfile.TemporaryDirectory(dir=ROOT / 'core/.runtime', prefix='scoring-') as temp:
    db = Path(temp) / 'sample.db'
    seed(database=db)
    with connect(db) as conn: conn.execute('DELETE FROM customers WHERE id>3')
    migrate(db)
    protected = scan(ROOT / 'core/demo-shop/src_after', db)
    assert protected['score'] == 91 and protected['sampledCustomers'] == 3
print('PASS: before=38, after-source=91, contradictory live DB adds findings, deduplication, clamping, fixed status and actual crypto assets')
print('PASS: after source + actually migrated database produces 91')
