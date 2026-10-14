"""Verified evidence PDF, frozen public summary shape and coordinated demo reset."""
from contextlib import closing
from datetime import datetime,timezone
from html import escape
import json,os,shutil,sqlite3,subprocess,threading
from pathlib import Path
from fastapi import APIRouter,HTTPException
from fastapi.responses import FileResponse,JSONResponse
from pydantic import BaseModel,ConfigDict
import scan_jobs
from verify import checks
from attacks import dictionary
from fixes import reviews

router=APIRouter();PDF_LOCK=threading.Lock()


def summary():
 project=scan_jobs.project('p_demo');verification=checks.published()
 current=scan_jobs.get_scan(project['latest_scan']) if project['latest_scan'] else None
 # An unverified post-migration candidate must not masquerade as a verified upgrade.
 with closing(scan_jobs.connection()) as conn:
  scans=[json.loads(r['payload']) for r in conn.execute("SELECT payload FROM scans WHERE project_id='p_demo' ORDER BY rowid DESC")]
 before=next((s for s in scans if s.get('mode')=='before' and s['status']=='done'),None)
 result=verification['candidate'] if verification else before
 if result is None and current and current['status']=='done':result=current
 counts=result['counts'] if result else {'critical':0,'high':0,'medium':0,'low':0}
 return {'slug':'chennai-organics','name':'Chennai Organics','industry':'E-commerce',
  'score':result['score'] if result else 0,'scoreBefore':before['score'] if before else 0,'counts':counts,
  'checks':{'passed':4 if verification else 0,'total':4},'verified':bool(verification),
  'lastScanAt':result['finishedAt'] if result else None,
  'dataProtection':[{'dataType':item['dataType'],'status':item['status']} for item in result['dataMap'] if item['dataType'] in ('phone','email','password','id_number')] if result else [],
  'quantumReady':bool(verification and verification['rsaVerdict']=='not_applicable'),
  'coreProjectUrl':'http://localhost:5173/p/p_demo','revision':project['revision'],
  'verificationId':verification['id'] if verification else None,'hasScan':result is not None,
  'evidenceState':'verified' if verification else 'unverified','disclaimer':'Security-safeguard evidence, not legal certification. Bounded demo tests only.'}


def render_html(value):
 candidate=value['candidate'];esc=lambda x:escape(str(x));before=value.get('scoreBefore')
 check_rows=''.join(f'<tr><td>{esc(c["label"])}</td><td>PASS</td><td>{esc(c["detail"])}</td></tr>' for c in value['checks'])
 findings=''.join(f'<tr><td>{esc(f["severity"])}</td><td>{esc(f["titleOwner"])}</td><td>{esc(f.get("howToFix","Manual review required"))}</td></tr>' for f in candidate['findings'])
 mapping=''.join(f'<tr><td>{esc(i["dataType"])}</td><td>{esc(i["store"])}</td><td>{esc(i["protection"])}</td></tr>' for i in candidate['dataMap'])
 font=next((scan_jobs.ROOT/'core/web/node_modules/@fontsource/inter/files').glob('inter-latin-400-normal.woff2'))
 return f'''<!doctype html><html><head><meta charset="utf-8"><style>
 @font-face{{font-family:Inter;src:url('{font.as_uri()}')}}
 @page{{size:A4;margin:18mm}}*{{box-sizing:border-box}}body{{font-family:Inter,Arial,sans-serif;color:#0b2530;font-size:11px;line-height:1.6;margin:0}}h1{{font-size:30px;font-weight:500}}h2{{font-size:19px;margin-top:24px}}p{{color:#475569}}.page{{break-after:page;min-height:250mm;position:relative}}.page:last-child{{break-after:auto}}.label{{font-size:10px;letter-spacing:2px;color:#059669}}.score{{font-size:44px;color:#059669;margin:24px 0}}table{{width:100%;border-collapse:collapse;table-layout:fixed}}td,th{{text-align:left;padding:10px;border-bottom:1px solid #e2e8f0;overflow-wrap:anywhere;vertical-align:top}}th{{background:#f1f5f9}}.note{{padding:15px;background:#f0fdf4;border-left:3px solid #059669}}footer{{position:absolute;bottom:0;color:#64748b;font-size:9px}}code{{overflow-wrap:anywhere;font-size:9px}}
 </style></head><body>
 <section class="page"><div class="label">CRYPTIQ / SECURITY EVIDENCE</div><h1>Chennai Organics</h1><p>Local demonstration • all customer data is fake</p><div class="score">{esc(before) if before is not None else '—'} → {candidate['score']} / 100</div><div class="note"><strong>Verified: four checks passed</strong><br>Evidence is tied to project revision {value['revision']} and the inspected database state.</div><h2>What was checked</h2><table><tr><th>Check</th><th>Result</th><th>Observed evidence</th></tr>{check_rows}</table><h2>Evidence identity</h2><p>Verification: <code>{esc(value['id'])}</code><br>Completed: {esc(value.get('finishedAt',candidate['finishedAt']))}<br>Source fingerprint: <code>{esc(value['sourceDigest'])}</code></p><footer>1 / 3 · Security-safeguard evidence, not legal certification.</footer></section>
 <section class="page"><div class="label">STORAGE AND REMAINING WORK</div><h1>What changed</h1><p>Argon2id password storage; contact and ID fields encrypted through the demo ML-KEM-768 + AES-256-GCM implementation; secure session cookies; payment configuration moved out of source.</p><table><tr><th>Data</th><th>Location</th><th>Detected protection</th></tr>{mapping}</table><h2>Remaining findings</h2><table><tr><th>Severity</th><th>Finding</th><th>Next action</th></tr>{findings}</table><p>Score formula: 100 − 15×critical − 7×high − 3×medium − 1×low, with a minimum of zero. A score is a ruleset summary, not a probability of breach.</p><footer>2 / 3 · Remaining manual findings have not been automatically resolved.</footer></section>
 <section class="page"><div class="label">METHOD AND LIMITATIONS</div><h1>Read the evidence correctly</h1><h2>Password demonstration</h2><p>{value['attackEvidence']['tried']} actual hash evaluations; {value['attackEvidence']['cracked']} passwords recovered from {value['attackEvidence']['total']} stored hashes in {value['attackEvidence']['durationMs']} ms. The run has a five-second budget and twenty curated candidates. A partial search with no recovery does not prove that all passwords are strong. Common passwords may still be guessed after migration.</p><h2>RSA demonstration</h2><p>Classical Pollard-rho factors only a deliberately tiny public demo RSA key. It is a simulation of the migration risk story, not quantum hardware and not an attack on RSA-2048. After-state verdict: {esc(value['rsaVerdict'])}.</p><h2>Coverage</h2><p>Source-pattern rules inspect supported Python examples. Database inspection samples up to100 rows. Browser checks exercise existing login, checkout and one fresh signup. These checks do not constitute a comprehensive penetration test, legal opinion or DPDP certification.</p><h2>Key management</h2><p>The ML-KEM library is educational. The local key store remains part of the trusted host; database encryption does not protect a compromised host with access to those keys.</p><h2>Commercial scope</h2><p>Any displayed ₹ subscription prices are proposed pilot pricing. This report is evidence of technical checks, not a purchase receipt or certification.</p><div class="note">Re-run verification after relevant changes. Public links serve current evidence only; this downloaded document remains a historical snapshot.</div><footer>3 / 3 · No plaintext customer records, passwords or key material included.</footer></section></body></html>'''


def report_file(value):
 directory=scan_jobs.DATA/'reports';directory.mkdir(exist_ok=True)
 output=directory/(value['id']+'.pdf')
 with PDF_LOCK:
  if not output.exists():
   source=directory/(value['id']+'.html');source.write_text(render_html(value),encoding='utf-8')
   env=dict(os.environ,PLAYWRIGHT_BROWSERS_PATH=str(scan_jobs.ROOT/'core/.runtime/playwright'))
   result=subprocess.run([shutil.which('node') or 'node',str(scan_jobs.ROOT/'core/web/scripts/render-report.cjs'),source.as_uri(),str(output)],capture_output=True,text=True,timeout=45,env=env,cwd=scan_jobs.ROOT/'core/web')
   if result.returncode:output.unlink(missing_ok=True);raise HTTPException(503,'PDF renderer unavailable; retry with local browser dependencies installed')
 return output


def current_report():
 value=checks.published()
 if not value:raise HTTPException(404,'A current passed verification is required for the evidence report')
 path=report_file(value)
 fresh=checks.published()
 if not fresh or fresh['id']!=value['id']:raise HTTPException(409,'Evidence changed while rendering; verify again')
 return FileResponse(path,media_type='application/pdf',filename='cryptiq-chennai-organics-evidence.pdf',headers={'Cache-Control':'no-store','X-CryptIQ-Revision':str(value['revision'])})

@router.get('/api/public/projects/{slug}/report.pdf')
def public_report(slug:str):
 if slug!='chennai-organics':raise HTTPException(404,'Project not found')
 return current_report()

@router.get('/api/projects/{project_id}/report.pdf')
def private_report(project_id:str):
 scan_jobs.project(project_id)
 if project_id!='p_demo':raise HTTPException(404,'Verified reports currently support the demo shop only')
 return current_report()

class ResetRequest(BaseModel):
 model_config=ConfigDict(extra='forbid')
 confirm:bool=False

@router.post('/api/demo/reset')
def reset_demo(body:ResetRequest):
 if not body.confirm:raise HTTPException(422,'Confirm resetting fake demo customers and results')
 # Serialize admission with all existing local job starters, then reject active work.
 with checks.LOCK,reviews.LOCK,dictionary.LOCK,scan_jobs.LOCK:
  with closing(scan_jobs.connection()) as conn:
   for table in ('scans','attacks','reviews','verifications'):
    if any(json.loads(r['payload']).get('status') in ('running','merging') for r in conn.execute(f'SELECT payload FROM {table}')):raise HTTPException(409,'Wait for active jobs to finish before resetting')
  marker=scan_jobs.SHOP.parent/'.migration.lock'
  try:marker.open('x').close()
  except FileExistsError:raise HTTPException(409,'Demo maintenance is already active')
  try:
   from reset import reset
   reset()
   with closing(scan_jobs.connection()) as conn,conn:
    conn.execute("UPDATE projects SET revision=revision+1,latest_scan=NULL WHERE id='p_demo'")
    conn.execute("DELETE FROM scans WHERE project_id='p_demo'")
    conn.execute('DELETE FROM verifications');conn.execute('DELETE FROM reviews');conn.execute('DELETE FROM attacks')
   # Return measured before evidence immediately, so Hub sees a consistent baseline after reset.
   from engine.pipeline import scan
   result=scan(scan_jobs.ROOT/'core/demo-shop/src_before',scan_jobs.SHOP)
   import uuid
   scan_id='s_'+uuid.uuid4().hex;revision=scan_jobs.project('p_demo')['revision']
   result.update(id=scan_id,projectId='p_demo',revision=revision,mode='before',source='demo',status='done',stages=[],databaseVersion=scan_jobs.SHOP.stat().st_mtime_ns)
   with closing(scan_jobs.connection()) as conn,conn:
    conn.execute('INSERT INTO scans VALUES(?,?,?,?)',(scan_id,'p_demo',revision,json.dumps(result)))
    conn.execute("UPDATE projects SET latest_scan=? WHERE id='p_demo'",(scan_id,))
   return {'ok':True,'mode':'before','revision':revision,'score':result['score']}
  finally:marker.unlink(missing_ok=True)
