import { useEffect, useRef, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { ArrowRight, CheckCircle2, ChevronRight, FileSearch, LoaderCircle, ShieldAlert, Upload } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { requestJson } from '@/lib/api';
import { ReportPage } from './ReportPage';
import { FixWorkflow } from './FixWorkflow';
import { LeakPreview } from './LeakPreview';
import type { Scan, Finding } from '@/lib/contracts';

type LiveScan = Scan & { error?: string; source: string; warnings: string[]; customerCount: number | null; sampledCustomers: number; candidateOnly: boolean };
type Evidence = Finding & { howToFix?: string };
const stages = ['Reading files', 'Finding crypto', 'Finding personal data', 'Checking settings', 'Scoring'];
const names: Record<string, string> = { phone: 'Phone numbers', email: 'Email addresses', password: 'Passwords', address: 'Addresses', id_number: 'ID numbers', payment_key: 'Payment key' };
const protection: Record<string, string> = { plaintext: 'Stored as plain text', weak_hash: 'Weak password hash', strong_hash: 'Argon2id password hash', rsa_quantum_vulnerable: 'Small RSA demo key', pqc_encrypted: 'ML-KEM + AES-GCM', secret_in_code: 'Secret written in code', env_secret: 'Environment configuration', unknown: 'Not established by this scan' };

export function Workflow({ step = 0 }: { step?: number }) {
  return <ol className="workflow" aria-label="Security workflow">{['Scan', 'Understand', 'Attack', 'Fix & verify', 'Report'].map((name, i) => <li key={name} className={i === step ? 'current' : ''} aria-current={i === step ? 'step' : undefined}><span>{i + 1}</span>{name}{i < 4 ? <ChevronRight size={13} className="flow-chevron" /> : null}</li>)}</ol>;
}

function ErrorNotice({ message, retry }: { message: string; retry?: () => void }) {
  return <div className="error-notice" role="alert"><ShieldAlert size={19} /><div><strong>Unable to complete this step</strong><p>{message.includes('fetch') ? 'Cannot reach the Core API. Start the Core launcher, then retry.' : message}</p>{retry ? <button onClick={retry} className="underline mt-2">Try again</button> : null}</div></div>;
}

export function LiveScanPage() {
  const navigate = useNavigate();
  const [source, setSource] = useState<'demo' | 'zip'>('demo');
  const [file, setFile] = useState<File | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [job, setJob] = useState<LiveScan | null>(null);
  const controller = useRef<AbortController | null>(null);
  useEffect(() => () => controller.current?.abort(), []);

  async function start() {
    if (busy) return;
    if (source === 'zip' && (!file || file.size > 20 * 1024 * 1024)) { setError('Choose a ZIP file up to 20 MB.'); return; }
    const abort = new AbortController(); controller.current = abort;
    setBusy(true); setError(''); setJob(null);
    try {
      let projectId = 'p_demo';
      if (source === 'zip') {
        const project = await requestJson<{ id: string }>('/api/projects', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ name: file!.name.slice(0,100) }), signal: abort.signal });
        projectId = project.id;
      }
      const { scanId } = await requestJson<{ scanId: string }>(`/api/projects/${projectId}/scans`, {
        method: 'POST', headers: { 'Content-Type': source === 'demo' ? 'application/json' : 'application/zip' },
        body: source === 'demo' ? JSON.stringify({ source: 'demo' }) : file!, signal: abort.signal,
      });
      while (!abort.signal.aborted) {
        const result = await requestJson<LiveScan>(`/api/scans/${scanId}`, { signal: abort.signal });
        setJob(result);
        if (result.status === 'error') throw new Error(result.error || 'Scan failed.');
        if (result.status === 'done') { navigate(`/p/${projectId}`); return; }
        await new Promise(resolve => setTimeout(resolve, 400));
      }
    } catch (reason) {
      if (!abort.signal.aborted) setError(reason instanceof Error ? reason.message : 'Scan failed.');
    } finally { if (!abort.signal.aborted) setBusy(false); }
  }

  return <><Workflow /><div className="eyebrow mt-8">01 / SCAN YOUR APPLICATION</div><div className="page-heading"><h1 tabIndex={-1}>Find out what needs protecting.</h1><p>Scan actual source and demo customer storage. See the findings and the evidence behind each one.</p></div>
    <div className="live-scan-grid"><Card className="p-6"><fieldset disabled={busy}><legend className="font-medium mb-4">Choose what to scan</legend>
      <label className={`source-option ${source === 'demo' ? 'selected' : ''}`}><input type="radio" name="source" checked={source === 'demo'} onChange={() => setSource('demo')} /><div><strong>Chennai Organics</strong><p>Working demo shop · source + local customer database</p><span className="text-xs text-emerald-700">Recommended for the full demo</span></div></label>
      <label className={`source-option ${source === 'zip' ? 'selected' : ''}`}><input type="radio" name="source" checked={source === 'zip'} onChange={() => setSource('zip')} /><div><strong>Upload your source ZIP</strong><p>Up to 20 MB · Python patterns · partial results</p></div></label>
      {source === 'zip' ? <label className="block text-sm my-4"><Upload size={16} className="inline mr-2" />Source archive<input className="block mt-2 w-full text-sm" type="file" accept=".zip,application/zip" onChange={event => setFile(event.target.files?.[0] || null)} /></label> : null}
      <p className="text-xs text-slate-500 my-4">GitHub connection is a planned pilot feature. Uploaded code is inspected locally and never executed.</p>
      <Button className="w-full" onClick={start}>{busy ? <><LoaderCircle size={17} className="animate-spin" /> Scanning…</> : <>Start security scan <ArrowRight size={17} /></>}</Button>
    </fieldset></Card><Card className="p-6"><h2 className="text-lg">What happens next</h2><p className="text-sm text-slate-500 mt-2 mb-5">Five real checks build your initial security picture.</p><ol className="scan-stages" aria-live="polite">{stages.map((label, i) => { const complete = job?.stages.find(s => s.label === label); return <li key={label}><span className={complete ? 'stage-done' : ''}>{complete ? <CheckCircle2 size={17} /> : i + 1}</span><div><strong>{label}</strong><p>{complete ? `${complete.count} ${i === 0 ? 'files' : i === 1 ? 'crypto assets' : i === 2 ? 'customer rows sampled' : 'findings'}` : busy ? 'Waiting for scan evidence' : 'Ready when you start'}</p></div></li>; })}</ol></Card></div>
    {error ? <ErrorNotice message={error} /> : null}<p className="text-xs text-slate-500 mt-5">This local ruleset covers the demonstration patterns. A scan is evidence, not a comprehensive audit or certification.</p></>;
}

export function LiveProjectPage({ page }: { page: string }) {
  const { id = 'p_demo' } = useParams();
  const [scan, setScan] = useState<LiveScan | null>(null);
  const [verified, setVerified] = useState(false);
  const [name, setName] = useState('Project');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [reload, setReload] = useState(0);
  useEffect(() => {
    const abort = new AbortController(); let timer: ReturnType<typeof setTimeout> | undefined;
    setLoading(true); setError(''); setScan(null);
    async function load() {
      try {
        const project = await requestJson<{ name: string; scan: LiveScan | null; verified: boolean }>(`/api/projects/${encodeURIComponent(id)}`, { signal: abort.signal });
        setVerified(project.verified); setName(project.name); setScan(project.scan); setLoading(false);
        if (project.scan?.status === 'running') timer = setTimeout(load, 400);
      } catch (reason) { if (!abort.signal.aborted) { setError(reason instanceof Error ? reason.message : 'Could not load project'); setLoading(false); } }
    }
    void load(); return () => { abort.abort(); clearTimeout(timer); };
  }, [id, page, reload]);
  const step = page === 'Overview' || page === 'Findings' ? 1 : page === 'Attack Lab' ? 2 : page === 'Fix & Verify' ? 3 : 4;
  return <><Workflow step={step} /><div className="page-heading mt-7"><div className="eyebrow mb-3">{name} / {scan?.source === 'zip' ? 'UPLOADED SOURCE' : 'LOCAL DEMO'}</div><h1 tabIndex={-1}>{page}</h1><p>{page === 'Overview' ? 'Your scan results, the evidence, and what to do next.' : page === 'Findings' ? 'Review each risk in plain English or inspect the source evidence.' : 'Continue the security workflow from your latest scan.'}</p></div>
    {error ? <ErrorNotice message={error} retry={() => setReload(n => n + 1)} /> : loading ? <Card className="p-8" role="status">Loading your project…</Card> : !scan ? <Card className="empty-state"><FileSearch size={32} /><h2>Start with a security scan.</h2><p>No scan results exist for this project yet.</p><Button asChild><Link to="/scan">Start a scan <ArrowRight size={16} /></Link></Button></Card> : scan.status === 'running' ? <Card className="p-8" role="status"><LoaderCircle className="animate-spin mb-3" /><h2>Scan in progress</h2><p>{scan.stages.length} of 5 stages completed. This page updates automatically.</p></Card> : scan.status === 'error' ? <><ErrorNotice message={scan.error || 'Scan failed'} /><Link className="secondary-link mt-4" to="/scan">Start a new scan</Link></> : page === 'Overview' ? <Overview scan={scan} id={id} verified={verified} /> : page === 'Findings' ? <Findings scan={scan} id={id} /> : page === 'Attack Lab' ? <LeakPreview id={id} /> : page === 'Fix & Verify' ? <FixWorkflow id={id} /> : <ReportPage id={id} scanId={scan.id} />}
  </>;
}

function Overview({ scan, id, verified }: { scan: LiveScan; id: string; verified:boolean }) {
  return <><div className="overview-grid"><Card className="score-card"><div className={`score-ring ${scan.score >= 80 ? 'good' : scan.score >= 50 ? 'warn' : ''}`}><strong>{scan.score}</strong><span>/ 100</span></div><div><h2 className="text-lg">{verified ? 'Verified security score' : 'Candidate scan score'}</h2><p className="text-sm text-slate-500 mt-1">{scan.counts.critical > 0 ? 'Critical issues need attention.' : 'Review remaining issues and verify any fixes.'}</p><span className="small-badge inline-block mt-3">{verified ? '4 OF 4 CHECKS PASSED' : 'NOT YET VERIFIED'}</span><details className="text-xs text-slate-500 mt-3"><summary>How this score is calculated</summary><p className="mt-2">100 − 15×critical − 7×high − 3×medium − 1×low. Open and manual findings count; minimum 0. This is a candidate result, not verification of a fix.</p></details></div></Card><Card className="p-5"><h2 className="text-base mb-3">Issues found</h2><div className="severity-grid">{Object.entries(scan.counts).map(([severity,count]) => <div key={severity}><strong className={`severity-${severity}`}>{count}</strong><span>{severity}</span></div>)}</div><p className="text-xs text-slate-500 mt-3">{scan.customerCount !== null ? `${scan.customerCount.toLocaleString()} demo customers · ${scan.sampledCustomers} storage rows sampled` : 'Source-only scan · no customer database assessed'}</p></Card></div>
    <div className="flex items-center justify-between mt-5 mb-3"><h2 className="text-lg">Where your data stands</h2><span className="text-xs text-slate-500">Actual scan evidence</span></div><div className="data-map">{scan.dataMap.map(item => <Card className="p-4" key={item.dataType}><h3 className="text-sm">{names[item.dataType]}</h3><p className={`text-xs mt-2 ${item.status === 'risk' ? 'text-danger-600' : item.status === 'ok' ? 'text-emerald-700' : 'text-amber-700'}`}>{protection[item.protection]}</p><p className="text-[10px] text-slate-500 mt-2 font-mono">{item.store}</p></Card>)}</div>
    <div className="next-action"><div><strong>Next: understand the findings</strong><p>Review source evidence and available fixes before running an attack.</p></div><Button asChild><Link to={`/p/${id}/findings`}>Review {scan.findings.length} findings <ArrowRight size={16} /></Link></Button></div>
    <details className="text-xs text-slate-500 mt-3"><summary>Scan coverage and limitations</summary><ul className="mt-2 list-disc pl-5">{scan.warnings.map(w => <li key={w}>{w}</li>)}</ul><p>Finished {new Date(scan.finishedAt).toLocaleString()} · {scan.id}</p></details></>;
}

function Findings({ scan, id }: { scan: LiveScan; id: string }) {
  const [view, setView] = useState<'owner' | 'developer'>('owner');
  const [filter, setFilter] = useState('all');
  const [selected, setSelected] = useState<Evidence | null>(null);
  const dialog = useRef<HTMLDialogElement>(null);
  useEffect(() => { if (selected) dialog.current?.showModal(); }, [selected]);
  const order = { critical: 0, high: 1, medium: 2, low: 3 };
  const findings = [...scan.findings].sort((a,b) => order[a.severity] - order[b.severity]).filter(f => filter === 'all' || (filter === 'auto' ? f.autoFixable : f.severity === filter));
  return <><div className="findings-toolbar"><div className="filter-group" aria-label="Finding filters">{[['all','All'],['critical','Critical'],['high','High'],['auto','Auto-fixable']].map(([value,label]) => <button key={value} aria-pressed={filter === value} onClick={() => setFilter(value)}>{label}</button>)}</div><label className="text-sm">View <select className="border rounded p-2 ml-2" value={view} onChange={e => setView(e.target.value as 'owner' | 'developer')}><option value="owner">Owner</option><option value="developer">Developer</option></select></label></div>
    <div className="findings-list">{findings.length ? findings.map(f => <Card key={f.id} className="finding-card"><span className={`severity-label severity-${f.severity}`}>{f.severity}</span><div><h2 className="text-base">{view === 'owner' ? f.titleOwner : f.titleDev}</h2><p className="text-sm text-slate-500 mt-1">{f.whyOwner}</p>{view === 'developer' ? <code className="block text-xs mt-2 text-slate-600">{f.file}:{f.line} · {f.ruleId}</code> : null}<span className="small-badge inline-block mt-2">{f.autoFixable ? 'Eligible for planned demo fix' : 'Manual action required'}</span></div><Button variant="outline" size="sm" onClick={() => setSelected(f)}>Details</Button></Card>) : <Card className="p-8">No findings match this filter.</Card>}</div>
    <div className="next-action"><div><strong>Next: demonstrate the impact</strong><p>Inspect actual demo storage and find your newest test customer.</p></div><Button asChild><Link to={`/p/${id}/attack`}>Explore the live data preview <ArrowRight size={16} /></Link></Button></div>
    <dialog ref={dialog} className="finding-dialog" onClose={() => setSelected(null)}><div className="flex justify-between gap-4"><span className="eyebrow">FINDING EVIDENCE</span><button onClick={() => dialog.current?.close()} aria-label="Close finding details" className="border rounded px-3 py-1">Close</button></div>{selected ? <><h2 className="mt-6">{selected.titleOwner}</h2><p className="text-sm text-slate-600 mt-3">{selected.whyOwner}</p><h3 className="mt-6 text-sm">Source evidence</h3><p className="font-mono text-xs mt-2">{selected.file}:{selected.line}</p><pre className="whitespace-pre-wrap break-words bg-slate-50 p-4 rounded text-xs mt-3">{selected.snippet}</pre><h3 className="mt-5 text-sm">How to fix</h3><p className="text-sm text-slate-600 mt-2">{selected.howToFix}</p><p className="text-xs text-slate-500 mt-5">Confidence: {Math.round(selected.confidence * 100)}% · {selected.dpdpSafeguard}</p><Link className="secondary-link mt-5" to={`/p/${id}/fix`} onClick={() => dialog.current?.close()}>View Fix & Verify status</Link></> : null}</dialog></>;
}
