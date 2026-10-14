import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Activity, ArrowLeft, ArrowUpRight, CheckCircle2, ChevronRight,
  Database, Eye, EyeOff, Fingerprint, KeyRound, Lock, Radio, Shield,
  ShieldAlert, Terminal, Wallet, Copy, Check, Flame, AlertTriangle, Bell, X
} from 'lucide-react';
import { requestJson } from '@/lib/api';
import type { Attack } from './DictionaryAttack';
import './HackerNotifications.css';

type Event = { id: string; kind: string; customerId: number; orderId?: number; at: string };
type RecordRow = { id: number; name: string; phone?: string; email?: string; password_hash: string; id_number: string };
type Snapshot = { rows: RecordRow[]; mode: string; total: number };

// Featured high-profile targets known to exist deterministically in seed
const PRIME_TARGETS = [
  { id: 1, name: 'Priya S', role: 'Chief Founder / VIP', email: 'priya@example.test', expectedPass: 'priya@123' },
  { id: 2, name: 'Arjun Kumar', role: 'Lead Procurement', email: 'customer0002@example.test', expectedPass: 'arjun123' },
  { id: 3, name: 'Kavya Raman', role: 'Operations Lead', email: 'customer0003@example.test', expectedPass: 'password1' },
  { id: 4, name: 'Ravi Krishnan', role: 'Finance Admin', email: 'customer0004@example.test', expectedPass: 'ravi@123' },
  { id: 5, name: 'Meena Nair', role: 'Store Dispatch', email: 'customer0005@example.test', expectedPass: 'welcome123' },
];

export function HackerObservatory() {
  const [events, setEvents] = useState<Event[]>([]);
  const [snapshot, setSnapshot] = useState<Snapshot | null>(null);
  const [target, setTarget] = useState<number>(1); // Default to Priya S (#1) so exploit is instantly ready
  const [module, setModule] = useState<'password' | 'transaction' | 'rsa' | 'network' | 'session'>('password');
  const [result, setResult] = useState<Attack | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [online, setOnline] = useState(false);
  const [transaction, setTransaction] = useState<'exposed' | 'blocked' | ''>('');
  const [stage, setStage] = useState(0);
  const [copied, setCopied] = useState(false);
  const [showPlaintext, setShowPlaintext] = useState(true);

  const control = useRef<AbortController | null>(null);
  const running = useRef(false);
  const workbench = useRef<HTMLElement>(null);
  const [selectedRow, setSelectedRow] = useState<RecordRow | null>(null);
  const [notifications, setNotifications] = useState<Event[]>([]);
  const seenEvents = useRef<Set<string> | null>(null);
  useEffect(() => {
    if (!notifications.length || busy) return;
    const timer = setTimeout(() => setNotifications([]), 15000);
    return () => clearTimeout(timer);
  }, [notifications, busy]);
  useEffect(() => {
    const abort = new AbortController();
    setSelectedRow(null);
    requestJson<Snapshot>(`/api/projects/p_demo/leak-preview?customer_id=${target}`, {signal: abort.signal})
      .then(value => { if (!abort.signal.aborted) setSelectedRow(value.rows[0] || null); }).catch(() => {});
    return () => abort.abort();
  }, [target, snapshot?.mode, snapshot?.total]);

  useEffect(() => {
    setResult(null);
    setTransaction('');
  }, [snapshot?.mode]);

  useEffect(() => {
    const abort = new AbortController();
    let timer: ReturnType<typeof setTimeout>;

    async function poll() {
      try {
        const [a, b] = await Promise.all([
          requestJson<{ events: Event[] }>('/api/demo/activity', { signal: abort.signal }),
          requestJson<Snapshot>('/api/projects/p_demo/leak-preview?limit=20', { signal: abort.signal }),
        ]);
        if (abort.signal.aborted) return;
        if (seenEvents.current) {
          const arrivals = a.events.filter(event => !seenEvents.current!.has(event.id));
          if (arrivals.length) setNotifications(current => [...arrivals, ...current].slice(0, 3));
        }
        seenEvents.current = new Set(a.events.map(event => event.id));
        setEvents(a.events);
        setSnapshot(b);
        setOnline(true);
      } catch {
        if (!abort.signal.aborted) setOnline(false);
      } finally {
        if (!abort.signal.aborted) timer = setTimeout(poll, 2500);
      }
    }

    void poll();
    return () => {
      abort.abort();
      clearTimeout(timer);
      control.current?.abort();
    };
  }, []);

  useEffect(() => {
    if (!busy) return;
    const timer = setInterval(() => setStage(n => (n + 1) % 4), 650);
    return () => clearInterval(timer);
  }, [busy]);

  function select(id: number, kind: 'password' | 'transaction' | 'rsa' = 'password') {
    if (busy) return;
    setTarget(id);
    setModule(kind);
    setResult(null);
    setTransaction('');
    setError('');
    requestAnimationFrame(() => { workbench.current?.scrollIntoView({behavior: 'smooth', block: 'start'}); workbench.current?.focus({preventScroll: true}); });
  }

  async function playTransaction() {
    if (running.current) return;
    running.current = true;
    const abort = new AbortController();
    control.current = abort;
    setBusy(true);
    setStage(0);
    setTransaction('');
    await new Promise(resolve => setTimeout(resolve, 2200));
    if (!abort.signal.aborted) {
      setTransaction(snapshot?.mode === 'after' ? 'blocked' : 'exposed');
      setBusy(false);
    }
    running.current = false;
  }

  async function run(kind: 'dictionary' | 'shor_sim') {
    if (running.current) return;
    running.current = true;
    const abort = new AbortController();
    control.current = abort;
    setBusy(true);
    setResult(null);
    setError('');
    setStage(0);

    try {
      const { attackId } = await requestJson<{ attackId: string }>('/api/projects/p_demo/attacks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ kind, budgetSeconds: 5, ...(kind === 'dictionary' ? {customerId: target} : {}) }),
        signal: abort.signal,
      });

      while (!abort.signal.aborted) {
        const value = await requestJson<Attack>(`/api/attacks/${attackId}`, { signal: abort.signal });
        setResult(value);
        if (value.status === 'error') throw new Error(value.error || 'Exploit attempt encountered an unexpected error');
        if (value.status === 'done') break;
        await new Promise(resolve => setTimeout(resolve, 350));
      }
    } catch (e) {
      if (!abort.signal.aborted) {
        setError(e instanceof Error ? e.message : 'Exploit execution failed');
      }
    } finally {
      running.current = false;
      if (!abort.signal.aborted) setBusy(false);
    }
  }

  const selectedTargetInfo = selectedRow ||
    snapshot?.rows.find(r => r.id === target) ||
    { id: target, name: `Account #${target}` };

  const targetName = 'name' in selectedTargetInfo ? selectedTargetInfo.name : `Target #${target}`;
  const targetEmail = 'email' in selectedTargetInfo ? selectedTargetInfo.email : `customer${target}@example.test`;

  // Look for target in attack results
  const revealedRecord = result?.revealed?.find(
    r => r.customerId === target && r.field === (module === 'rsa' ? 'id_number' : 'password')
  );

  const isPasswordSuccess = Boolean(module === 'password' && result?.status === 'done' && revealedRecord);
  const isRsaSuccess = Boolean(module === 'rsa' && result?.status === 'done' && revealedRecord);
  const crackedPasswordValue = revealedRecord?.value || '';

  function copyToClipboard(text: string) {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <div className="hacker-shell">
      {/* Top HUD */}
      <header className="hacker-header">
        <div className="flex items-center gap-4">
          <Link to="/hacker" className="hacker-wordmark">
            <Fingerprint className="text-rose-500 animate-pulse" size={24} />
            <span>CRYPTIQ // OFFENSIVE COMMAND</span>
            <small className="hud-badge">TACTICAL RED TEAM</small>
          </Link>
        </div>

        <div className="flex items-center gap-4">
          <div className="hacker-live-tag">
            <Radio size={14} className={online ? 'text-rose-500 animate-ping' : 'text-slate-500'} />
            <span className="font-mono text-xs">{online ? 'INTERCEPT FEED ACTIVE' : 'CONNECTING...'}</span>
          </div>

          <a
            href="http://localhost:5050"
            target="_blank"
            rel="noreferrer"
            className="hacker-ext-link"
          >
            Target Shop :5050 <ArrowUpRight size={14} />
          </a>
        </div>
      </header>

      <section className="shop-notifications" aria-label="Shop activity notifications" aria-live="polite">
        {notifications.map(event => <article className="shop-notification" key={event.id}>
          <Bell size={20} className="notification-bell" />
          <button disabled={busy} className="notification-open" onClick={() => {
            select(event.customerId, event.kind === 'checkout' ? 'transaction' : 'password');
            setNotifications(current => current.filter(item => item.id !== event.id));
          }}>
            <strong>{event.kind === 'signup' ? 'New registration' : event.kind === 'login' ? 'New sign-in' : 'New checkout'} - Account #{event.customerId}</strong>
            <span>Chennai Organics · {new Date(event.at).toLocaleTimeString()}</span>
            <span>Open {event.kind === 'checkout' ? 'transaction' : 'password'} workbench</span>
          </button>
          <button className="notification-dismiss" aria-label="Dismiss notification" onClick={() => setNotifications(current => current.filter(item => item.id !== event.id))}><X size={16} /></button>
        </article>)}
      </section>
      {/* Main Grid */}
      <div className="hacker-main">
        {/* Left Rail: Exploit Modules */}
        <aside className="hacker-rail">
          <span className="hacker-micro-label">EXPLOITATION MODULES</span>

          {[
            { id: 'password', icon: KeyRound, label: 'Credential exposure', tag: 'MD5 DICTIONARY', active: true },
            { id: 'rsa', icon: Database, label: 'Public-key analysis', tag: 'CLASSICAL FACTOR', active: true },
            { id: 'transaction', icon: Wallet, label: 'Transaction integrity', tag: 'SCRIPTED SANDBOX', active: true },
            { id: 'network', icon: Activity, label: 'Traffic Sniffer', tag: 'PASSIVE TLS', active: false },
            { id: 'session', icon: Lock, label: 'Cookie Hijacker', tag: 'SESSION HIJACK', active: false },
          ].map(({ icon: Icon, ...m }) => (
            <button
              key={m.id}
              disabled={busy}
              className={`hacker-module-btn ${module === m.id ? 'selected' : ''}`}
              onClick={() => {
                setModule(m.id as any);
                setResult(null);
                setTransaction('');
                setError('');
              }}
            >
              <Icon size={18} />
              <div className="flex-1 text-left">
                <strong>{m.label}</strong>
                <small>{m.tag}</small>
              </div>
              <ChevronRight size={14} className="opacity-50" />
            </button>
          ))}

          {/* Scope terminal */}
          <div className="hacker-scope-box">
            <div className="flex items-center gap-2 mb-2">
              <span className="tactical-dot" />
              <strong className="text-xs font-mono text-rose-400">ACTIVE TARGET</strong>
            </div>
            <div className="text-[11px] font-mono text-slate-300">
              Chennai Organics Demo<br />
              <span className="text-slate-500">Host: 127.0.0.1:5050</span><br />
              <span className="text-slate-500">Storage: local shop.db</span>
            </div>
            <div className="mt-3 text-[10px] text-rose-400/80 font-mono border-t border-rose-950/60 pt-2">
              Mode: <strong className="text-rose-300">{snapshot?.mode === 'after' ? 'HARDENED (AFTER)' : 'VULNERABLE (BEFORE)'}</strong>
            </div>
          </div>

          <Link to="/" className="hacker-exit-link">
            <ArrowLeft size={14} /> Exit Observatory
          </Link>
        </aside>

        {/* Center Workspace */}
        <main className="hacker-workspace">
          {/* Header Bar */}
          <div className="hacker-title-bar">
            <div>
              <span className="hacker-micro-label">PENETRATION WORKBENCH // ENGAGEMENT 01</span>
              <h1 className="hacker-headline">Exploit the perimeter.</h1>
              <p className="hacker-subtext">
                Select a high-profile demo victim, inject dictionary permutations, and observe whether security holds or crumbles.
              </p>
            </div>

            {/* Tactical Red Radar Reticle */}
            <div className="tactical-radar" aria-hidden="true">
              <span className="radar-sweep" />
              <Fingerprint size={32} className="radar-icon" />
            </div>
          </div>

          {/* Top Metrics Row */}
          <div className="hacker-metrics-grid">
            <div className="metric-box">
              <span>TARGET POOL</span>
              <strong>{snapshot?.total.toLocaleString() ?? '3,000'}</strong>
              <small>customer database records</small>
            </div>
            <div className="metric-box">
              <span>CAPTURED SIGNALS</span>
              <strong>{events.length}</strong>
              <small>recent shop transactions</small>
            </div>
            <div className="metric-box">
              <span>LOCKED TARGET</span>
              <strong className="text-rose-400">#{target}</strong>
              <small>{targetName}</small>
            </div>
            <div className="metric-box">
              <span>EXPLOIT TIME BUDGET</span>
              <strong>5.0s</strong>
              <small>bounded CPU iterations</small>
            </div>
          </div>

          {/* Highlighting Core Database Reconfiguration Alert */}
          {snapshot?.mode === 'after' && (
            <div className="hacker-database-change-alert my-4 p-4 rounded-xl border border-amber-500/40 bg-amber-950/30 flex items-start gap-3 animate-pulse">
              <AlertTriangle className="text-amber-400 flex-shrink-0 mt-0.5" size={20} />
              <div>
                <div className="flex items-center gap-2">
                  <span className="bg-amber-500/20 text-amber-300 border border-amber-500/30 font-mono text-[10px] px-2 py-0.5 rounded">
                    LIVE SYSTEM UPDATE
                  </span>
                  <strong className="text-sm font-semibold text-amber-200 font-mono">
                    CRITICAL DATABASE RECONFIGURATION OBSERVED
                  </strong>
                </div>
                <p className="text-xs text-amber-200/80 mt-1 leading-relaxed">
                  Chennai Organics storage migrated to Post-Quantum Protected Mode (ML-KEM-768 lattice KEM &amp; Argon2id memory-hard key stretching).
                  Active database view updated. Legacy MD5 dictionary rainbow permutations and small RSA factorization attempts are now actively resisted.
                </p>
              </div>
            </div>
          )}

          {/* Main 2-Column Grid */}
          <div className="hacker-grid">
            {/* Left Column: Target Selector */}
            <section className="hacker-panel">
              <div className="hacker-panel-head">
                <Flame size={15} className="text-rose-500" />
                <span>PRIME HIGH-VALUE TARGETS</span>
                <span className="badge-tag">VIP ACCOUNTS</span>
              </div>
              <p className="panel-desc">
                Featured accounts seeded with weak MD5 passwords. Click any target to load their credentials into the attack chamber.
              </p>

              <div className="space-y-1.5 mt-3">
                {PRIME_TARGETS.map(p => (
                  <button
                    key={p.id}
                    disabled={busy}
                    className={`target-row ${target === p.id ? 'active' : ''}`}
                    onClick={() => select(p.id, 'password')}
                  >
                    <div className="target-num">#{p.id}</div>
                    <div className="target-info">
                      <strong>{p.name}</strong>
                      <small>{p.role} · {p.email}</small>
                    </div>
                    {target === p.id && <span className="target-locked-tag">LOCKED</span>}
                  </button>
                ))}
              </div>

              {/* Recent Shop Activity */}
              <div className="hacker-panel-head mt-6">
                <Activity size={15} className="text-rose-500" />
                <span>LIVE ACTIVITY SNIFFER</span>
                <span className="badge-tag">2s REFRESH</span>
              </div>
              <div className="space-y-1.5 mt-2">
                {events.length > 0 ? (
                  events.slice(0, 4).map(e => (
                    <button
                      key={e.id}
                      disabled={busy}
                      className={`target-row compact ${target === e.customerId ? 'active' : ''}`}
                      onClick={() => select(e.customerId, e.kind === 'checkout' ? 'transaction' : 'password')}
                    >
                      <span className="text-xs font-mono text-slate-400">#{e.customerId}</span>
                      <span className="text-xs text-slate-300 font-medium">
                        {e.kind === 'signup' ? 'New account created' : e.kind === 'login' ? 'Sign-in observed' : 'Demo order placed'}
                      </span>
                      <small className="text-[10px] text-slate-500 ml-auto font-mono">
                        {new Date(e.at).toLocaleTimeString()}
                      </small>
                    </button>
                  ))
                ) : (
                  <p className="text-xs text-slate-500 italic py-2">Listening for shop traffic on :5050...</p>
                )}
              </div>

              {/* Recent Stored Records for Quick Choice */}
              <div className="hacker-panel-head mt-6">
                <Database size={15} className="text-rose-500" />
                <span>RECENT STORED RECORDS</span>
              </div>
              <div className="space-y-1.5 mt-2">
                {snapshot?.rows.slice(0, 4).map(r => (
                  <button
                    disabled={busy}
                    key={r.id}
                    className={`record-choice target-row compact ${target === r.id ? 'active' : ''}`}
                    onClick={() => select(r.id)}
                  >
                    <span className="text-xs font-mono text-slate-300">#{r.id} · {r.name}</span>
                    <ChevronRight size={14} className="ml-auto text-slate-500" />
                  </button>
                ))}
              </div>
            </section>

            {/* Right Column: Attack Execution Workbench */}
            <section className="hacker-panel" ref={workbench} tabIndex={-1} aria-label="Selected account workbench">
              <div className="hacker-panel-head">
                <Terminal size={15} className="text-rose-500" />
                <span>
                  {module === 'password'
                    ? 'CREDENTIAL CRACKER WORKBENCH'
                    : module === 'rsa'
                    ? 'PUBLIC-KEY FACTORIZATION WORKBENCH'
                    : module === 'transaction'
                    ? 'REQUEST REPLAY & TAMPER WORKBENCH'
                    : 'MODULE PREVIEW'}
                </span>
                <span className={`status-pill ${busy ? 'running' : 'idle'}`}>
                  {busy ? 'INJECTING PAYLOAD...' : 'ARMED'}
                </span>
              </div>

              {/* Target Banner */}
              <div className="target-card">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-mono tracking-wider text-rose-400">
                    TARGET: ACCOUNT #{target} // {targetName}
                  </span>
                  <span className="text-[10px] font-mono text-slate-500">
                    TARGET EMAIL: {targetEmail}
                  </span>
                </div>

                <div className="observed-hash-box mt-3">
                  <span className="hash-label">OBSERVED STORED ARTIFACT:</span>
                  <code className="hash-code">
                    {module === 'rsa'
                      ? (selectedRow?.id_number || 'No stored ID for this account')
                      : module === 'transaction'
                      ? `POST /checkout - order for Account #${target} · Fake payment token`
                      : (selectedRow?.password_hash || 'Loading stored artifact...')}
                  </code>
                </div>
              </div>

              {/* Exploit Config Card */}
              <div className="exploit-trigger-card">
                <div>
                  <h3 className="text-sm font-semibold text-slate-100">
                    {module === 'password'
                      ? 'Recommended: dictionary password test'
                      : module === 'rsa'
                      ? 'Classical Pollard-Rho Factorization'
                      : 'Scripted Tampering Sandbox'}
                  </h3>
                  <p className="text-xs text-slate-400 mt-1">
                    {module === 'password'
                      ? 'Tests 25 known passwords against this selected account only. For a repeatable demo, register with chennai123. Arbitrary passwords may not match.'
                      : module === 'rsa'
                      ? 'Factors the deliberate demo public key and decrypts fake national IDs.'
                      : 'Replays a captured order request with modified payload to test integrity.'}
                  </p>
                </div>

                <button
                  className="btn-hacker-launch hack-action"
                  disabled={busy || !online || module === 'network' || module === 'session'}
                  onClick={() => {
                    if (module === 'transaction') void playTransaction();
                    else void run(module === 'rsa' ? 'shor_sim' : 'dictionary');
                  }}
                >
                  {busy ? (
                    'Testing…'
                  ) : module === 'transaction' ? (
                    'Play scenario'
                  ) : (
                    'Run attempt'
                  )}
                  <ChevronRight size={16} />
                </button>
              </div>

              {/* Execution Progress Bar */}
              {busy && (
                <div className="hacker-progress-box attack-progress" role="status">
                  <div className="tactical-sweep sweep-line" />
                  <div className="flex items-center justify-between text-xs font-mono text-rose-300">
                    <span>
                      {module === 'transaction'
                        ? ['Loading sandbox scenario', 'Replaying a modified request', 'Evaluating scripted outcome', 'Preparing scenario result'][stage]
                        : ['Stage 1/4: Parsing stored SQLite customer hashes...', 'Stage 2/4: Testing candidate passwords...', 'Stage 3/4: High-speed verification against demo accounts...', 'Stage 4/4: Extracting recovered plaintext credentials...'][stage]}
                    </span>
                    <small className="text-rose-400">
                      {module === 'transaction'
                        ? 'Scripted animation · no actual transaction modified'
                        : `${result?.tried ?? 0} actual work iterations`}
                    </small>
                  </div>
                </div>
              )}

              {result && <details className="ai-thinking-box my-4 p-3.5" open><summary>Actual test log - Account #{target}</summary>
                {result.lines.map((line, index) => <p key={index}>{line}</p>)}
                <p>Only a recovered record matching this account is shown as its result.</p>
              </details>}

              {/* ======================================================== */}
              {/* RESULTS: THINK FROM HACKER POV: SUCCESS = CRACKED (GREEN) */}
              {/* FAILURE = SAFETY / TARGET DEFENDED (RED-BLACK ERROR)      */}
              {/* ======================================================== */}

              {/* PASSWORD EXPLOIT RESULTS */}
              {module === 'password' && result?.status === 'done' && (
                <>
                  {isPasswordSuccess ? (
                    /* HACKER SUCCESS: GREEN THEME */
                    <div className="hacker-verdict-card success attack-verdict exposed" role="status">
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-2">
                          <CheckCircle2 size={20} className="text-emerald-400" />
                          <strong className="text-emerald-300 text-sm tracking-wide font-mono">
                            [+] EXPLOIT SUCCESSFUL — CREDENTIALS CRACKED
                          </strong>
                        </div>
                        <span className="hud-pill-green font-mono text-[10px]">
                          {result.durationMs}ms · {result.cracked.toLocaleString()} ACCOUNTS RECOVERED
                        </span>
                      </div>

                      <div className="recovered-box mt-3">
                        <span className="text-[10px] text-emerald-400/80 font-mono block">
                          RECOVERED PLAINTEXT PASSWORD FOR {targetName.toUpperCase()}:
                        </span>
                        <div className="flex items-center justify-between mt-1.5">
                          <strong className="text-2xl font-mono text-emerald-300 tracking-wider">
                            {showPlaintext ? crackedPasswordValue : '••••••••'}
                          </strong>
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => setShowPlaintext(!showPlaintext)}
                              className="text-emerald-400/80 hover:text-emerald-300 p-1"
                              title="Toggle visibility"
                            >
                              {showPlaintext ? <EyeOff size={16} /> : <Eye size={16} />}
                            </button>
                            <button
                              onClick={() => copyToClipboard(crackedPasswordValue)}
                              className="text-emerald-400/80 hover:text-emerald-300 p-1 flex items-center gap-1 text-xs"
                              title="Copy password"
                            >
                              {copied ? <Check size={16} className="text-emerald-300" /> : <Copy size={16} />}
                              <span>{copied ? 'Copied' : 'Copy'}</span>
                            </button>
                          </div>
                        </div>
                      </div>

                      <p className="text-xs text-emerald-200/90 mt-3 leading-relaxed">
                        A dictionary guess matched this account. <strong>{result.cracked}</strong> customer passwords recovered across the database within <strong>{result.durationMs} ms</strong>.
                      </p>

                      {/* Cracked sample feed */}
                      {result.revealed && result.revealed.length > 0 && (
                        <div className="cracked-feed mt-3">
                          <div className="text-[10px] font-mono text-emerald-400/80 mb-1">
                            DATABASE EXPOSURE FEED ({result.revealed.length} SAMPLE HITS):
                          </div>
                          <div className="max-h-28 overflow-y-auto space-y-1 font-mono text-xs text-emerald-300/90 pr-2">
                            {result.revealed.slice(0, 10).map((r, i) => (
                              <div key={i} className="flex justify-between border-b border-emerald-950/60 pb-0.5">
                                <span>Cust #{r.customerId} ({r.field})</span>
                                <strong className="text-emerald-200">{r.value}</strong>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  ) : (
                    /* HACKER FAILURE: RED & BLACK ERROR THEME (TARGET IS SAFE) */
                    <div className="hacker-verdict-card failure attack-verdict blocked" role="status">
                      <div className="flex items-center gap-2">
                        <AlertTriangle size={20} className="text-rose-500" />
                        <h2 className="text-sm font-semibold text-rose-300 font-mono">
                          No recovery for this account.
                        </h2>
                      </div>
                      <p className="text-xs text-rose-300/90 mt-2 leading-relaxed">
                        Could not recover this account's password within the 5-second test budget.
                        Common passwords can still be recovered after fixes; this does not prove the password is unguessable.
                      </p>
                      <div className="text-[10px] font-mono text-slate-500 mt-2">
                        Iterations: {result.tried.toLocaleString()} · Verdict: DEFENSE_HELD · No credentials dumped
                      </div>
                    </div>
                  )}
                </>
              )}

              {/* RSA EXPLOIT RESULTS */}
              {module === 'rsa' && result?.status === 'done' && (
                <>
                  {isRsaSuccess ? (
                    /* HACKER SUCCESS: GREEN */
                    <div className="hacker-verdict-card success attack-verdict exposed" role="status">
                      <div className="flex items-center gap-2">
                        <CheckCircle2 size={20} className="text-emerald-400" />
                        <strong className="text-emerald-300 text-sm tracking-wide font-mono">
                          [+] TINY RSA KEY FACTORED — CUSTOMER ID DECRYPTED
                        </strong>
                      </div>
                      <div className="recovered-box mt-3">
                        <span className="text-[10px] text-emerald-400/80 font-mono block">
                          DECRYPTED NATIONAL ID NUMBER:
                        </span>
                        <strong className="text-xl font-mono text-emerald-300 tracking-wider block mt-1">
                          {revealedRecord?.value}
                        </strong>
                      </div>
                      <p className="text-xs text-emerald-200/90 mt-3">
                        Classical Pollard-rho algorithm factored the deliberate 64-bit demo modulus in <strong>{result.durationMs} ms</strong>. Reconstructed private exponent d and decrypted {result.cracked} encrypted fake IDs.
                      </p>
                    </div>
                  ) : (
                    /* HACKER FAILURE: RED/BLACK */
                    <div className="hacker-verdict-card failure attack-verdict blocked" role="status">
                      <div className="flex items-center gap-2">
                        <ShieldAlert size={20} className="text-rose-500" />
                        <h2 className="text-sm font-semibold text-rose-300 font-mono">
                          [-] NO ID RECOVERED FOR THIS ACCOUNT
                        </h2>
                      </div>
                      <p className="text-xs text-rose-300/90 mt-2 leading-relaxed">
                        No matching ID was recovered. Consult the test log for whether the tiny-key demonstration was applicable or reached its time limit.
                      </p>
                    </div>
                  )}
                </>
              )}

              {/* TRANSACTION EXPLOIT RESULTS */}
              {module === 'transaction' && transaction && (
                <div className={`hacker-verdict-card attack-verdict ${transaction === 'blocked' ? 'failure blocked' : 'success exposed'}`} role="status">
                  <span className="text-[10px] font-mono text-rose-400 block mb-1">SCRIPTED TRANSACTION SCENARIO</span>
                  <h2>{transaction === 'blocked' ? 'Attempt rejected.' : 'Tampering demonstrated.'}</h2>
                  <p className="text-xs mt-2 leading-relaxed">
                    {transaction === 'blocked'
                      ? 'The protected scenario rejects the modified request.'
                      : 'The vulnerable scenario illustrates an unvalidated request being accepted.'}{' '}
                    No real transaction was attacked.
                  </p>
                </div>
              )}

              {/* Preview modules */}
              {['network', 'session'].includes(module) && (
                <div className="hacker-preview-box">
                  <Shield size={36} className="text-slate-600 mb-2" />
                  <h4 className="text-sm font-semibold text-slate-300">Tool Module Preview</h4>
                  <p className="text-xs text-slate-500 mt-1 max-w-sm">
                    This advanced module preview demonstrates future attack vectors. Use Credential Cracker or Public-Key Decryptor for live exploitation.
                  </p>
                </div>
              )}

              {/* Error notice if API failed */}
              {error && (
                <div className="hacker-error-banner mt-4">
                  <AlertTriangle size={16} />
                  <span>{error}</span>
                </div>
              )}
            </section>
          </div>

          <footer className="hacker-footer-note">
            RESTRICTED PENETRATION DEMO // FOR ETHICAL RESEARCH ON SYNTHETIC DEMO SHOP ONLY // PROPRIETARY ENGINE
          </footer>
        </main>
      </div>
    </div>
  );
}
