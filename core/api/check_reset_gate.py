"""Verify the reset endpoint refuses active work before touching demo storage."""
from contextlib import closing
from pathlib import Path
import tempfile,json
from fastapi import HTTPException
import scan_jobs
from verify import checks
from attacks import dictionary
from fixes import reviews
from report.results import reset_demo,ResetRequest
with tempfile.TemporaryDirectory(dir=scan_jobs.ROOT/'core/.runtime') as folder:
 scan_jobs.DATA=Path(folder);scan_jobs.DB=Path(folder)/'jobs.db'
 scan_jobs.initialize();dictionary.initialize();reviews.initialize();checks.initialize()
 with closing(scan_jobs.connection()) as conn,conn:
  conn.execute('INSERT INTO attacks VALUES(?,?)',('active',json.dumps({'status':'running'})))
 try:reset_demo(ResetRequest(confirm=True))
 except HTTPException as e:assert e.status_code==409
 else:raise AssertionError('Reset accepted during active job')
print('PASS: reset refuses active jobs before touching main demo storage')
