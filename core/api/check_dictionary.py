"""C13: actual signup hashes, migrated guesses and timeout, using isolated demo DB."""
from pathlib import Path
import sys,tempfile,re
from attacks.dictionary import dictionary
from scan_jobs import ROOT
sys.path.insert(0,str(ROOT/'core/demo-shop'))
from app import create_app
from migrate_to_after import migrate
from storage import connect
from argon2 import PasswordHasher
with tempfile.TemporaryDirectory(dir=ROOT/'core/.runtime') as temp:
 db=Path(temp)/'shop.db'; client=create_app(db,testing=True).test_client()
 for name,pw in [('Priya','priya@123'),('Judge','chennai123')]:
  csrf=re.search(r'name="csrf_token" value="([^"]+)"',client.get('/signup').get_data(as_text=True)).group(1)
  assert client.post('/signup',data={'csrf_token':csrf,'name':name,'email':name.lower()+'@example.test','phone':'9000000000','password':pw,'address':'Fake street'}).status_code==302
 before=dictionary(db,1)
 assert before['cracked']==2 and {r['value'] for r in before['revealed']}=={'priya@123','chennai123'}
 migrate(db)
 after=dictionary(db,1)
 assert after['cracked']==0,after
 assert after['tried']>0 and after['durationMs']>before['durationMs']
 print(f"PASS: real signup before recovered2/{before['total']} in{before['durationMs']}ms; database-only guesses after pepper migration recovered{after['cracked']} in{after['durationMs']}ms")
 with connect(db) as conn:
  conn.execute('UPDATE customers SET password_hash=?,password_scheme=?',(PasswordHasher(time_cost=2,memory_cost=19456,parallelism=1).hash('unique-not-in-dictionary'),'argon2id'))
 timeout=dictionary(db,.1)
 assert timeout['budgetExhausted'] and timeout['cracked']==0 and timeout['tried']>0 and 90<=timeout['durationMs']<1500,timeout
 print(f"PASS: timeout {timeout['durationMs']}ms, {timeout['tried']} actual evaluations, no invented recoveries")
