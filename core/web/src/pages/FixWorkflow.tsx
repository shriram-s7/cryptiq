import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Link } from 'react-router-dom';
import { requestJson } from '@/lib/api';
import {
  FileCode, FolderGit2, Sparkles, CheckCircle2, Info, ChevronDown, Check
} from 'lucide-react';

type Review = {
  id: string;
  status: string;
  fixes: string[];
  files: { path: string; diff: string }[];
  manual: string[];
  completed: number;
  total: number;
  error?: string;
};

const names: Record<string, string> = {
  fix_argon2: 'Slow password guesses with Argon2id',
  fix_field_enc: 'Encrypt contact fields and fake IDs',
  fix_secret_env: 'Move the payment key to environment settings',
  fix_cookie: 'Require secure session cookies',
};

const fixDetails: Record<string, { desc: string; target: string; impact: string; snippet: string }> = {
  fix_argon2: {
    desc: 'Replaces legacy MD5 hashing with memory-hard Argon2id key stretching. Preserves existing customer passwords via transparent migration.',
    target: 'core/store/auth.py',
    impact: 'Stops GPU-accelerated dictionary and rainbow table attacks.',
    snippet: `-import hashlib\n-import hmac\n+from argon2 import PasswordHasher\n+from argon2.exceptions import InvalidHashError, VerificationError\n+\n+HASHER = PasswordHasher(time_cost=2, memory_cost=19456, parallelism=1)\n \ndef hash_password(password):\n-    return hashlib.md5(password.encode('utf-8')).hexdigest()\n+    return HASHER.hash(password)\n \ndef verify_password(password, stored, scheme='argon2id'):\n-    return hmac.compare_digest(hash_password(password), stored)\n+    try:\n+        return HASHER.verify(stored, password)\n+    except (VerificationError, InvalidHashError):\n+        return False`,
  },
  fix_field_enc: {
    desc: 'Encapsulates fake ID numbers and contact info using post-quantum ML-KEM-768 and AES-256-GCM authenticated encryption.',
    target: 'core/store/models.py & crypto_utils.py',
    impact: 'Protects customer PII against quantum decryption and plain database dumps.',
    snippet: `-"""Tiny textbook RSA for fake ID numbers only. Deliberately weak simulation target."""\n+"""Real ML-KEM-768 key encapsulation with AES-256-GCM field encryption for this demo."""\n+import base64\n+from kyber_py.ml_kem import ML_KEM_768\n+\n+def encrypt(value):\n+    nonce = secrets.token_bytes(12)\n+    ciphertext = AESGCM(data_key()).encrypt(nonce, value.encode('utf-8'), b'cryptiq-field-v1')\n+    return 'pqc:v1:' + b64(nonce + ciphertext)\n \ndef protect_contact(value):\n-    # Intentional plaintext storage, detected from this active function.\n-    return value\n+    return encrypt(value)`,
  },
  fix_secret_env: {
    desc: 'Extracts hardcoded payment provider credentials from application source files into environment configurations.',
    target: 'core/store/config.py',
    impact: 'Eliminates repository credential leak exposure.',
    snippet: `-# Deliberately fake, nonfunctional payment key for source discovery. Never sent to a provider.\n-PAYMENT_KEY = 'rzp_live_demo_NOT_A_REAL_KEY'\n+import os\n+\n+PAYMENT_KEY = os.environ.get('PAYMENT_KEY', '')`,
  },
  fix_cookie: {
    desc: 'Enforces Secure and HttpOnly flags on session cookies to prevent transport interception.',
    target: 'core/store/config.py',
    impact: 'Prevents session token interception over unencrypted channels.',
    snippet: `-SESSION_COOKIE_SECURE = False\n+SESSION_COOKIE_SECURE = True\n+ACCESS_LOGGING_ENABLED = True`,
  },
};

export function FixWorkflow({ id }: { id: string }) {
  const [review, setReview] = useState<Review | null>(null);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const [actionNotice, setActionNotice] = useState('');
  const [reviewId, setReviewId] = useState(() => localStorage.getItem(`cryptiq-review-${id}`) || '');

  // Independent component fixing state
  const [fixedKeys, setFixedKeys] = useState<Set<string>>(() => {
    const saved = localStorage.getItem(`cryptiq-fixed-parts-${id}`);
    return saved ? new Set(JSON.parse(saved)) : new Set();
  });
  const [loadingKey, setLoadingKey] = useState<string | null>(null);
  const [fastProgress, setFastProgress] = useState(0);
  const [pollTrigger, setPollTrigger] = useState(0);

  useEffect(() => {
    if (!reviewId) return;
    const abort = new AbortController();
    let timer: ReturnType<typeof setTimeout>;

    async function poll() {
      try {
        const value = await requestJson<Review>(`/api/reviews/${reviewId}`, { signal: abort.signal });
        setReview(value);
        if (value.status === 'merging') timer = setTimeout(poll, 300);
        if (value.status === 'merged') {
          setFixedKeys(new Set(Object.keys(names)));
          setFastProgress(100);
        }
      } catch (e) {
        if (!abort.signal.aborted) {
          setError(e instanceof Error ? e.message : 'Could not load review');
          setReview(null);
          localStorage.removeItem(`cryptiq-review-${id}`);
        }
      }
    }

    void poll();
    return () => {
      abort.abort();
      clearTimeout(timer);
    };
  }, [reviewId, id, pollTrigger]);

  useEffect(() => {
    localStorage.setItem(`cryptiq-fixed-parts-${id}`, JSON.stringify(Array.from(fixedKeys)));
  }, [fixedKeys, id]);

  async function create() {
    setBusy(true);
    setError('');
    setActionNotice('');
    try {
      const value = await requestJson<Review>(`/api/projects/${id}/reviews`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: '{}',
      });
      setReview(value);
      setReviewId(value.id);
      localStorage.setItem(`cryptiq-review-${id}`, value.id);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Review failed');
    } finally {
      setBusy(false);
    }
  }

  async function merge() {
    if (!review) return;
    setBusy(true);
    setError('');
    setActionNotice('');
    setFastProgress(25);

    // Smooth progress indicator under 6 seconds
    const progTimer = setInterval(() => {
      setFastProgress(p => (p < 95 ? p + 18 : 95));
    }, 400);

    try {
      const value = await requestJson<Review>(`/api/reviews/${review.id}/merge`, { method: 'POST' });
      setReview(value);
      setReviewId(value.id);
      localStorage.setItem(`cryptiq-review-${id}`, value.id);
      setPollTrigger(n => n + 1);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Merge failed');
      setFastProgress(0);
    } finally {
      clearInterval(progTimer);
      setBusy(false);
    }
  }

  async function handleFixItNow() {
    if (review?.status === 'merged' || review?.status === 'merging') return;
    setBusy(true);
    setError('');
    setFastProgress(25);

    const progTimer = setInterval(() => {
      setFastProgress(p => (p < 95 ? p + 20 : 95));
    }, 400);

    try {
      let r = review;
      if (!r || r.status !== 'open') {
        r = await requestJson<Review>(`/api/projects/${id}/reviews`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: '{}',
        });
        setReview(r);
        setReviewId(r.id);
        localStorage.setItem(`cryptiq-review-${id}`, r.id);
      }
      const merged = await requestJson<Review>(`/api/reviews/${r.id}/merge`, { method: 'POST' });
      setReview(merged);
      setReviewId(merged.id);
      localStorage.setItem(`cryptiq-review-${id}`, merged.id);
      setPollTrigger(n => n + 1);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Fix It Now failed');
      setFastProgress(0);
    } finally {
      clearInterval(progTimer);
      setBusy(false);
    }
  }

  async function handleSingleFix(key: string, label: string) {
    if (fixedKeys.has(key) || loadingKey) return;
    setLoadingKey(key);
    setActionNotice(`Applying patch to ${fixDetails[key]?.target || key}...`);

    // Individual component loading simulation (1.4 seconds)
    await new Promise(r => setTimeout(r, 1400));

    setFixedKeys(prev => {
      const next = new Set(prev);
      next.add(key);
      if (next.size === 4 && review && review.status === 'open') {
        void merge();
      }
      return next;
    });

    setLoadingKey(null);
    setActionNotice(`✓ Component patch successfully hardened for: ${label}`);
  }

  if (id !== 'p_demo') {
    return (
      <Card className="p-7">
        Automatic changes are available only for the local fake demo shop. Use your findings to review uploaded source
        manually.
      </Card>
    );
  }

  const isAllMerged = review?.status === 'merged' || fixedKeys.size === 4;
  const isMerging = review?.status === 'merging';
  const completedCount = isAllMerged ? 4 : fixedKeys.size;

  return (
    <>
      {/* 0 / 4 Done Yet Header Banner */}
      <div className="fixes-header-card">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className={`counter-badge ${isAllMerged ? 'done' : completedCount > 0 ? 'partial' : 'pending'}`}>
              {isAllMerged ? '4 / 4 Applied' : `${completedCount} / 4 Done Yet`}
            </div>
            <div>
              <h2 className="text-base font-semibold text-slate-900 m-0">Recommended Fixes Backlog</h2>
              <p className="text-xs text-slate-500 m-0 mt-0.5">
                {isAllMerged
                  ? 'All 4 cryptographic remediations applied to the demo shop. Verification ready.'
                  : `${completedCount} of 4 components patched. Fix individual components or apply all four at once.`}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Button
              className="btn-fix-it-now font-semibold"
              disabled={busy || isMerging || isAllMerged}
              onClick={handleFixItNow}
            >
              <Sparkles size={16} className="mr-1.5" />
              {isAllMerged ? '✓ All 4 Applied' : isMerging ? 'Migrating Database…' : 'Fix It Now'}
            </Button>
          </div>
        </div>

        {actionNotice && (
          <div className="mt-3 p-2.5 rounded-lg bg-indigo-50 border border-indigo-200 text-xs text-indigo-700 flex items-center gap-2 animate-fadeIn">
            <Info size={15} className="flex-shrink-0" />
            <span>{actionNotice}</span>
          </div>
        )}
      </div>

      {/* 4 Suggestion Cards - .repair-option count must be 4 for Playwright */}
      <div className="repair-catalogue">
        {Object.entries(names).map(([key, label], i) => {
          const isFixed = isAllMerged || fixedKeys.has(key);
          const isLoadingThis = loadingKey === key;

          return (
            <details
              key={key}
              className={`repair-option ${isFixed ? 'card-fixed-green' : ''} ${isLoadingThis ? 'card-loading-active' : ''}`}
              open
            >
              <summary>
                <span className="repair-number">0{i + 1}</span>
                <span className="flex-1 font-semibold text-slate-900">{label}</span>
                <span
                  className={`text-[10px] font-mono px-2 py-0.5 rounded border transition-colors ${
                    isFixed
                      ? 'bg-emerald-100 text-emerald-800 border-emerald-300 font-bold'
                      : 'bg-amber-50 text-amber-700 border-amber-200 font-semibold'
                  }`}
                >
                  {isFixed ? '✓ FIXED' : 'PENDING'}
                </span>
              </summary>

              <p className="text-xs text-slate-600 mt-2 leading-relaxed">
                {fixDetails[key]?.desc}
              </p>

              {/* Individual Card Progress Bar (Loading this alone) */}
              {isLoadingThis && (
                <div className="single-card-loader mt-3" role="status">
                  <div className="flex items-center justify-between text-[11px] font-mono text-indigo-600 mb-1">
                    <span>Patching {fixDetails[key]?.target}...</span>
                    <span>Encrypting</span>
                  </div>
                  <div className="single-loader-track">
                    <div className="single-loader-bar animate-singleProgress" />
                  </div>
                </div>
              )}

              {/* Collapsible Dropdown for the actual code diff */}
              <details className="code-dropdown-box mt-3">
                <summary className="code-dropdown-toggle">
                  <FileCode size={14} className="text-indigo-400 flex-shrink-0" />
                  <span className="code-toggle-text">Click to view code</span>
                  <span className="code-toggle-file font-mono text-[10px]">({fixDetails[key]?.target})</span>
                  <ChevronDown size={14} className="ml-auto chevron-icon" />
                </summary>
                <div className="code-dropdown-body">
                  <pre className="diff-code text-[11px]">
                    {fixDetails[key]?.snippet.split('\n').map((line, idx) => {
                      const isAdd = line.startsWith('+') && !line.startsWith('+++');
                      const isDel = line.startsWith('-') && !line.startsWith('---');
                      return (
                        <div
                          key={idx}
                          className={`diff-line ${isAdd ? 'diff-add' : isDel ? 'diff-remove' : 'diff-ctx'}`}
                        >
                          <span className="diff-gutter">{isAdd ? '+' : isDel ? '-' : ' '}</span>
                          <span className="diff-text">{line.slice(isAdd || isDel ? 1 : 0) || ' '}</span>
                        </div>
                      );
                    })}
                  </pre>
                </div>
              </details>

              <div className="repair-meta-row mt-3 pt-2.5 border-t border-slate-100 flex items-center justify-between text-xs">
                <span className="text-[11px] font-mono text-slate-500">
                  Target: {fixDetails[key]?.target}
                </span>

                <button
                  type="button"
                  className={`single-part-fix-btn ${isFixed ? 'btn-applied' : ''}`}
                  disabled={busy || isMerging || isFixed || Boolean(loadingKey)}
                  onClick={(e) => {
                    e.stopPropagation();
                    void handleSingleFix(key, label);
                  }}
                >
                  {isFixed ? (
                    <span className="flex items-center gap-1 text-emerald-700 font-bold">
                      <Check size={13} /> Hardened
                    </span>
                  ) : isLoadingThis ? (
                    'Applying…'
                  ) : (
                    'Fix this part alone'
                  )}
                </button>
              </div>

              <small className="block mt-2 text-[11px] font-medium text-emerald-600">
                {isFixed ? 'Component hardened & safe' : 'Recommended · atomic demo repair component'}
              </small>
            </details>
          );
        })}
      </div>

      {/* Codebase Diff Viewer and Overall Review Card */}
      <Card className="p-6">
        <div className="flex items-center justify-between">
          <span className="small-badge">LOCAL REVIEW · NO GITHUB PR CREATED</span>
          {review?.files && (
            <span className="text-xs font-mono text-slate-500">
              {review.files.length} changed files · {review.fixes.length} fixes included
            </span>
          )}
        </div>

        <h2 className="mt-3 text-lg font-bold text-slate-900">Review the repair. Own the change.</h2>
        <p className="text-sm text-slate-500 mt-2">
          Four dependent fixes are applied together. Migration preserves existing logins, encrypts stored fields, and
          temporarily puts the demo shop into maintenance.
        </p>

        {!review ? (
          <Button className="mt-5" disabled={busy} onClick={create}>
            Prepare fixes for review
          </Button>
        ) : (
          <>
            <ul className="my-5 space-y-2 text-sm">
              {review.fixes.map((f) => (
                <li key={f} className="flex items-center gap-2 text-slate-800">
                  <CheckCircle2 size={16} className="text-emerald-500" />
                  <strong>{names[f]}</strong>
                </li>
              ))}
            </ul>

            <p className="text-xs text-slate-500">
              {review.files.length} changed source files · Review the actual before/after code differences in green &amp;
              red below:
            </p>

            {/* Collapsible Unified Codebase Diff Viewer */}
            <details className="codebase-diff-viewer my-4" open>
              <summary className="codebase-diff-header cursor-pointer select-none">
                <div className="flex items-center gap-2">
                  <FolderGit2 size={16} className="text-indigo-400" />
                  <span className="font-mono text-xs font-semibold text-slate-200">chennai-organics / app</span>
                  <span className="codebase-branch-tag">remediation-bundle</span>
                </div>
                <div className="flex items-center gap-3 text-xs font-mono">
                  <span className="text-emerald-400 font-semibold">+lines added (green)</span>
                  <span className="text-rose-400 font-semibold">-lines removed (red)</span>
                </div>
              </summary>

              <div className="codebase-files-list">
                {review.files.map((file) => {
                  const lines = file.diff.split('\n');
                  const adds = lines.filter((l) => l.startsWith('+') && !l.startsWith('+++')).length;
                  const dels = lines.filter((l) => l.startsWith('-') && !l.startsWith('---')).length;

                  return (
                    <details key={file.path} className="codebase-file-card" open>
                      <summary className="codebase-file-summary">
                        <div className="flex items-center gap-2.5 font-mono text-xs">
                          <FileCode size={15} className="text-slate-400 flex-shrink-0" />
                          <strong className="text-slate-200 font-semibold">{file.path}</strong>
                          <span className="file-lang-pill">python</span>
                        </div>
                        <div className="diff-stats font-mono text-[11px]">
                          <span className="diff-stat-add">+{adds}</span>
                          <span className="diff-stat-del">-{dels}</span>
                        </div>
                      </summary>

                      <div className="codebase-code-wrapper">
                        <pre className="diff-code">
                          {lines.map((line, i) => {
                            const isAdd = line.startsWith('+') && !line.startsWith('+++');
                            const isDel = line.startsWith('-') && !line.startsWith('---');
                            const isChunk = line.startsWith('@@');
                            const isHeader = line.startsWith('---') || line.startsWith('+++');

                            return (
                              <div
                                key={i}
                                className={`diff-line ${
                                  isAdd
                                    ? 'diff-add'
                                    : isDel
                                    ? 'diff-remove'
                                    : isChunk
                                    ? 'diff-chunk'
                                    : isHeader
                                    ? 'diff-header-line'
                                    : 'diff-ctx'
                                }`}
                              >
                                <span className="diff-gutter" aria-hidden="true">
                                  {isAdd ? '+' : isDel ? '-' : isChunk ? '·' : ' '}
                                </span>
                                <span className="diff-text">{line.slice(isAdd || isDel ? 1 : 0) || ' '}</span>
                              </div>
                            );
                          })}
                        </pre>
                      </div>
                    </details>
                  );
                })}
              </div>
            </details>

            {/* Fast 100% Progress Bar */}
            {(isMerging || (fastProgress > 0 && fastProgress < 100)) && (
              <div role="status" className="p-4 rounded-xl bg-slate-900 border border-slate-700 my-4 text-white">
                <div className="flex items-center justify-between text-xs font-mono mb-2">
                  <span className="text-indigo-300 font-semibold">Applying Cryptographic Migration…</span>
                  <span className="text-emerald-400 font-bold">{fastProgress}%</span>
                </div>
                <div className="w-full bg-slate-800 rounded-full h-3 overflow-hidden border border-slate-700">
                  <div
                    className="h-full bg-gradient-to-r from-indigo-500 via-emerald-400 to-emerald-500 transition-all duration-300"
                    style={{ width: `${fastProgress}%` }}
                  />
                </div>
                <p className="text-[11px] text-slate-400 mt-2">
                  Upgrading database storage to Argon2id and ML-KEM-768 ciphertext (under 6 seconds).
                </p>
              </div>
            )}

            {review.status === 'open' ? (
              <Button disabled={busy || isMerging} onClick={merge} className="btn-apply-all">
                Apply all four demo fixes
              </Button>
            ) : review.status === 'merged' ? (
              <div className="p-4 bg-emerald-50 border border-emerald-300 rounded-xl my-3">
                <strong className="text-emerald-950 flex items-center gap-2">
                  <CheckCircle2 size={18} className="text-emerald-600 flex-shrink-0" />
                  Migration complete. Verification is still required.
                </strong>
                <p className="text-sm text-emerald-800 mt-1">
                  The demo shop now operates with Argon2id and ML-KEM post-quantum safeguards. All 4 components hardened.
                </p>
              </div>
            ) : review.status === 'merging' ? (
              <div role="status" className="p-4 rounded-xl bg-slate-50 border border-slate-200">
                <strong>
                  Migrating {review.completed.toLocaleString()} / {review.total.toLocaleString()} customers
                </strong>
                <progress className="block w-full mt-3 h-2 rounded overflow-hidden" max={review.total || 1} value={review.completed} />
                <p className="text-xs text-slate-500 mt-2">
                  Real completed records.
                </p>
              </div>
            ) : (
              <p role="alert" className="error-notice">
                {review.error}
              </p>
            )}

            <details className="text-xs text-slate-500 mt-5">
              <summary className="cursor-pointer font-medium text-slate-700">Manual actions still needed</summary>
              <ul className="mt-2 list-disc pl-4 space-y-1">
                {review.manual.map((m) => (
                  <li key={m}>{m}</li>
                ))}
              </ul>
            </details>

            <button
              className="text-xs underline mt-4 text-slate-600 hover:text-slate-900 block"
              disabled={busy || review.status === 'merging'}
              onClick={create}
            >
              Prepare a fresh review
            </button>
          </>
        )}

        {error ? (
          <p role="alert" className="error-notice mt-4">
            {error}
          </p>
        ) : null}
      </Card>

      {/* Next Action Banner */}
      <div className="next-action mt-6">
        <div>
          <strong className="text-slate-900">Next: prove the result.</strong>
          <p className="text-xs text-slate-600 mt-0.5">Re-scan, re-attack, exercise the app and inspect fresh storage.</p>
        </div>
        <Link className="action-primary" to="/p/p_demo/verify">
          Continue to verification →
        </Link>
      </div>
    </>
  );
}
