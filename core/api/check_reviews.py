"""C15 isolated review/merge acceptance, including concurrency and failure."""
from pathlib import Path
import tempfile,time,threading,hashlib
from fastapi import HTTPException
import scan_jobs
from fixes import reviews
from attacks import dictionary
from storage import initialize,connect,mode
from src_before.crypto_utils import encrypt_id

def wait(review_id):
 for _ in range(100):
  value=reviews.read(review_id)
  if value['status']!='merging':return value
  time.sleep(.05)
 raise AssertionError('merge did not terminate')
with tempfile.TemporaryDirectory(dir=scan_jobs.ROOT/'core/.runtime') as temp:
 scan_jobs.DATA=Path(temp);scan_jobs.DB=Path(temp)/'jobs.db';scan_jobs.SHOP=Path(temp)/'shop.db'
 scan_jobs.initialize();dictionary.initialize();reviews.initialize();initialize(scan_jobs.SHOP)
 with connect(scan_jobs.SHOP) as c:c.execute('INSERT INTO customers(name,phone,email,password_hash,id_number,address,created_at) VALUES(?,?,?,?,?,?,?)',('Fake','9000000000','fake@example.test',hashlib.md5(b'chennai123').hexdigest(),encrypt_id('FAKE-ID'),'Fake','2026-10-14'))
 try:reviews.create('p_demo',reviews.Selection(fixes=['fix_argon2']))
 except HTTPException as e:assert e.status_code==422
 else:raise AssertionError('Partial dependent bundle accepted')
 first=reviews.create('p_demo',reviews.Selection());second=reviews.create('p_demo',reviews.Selection())
 config=next(f['diff'] for f in first['files'] if f['path']=='config.py')
 assert '-SESSION_COOKIE_SECURE = False' in config and '+SESSION_COOKIE_SECURE = True' in config
 real=reviews.migrate;gate=threading.Event()
 def delayed(*a,**kw):gate.wait(2);return real(*a,**kw)
 reviews.migrate=delayed
 assert reviews.merge(first['id'])['status']=='merging'
 assert reviews.merge(first['id'])['id']==first['id']
 try:reviews.merge(second['id'])
 except HTTPException as e:assert e.status_code==409
 else:raise AssertionError('Concurrent merge accepted')
 gate.set();merged=wait(first['id']);assert merged['status']=='merged',merged
 assert reviews.merge(first['id'])['status']=='merged'
 with connect(scan_jobs.SHOP) as c:assert c.execute('SELECT phone FROM customers').fetchone()[0].startswith('pqc:v1:')
 assert merged['verified'] is False and mode(scan_jobs.SHOP)=='after'
 # A failing migration leaves before mode intact and never marks verified.
 with connect(scan_jobs.SHOP) as c:c.execute("UPDATE metadata SET value='before' WHERE key='mode'")
 failed=reviews.create('p_demo',reviews.Selection())
 def broken(*a,**k):raise RuntimeError('Injected migration failure')
 reviews.migrate=broken;reviews.merge(failed['id']);value=wait(failed['id'])
 assert value['status']=='error' and value['verified'] is False and mode(scan_jobs.SHOP)=='before'
 reviews.migrate=real
print('PASS: actual source diff, selections, async migration, repeated/concurrent merge, ciphertext and failure gate')
