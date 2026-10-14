"""Isolated failure and stale publication gates; live happy path is in verify.spec.ts."""
from contextlib import closing
import json,tempfile,uuid
from pathlib import Path
import scan_jobs
from fixes import reviews
from verify import checks
from storage import initialize,connect

with tempfile.TemporaryDirectory(dir=scan_jobs.ROOT/'core/.runtime') as folder:
 scan_jobs.DATA=Path(folder);scan_jobs.DB=Path(folder)/'jobs.db';scan_jobs.SHOP=Path(folder)/'shop.db'
 scan_jobs.initialize();initialize(scan_jobs.SHOP);checks.initialize()
 with connect(scan_jobs.SHOP) as conn:conn.execute("UPDATE metadata SET value='after' WHERE key='mode'")
 checks.scan=lambda *args:{'score':91,'counts':{'critical':0,'high':1,'medium':0,'low':2}}
 checks.dictionary=lambda *args:{'tried':3,'cracked':1,'total':1,'durationMs':100,'budgetExhausted':True}
 checks.simulate=lambda *args:{'verdict':'not_applicable'}
 checks.browser_check=lambda *args:{'app':{'pass':False,'detail':'Injected app failure'},'signup':{'pass':False,'detail':''},'error':'Injected failure'}
 value={'id':'v_failure','revision':0,'sourceDigest':reviews.source_diff()[1],'status':'running','checks':[{'key':str(i),'status':'pending'} for i in range(4)]}
 checks.save(value);checks.work(value)
 assert checks.read('v_failure')['status']=='failed' and checks.published() is None
 assert scan_jobs.project('p_demo')['latest_scan'] is None
 # Publication freshness must reject reset/source/database changes even for persisted all-pass evidence.
 value.update(id='v_pass',status='passed',databaseVersion=scan_jobs.SHOP.stat().st_mtime_ns)
 checks.save(value);assert checks.published() is not None
 with closing(scan_jobs.connection()) as conn,conn:conn.execute("UPDATE projects SET revision=revision+1 WHERE id='p_demo'")
 assert checks.published() is None
 value['revision']=1;value['databaseVersion']-=1;checks.save(value);assert checks.published() is None
 print('PASS: recovered password/app failure prevents score publication; stale revision and changed storage invalidate evidence')
