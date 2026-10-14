"""Local review of an atomic demo patch bundle, followed by measured migration."""
from concurrent.futures import ThreadPoolExecutor
from contextlib import closing
import difflib
import hashlib
import json
import sys
import threading
import uuid
from fastapi import APIRouter,HTTPException
from pydantic import BaseModel,ConfigDict,Field
import scan_jobs
sys.path.insert(0,str(scan_jobs.ROOT/'core/demo-shop'))
from migrate_to_after import migrate

router=APIRouter();POOL=ThreadPoolExecutor(max_workers=1,thread_name_prefix='merge');LOCK=threading.Lock()
FIXES=['fix_argon2','fix_field_enc','fix_secret_env','fix_cookie']


def initialize():
 with closing(scan_jobs.connection()) as conn,conn:
  conn.execute('CREATE TABLE IF NOT EXISTS reviews(id TEXT PRIMARY KEY,payload TEXT NOT NULL)')
  for row in conn.execute('SELECT id,payload FROM reviews'):
   value=json.loads(row['payload'])
   if value['status']=='merging':
    value.update(status='error',error='Server restarted during merge. Inspect shop mode and maintenance lock before retrying.')
    conn.execute('UPDATE reviews SET payload=? WHERE id=?',(json.dumps(value),row['id']))


def save(value):
 with closing(scan_jobs.connection()) as conn,conn:conn.execute('INSERT OR REPLACE INTO reviews VALUES(?,?)',(value['id'],json.dumps(value)))


def read(review_id):
 with closing(scan_jobs.connection()) as conn:row=conn.execute('SELECT payload FROM reviews WHERE id=?',(review_id,)).fetchone()
 if not row:raise HTTPException(404,'Review not found')
 return json.loads(row['payload'])


def source_diff():
 base=scan_jobs.ROOT/'core/demo-shop';files=[];digest=hashlib.sha256()
 names=sorted({p.name for folder in ('src_before','src_after') for p in (base/folder).glob('*.py')})
 for name in names:
  before=(base/'src_before'/name).read_text() if (base/'src_before'/name).exists() else ''
  after=(base/'src_after'/name).read_text() if (base/'src_after'/name).exists() else ''
  digest.update(name.encode()+b'\0'+before.encode()+b'\0'+after.encode())
  diff=''.join(difflib.unified_diff(before.splitlines(True),after.splitlines(True),fromfile='src_before/'+name,tofile='src_after/'+name))
  if diff:files.append({'path':name,'diff':diff})
 return files,digest.hexdigest()


class Selection(BaseModel):
 model_config=ConfigDict(extra='forbid')
 fixes:list[str]=Field(default_factory=lambda:list(FIXES))


@router.post('/api/projects/{project_id}/reviews',status_code=201)
def create(project_id:str,body:Selection):
 project=scan_jobs.project(project_id)
 if project_id!='p_demo':raise HTTPException(422,'Local demo fixes only; uploaded code is never rewritten')
 if len(body.fixes)!=4 or set(body.fixes)!=set(FIXES):raise HTTPException(422,'The four demo fixes form one atomic bundle; select all four')
 if scan_jobs.active_mode()!='before':raise HTTPException(409,'Shop already uses protected storage; run verification')
 files,digest=source_diff()
 value={'id':'pr_'+uuid.uuid4().hex,'projectId':project_id,'revision':project['revision'],'title':'Protect demo storage and settings','fixes':body.fixes,'files':files,'sourceDigest':digest,'status':'open','completed':0,'total':0,'manual':['Enable access logging','Define a retention policy','Publish a security contact'],'localOnly':True,'verified':False}
 save(value);return value


def work(value):
 try:
  def report(completed,total):value.update(completed=completed,total=total);save(value)
  result=migrate(scan_jobs.SHOP,report=report)
  with scan_jobs.LOCK,closing(scan_jobs.connection()) as conn,conn:
   conn.execute('UPDATE projects SET revision=revision+1 WHERE id=?',(value['projectId'],))
  value.update(status='merged',migration=result,verified=False);save(value)
 except Exception as error:value.update(status='error',error=str(error),verified=False);save(value)


@router.post('/api/reviews/{review_id}/merge')
def merge(review_id:str):
 with LOCK:
  value=read(review_id)
  if value['status'] in ('merged','merging'):return value
  if value['status']!='open':raise HTTPException(409,'Create a new review after resolving the failed migration')
  if scan_jobs.project(value['projectId'])['revision']!=value['revision']:raise HTTPException(409,'Project changed; create a fresh review')
  if source_diff()[1]!=value['sourceDigest']:raise HTTPException(409,'Source changed; review new diffs before merging')
  if scan_jobs.active_mode()!='before':raise HTTPException(409,'Shop mode changed; run verification')
  with closing(scan_jobs.connection()) as conn:
   if any(json.loads(r['payload'])['status']=='merging' for r in conn.execute('SELECT payload FROM reviews')):raise HTTPException(409,'Another merge is active')
   if any(json.loads(r['payload'])['status']=='running' for r in conn.execute('SELECT payload FROM attacks')):raise HTTPException(409,'Wait for the active attack before merging')
  value.update(status='merging');save(value);POOL.submit(work,value);return value


@router.get('/api/reviews/{review_id}')
def poll(review_id:str):return read(review_id)
