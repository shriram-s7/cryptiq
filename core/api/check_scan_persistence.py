# Isolated persistence and stale-storage gate, using only temporary files under Core.
import tempfile
from pathlib import Path
import scan_jobs as jobs
from contextlib import closing
original_scan = jobs.scan
with tempfile.TemporaryDirectory(dir=jobs.DATA) as folder:
    jobs.DATA=Path(folder); jobs.DB=jobs.DATA/'jobs.db'; jobs.initialize()
    jobs.SHOP=jobs.DATA/'shop.db'; jobs.SHOP.write_bytes(b'before')
    jobs.active_mode=lambda:'before'
    payload={'id':'test','projectId':'p_demo','revision':0,'mode':'before','databaseVersion':jobs.SHOP.stat().st_mtime_ns,'status':'running','stages':[]}
    with closing(jobs.connection()) as conn,conn:
        conn.execute('INSERT INTO scans VALUES(?,?,?,?)',('test','p_demo',0,jobs.json.dumps(payload)))
    def changed(*args):
        jobs.SHOP.write_bytes(b'reset storage')
        import os
        os.utime(jobs.SHOP,ns=(payload['databaseVersion']+10000000,payload['databaseVersion']+10000000))
        return {'score':91}
    jobs.scan=changed; jobs.work('test',jobs.DATA,jobs.SHOP)
    assert jobs.get_scan('test')['status']=='error'
    assert jobs.project('p_demo')['latest_scan'] is None
    payload.update(status='done',score=38); jobs.save(payload); jobs.initialize()
    assert jobs.get_scan('test')['score']==38
    payload.update(status='running'); jobs.save(payload); jobs.initialize()
    assert jobs.get_scan('test')['status']=='error'
print('PASS: storage changes block publication; initialization preserves completed results and terminates interrupted jobs')
