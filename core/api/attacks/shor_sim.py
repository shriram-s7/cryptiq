"""Classical Pollard-rho illustration on the <=64-bit public demo key only."""
from contextlib import closing
import json
from math import gcd
import sqlite3
import time
from engine.pipeline import scan
from scan_jobs import ROOT

DISCLAIMER='Simulation: classical Pollard-rho on a deliberately tiny demo key, not quantum hardware or an RSA-2048 attack.'

def factor(n,deadline,report=lambda _:None):
    if not 4<=n or n.bit_length()>64: raise ValueError('Only deliberately tiny demo keys up to64 bits are supported')
    if n%2==0:return 2,0
    steps=0
    for c in range(1,100):
        x=y=2; divisor=1
        while divisor==1:
            if time.monotonic()>=deadline: raise TimeoutError('Factoring budget expired; no decryption performed')
            x=(x*x+c)%n; y=(y*y+c)%n; y=(y*y+c)%n
            divisor=gcd(abs(x-y),n);steps+=1
            if steps%10000==0:report(steps)
        if divisor!=n:return divisor,steps
    raise TimeoutError('Factoring search exhausted')


def simulate(database,budget_seconds,report=lambda _:None,public_path=None):
    started=time.monotonic();deadline=started+budget_seconds
    result={'tried':0,'cracked':0,'total':0,'revealed':[],'durationMs':0,'lines':[DISCLAIMER]}
    with closing(sqlite3.connect(f'{database.as_uri()}?mode=ro',uri=True)) as conn:
        mode=conn.execute("SELECT value FROM metadata WHERE key='mode'").fetchone()[0]
        rows=conn.execute('SELECT id,id_number FROM customers WHERE id_number!=\'\' ORDER BY id DESC').fetchall()
    result['total']=len(rows)
    assets=scan(ROOT/f'core/demo-shop/src_{mode}')['assets']
    if not any(a['name']=='RSA' for a in assets):
        if {'ML-KEM-768','AES-256-GCM'} <= {a['name'] for a in assets} and all(value.startswith('pqc:v1:') for _,value in rows):
            result.update(verdict='not_applicable',lines=[DISCLAIMER,'No active RSA asset. Stored IDs use the ML-KEM + AES-GCM demo representation.'])
            result['durationMs']=round((time.monotonic()-started)*1000);return result
        raise ValueError('Active inventory/storage is unsupported or inconsistent')
    public=json.loads((public_path or ROOT/'core/demo-shop/data/demo_rsa_public.json').read_text())
    if set(public)-{'algorithm','demo','n','e'} or public.get('demo') is not True or public.get('algorithm')!='RSA':raise ValueError('Expected public-only demo RSA parameters')
    n,e=public['n'],public['e']
    result['lines'].append(f'Factoring public demo modulus ({n.bit_length()} bits).')
    def progress(steps):
        result.update(tried=steps,durationMs=round((time.monotonic()-started)*1000));report(dict(result))
    try:p,steps=factor(n,deadline,progress)
    except TimeoutError as error:
        result.update(verdict='timeout',durationMs=round((time.monotonic()-started)*1000));result['lines'].append(str(error));return result
    q=n//p; d=pow(e,-1,(p-1)*(q-1))
    result.update(tried=steps)
    result['lines'].append(f'Factors recovered after {steps} classical iterations; private exponent reconstructed.')
    for customer_id,value in rows:
        if time.monotonic()>=deadline:
            result['budgetExhausted']=True;break
        if not value.startswith('rsa-demo:'):raise ValueError('Unexpected ID representation for active RSA inventory')
        decoded=b''.join(pow(block,d,n).to_bytes(size,'big') for size,block in json.loads(value.removeprefix('rsa-demo:'))).decode()
        result['revealed'].append({'customerId':customer_id,'field':'id_number','value':decoded})
    result.update(cracked=len(result['revealed']),verdict='cracked' if result['revealed'] else 'timeout',durationMs=round((time.monotonic()-started)*1000))
    result['lines'].append(f"Decrypted {result['cracked']} / {result['total']} fake IDs in {result['durationMs']} ms.")
    return result
