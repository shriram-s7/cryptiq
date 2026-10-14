"""Local fake-shop dictionary demonstration; never accepts external targets or hashes."""
from concurrent.futures import ThreadPoolExecutor
from contextlib import closing
import hashlib
import json
from pathlib import Path
import sqlite3
import threading
import time
import uuid
from argon2 import PasswordHasher
from argon2.exceptions import VerifyMismatchError
from fastapi import APIRouter, HTTPException
from fastapi.responses import JSONResponse
from pydantic import BaseModel, ConfigDict, Field
import scan_jobs

router=APIRouter()
POOL=ThreadPoolExecutor(max_workers=1,thread_name_prefix='dictionary')
LOCK=threading.Lock()
HASHER=PasswordHasher()
WORDS=tuple(dict.fromkeys((Path(__file__).parent/'common_passwords.txt').read_text(encoding='utf-8-sig').splitlines()))


def initialize():
    with closing(scan_jobs.connection()) as conn,conn:
        conn.execute('CREATE TABLE IF NOT EXISTS attacks(id TEXT PRIMARY KEY,payload TEXT NOT NULL)')
        for row in conn.execute('SELECT id,payload FROM attacks').fetchall():
            value=json.loads(row['payload'])
            if value['status']=='running':
                value.update(status='error',error='Server restarted. Run a new attack.',revealed=[],cracked=0)
                conn.execute('UPDATE attacks SET payload=? WHERE id=?',(json.dumps(value),row['id']))


def save(value):
    with closing(scan_jobs.connection()) as conn,conn:
        conn.execute('INSERT OR REPLACE INTO attacks VALUES(?,?)',(value['id'],json.dumps(value)))


def read(run_id):
    with closing(scan_jobs.connection()) as conn:
        row=conn.execute('SELECT payload FROM attacks WHERE id=?',(run_id,)).fetchone()
    if not row: raise HTTPException(404,'Attack run not found')
    return json.loads(row['payload'])


def dictionary(database,budget_seconds,report=lambda _:None,customer_id=None):
    started=time.monotonic()
    with closing(sqlite3.connect(f'{database.as_uri()}?mode=ro',uri=True)) as conn:
        conn.row_factory=sqlite3.Row
        rows=conn.execute('SELECT id,password_hash,password_scheme FROM customers WHERE (? IS NULL OR id=?) ORDER BY id DESC', (customer_id,customer_id)).fetchall()
    if customer_id is not None and not rows:
        raise ValueError('Selected account no longer exists. Choose a current shop notification.')
    result={'tried':0,'candidatesTried':0,'cracked':0,'total':len(rows),'revealed':[], 'durationMs':0,'budgetSeconds':budget_seconds,'budgetExhausted':False,'lines':[f'Loaded {len(rows)} fake customer hashes; {len(WORDS)} dictionary candidates.']}
    if any(row['password_scheme'].endswith('_peppered') for row in rows):
        result['lines'].append('Database-only test: server-held password pepper is not present in the leaked records. Guesses are tested without that secret.')
    remaining={row['id']:row for row in rows}
    md5={}
    for row in rows:
        scheme = row['password_scheme'] or 'md5'
        if scheme == 'md5':
            md5.setdefault(row['password_hash'], []).append(row['id'])
        elif scheme in ('argon2id', 'argon2id_md5', 'argon2id_peppered', 'argon2id_md5_peppered'):
            pass
        else:
            continue
    last_report=0
    for candidate in WORDS:
        if time.monotonic()-started>=budget_seconds:
            result['budgetExhausted']=True; break
        result['candidatesTried']+=1
        digest=hashlib.md5(candidate.encode()).hexdigest()
        matches=[]
        if md5:
            result['tried']+=1
            matches.extend(md5.get(digest,[]))
        for row in rows:
            if row['id'] not in remaining or row['password_scheme']=='md5': continue
            if time.monotonic()-started>=budget_seconds:
                result['budgetExhausted']=True; break
            guess=digest if row['password_scheme'] in ('argon2id_md5','argon2id_md5_peppered') else candidate
            result['tried']+=1
            try:
                HASHER.verify(row['password_hash'],guess)
                matches.append(row['id'])
            except VerifyMismatchError: pass
            if time.monotonic()-last_report>.25:
                result['durationMs']=round((time.monotonic()-started)*1000)
                report(dict(result)); last_report=time.monotonic()
        for customer_id in matches:
            if customer_id in remaining:
                remaining.pop(customer_id)
                result['revealed'].append({'customerId':customer_id,'field':'password','value':candidate})
        result['cracked']=len(result['revealed'])
        result['durationMs']=round((time.monotonic()-started)*1000)
        if time.monotonic()-last_report>.25:
            report(dict(result)); last_report=time.monotonic()
        if result['budgetExhausted'] or not remaining: break
    result['durationMs']=round((time.monotonic()-started)*1000)
    result['verdict']='cracked' if result['cracked'] else 'protected'
    result['lines'].append(f"{result['tried']} hash evaluations; {result['cracked']} / {result['total']} passwords recovered in {result['durationMs']} ms.")
    result['lines'].append('Time budget reached; untested passwords remain.' if result['budgetExhausted'] else 'Dictionary finished. Unrecovered passwords are not proof of safety.')
    return result


def work(value):
    try:
        def report(progress):
            value.update(progress); save(value)
        from attacks.shor_sim import simulate
        attack = dictionary if value['kind']=='dictionary' else simulate
        result=attack(scan_jobs.SHOP,value['budgetSeconds'],report,customer_id=value.get('customerId')) if value['kind']=='dictionary' else attack(scan_jobs.SHOP,value['budgetSeconds'],report)
        if scan_jobs.SHOP.stat().st_mtime_ns!=value['databaseVersion'] or (scan_jobs.SHOP.parent/'.migration.lock').exists():
            raise ValueError('Demo storage changed. Refresh and run a new attack.')
        value.update(result,status='done'); save(value)
    except Exception as error:
        value.update(status='error',error=str(error),revealed=[],cracked=0); save(value)


class AttackRequest(BaseModel):
    model_config=ConfigDict(extra='forbid')
    customerId: int | None=Field(default=None,ge=1)
    kind: str='dictionary'
    budgetSeconds: float=Field(default=5,ge=0.1,le=60)


@router.post('/api/projects/{project_id}/attacks',status_code=202)
def start(project_id: str,body: AttackRequest):
    scan_jobs.project(project_id)
    if project_id!='p_demo': raise HTTPException(422,'Attacks are restricted to the local fake demo shop')
    if body.kind not in ('dictionary','shor_sim'): raise HTTPException(422,'Unknown attack kind')
    if not scan_jobs.SHOP.exists() or (scan_jobs.SHOP.parent/'.migration.lock').exists(): raise HTTPException(409,'Demo storage unavailable or migrating')
    with LOCK:
        with closing(scan_jobs.connection()) as conn:
            if any(json.loads(row['payload'])['status']=='running' for row in conn.execute('SELECT payload FROM attacks')):
                raise HTTPException(409,'An attack is already running. Wait for completion.')
        value={'id':'a_'+uuid.uuid4().hex,'projectId':project_id,'kind':body.kind,'customerId':body.customerId,'status':'running','budgetSeconds':body.budgetSeconds,'databaseVersion':scan_jobs.SHOP.stat().st_mtime_ns,'lines':['Reading local fake demo hashes.'],'tried':0,'cracked':0,'total':0,'revealed':[],'durationMs':0}
        save(value); POOL.submit(work,value)
    return {'attackId':value['id']}


@router.get('/api/attacks/{run_id}')
def poll(run_id: str):
    value=read(run_id)
    if value['status']!='error' and (not scan_jobs.SHOP.exists() or scan_jobs.SHOP.stat().st_mtime_ns!=value['databaseVersion'] or (scan_jobs.SHOP.parent/'.migration.lock').exists()):
        value.update(status='error',error='Demo storage changed. Run a new attack.',revealed=[],cracked=0)
    return JSONResponse(value,headers={'Cache-Control':'no-store'})
