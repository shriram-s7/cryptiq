"""Four evidence checks; only a current all-pass result can be published."""
from concurrent.futures import ThreadPoolExecutor
from contextlib import closing
import hashlib,json,os,secrets,shutil,sqlite3,subprocess,threading,uuid
from datetime import datetime, timezone
from fastapi import APIRouter,HTTPException
import scan_jobs
from engine.pipeline import scan
from attacks.dictionary import dictionary
from attacks.shor_sim import simulate
from fixes.reviews import source_diff
from storage import connect,lookup_email

router=APIRouter();POOL=ThreadPoolExecutor(max_workers=1,thread_name_prefix='verify');LOCK=threading.Lock()

def initialize():
 with closing(scan_jobs.connection()) as conn,conn:
  conn.execute('CREATE TABLE IF NOT EXISTS verifications(id TEXT PRIMARY KEY,payload TEXT NOT NULL)')
  for row in conn.execute('SELECT id,payload FROM verifications').fetchall():
   value=json.loads(row['payload'])
   if value['status']=='running':
    value.update(status='failed',error='Server restarted. Run verification again.')
    conn.execute('UPDATE verifications SET payload=? WHERE id=?',(json.dumps(value),row['id']))

def save(value):
 with closing(scan_jobs.connection()) as conn,conn:conn.execute('INSERT OR REPLACE INTO verifications VALUES(?,?)',(value['id'],json.dumps(value)))

def read(run_id):
 with closing(scan_jobs.connection()) as conn:row=conn.execute('SELECT payload FROM verifications WHERE id=?',(run_id,)).fetchone()
 if not row:raise HTTPException(404,'Verification not found')
 return json.loads(row['payload'])

def latest():
 with closing(scan_jobs.connection()) as conn:row=conn.execute('SELECT payload FROM verifications ORDER BY rowid DESC LIMIT 1').fetchone()
 return json.loads(row['payload']) if row else None

def published():
 value=latest()
 if not value or value['status']!='passed':return None
 if value['revision']!=scan_jobs.project('p_demo')['revision'] or not scan_jobs.SHOP.exists():return None
 if value.get('databaseVersion')!=scan_jobs.SHOP.stat().st_mtime_ns or value['sourceDigest']!=source_diff()[1]:return None
 return value

def fingerprint():
 with connect(scan_jobs.SHOP) as conn:
  rows=[tuple(r) for r in conn.execute('SELECT * FROM customers ORDER BY id')]
  orders=[tuple(r) for r in conn.execute('SELECT * FROM orders ORDER BY id')]
 return hashlib.sha256(repr((rows,orders)).encode()).hexdigest()

def browser_check(email,password):
 env=dict(os.environ,PLAYWRIGHT_BROWSERS_PATH=str(scan_jobs.ROOT/'core/.runtime/playwright'))
 completed=subprocess.run([shutil.which('node') or 'node',str(scan_jobs.ROOT/'core/web/scripts/verify-shop.cjs')],input=json.dumps({'email':email,'password':password}),capture_output=True,text=True,encoding='utf-8',timeout=60,env=env,cwd=scan_jobs.ROOT/'core/web')
 if completed.returncode:raise RuntimeError('Browser verification could not run: '+completed.stderr[-500:])
 return json.loads(completed.stdout.strip())

def work(value):
 baseline=None
 browser=None;email='verify-'+uuid.uuid4().hex+'@example.test';password=secrets.token_urlsafe(24)
 def check(index,status,detail):
  value['checks'][index].update(status=status,detail=detail);save(value)
 try:
  baseline=fingerprint()
  check(0,'running','Scanning protected source and stored fields')
  candidate=scan(scan_jobs.ROOT/'core/demo-shop/src_after',scan_jobs.SHOP)
  value['candidate']=candidate;value['scoreAfter']=candidate['score']
  check(0,'pass' if candidate['counts']['critical']==0 else 'fail',f"{candidate['counts']['critical']} critical issues; candidate score {candidate['score']}")
  check(1,'running','Five-second real dictionary budget and tiny-key simulation check')
  attack=dictionary(scan_jobs.SHOP,5);rsa=simulate(scan_jobs.SHOP,5)
  value['attackEvidence']={k:attack[k] for k in ('tried','cracked','total','durationMs','budgetExhausted')};value['rsaVerdict']=rsa['verdict']
  passed=attack['cracked']==0 and rsa['verdict']=='not_applicable'
  check(1,'pass' if passed else 'fail',f"{attack['cracked']} recovered in {attack['durationMs']}ms / {attack['tried']} hash evaluations; RSA {rsa['verdict']}. This is bounded evidence, not exhaustive resistance.")
  check(2,'running','Testing existing login and checkout in a real browser')
  browser=browser_check(email,password)
  check(2,'pass' if browser['app']['pass'] else 'fail',browser['app']['detail'] or browser.get('error','Live app check failed'))
  check(3,'running','Inspecting new signup storage')
  with connect(scan_jobs.SHOP) as conn:
   row=conn.execute('SELECT * FROM customers WHERE email_lookup=?',(lookup_email(email,scan_jobs.SHOP),)).fetchone()
   protected=bool(browser['signup']['pass'] and row and row['password_scheme']=='argon2id_peppered' and row['password_hash'].startswith('$argon2id$') and all(row[k].startswith('pqc:v1:') for k in ('phone','email','address','id_number')))
  check(3,'pass' if protected else 'fail','New live signup stored as peppered Argon2id and encrypted fields.' if protected else browser.get('error','New record protection did not pass'))
 except Exception as error:
  value['error']=str(error)
  for item in value['checks']:
   if item['status'] in ('running','pending'):item.update(status='fail',detail=str(error))
 finally:
  try:
   # Delete only this run's unique test identity and the recorded test order.
   with connect(scan_jobs.SHOP) as conn:
    if browser and browser.get('orderId'):conn.execute('DELETE FROM orders WHERE id=? AND customer_id=(SELECT id FROM customers WHERE email_lookup=?)',(browser['orderId'],lookup_email('priya@example.test',scan_jobs.SHOP)))
    conn.execute('DELETE FROM customers WHERE email_lookup=?',(lookup_email(email,scan_jobs.SHOP),))
   if fingerprint()!=baseline or scan_jobs.project('p_demo')['revision']!=value['revision'] or source_diff()[1]!=value['sourceDigest']:
    value['error']='Project changed during verification; retry against the current state.'
   value['databaseVersion']=scan_jobs.SHOP.stat().st_mtime_ns
  except Exception as error:value['error']='Verification cleanup/state check failed: '+str(error)
  value['status']='passed' if not value.get('error') and all(c['status']=='pass' for c in value['checks']) else 'failed'
  if value['status']=='passed':
   scan_id='s_'+value['id']
   result={**value['candidate'],'id':scan_id,'projectId':'p_demo','revision':value['revision'],'status':'done','mode':'after','source':'demo','stages':[],'candidateOnly':False}
   with scan_jobs.LOCK,closing(scan_jobs.connection()) as conn,conn:
    conn.execute('INSERT INTO scans VALUES(?,?,?,?)',(scan_id,'p_demo',value['revision'],json.dumps(result)))
    conn.execute('UPDATE projects SET latest_scan=? WHERE id=? AND revision=?',(scan_id,'p_demo',value['revision']))
   value['scanId']=scan_id
  value['finishedAt']=datetime.now(timezone.utc).isoformat()
  save(value)

@router.post('/api/projects/{project_id}/verifications',status_code=202)
def start(project_id:str):
 project=scan_jobs.project(project_id)
 if project_id!='p_demo':raise HTTPException(422,'Verification applies only to the local demo shop')
 if scan_jobs.active_mode()!='after' or (scan_jobs.SHOP.parent/'.migration.lock').exists():raise HTTPException(409,'Merge the protected demo fixes before verification')
 with LOCK:
  active=latest()
  if active and active['status']=='running':raise HTTPException(409,'Verification already running')
  with closing(scan_jobs.connection()) as conn:
   previous=[json.loads(r['payload']) for r in conn.execute('SELECT payload FROM scans WHERE project_id=? ORDER BY rowid DESC',('p_demo',))]
  scan_before=next((s for s in previous if s.get('mode')=='before' and s['status']=='done'),None)
  value={'id':'v_'+uuid.uuid4().hex,'projectId':project_id,'revision':project['revision'],'sourceDigest':source_diff()[1],'status':'running','scoreBefore':scan_before['score'] if scan_before else None,'checks':[{'key':key,'label':label,'status':'pending','detail':''} for key,label in [('rescan','Re-scan'),('reattack','Re-attack'),('app','App still works'),('new_data','New data protected')]]}
  save(value);POOL.submit(work,value);return {'verificationId':value['id']}

@router.get('/api/verifications/{run_id}')
def poll(run_id:str):return read(run_id)

@router.get('/api/projects/{project_id}/verification')
def project_verification(project_id:str):
 scan_jobs.project(project_id)
 if project_id!='p_demo':return {'verification':None,'published':False}
 return {'verification':latest(),'published':published() is not None}
