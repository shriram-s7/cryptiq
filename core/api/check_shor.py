"""C14 real public-key factoring and migrated inventory acceptance."""
from pathlib import Path
import sys,tempfile,time
from attacks.shor_sim import simulate,factor
from scan_jobs import ROOT,SHOP
sys.path.insert(0,str(ROOT/'core/demo-shop'))
from storage import initialize,connect
from src_before.crypto_utils import encrypt_id
from migrate_to_after import migrate
before=simulate(SHOP,5)
assert before['verdict']=='cracked' and any(r['customerId']==1 and r['value']=='DEMO-ID-000001' for r in before['revealed'])
print(f"PASS: public-only factoring recovered{before['cracked']} IDs in{before['durationMs']}ms")
try:factor(2**2048-1,time.monotonic()+1)
except ValueError:pass
else:raise AssertionError('Production-size modulus accepted')
try:factor(101*103,time.monotonic()-1)
except TimeoutError:pass
else:raise AssertionError('Expired budget accepted')
with tempfile.TemporaryDirectory(dir=ROOT/'core/.runtime') as folder:
 db=Path(folder)/'shop.db';initialize(db)
 with connect(db) as conn:conn.execute('INSERT INTO customers(name,phone,email,password_hash,id_number,address,created_at) VALUES(?,?,?,?,?,?,?)',('Fake','9000000000','fake@example.test','c4ca4238a0b923820dcc509a6f75849b',encrypt_id('FAKE-ID'),'Fake','2026-10-14'))
 migrate(db);after=simulate(db,1)
 assert after['verdict']=='not_applicable' and not after['revealed']
print('PASS: actual migrated inventory not-applicable; timeout and unsupported key rejected')
