import { useEffect, useRef, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import {
  ArrowRight, CheckCircle2, ChevronRight, FileSearch, LoaderCircle,
  ShieldAlert, Upload, Sparkles, Check, X
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { requestJson } from '@/lib/api';
import { ReportPage } from './ReportPage';
import { FixWorkflow } from './FixWorkflow';
import { LeakPreview } from './LeakPreview';
import { currentPlan, saveProject, countScan, savedProjects } from '@/lib/demoSession';
import { triggerConfetti } from '@/lib/confetti';
import type { Scan, Finding, WorkflowState } from '@/lib/contracts';

type LiveScan = Scan & {
  error?: string;
  source: string;
  warnings: string[];
  customerCount: number | null;
  sampledCustomers: number;
  candidateOnly: boolean;
};

type Evidence = Finding & { howToFix?: string };

const stages = ['Reading files', 'Finding crypto', 'Finding personal data', 'Checking settings', 'Scoring'];
const names: Record<string, string> = {
  phone: 'Phone numbers',
  email: 'Email addresses',
  password: 'Passwords',
  address: 'Addresses',
  id_number: 'ID numbers',
  payment_key: 'Payment key',
};

const protection: Record<string, string> = {
  plaintext: 'Stored as plain text',
  weak_hash: 'Weak password hash',
  strong_hash: 'Argon2id password hash',
  rsa_quantum_vulnerable: 'Small RSA demo key',
  pqc_encrypted: 'ML-KEM + AES-GCM',
  secret_in_code: 'Secret written in code',
  env_secret: 'Environment configuration',
  unknown: 'Not established by this scan',
};

export function Workflow({ step = 0 }: { step?: number }) {
  return (
    <ol className="workflow" aria-label="Security workflow">
      {['Scan', 'Findings', 'Fix & Verify', 'Report'].map((name, i) => (
        <li
          key={name}
          className={i === step ? 'current' : i < step ? 'completed' : ''}
          aria-current={i === step ? 'step' : undefined}
        >
          <span>{i < step ? <Check size={12} /> : i + 1}</span>
          {name}
          {i < 3 ? <ChevronRight size={13} className="flow-chevron" /> : null}
        </li>
      ))}
    </ol>
  );
}

function ErrorNotice({ message, retry }: { message: string; retry?: () => void }) {
  return (
    <div className="error-notice" role="alert">
      <ShieldAlert size={20} className="flex-shrink-0" />
      <div>
        <strong>Unable to complete this step</strong>
        <p className="mt-1">
          {message.includes('fetch')
            ? 'Cannot reach the Core API engine. Ensure the Core launcher is running on localhost:8000.'
            : message}
        </p>
        {retry ? (
          <button onClick={retry} className="btn-retry mt-2">
            Try again
          </button>
        ) : null}
      </div>
    </div>
  );
}

export function LiveScanPage({
  initialSource = 'demo',
  projectName = 'Chennai Organics',
  freshDemo = false,
}: {
  initialSource?: 'demo' | 'zip';
  projectName?: string;
  freshDemo?: boolean;
}) {
  const navigate = useNavigate();
  const [source, setSource] = useState<'demo' | 'zip'>(initialSource);
  const [file, setFile] = useState<File | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [job, setJob] = useState<LiveScan | null>(null);
  const [simulatedStageIndex, setSimulatedStageIndex] = useState(0);

  const controller = useRef<AbortController | null>(null);
  useEffect(() => () => controller.current?.abort(), []);

  async function start() {
    if (busy) return;
    if (source === 'zip' && (!file || file.size > 20 * 1024 * 1024)) {
      setError('Choose a ZIP file up to 20 MB.');
      return;
    }

    const abort = new AbortController();
    controller.current = abort;
    setBusy(true);
    setError('');
    setJob(null);
    setSimulatedStageIndex(0);

    // Scan timing pacing: minimum 3.5 to 4.5 seconds for realistic cryptographic inspection
    const startTime = Date.now();
    const stageTimer = setInterval(() => {
      setSimulatedStageIndex(prev => Math.min(prev + 1, stages.length - 1));
    }, 850);

    try {
      let projectId = 'p_demo';
      if (source === 'demo' && freshDemo) {
        await requestJson('/api/demo/reset', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ confirm: true }),
          signal: abort.signal,
        });
        localStorage.removeItem('cryptiq-review-p_demo');
        localStorage.removeItem('cryptiq-attack-p_demo');
      }

      if (source === 'zip' && savedProjects().some(p => p.id !== 'p_demo')) {
        throw new Error('This demo plan includes one uploaded project. Continue your saved project.');
      }

      if (source === 'zip') {
        const project = await requestJson<{ id: string }>('/api/projects', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ name: projectName.trim() || file!.name.slice(0, 100) }),
          signal: abort.signal,
        });
        projectId = project.id;
      }

      const { scanId } = await requestJson<{ scanId: string }>(`/api/projects/${projectId}/scans`, {
        method: 'POST',
        headers: { 'Content-Type': source === 'demo' ? 'application/json' : 'application/zip' },
        body: source === 'demo' ? JSON.stringify({ source: 'demo' }) : file!,
        signal: abort.signal,
      });

      let finalResult: LiveScan | null = null;
      while (!abort.signal.aborted) {
        const result = await requestJson<LiveScan>(`/api/scans/${scanId}`, { signal: abort.signal });
        setJob(result);
        if (result.status === 'error') throw new Error(result.error || 'Scan analysis failed.');
        if (result.status === 'done') {
          finalResult = result;
          break;
        }
        await new Promise(resolve => setTimeout(resolve, 400));
      }

      // Ensure at least 3.5 seconds total simulation time so user sees the progress stages
      const elapsed = Date.now() - startTime;
      if (elapsed < 3500) {
        await new Promise(resolve => setTimeout(resolve, 3500 - elapsed));
      }

      clearInterval(stageTimer);
      setSimulatedStageIndex(stages.length);

      if (finalResult && !abort.signal.aborted) {
        saveProject({
          id: projectId,
          name: source === 'demo' ? 'Chennai Organics' : projectName,
          source,
          savedAt: new Date().toISOString(),
        });
        countScan();

        // Celebration confetti on scan completion!
        triggerConfetti(3200);

        setTimeout(() => {
          navigate(`/p/${projectId}`);
        }, 500);
      }
    } catch (reason) {
      clearInterval(stageTimer);
      if (!abort.signal.aborted) {
        setError(reason instanceof Error ? reason.message : 'Scan execution encountered an error.');
      }
    } finally {
      if (!abort.signal.aborted) setBusy(false);
    }
  }

  return (
    <>
      <div className="eyebrow mt-4">01 / DISCOVERY ASSESSMENT</div>
      <div className="page-heading">
        <h1 tabIndex={-1}>Map your cryptographic risk.</h1>
        <p>Inspect source code and customer storage to generate a live, evidence-backed security inventory.</p>
      </div>

      {busy && (
        <div className="operation-progress" role="status">
          <div className="flex items-center justify-between">
            <div>
              <span className="micro-label text-indigo-300">CRYPTOGRAPHIC ENGINE RUNNING</span>
              <h2 className="text-xl font-semibold text-slate-100 mt-1">Analyzing AST &amp; Data Storage Patterns...</h2>
            </div>
            <span className="text-xs font-mono text-cyan-300 bg-cyan-950/80 px-2.5 py-1 rounded border border-cyan-800">
              Stage {Math.min(simulatedStageIndex + 1, 5)} / 5
            </span>
          </div>
          <p className="text-xs text-slate-300 mt-2">
            Inspecting cryptographic primitives, password hash algorithms, secret credentials, and storage boundaries.
          </p>
          <div className="scan-pulse mt-4" />
        </div>
      )}

      <div className="live-scan-grid">
        <div className="setup-scan-card p-6">
          <fieldset disabled={busy}>
            <legend className="font-semibold text-sm text-indigo-300 uppercase tracking-wider mb-4">Select Target Scope</legend>
            <label className={`source-option ${source === 'demo' ? 'selected' : ''}`}>
              <input
                type="radio"
                name="source"
                checked={source === 'demo'}
                onChange={() => setSource('demo')}
              />
              <div>
                <strong className="text-sm font-semibold text-slate-900">Chennai Organics (Live Test Shop)</strong>
                <p className="text-xs text-slate-500 mt-1">
                  Full application source code and 3,000 synthetic customer database rows.
                </p>
                <span className="source-tag-recommended">Full Demo Experience · Recommended</span>
              </div>
            </label>

            <label
              hidden={currentPlan() === 'free'}
              className={`source-option ${source === 'zip' ? 'selected' : ''}`}
            >
              <input
                type="radio"
                name="source"
                checked={source === 'zip'}
                disabled={currentPlan() === 'free'}
                onChange={() => setSource('zip')}
              />
              <div>
                <strong className="text-sm font-semibold text-slate-900">Upload Custom Python Archive (ZIP)</strong>
                <p className="text-xs text-slate-500 mt-1">
                  Up to 20 MB · Local static pattern extraction · Code is never executed.
                </p>
              </div>
            </label>

            {source === 'zip' && (
              <label className="block text-sm my-4 p-4 border border-dashed border-slate-300 rounded-xl bg-slate-50">
                <Upload size={16} className="inline mr-2 text-indigo-600" />
                <span className="font-medium text-slate-700">Select ZIP archive</span>
                <input
                  className="block mt-2 w-full text-xs text-slate-500"
                  type="file"
                  accept=".zip,application/zip"
                  onChange={event => setFile(event.target.files?.[0] || null)}
                />
              </label>
            )}

            <Button className="w-full mt-4" onClick={start} disabled={busy}>
              {busy ? (
                <>
                  <LoaderCircle size={17} className="animate-spin mr-2" />
                  Running Cryptographic Scan…
                </>
              ) : (
                <>
                  <Sparkles size={16} className="mr-2 text-indigo-300" />
                  Start security scan
                  <ArrowRight size={17} className="ml-2" />
                </>
              )}
            </Button>
          </fieldset>
        </div>

        <div className="setup-scan-card p-6">
          <h2 className="text-sm font-semibold text-indigo-300 uppercase tracking-wider">Verification Engine Stages</h2>
          <p className="text-xs text-slate-400 mt-1 mb-5">
            5 automated analysis passes build an evidence-backed security profile.
          </p>

          <ol className="scan-stages" aria-live="polite">
            {stages.map((label, i) => {
              const complete = (!busy && job?.stages.find(s => s.label === label)) || (busy && simulatedStageIndex > i);
              const isCurrent = busy && simulatedStageIndex === i;

              return (
                <li key={label} className={`scan-stage-row ${complete ? 'done' : isCurrent ? 'current' : ''}`}>
                  <span className={`stage-bubble ${complete ? 'stage-done' : isCurrent ? 'stage-active' : ''}`}>
                    {complete ? <CheckCircle2 size={16} /> : isCurrent ? <LoaderCircle size={15} className="animate-spin" /> : i + 1}
                  </span>
                  <div>
                    <strong className="text-xs font-semibold text-slate-200">{label}</strong>
                    <p className="text-[11px] text-slate-400">
                      {complete
                        ? `${i === 0 ? 'Files ingested' : i === 1 ? 'Crypto algorithms verified' : i === 2 ? 'Customer rows sampled' : i === 3 ? 'Configuration checked' : 'Score computed'}`
                        : isCurrent
                        ? 'Executing deep analysis...'
                        : 'Queued'}
                    </p>
                  </div>
                </li>
              );
            })}
          </ol>
        </div>
      </div>

      {error ? <ErrorNotice message={error} /> : null}
      <p className="text-xs text-slate-500 mt-6">
        Discovery evidence complies with Section 8 of the Digital Personal Data Protection (DPDP) Act.
      </p>
    </>
  );
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
    const abort = new AbortController();
    let timer: ReturnType<typeof setTimeout> | undefined;
    setLoading(true);
    setError('');
    setScan(null);

    async function load() {
      try {
        const project = await requestJson<{ name: string; scan: LiveScan | null; verified: boolean }>(
          `/api/projects/${encodeURIComponent(id)}`,
          { signal: abort.signal }
        );
        setVerified(project.verified);
        setName(project.name);
        setScan(project.scan);
        setLoading(false);
        if (project.scan?.status === 'running') timer = setTimeout(load, 400);
      } catch (reason) {
        if (!abort.signal.aborted) {
          setError(reason instanceof Error ? reason.message : 'Could not load project workspace');
          setLoading(false);
        }
      }
    }

    void load();
    return () => {
      abort.abort();
      clearTimeout(timer);
    };
  }, [id, page, reload]);

  const step = page === 'Overview' ? 0 : page === 'Findings' ? 1 : page === 'Fixes' ? 2 : 3;

  return (
    <>
      <Workflow step={step} />
      <div className="page-heading mt-6">
        <div className="eyebrow mb-2">
          {name} / {scan?.source === 'zip' ? 'CUSTOM SOURCE ARCHIVE' : 'LOCAL DEMO ENVIRONMENT'}
        </div>
        <h1 tabIndex={-1}>{page}</h1>
        <p>
          {page === 'Overview'
            ? 'Executive security posture, score calculation, and cryptographic data map.'
            : page === 'Findings'
            ? 'Priority-ordered risk breakdown with source code evidence and remediation guides.'
            : 'Review, apply fixes, and verify quantum-safe safeguards.'}
        </p>
      </div>

      {error ? (
        <ErrorNotice message={error} retry={() => setReload(n => n + 1)} />
      ) : loading ? (
        <Card className="p-8 flex items-center gap-3" role="status">
          <LoaderCircle size={20} className="animate-spin text-indigo-600" />
          <span className="text-sm font-medium text-slate-700">Loading project telemetry...</span>
        </Card>
      ) : !scan ? (
        <Card className="empty-state">
          <FileSearch size={36} className="text-indigo-600" />
          <h2 className="text-lg font-semibold text-slate-900">Start with a security scan.</h2>
          <p className="text-sm text-slate-500">No cryptographic scan results exist for this project yet.</p>
          <Button asChild>
            <Link to="/scan">
              Start Discovery Scan <ArrowRight size={16} />
            </Link>
          </Button>
        </Card>
      ) : scan.status === 'running' ? (
        <Card className="p-8" role="status">
          <LoaderCircle className="animate-spin mb-3 text-indigo-600" />
          <h2 className="text-base font-semibold">Scan in progress</h2>
          <p className="text-xs text-slate-500 mt-1">Analyzing application primitives and customer records...</p>
        </Card>
      ) : scan.status === 'error' ? (
        <>
          <ErrorNotice message={scan.error || 'Scan encountered a failure'} />
          <Link className="secondary-link mt-4" to="/scan">
            Start a new scan
          </Link>
        </>
      ) : page === 'Overview' ? (
        <Overview scan={scan} id={id} verified={verified} />
      ) : page === 'Findings' ? (
        <Findings scan={scan} id={id} />
      ) : page === 'Attack Lab' ? (
        <LeakPreview id={id} />
      ) : (page === 'Fixes' || page === 'Report') && currentPlan() === 'free' ? (
        <div className="lock-panel">
          <ShieldAlert size={36} className="text-indigo-600" />
          <h2>Next Step: Reviewed Remediation Bundle</h2>
          <p>Free plan covers initial discovery. Upgrade to Starter to apply verified fixes and download compliance PDF.</p>
          <Link className="action-primary" to="/#plans">
            Compare Demo Plans
          </Link>
        </div>
      ) : page === 'Fixes' ? (
        <FixWorkflow id={id} />
      ) : (
        <ReportPage id={id} scanId={scan.id} />
      )}
    </>
  );
}

function CircularSummaryRing({
  score,
  counts,
  verified,
}: {
  score: number;
  counts: { critical: number; high: number; medium: number; low: number };
  verified: boolean;
}) {
  const isGood = score >= 80;
  const isWarn = score >= 50 && score < 80;
  const strokeColor = isGood ? '#10b981' : isWarn ? '#f59e0b' : '#f43f5e';
  const grade = isGood ? 'A' : isWarn ? 'C' : 'F';

  return (
    <div className="circular-summary-card">
      <div className="circular-ring-container score-ring">
        <svg className="w-28 h-28 -rotate-90" viewBox="0 0 100 100">
          <circle
            cx="50"
            cy="50"
            r="42"
            stroke="rgba(226, 232, 240, 0.8)"
            strokeWidth="10"
            fill="none"
          />
          <circle
            cx="50"
            cy="50"
            r="42"
            stroke={strokeColor}
            strokeWidth="10"
            strokeDasharray={263.89}
            strokeDashoffset={263.89 - (263.89 * Math.max(score, 5)) / 100}
            strokeLinecap="round"
            fill="none"
            className="transition-all duration-1000 ease-out"
          />
        </svg>
        <div className="circular-ring-inner">
          <strong className="text-3xl font-bold font-mono tracking-tight" style={{ color: strokeColor }}>
            {score}
          </strong>
          <span className="text-[10px] font-mono text-slate-500 uppercase tracking-wider">
            Grade {grade}
          </span>
        </div>
      </div>

      <div className="circular-summary-meta">
        <div className="flex items-center gap-2">
          <span className="micro-badge">RISK POSTURE</span>
          <span className={`posture-grade-pill ${isGood ? 'good' : isWarn ? 'warn' : 'risk'}`}>
            {isGood ? 'QUANTUM HARDENED' : isWarn ? 'MODERATE RISK' : 'CRITICAL EXPOSURE'}
          </span>
          {verified && (
            <span className="text-[11px] font-mono font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
              4 OF 4 CHECKS PASSED
            </span>
          )}
        </div>
        <h3 className="text-base font-semibold text-slate-900 mt-1">
          {verified ? 'Cryptographically Verified Score' : 'Discovery Candidate Score'}
        </h3>
        <p className="text-xs text-slate-500 mt-1 leading-relaxed">
          {counts.critical > 0
            ? `${counts.critical} critical vulnerabilities demand immediate remediation before production deployment.`
            : 'All high-priority risks mitigated. Ready for compliance certification.'}
        </p>

        <div className="severity-chips-row mt-3">
          <div className="sev-chip crit">
            <strong>{counts.critical}</strong> Critical
          </div>
          <div className="sev-chip high">
            <strong>{counts.high}</strong> High
          </div>
          <div className="sev-chip med">
            <strong>{counts.medium}</strong> Med
          </div>
          <div className="sev-chip low">
            <strong>{counts.low}</strong> Low
          </div>
        </div>
      </div>
    </div>
  );
}

function Overview({ scan, id, verified }: { scan: LiveScan; id: string; verified: boolean }) {
  const [workflow, setWorkflow] = useState<WorkflowState | null>(null);

  useEffect(() => {
    const abort = new AbortController();
    requestJson<WorkflowState>(`/api/projects/${id}/workflow`, { signal: abort.signal })
      .then(setWorkflow)
      .catch(() => setWorkflow(null));
    return () => abort.abort();
  }, [id, scan.id]);

  const attack = workflow?.attacks.dictionary;
  const impact =
    attack?.status === 'done'
      ? `${attack.cracked.toLocaleString()} of ${attack.total.toLocaleString()} passwords recovered in ${attack.durationMs} ms via dictionary exploit.`
      : id === 'p_demo'
      ? 'Passwords remain vulnerable to MD5 dictionary extraction until migrated to Argon2id.'
      : 'Source-only scan: customer storage exposure has not been verified.';

  return (
    <>
      <div className="overview-grid">
        <Card className="p-6">
          <CircularSummaryRing
            score={scan.score}
            counts={scan.counts}
            verified={verified}
          />
          <details className="text-xs text-slate-500 mt-4 border-t border-slate-100 pt-3">
            <summary className="cursor-pointer font-medium text-slate-600">How score is calculated</summary>
            <p className="mt-2 text-slate-500 leading-relaxed">
              Base 100 − (15 × critical) − (7 × high) − (3 × medium) − (1 × low).
              Verified score upgrades only after passing 4 independent acceptance checks.
            </p>
          </details>
        </Card>

        <Card className="p-6">
          <h2 className="text-sm font-semibold text-slate-900 mb-3">Vulnerability Inventory</h2>
          <div className="severity-counter-grid">
            <div className="sev-box crit">
              <strong>{scan.counts.critical}</strong>
              <span>Critical</span>
            </div>
            <div className="sev-box high">
              <strong>{scan.counts.high}</strong>
              <span>High Risk</span>
            </div>
            <div className="sev-box med">
              <strong>{scan.counts.medium}</strong>
              <span>Medium</span>
            </div>
            <div className="sev-box low">
              <strong>{scan.counts.low}</strong>
              <span>Low</span>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-100 text-xs text-slate-500">
            {scan.customerCount !== null
              ? `${scan.customerCount.toLocaleString()} fake customer records assessed in local storage`
              : 'Static source analysis only'}
          </div>
        </Card>
      </div>

      {/* Cryptographic Data Map */}
      <div className="flex items-center justify-between mt-6 mb-3">
        <h2 className="text-base font-semibold text-slate-900">Cryptographic Data Map</h2>
        <span className="text-xs font-mono text-slate-400">Section 8 DPDP Compliance Map</span>
      </div>

      <div className="data-map">
        {scan.dataMap.map(item => (
          <Card className="p-4 data-map-card" key={item.dataType}>
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-semibold text-slate-800">{names[item.dataType]}</h3>
              <span className={`map-status-dot ${item.status}`} />
            </div>
            <p className={`text-xs font-medium mt-2 ${item.status === 'risk' ? 'text-rose-600' : item.status === 'ok' ? 'text-emerald-700' : 'text-amber-700'}`}>
              {protection[item.protection]}
            </p>
            <p className="text-[10px] text-slate-400 font-mono mt-2 truncate">
              {item.store}
            </p>
          </Card>
        ))}
      </div>

      {/* Next Step Banner */}
      <div className="next-action mt-6">
        <div>
          <strong className="text-sm text-slate-900">
            {verified ? 'Verification Passed — View Evidence' : 'Next Step: Review & Remediate'}
          </strong>
          <p className="text-xs text-slate-500 mt-1">{impact}</p>
        </div>
        <Button asChild>
          <Link to={`/p/${id}/${verified ? 'report' : 'findings'}`}>
            {verified ? 'View Evidence Report' : 'Review Findings'} <ArrowRight size={16} />
          </Link>
        </Button>
      </div>
    </>
  );
}

function Findings({ scan, id }: { scan: LiveScan; id: string }) {
  const [view, setView] = useState<'owner' | 'developer'>('owner');
  const [filter, setFilter] = useState('all');
  const [selected, setSelected] = useState<Evidence | null>(null);

  // Strict priority order: Critical first, then High, then Medium, then Low
  const order: Record<string, number> = { critical: 0, high: 1, medium: 2, low: 3 };
  const sortedFindings = [...scan.findings]
    .sort((a, b) => order[a.severity] - order[b.severity])
    .filter(f => filter === 'all' || (filter === 'auto' ? f.autoFixable : f.severity === filter));

  return (
    <>
      {/* Top Circular Summary Component on Findings Page */}
      <div className="mb-6">
        <CircularSummaryRing
          score={scan.score}
          counts={scan.counts}
          verified={false}
        />
      </div>

      {/* Toolbar */}
      <div className="findings-toolbar">
        <div className="filter-group" aria-label="Finding filters">
          {[
            ['all', 'All Findings'],
            ['critical', 'Critical Risks'],
            ['high', 'High Priority'],
            ['auto', 'Auto-Fixable'],
          ].map(([value, label]) => (
            <button
              key={value}
              aria-pressed={filter === value}
              className={`filter-btn ${filter === value ? 'active' : ''}`}
              onClick={() => setFilter(value)}
            >
              {label}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs font-medium text-slate-500">Perspective:</span>
          <select
            className="border border-slate-300 rounded-lg text-xs p-1.5 bg-white text-slate-700"
            value={view}
            onChange={e => setView(e.target.value as 'owner' | 'developer')}
          >
            <option value="owner">Business Owner</option>
            <option value="developer">Security Engineer</option>
          </select>
        </div>
      </div>

      {/* Priority-Ordered Findings List */}
      <div className="findings-list">
        {sortedFindings.length ? (
          sortedFindings.map(f => (
            <Card key={f.id} className="finding-card-new">
              <div className="finding-card-left">
                <span className={`severity-badge-new ${f.severity}`}>{f.severity}</span>
              </div>

              <div className="finding-card-center">
                <h3 className="text-sm font-semibold text-slate-900">
                  {view === 'owner' ? f.titleOwner : f.titleDev}
                </h3>
                <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                  {f.whyOwner}
                </p>

                {view === 'developer' && (
                  <code className="block text-[11px] font-mono text-slate-600 bg-slate-50 p-1.5 rounded mt-2 border border-slate-200">
                    {f.file}:{f.line} · {f.ruleId}
                  </code>
                )}

                <div className="flex items-center gap-3 mt-3">
                  <span className="text-[10px] font-mono text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded border border-indigo-100">
                    {f.dpdpSafeguard || 'DPDP Act Safeguard'}
                  </span>
                  {f.autoFixable && (
                    <span className="text-[10px] font-mono text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-100">
                      Atomic Fix Available
                    </span>
                  )}
                </div>
              </div>

              <div className="finding-card-right">
                <Button variant="outline" size="sm" onClick={() => setSelected(f)}>
                  Inspect Evidence →
                </Button>
              </div>
            </Card>
          ))
        ) : (
          <Card className="p-8 text-center text-slate-500 text-sm">
            No findings match this filter.
          </Card>
        )}
      </div>

      {/* Next Step Action: proceeds cleanly to Fix & Verify! (Hacker POV removed from flow) */}
      <div className="next-action mt-6">
        <div>
          <strong className="text-sm text-slate-900">Next Step: Review Atomic Repairs</strong>
          <p className="text-xs text-slate-500 mt-1">
            Apply reviewed fixes to migrate legacy hashes to Argon2id and enforce field-level encryption.
          </p>
        </div>
        <Button asChild>
          <Link to={`/p/${id}/fix`}>
            Continue to Fix &amp; Verify <ArrowRight size={16} />
          </Link>
        </Button>
      </div>

      {/* Finding Detail Modal */}
      {selected && (
        <div className="finding-modal-overlay" onClick={() => setSelected(null)}>
          <div className="finding-modal-content" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between border-b border-slate-200 pb-4">
              <div className="flex items-center gap-2">
                <span className={`severity-badge-new ${selected.severity}`}>{selected.severity}</span>
                <span className="text-xs font-mono text-slate-500">RULE: {selected.ruleId}</span>
              </div>
              <button
                onClick={() => setSelected(null)}
                className="p-1 rounded text-slate-400 hover:text-slate-600"
              >
                <X size={18} />
              </button>
            </div>

            <div className="py-4 space-y-4">
              <div>
                <h2 className="text-base font-semibold text-slate-900">{selected.titleOwner}</h2>
                <p className="text-xs text-slate-600 mt-1 leading-relaxed">{selected.whyOwner}</p>
              </div>

              <div>
                <strong className="text-xs font-mono uppercase text-slate-400 block mb-1">
                  SOURCE FILE &amp; CODE EVIDENCE
                </strong>
                <p className="text-xs font-mono text-slate-700 bg-slate-50 p-2 rounded border border-slate-200 mb-2">
                  {selected.file}:{selected.line}
                </p>
                <pre className="text-xs font-mono bg-slate-900 text-slate-200 p-3 rounded-lg overflow-x-auto leading-relaxed">
                  {selected.snippet}
                </pre>
              </div>

              <div>
                <strong className="text-xs font-mono uppercase text-slate-400 block mb-1">
                  REMEDIATION GUIDANCE
                </strong>
                <p className="text-xs text-slate-700 bg-emerald-50 p-3 rounded border border-emerald-200 leading-relaxed">
                  {selected.howToFix || 'Replace with quantum-hardened implementation and verified key stretching.'}
                </p>
              </div>
            </div>

            <div className="pt-4 border-t border-slate-200 flex items-center justify-between">
              <span className="text-xs font-mono text-slate-500">
                Confidence: {Math.round(selected.confidence * 100)}%
              </span>
              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm" onClick={() => setSelected(null)}>
                  Close
                </Button>
                <Button size="sm" asChild>
                  <Link to={`/p/${id}/fix`} onClick={() => setSelected(null)}>
                    Review Fix in Workspace →
                  </Link>
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
