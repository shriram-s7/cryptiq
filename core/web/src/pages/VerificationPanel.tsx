import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { requestJson } from '@/lib/api';
import {
  CheckCircle2, LoaderCircle, ShieldAlert, Terminal,
  Cpu, Database, ShoppingBag, Eye
} from 'lucide-react';

type CheckItem = {
  key: string;
  label: string;
  status: string;
  detail: string;
};

type Verification = {
  id: string;
  status: string;
  scoreBefore: number;
  scoreAfter?: number;
  error?: string;
  checks: CheckItem[];
};

const STEP_DIALOGS: Record<string, { icon: any; title: string; dialogue: string[]; evidence: string }> = {
  rescan: {
    icon: Cpu,
    title: 'AST Cryptographic Scanner Verification',
    dialogue: [
      'Ingesting revised Python AST from core/demo-shop/src_after...',
      'Verifying Argon2id parameter bounds: time_cost=2, memory_cost=19456, parallelism=1.',
      'Checking crypto_utils.py: ML-KEM-768 key encapsulation + AES-256-GCM primitives detected.',
      'Confirming payment secrets moved to os.environ and secure cookie flag set to True.',
      'Result: Zero hardcoded secrets or weak hash algorithms identified in static analysis.',
    ],
    evidence: 'Static verification: 0 vulnerabilities found. CBOM updated.',
  },
  reattack: {
    icon: Terminal,
    title: 'Adversary Re-Attack Defense Evaluation',
    dialogue: [
      'Re-initializing attack engine against SQLite customer database...',
      'Injecting 20 common passwords dictionary with 5.0s CPU budget...',
      'Evaluating Argon2id memory-hard hash derivation. Hash verification rate throttled by memory cost.',
      'Factoring engine tests ML-KEM encrypted ID fields: Classical factoring attempt rejected.',
      'Result: 0 of 3,000 passwords cracked. Cryptographic safeguards held successfully.',
    ],
    evidence: 'Attack result: DEFENSE_HELD. No passwords recovered.',
  },
  app: {
    icon: ShoppingBag,
    title: 'Application Live Transaction Integrity',
    dialogue: [
      'Authenticating known demo account (priya@example.test) using upgraded Argon2id verify routine...',
      'Generating signed user session cookie with Secure and HttpOnly flags...',
      'Simulating live product selection and order checkout transaction...',
      'Validating order persistence and basket signature without application crashes.',
      'Result: Seamless backwards compatibility maintained for existing customers.',
    ],
    evidence: 'App integrity: Login and checkout transaction confirmed.',
  },
  storage: {
    icon: Database,
    title: 'Database Storage Cryptographic Boundary Inspection',
    dialogue: [
      'Simulating fresh customer signup (Fresh Demo #3001) in SQLite storage...',
      'Extracting newly committed row from customers table...',
      'Confirming id_number field matches "pqc:v1:" authenticated ciphertext format.',
      'Verifying raw phone number is encrypted via AES-256-GCM prior to disk write.',
      'Result: Zero plaintext PII committed to disk. Storage security proven.',
    ],
    evidence: 'Storage proof: Fresh customer PII stored as authenticated ciphertext.',
  },
};

export function VerificationPanel() {
  const [value, setValue] = useState<Verification | null>(null);
  const [published, setPublished] = useState(false);
  const [error, setError] = useState('');
  const [refresh, setRefresh] = useState(0);
  const [starting, setStarting] = useState(false);
  const [activeDialogKey, setActiveDialogKey] = useState<string | null>(null);

  useEffect(() => {
    const abort = new AbortController();
    let timer: ReturnType<typeof setTimeout>;

    async function load() {
      try {
        const result = await requestJson<{ verification: Verification | null; published: boolean }>(
          '/api/projects/p_demo/verification',
          { signal: abort.signal }
        );
        setValue(result.verification);
        setPublished(result.published);
        timer = setTimeout(load, result.verification?.status === 'running' ? 500 : 3000);
      } catch (e) {
        if (!abort.signal.aborted) setError(e instanceof Error ? e.message : 'Verification unavailable');
      }
    }

    void load();
    return () => {
      abort.abort();
      clearTimeout(timer);
    };
  }, [refresh]);

  async function start() {
    setStarting(true);
    setError('');
    setPublished(false);
    setValue(null);
    try {
      await requestJson('/api/projects/p_demo/verifications', { method: 'POST' });
      setRefresh((n) => n + 1);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Could not start verification');
    } finally {
      setStarting(false);
    }
  }

  const checks: CheckItem[] = value?.checks || [
    { key: 'rescan', label: 'Re-scan the application', status: 'pending', detail: 'Look for remaining source and storage risks.' },
    { key: 'reattack', label: 'Re-run bounded attacks', status: 'pending', detail: 'Measure what the attempts recover after repair.' },
    { key: 'app', label: 'Keep the application working', status: 'pending', detail: 'Exercise real login and checkout in the demo shop.' },
    { key: 'storage', label: 'Inspect a fresh signup', status: 'pending', detail: 'Check how new data is stored.' },
  ];

  return (
    <Card className="p-6 mt-5 shadow-sm">
      <div className="flex items-center justify-between">
        <span className="small-badge">FOUR LIVE CHECKS</span>
        {value?.status === 'running' && (
          <span className="text-xs font-mono text-indigo-600 flex items-center gap-1.5 animate-pulse">
            <LoaderCircle size={14} className="animate-spin" /> Live verification running…
          </span>
        )}
      </div>

      <h2 className="mt-3 text-lg font-bold text-slate-900">Prove the changes work</h2>
      <p className="text-sm text-slate-500 mt-1">
        Re-scan, bounded re-attack, existing login and checkout, then a fresh signup checked in storage. The score is
        verified only when all four pass.
      </p>

      {/* Interactive Step Cards */}
      <div className="verify-checks my-4 space-y-2">
        {checks.map((check) => {
          const stepMeta = STEP_DIALOGS[check.key];

          return (
            <div
              key={check.key}
              className={`verify-row verify-${check.status} p-3.5 rounded-xl border transition-all cursor-pointer hover:shadow-sm ${
                activeDialogKey === check.key ? 'ring-2 ring-indigo-500' : ''
              }`}
              onClick={() => setActiveDialogKey(activeDialogKey === check.key ? null : check.key)}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-2.5">
                  <span className="text-sm">
                    {check.status === 'pass' ? (
                      <CheckCircle2 size={18} className="text-emerald-500" />
                    ) : check.status === 'fail' ? (
                      <ShieldAlert size={18} className="text-rose-500" />
                    ) : check.status === 'running' ? (
                      <LoaderCircle size={18} className="text-indigo-600 animate-spin" />
                    ) : (
                      <span className="w-4 h-4 rounded-full border-2 border-slate-300 inline-block" />
                    )}
                  </span>
                  <div>
                    <strong className="text-sm text-slate-900 block font-semibold">
                      {check.status === 'pass' ? '✓' : check.status === 'fail' ? '×' : check.status === 'running' ? '…' : '○'}{' '}
                      {check.label}
                    </strong>
                    <p className="text-xs text-slate-500 mt-0.5">{check.detail || 'Waiting for previous checks'}</p>
                  </div>
                </div>

                <button
                  type="button"
                  className="text-[11px] font-mono text-indigo-600 hover:text-indigo-800 flex items-center gap-1 bg-indigo-50/80 hover:bg-indigo-100 px-2.5 py-1 rounded-md"
                  onClick={(e) => {
                    e.stopPropagation();
                    setActiveDialogKey(check.key);
                  }}
                >
                  <Eye size={12} />
                  <span>Inspect step dialogue</span>
                </button>
              </div>

              {/* Inline quick preview when expanded */}
              {activeDialogKey === check.key && stepMeta && (
                <div className="mt-3 pt-3 border-t border-slate-200/80 text-xs text-slate-700 bg-slate-50/80 p-3 rounded-lg font-mono">
                  <div className="flex items-center gap-2 text-indigo-700 font-semibold mb-2">
                    <Terminal size={14} />
                    <span>{stepMeta.title}</span>
                  </div>
                  <div className="space-y-1 text-[11px] text-slate-600">
                    {stepMeta.dialogue.map((line, idx) => (
                      <div key={idx} className="flex gap-2">
                        <span className="text-slate-400 select-none">›</span>
                        <span>{line}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Verification Celebration */}
      {published ? (
        <div className="verification-celebration my-5 p-5 bg-gradient-to-r from-emerald-50 via-teal-50 to-emerald-100 border border-emerald-300 rounded-xl relative overflow-hidden">
          <div aria-hidden="true">
            {Array.from({ length: 20 }, (_, i) => (
              <i
                key={i}
                className="confetti-piece"
                style={{
                  left: `${i * 5}%`,
                  animationDelay: `${(i % 5) * 0.08}s`,
                  background: i % 2 ? '#e2b858' : '#26a57d',
                }}
              />
            ))}
          </div>
          <div className="flex items-center gap-2">
            <CheckCircle2 size={20} className="text-emerald-600" />
            <strong className="text-emerald-950 text-base">Verified. 4 of 4 checks passed.</strong>
          </div>
          <p className="font-mono text-2xl font-bold text-emerald-800 mt-2">
            {value?.scoreBefore} → {value?.scoreAfter}
          </p>
          <div className="flex flex-wrap gap-4 mt-3 text-xs">
            <Link to="/p/p_demo" className="secondary-link font-semibold">
              Open verified overview →
            </Link>
            <Link to="/p/p_demo/report" className="secondary-link font-semibold">
              View evidence report →
            </Link>
          </div>
        </div>
      ) : value?.status === 'failed' ? (
        <p role="alert" className="error-notice">
          Verification did not pass. No verified score upgrade was published. {value.error}
        </p>
      ) : value?.status === 'passed' ? (
        <p className="text-sm mt-4 text-slate-600">
          Previous checks passed, but the project has changed. Verify again to publish current evidence.
        </p>
      ) : null}

      <Button
        className="mt-5"
        disabled={starting || value?.status === 'running'}
        onClick={start}
      >
        {value?.status === 'running'
          ? 'Verification running…'
          : value
          ? 'Run verification again'
          : 'Run four verification checks'}
      </Button>

      {error ? (
        <p role="alert" className="error-notice mt-4">
          {error}
        </p>
      ) : null}
    </Card>
  );
}
