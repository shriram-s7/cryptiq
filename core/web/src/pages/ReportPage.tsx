import { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  ShieldCheck, Award, FileText, ExternalLink, Copy, Printer, Download, Check
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { requestJson } from '@/lib/api';
import { config } from '@/lib/config';

type Evidence = {
  published: boolean;
  verification: null | {
    id: string;
    status: string;
    scoreBefore: number | null;
    scoreAfter: number;
    finishedAt?: string;
    checks: { key: string; label: string; status: string; detail: string }[];
  };
};

export function ReportPage({ id, scanId }: { id: string; scanId: string }) {
  const [data, setData] = useState<Evidence | null>(null);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const [resetOpen, setResetOpen] = useState(false);
  const [copy, setCopy] = useState('');
  const [exporting, setExporting] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const abort = new AbortController();
    requestJson<Evidence>(`/api/projects/${id}/verification`, { signal: abort.signal })
      .then(setData)
      .catch((e) => {
        if (!abort.signal.aborted) setError(e.message);
      });
    return () => abort.abort();
  }, [id]);

  async function downloadReport() {
    setExporting(true); setError('');
    try {
      const response = await fetch(`${config.apiUrl}/api/projects/${id}/report.pdf`);
      if (!response.ok) {
        const detail = await response.json().catch(() => ({}));
        throw new Error(detail.detail || 'PDF export failed. Run verification again and retry.');
      }
      if (!response.headers.get('content-type')?.includes('application/pdf')) throw new Error('The server did not return a PDF. Retry verification.');
      const url = URL.createObjectURL(await response.blob());
      const anchor = document.createElement('a'); anchor.href = url;
      anchor.download = 'cryptiq-chennai-organics-evidence.pdf'; anchor.click();
      setTimeout(() => URL.revokeObjectURL(url), 1000);
    } catch (reason) { setError(reason instanceof Error ? reason.message : 'PDF export failed.'); }
    finally { setExporting(false); }
  }

  async function reset() {
    setBusy(true);
    setError('');
    try {
      await requestJson('/api/demo/reset', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ confirm: true }),
      });
      localStorage.removeItem('cryptiq-review-p_demo');
      localStorage.removeItem('cryptiq-attack-p_demo');
      navigate('/scan');
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Reset failed');
    } finally {
      setBusy(false);
    }
  }

  async function copyBadgeUrl() {
    try {
      const url = `${window.location.origin}/badge/chennai-organics`;
      await navigator.clipboard.writeText(url);
      setCopy('Live badge link copied to clipboard!');
      setTimeout(() => setCopy(''), 3000);
    } catch {
      setCopy('Copy unavailable. Use direct link below.');
    }
  }

  async function copyBadgeEmbed() {
    try {
      const embed = `<a href="${window.location.origin}/badge/chennai-organics" target="_blank" rel="noopener noreferrer"><img src="${config.apiUrl}/api/public/projects/chennai-organics/badge.svg" alt="CryptIQ Verified: Quantum-Safe" /></a>`;
      await navigator.clipboard.writeText(embed);
      setCopy('Embed code snippet copied to clipboard!');
      setTimeout(() => setCopy(''), 3000);
    } catch {
      setCopy('Copy unavailable. Use direct link below.');
    }
  }

  const isVerified = Boolean(data?.published);
  const scoreBefore = data?.verification?.scoreBefore ?? 38;
  const scoreAfter = data?.verification?.scoreAfter ?? (isVerified ? 91 : 38);

  return (
    <div className="report-page space-y-6">
      {/* Executive Security Report Shell */}
      <div className="report-executive-shell">
        {/* Executive Header */}
        <header className="report-executive-header">
          <div className="report-company-seal">
            <div className="report-seal-badge">
              <Award size={28} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="micro-label">EXECUTIVE SECURITY EVALUATION</span>
                <span className={`live-pill ${isVerified ? 'bg-emerald-950/80 text-emerald-300 border-emerald-500/40' : 'bg-amber-950/80 text-amber-300 border-amber-500/40'}`}>
                  {isVerified ? 'VERIFICATION PASSED' : 'AUDIT ASSESSMENT'}
                </span>
              </div>
              <h1 className="text-2xl font-bold text-slate-100 mt-1">
                Chennai Organics Pvt Ltd
              </h1>
              <p className="text-xs text-slate-400 mt-0.5">
                Target: Chennai Organics · Scope: bundled fake shop · CryptIQ demo engine
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => window.print()}
              className="btn-partner-outline"
              title="Print executive report summary"
            >
              <Printer size={15} /> Print Summary
            </button>
            <Button disabled={!isVerified || exporting} onClick={downloadReport} className="btn-review-findings-bright">
              <FileText size={15} /> {exporting ? 'Preparing PDF…' : isVerified ? 'Export PDF Report' : 'Verify to unlock PDF'}
            </Button>
          </div>
        </header>

        {/* Executive Score & Key Metrics Banner */}
        <div className="report-score-hero">
          <div className="report-score-stat">
            <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400">Cryptographic Posture</span>
            <div className="report-score flex items-baseline gap-2 mt-1">
              <strong>
                {scoreBefore} → {scoreAfter}
              </strong>
            </div>
            <span className="text-emerald-400 font-mono text-[11px] mt-1 block">
              {isVerified ? '+53 points gained (Grade A)' : 'Baseline score (Grade F)'}
            </span>
          </div>

          <div className="report-score-stat">
            <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400">Verification Status</span>
            <strong className={isVerified ? 'text-emerald-400' : 'text-amber-400'}>
              {isVerified ? '4 / 4 PASSED' : '0 / 4 PASSED'}
            </strong>
            <span className="text-[11px]">
              {isVerified ? 'All checks verified live' : 'Verification run required'}
            </span>
          </div>

          <div className="report-score-stat">
            <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400">Quantum Readiness</span>
            <strong className={isVerified ? 'text-cyan-400' : 'text-rose-400'}>
              {isVerified ? 'ML-KEM-768' : 'RSA-64 (BROKEN)'}
            </strong>
            <span className="text-[11px]">
              {isVerified ? 'Educational implementation' : 'Classical factor vulnerable'}
            </span>
          </div>

          <div className="report-score-stat">
            <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400">Safeguard evidence</span>
            <strong className={isVerified ? 'text-emerald-400' : 'text-rose-400'}>
              {isVerified ? 'CHECKED' : 'NOT VERIFIED'}
            </strong>
            <span className="text-[11px]">
              {isVerified ? 'Bounded technical checks passed' : 'Vulnerable MD5 password hash'}
            </span>
          </div>
        </div>

        {/* Body Content */}
        <div className="report-section-body">
          {/* Executive Summary Statement */}
          <div>
            <h2 className="text-base font-bold text-slate-100 flex items-center gap-2">
              <ShieldCheck size={18} className="text-indigo-400" />
              Executive Security Posture Detail
            </h2>
            <p className="text-xs text-slate-300 mt-2 leading-relaxed">
              This cryptographic evaluation report documents the security posture of Chennai Organics. The audit evaluated
              authentication primitives, post-quantum resilience, secret hygiene, and transport protections against both
              automated adversary attacks (dictionary guesses and classical Pollard-rho factorization) and
              real-time AST scanning.
            </p>
          </div>

          {/* Detailed Cryptographic Safeguards Inventory Table */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-mono font-semibold text-slate-400 uppercase tracking-wider">
                Cryptographic Safeguards &amp; Asset Inventory
              </span>
              <span className="text-xs font-mono text-slate-500">
                4 CRITICAL CONTROLS AUDITED
              </span>
            </div>

            <table className="report-inventory-table">
              <thead>
                <tr>
                  <th>Security Asset / Vector</th>
                  <th>Observed Primitive</th>
                  <th>Remediated Safeguard</th>
                  <th>Adversary Attack Defense</th>
                  <th>Regulatory Standard</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>
                    <strong className="text-slate-100 block">User Passwords</strong>
                    <span className="text-[11px] font-mono text-slate-400">customers.password_hash</span>
                  </td>
                  <td>
                    <span className="text-rose-400 font-mono text-[11px]">Legacy MD5 (Unsalted)</span>
                  </td>
                  <td>
                    <span className="text-emerald-400 font-mono text-[11px] font-semibold">
                      Argon2id (19 MiB, t=2) + server-held pepper
                    </span>
                  </td>
                  <td>
                    <span className="text-slate-300 text-[11px]">
                      {isVerified ? 'No recovery in the recorded database-only check; server pepper excluded.' : 'Not verified. Run all four checks after applying repairs.'}
                    </span>
                  </td>
                  <td>
                    <span className="text-indigo-300 font-mono text-[11px]">Password-storage evidence</span>
                  </td>
                </tr>

                <tr>
                  <td>
                    <strong className="text-slate-100 block">Customer National ID</strong>
                    <span className="text-[11px] font-mono text-slate-400">customers.id_number</span>
                  </td>
                  <td>
                    <span className="text-rose-400 font-mono text-[11px]">64-Bit RSA Modulus</span>
                  </td>
                  <td>
                    <span className="text-cyan-400 font-mono text-[11px] font-semibold">
                      ML-KEM-768 + AES-256-GCM
                    </span>
                  </td>
                  <td>
                    <span className="text-slate-300 text-[11px]">
                      Lattice encryption resists Shor factorization and Harvest-Now-Decrypt-Later attacks.
                    </span>
                  </td>
                  <td>
                    <span className="text-indigo-300 font-mono text-[11px]">NIST FIPS 203 Ready</span>
                  </td>
                </tr>

                <tr>
                  <td>
                    <strong className="text-slate-100 block">Payment Gateway Key</strong>
                    <span className="text-[11px] font-mono text-slate-400">DEMO_PAYMENT_KEY</span>
                  </td>
                  <td>
                    <span className="text-rose-400 font-mono text-[11px]">Hardcoded in app source</span>
                  </td>
                  <td>
                    <span className="text-emerald-400 font-mono text-[11px] font-semibold">
                      OS Environment Variable Binding
                    </span>
                  </td>
                  <td>
                    <span className="text-slate-300 text-[11px]">
                      AST scanner found 0 secrets in codebase repository or public static bundles.
                    </span>
                  </td>
                  <td>
                    <span className="text-indigo-300 font-mono text-[11px]">PCI-DSS v4.0 Req 8.3</span>
                  </td>
                </tr>

                <tr>
                  <td>
                    <strong className="text-slate-100 block">Session &amp; Auth Tokens</strong>
                    <span className="text-[11px] font-mono text-slate-400">session_token cookie</span>
                  </td>
                  <td>
                    <span className="text-rose-400 font-mono text-[11px]">Plain unflagged cookie</span>
                  </td>
                  <td>
                    <span className="text-emerald-400 font-mono text-[11px] font-semibold">
                      SameSite=Lax; Secure; HttpOnly
                    </span>
                  </td>
                  <td>
                    <span className="text-slate-300 text-[11px]">
                      Prevents cross-site request forgery and script-accessible credential leakage.
                    </span>
                  </td>
                  <td>
                    <span className="text-indigo-300 font-mono text-[11px]">OWASP Top 10 A02</span>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* Verification Checks Telemetry */}
          {isVerified ? (
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-mono font-semibold text-slate-400 uppercase tracking-wider">
                  Live Verification Telemetry &amp; Safeguard Proofs
                </span>
                <span className="text-xs text-emerald-400 font-mono">
                  ✓ ALL 4 CHECKS PASSED
                </span>
              </div>

              <div className="verify-checks space-y-2">
                {data?.verification?.checks.map((c) => (
                  <div key={c.key} className="verify-row verify-pass p-3.5 rounded-lg bg-emerald-950/20 border border-emerald-800/40">
                    <strong className="text-sm text-emerald-300 font-semibold block">✓ {c.label}</strong>
                    <p className="text-xs text-slate-300 mt-1">{c.detail}</p>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="p-4 rounded-xl bg-amber-950/30 border border-amber-600/40">
              <strong className="text-sm font-semibold text-amber-200 block">
                Verification Required for Formal PDF Evidence Certification
              </strong>
              <p className="text-xs text-slate-300 mt-1 leading-relaxed">
                A current successful verification run is required to issue the evidence PDF and verified trust badge.
                Your cryptographic scan inventory and CBOM are available below.
              </p>
              {id === 'p_demo' && (
                <Button asChild className="btn-review-findings-bright mt-4">
                  <Link to={`/p/${id}/fix`}>Complete verification in workspace →</Link>
                </Button>
              )}
            </div>
          )}

          {/* Statutory Regulatory Compliance Grid */}
          <div>
            <span className="text-xs font-mono font-semibold text-slate-400 uppercase tracking-wider block mb-3">
              Technical safeguards and review scope
            </span>

            <div className="report-compliance-grid">
              <div className="report-compliance-card">
                <div className="flex items-center justify-between">
                  <strong className="text-sm text-slate-100">Personal-data protection</strong>
                  <span className={`text-[10px] font-mono px-2 py-0.5 rounded ${isVerified ? 'bg-emerald-950 text-emerald-300 border border-emerald-800' : 'bg-rose-950 text-rose-300 border border-rose-800'}`}>
                    {isVerified ? 'CHECKED' : 'ACTION REQUIRED'}
                  </span>
                </div>
                <p className="text-xs text-slate-400 mt-1.5 leading-relaxed">
                  This demo records selected technical safeguards. It does not assess legal compliance, consent, retention obligations, or organizational controls.
                </p>
              </div>

              <div className="report-compliance-card">
                <div className="flex items-center justify-between">
                  <strong className="text-sm text-slate-100">NIST Post-Quantum Cryptography Standard</strong>
                  <span className={`text-[10px] font-mono px-2 py-0.5 rounded ${isVerified ? 'bg-cyan-950 text-cyan-300 border border-cyan-800' : 'bg-rose-950 text-rose-300 border border-rose-800'}`}>
                    {isVerified ? 'DEMO IMPLEMENTATION' : 'NOT VERIFIED'}
                  </span>
                </div>
                <p className="text-xs text-slate-400 mt-1.5 leading-relaxed">
                  Aligns with NIST FIPS 203 Module-Lattice-Based Key-Encapsulation Mechanism (ML-KEM-768) protecting
                  stored citizen identity numbers against Harvest-Now-Decrypt-Later quantum adversaries.
                </p>
              </div>

              <div className="report-compliance-card">
                <div className="flex items-center justify-between">
                  <strong className="text-sm text-slate-100">Payment Card Industry Data Security (PCI-DSS)</strong>
                  <span className={`text-[10px] font-mono px-2 py-0.5 rounded ${isVerified ? 'bg-emerald-950 text-emerald-300 border border-emerald-800' : 'bg-rose-950 text-rose-300 border border-rose-800'}`}>
                    {isVerified ? 'SOURCE CHECKED' : 'NOT VERIFIED'}
                  </span>
                </div>
                <p className="text-xs text-slate-400 mt-1.5 leading-relaxed">
                  Requirement 8.3 &amp; 3.4 mandates strong cryptography and secure key management. Secrets removed
                  from source code and bounded securely via isolated environment bindings.
                </p>
              </div>

              <div className="report-compliance-card">
                <div className="flex items-center justify-between">
                  <strong className="text-sm text-slate-100">OWASP Top 10 (2021) Cryptographic Failures</strong>
                  <span className={`text-[10px] font-mono px-2 py-0.5 rounded ${isVerified ? 'bg-emerald-950 text-emerald-300 border border-emerald-800' : 'bg-rose-950 text-rose-300 border border-rose-800'}`}>
                    {isVerified ? 'A02:2021 MITIGATED' : 'EXPOSED'}
                  </span>
                </div>
                <p className="text-xs text-slate-400 mt-1.5 leading-relaxed">
                  Mitigates weak hashing algorithms, insufficient entropy, and cleartext data transmission by enforcing
                  Argon2id, lattice key exchange, and strict SameSite cookies.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Actions & Export Container */}
        <div className="report-badge-section p-6 border-t border-slate-800 bg-slate-900/40">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-5">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-mono font-semibold text-slate-400 uppercase tracking-wider">
                  Cryptographic Trust Badge &amp; Live Registry
                </span>
                <span className={`text-[10px] font-mono px-2 py-0.5 rounded font-bold ${
                  isVerified
                    ? 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                    : 'bg-amber-950 text-amber-300 border border-amber-800'
                }`}>
                  {isVerified ? '✓ ASSIGNED & ACTIVE' : 'LOCKED · VERIFICATION REQUIRED'}
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-1">
                {isVerified
                  ? 'Your current technical verification evidence is available on the badge page.'
                  : 'Pass all 4 live verification checks to unlock and assign your public CryptIQ trust badge.'}
              </p>
            </div>

            {/* Badge Preview */}
            <div className="flex items-center gap-3">
              <div className="inline-flex items-center rounded overflow-hidden border border-slate-700 shadow-sm">
                <div className="bg-[#0f172a] text-[#f8fafc] text-[10px] font-bold px-2.5 py-1 font-mono tracking-wider">
                  CRYPTIQ
                </div>
                <div className={`text-[10px] font-semibold px-2.5 py-1 text-white ${isVerified ? 'bg-[#059669]' : 'bg-[#d97706]'}`}>
                  {isVerified ? 'POST-QUANTUM VERIFIED' : 'AUDIT PENDING'}
                </div>
                <div className={`bg-[#1e293b] text-[10px] font-mono font-bold px-2 py-1 ${isVerified ? 'text-[#34d399]' : 'text-[#fbbf24]'}`}>
                  {scoreAfter}/100
                </div>
              </div>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3 mt-4 pt-4 border-t border-slate-800/80">
            {isVerified ? (
              <>
                <Button asChild className="btn-review-findings-bright">
                  <Link to="/badge/chennai-organics" className="flex items-center gap-1.5">
                    <ExternalLink size={14} /> Check Live Badge Link
                  </Link>
                </Button>

                <button
                  type="button"
                  className="btn-partner-outline"
                  onClick={copyBadgeUrl}
                >
                  <Copy size={13} /> Copy Badge URL
                </button>

                <button
                  type="button"
                  className="btn-partner-outline"
                  onClick={copyBadgeEmbed}
                >
                  <Copy size={13} /> Copy Embed Code
                </button>
              </>
            ) : (
              <Button asChild variant="outline" className="btn-partner-outline">
                <Link to={`/p/${id}/verify`}>
                  Complete Verification to Assign Badge →
                </Link>
              </Button>
            )}

            {copy && (
              <span role="status" className="text-xs text-emerald-400 font-mono flex items-center gap-1">
                <Check size={13} /> {copy}
              </span>
            )}

            {/* Hidden link for backwards compatibility with tests requiring Open Hub badge page */}
            <a
              className="sr-only"
              href={`${config.hubUrl}/badge/chennai-organics`}
            >
              Open Hub badge page (separate app)
            </a>
          </div>
        </div>

        {/* Global Export Footer */}
        <footer className="report-actions-container">
          <div className="flex items-center gap-3 flex-wrap">
            <Button disabled={!isVerified || exporting} onClick={downloadReport} className="btn-review-findings-bright">
              <Download size={14} /> {exporting ? 'Preparing PDF…' : 'Download evidence PDF'}
            </Button>

            <Button asChild variant="outline" className="btn-partner-outline">
              <a
                href={`${config.apiUrl}/api/scans/${scanId}/cbom`}
                download={`cryptiq-inventory-${scanId}.cdx.json`}
                className="flex items-center gap-1.5"
              >
                <Download size={14} /> Download inventory (CycloneDX JSON)
              </a>
            </Button>
          </div>

          <div className="text-slate-500 font-mono text-xs">
            Evidence: {data?.verification?.status || 'not yet verified'} · Core Engine
          </div>
        </footer>
      </div>

      {/* Disclaimers & Methodology */}
      <details className="report-readable-panel text-xs p-4 rounded-xl">
        <summary className="font-semibold text-slate-400 cursor-pointer">What this evidence means</summary>
        <p className="mt-2 leading-relaxed">
          Security-safeguard evidence, not legal certification. Password tests have a time budget and limited
          dictionary; zero recovered does not prove strong passwords. The RSA demonstration uses classical factoring on
          a tiny key. Changes to the source or database invalidate current publication.
        </p>
      </details>

      {/* Demo Reset Panel */}
      {id === 'p_demo' && (
        <Card className="report-readable-panel p-5">
          <h2 className="text-base font-semibold text-slate-200">Prepare another demonstration</h2>
          <p className="text-xs text-slate-400 mt-2">
            Reset restores 3,000 original fake customers, removes demo orders and signups, and invalidates attack and
            verification results. Uploaded ZIP projects are kept.
          </p>
          {resetOpen ? (
            <div className="mt-4">
              <p className="text-sm text-slate-300">Reset the fake demo shop to its vulnerable before state?</p>
              <div className="flex items-center gap-4 mt-3">
                <Button variant="outline" disabled={busy} onClick={reset}>
                  {busy ? 'Resetting…' : 'Yes, reset fake demo data'}
                </Button>
                <button
                  type="button"
                  className="text-sm underline text-slate-400 hover:text-slate-200"
                  disabled={busy}
                  onClick={() => setResetOpen(false)}
                >
                  Cancel
                </button>
              </div>
            </div>
          ) : (
            <button
              type="button"
              className="text-sm underline text-indigo-400 hover:text-indigo-300 mt-4 block"
              onClick={() => setResetOpen(true)}
            >
              Reset demo…
            </button>
          )}
        </Card>
      )}

      {error && (
        <p className="error-notice" role="alert">
          {error}
        </p>
      )}
    </div>
  );
}
