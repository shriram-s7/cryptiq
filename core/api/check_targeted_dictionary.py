import sys,sqlite3,tempfile
from pathlib import Path
root=Path.cwd();sys.path.insert(0,str(root/'core/api'))
from attacks.dictionary import dictionary, WORDS
from argon2 import PasswordHasher
import hashlib
with tempfile.TemporaryDirectory(dir=root/'core/.runtime') as folder:
 db=Path(folder)/'scope.db'
 with sqlite3.connect(db) as c:
  c.execute('CREATE TABLE customers(id INTEGER,password_hash TEXT,password_scheme TEXT)')
  c.executemany('INSERT INTO customers VALUES(?,?,?)',[(i,hashlib.md5(word.encode()).hexdigest(),'md5') for i,word in enumerate(WORDS,1)])
  c.execute('INSERT INTO customers VALUES(101,?,?)',(hashlib.md5(b'unlisted-strong-password-76349').hexdigest(),'md5'))
  c.execute('INSERT INTO customers VALUES(102,?,?)',(PasswordHasher().hash('chennai123'),'argon2id'))
 c.close()
 for i,word in enumerate(WORDS,1):
  result=dictionary(db,5,customer_id=i)
  assert result['total']==1 and result['revealed']==[{'customerId':i,'field':'password','value':word}]
 assert dictionary(db,5,customer_id=101)['cracked']==0
 assert dictionary(db,5,customer_id=102)['revealed'][0]['value']=='chennai123'
 assert dictionary(db,5)['total']==22
 try: dictionary(db,5,customer_id=999)
 except ValueError: pass
 else: raise AssertionError('Missing target must error')
print('PASS: all 20 known examples recovered for exact target; strong password no recovery; weak Argon2 example honestly recovered; whole-database compatibility; missing target rejected')

