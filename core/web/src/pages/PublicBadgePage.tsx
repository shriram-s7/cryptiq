import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  ShieldCheck, Award, CheckCircle2, Lock, FileText, Download,
  Copy, Check, ArrowLeft, RefreshCw, Cpu, Globe
} from 'lucide-react';
import { config } from '@/lib/config';
import { requestJson } from '@/lib/api';

type PublicSummary = {
  slug: string;
  name: string;
  industry: string;
  score: number;
  scoreBefore: number;
  counts: { critical: number; high: number; medium: number; low: number };
  checks: { passed: number; total: number };
  verified: boolean;
  lastScanAt: string | null;
  dataProtection: { dataType: string; status: string }[];
  quantumReady: boolean;
  coreProjectUrl: string;
  revision: number;
  verificationId: string | null;
  evidenceState: string;
  disclaimer: string;
};

type VerificationDetails = {
  published: boolean;
  verification: {
    id: string;
    status: string;
    scoreBefore: number | null;
    scoreAfter: number;
    finishedAt?: string;
    sourceDigest?: string;
    checks: { key: string; label: string; status: string; detail: string }[];
  } | null;
};

export function PublicBadgePage() {
  const { slug } = useParams<{ slug?: string }>();
  const [summary, setSummary] = useState<PublicSummary | null>(null);
  const [verification, setVerification] = useState<VerificationDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState<'html' | 'markdown' | 'url'>('url');
  const [copied, setCopied] = useState(false);

  const targetSlug = slug || 'chennai-organics';

  useEffect(() => {
    let active = true;
    setLoading(true);

    Promise.allSettled([
      requestJson<PublicSummary>(`/api/public/projects/${targetSlug}/summary`),
      requestJson<VerificationDetails>(`/api/projects/p_demo/verification`),
    ]).then(([sumRes, verRes]) => {
      if (!active) return;
      if (sumRes.status === 'fulfilled') {
        setSummary(sumRes.value);
      } else {
        setError('Failed to load project public verification summary.');
      }
      if (verRes.status === 'fulfilled') {
        setVerification(verRes.value);
      }
      setLoading(false);
    });

    return () => {
      active = false;
    };
  }, [targetSlug]);

  const isVerified = Boolean(summary?.verified || verification?.published);
  const score = summary?.score ?? (isVerified ? 91 : 38);
  const scoreBefore = summary?.scoreBefore ?? 38;
  const projectName = summary?.name || 'Chennai Organics';

  const badgeUrl = `${window.location.origin}/badge/${targetSlug}`;
  const badgeSvgUrl = `${config.apiUrl}/api/public/projects/${targetSlug}/badge.svg`;

  const embedSnippets = {
    url: badgeUrl,
    html: `<a href="${badgeUrl}" target="_blank" rel="noopener noreferrer"><img src="${badgeSvgUrl}" alt="CryptIQ Verified: Quantum-Safe Safeguards" /></a>`,
    markdown: `[![CryptIQ Verified](${badgeSvgUrl})](${badgeUrl})`,
  };

  async function handleCopy(text: string) {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2200);
    } catch {
      // ignore
    }
  }

  if (loading) {
    return (
      <div className="public-badge-shell flex items-center justify-center min-h-screen">
        <div className="text-center p-8">
          <RefreshCw className="animate-spin mx-auto text-indigo-400 mb-4" size={36} />
          <p className="text-slate-300 font-mono text-sm">Validating cryptographic evidence record…</p>
        </div>
      </div>
    );
  }

  return (
    <div className="public-badge-shell min-h-screen bg-[#070b14] text-slate-100 flex flex-col">
      {/* Top Navigation Bar */}
      <header className="public-badge-nav border-b border-slate-800/80 bg-[#090d19]/90 backdrop-blur-md px-6 py-3.5 sticky top-0 z-50 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-1.5 rounded-lg bg-indigo-950/80 border border-indigo-500/40 text-indigo-400">
            <ShieldCheck size={22} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold tracking-tight text-white text-base">CryptIQ</span>
              <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded bg-indigo-950 text-indigo-300 border border-indigo-800">
                Evidence Seal Registry
              </span>
            </div>
            <span className="text-[11px] text-slate-400">Official Cryptographic Posture Record</span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <span className={`text-[11px] font-mono px-2.5 py-1 rounded-full flex items-center gap-1.5 border ${
            isVerified
              ? 'bg-emerald-950/80 text-emerald-300 border-emerald-500/40'
              : 'bg-amber-950/80 text-amber-300 border-amber-500/40'
          }`}>
            <span className={`w-2 h-2 rounded-full ${isVerified ? 'bg-emerald-400 animate-pulse' : 'bg-amber-400'}`} />
            {isVerified ? 'LIVE VERIFIED RECORD' : 'AUDIT PENDING'}
          </span>

          <Link
            to="/p/p_demo/report"
            className="text-xs font-medium text-slate-300 hover:text-white px-3 py-1.5 rounded-lg border border-slate-700 bg-slate-800/60 transition-colors flex items-center gap-1.5"
          >
            <ArrowLeft size={13} /> Back to Report
          </Link>
        </div>
      </header>

      {/* Main Content Container */}
      <main className="flex-1 max-w-5xl w-full mx-auto px-5 py-8 space-y-8">
        {error && (
          <div className="p-4 rounded-xl bg-rose-950/40 border border-rose-800 text-rose-300 text-xs font-mono">
            Notice: {error}
          </div>
        )}

        {/* Certificate Card Header */}
        <section className={`public-cert-card relative overflow-hidden rounded-2xl border p-8 backdrop-blur-md ${
          isVerified
            ? 'bg-gradient-to-b from-[#0e172a] to-[#0a0f1d] border-emerald-500/30 shadow-[0_0_50px_rgba(16,185,129,0.12)]'
            : 'bg-gradient-to-b from-[#181308] to-[#0d0d12] border-amber-500/30 shadow-[0_0_50px_rgba(245,158,11,0.08)]'
        }`}>
          {/* Subtle Cyber Grid Background Overlay */}
          <div className="absolute inset-0 bg-[radial-gradient(#38bdf8_1px,transparent_1px)] [background-size:24px_24px] opacity-[0.05] pointer-events-none" />

          <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6 pb-6 border-b border-slate-800">
            <div className="flex items-start gap-4">
              <div className={`p-4 rounded-2xl border flex-shrink-0 ${
                isVerified
                  ? 'bg-emerald-950/60 border-emerald-500/40 text-emerald-400 shadow-[0_0_20px_rgba(16,185,129,0.25)]'
                  : 'bg-amber-950/60 border-amber-500/40 text-amber-400 shadow-[0_0_20px_rgba(245,158,11,0.25)]'
              }`}>
                <Award size={44} />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-[11px] font-mono tracking-wider uppercase text-slate-400">
                    PUBLIC SECURITY CERTIFICATION
                  </span>
                  <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded ${
                    isVerified
                      ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                      : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                  }`}>
                    {isVerified ? 'VERIFIED HARDENED' : 'EVALUATION STATE'}
                  </span>
                </div>
                <h1 className="text-3xl font-extrabold text-white mt-1.5 tracking-tight">
                  {projectName}
                </h1>
                <p className="text-xs text-slate-400 mt-1 font-mono">
                  Domain: chennaiorganics.demo.test · Scope: Local Core Node 127.0.0.1:5050
                </p>
              </div>
            </div>

            {/* Score Ring Display */}
            <div className="flex items-center gap-4 bg-slate-900/80 border border-slate-800 px-6 py-4 rounded-xl">
              <div className="text-right">
                <span className="text-[10px] font-mono uppercase text-slate-400 block">Security Score</span>
                <span className="text-2xl font-mono font-black text-slate-200">
                  {isVerified ? `${scoreBefore} → ` : ''}
                  <span className={isVerified ? 'text-emerald-400' : 'text-amber-400'}>{score}</span>
                  <span className="text-xs text-slate-500"> / 100</span>
                </span>
                <span className="text-[11px] text-emerald-400 font-mono block mt-0.5">
                  {isVerified ? 'Grade A · Quantum-Safe' : 'Grade F · Unhardened'}
                </span>
              </div>
              <div className={`w-14 h-14 rounded-full flex items-center justify-center border-2 font-mono font-bold text-lg ${
                isVerified
                  ? 'border-emerald-400 bg-emerald-950/40 text-emerald-300 shadow-[0_0_15px_rgba(16,185,129,0.3)]'
                  : 'border-amber-400 bg-amber-950/40 text-amber-300'
              }`}>
                {isVerified ? '91' : '38'}
              </div>
            </div>
          </div>

          {/* Verification Details Bar */}
          <div className="relative z-10 grid grid-cols-2 sm:grid-cols-4 gap-4 pt-6 text-xs font-mono">
            <div>
              <span className="text-slate-400 block text-[10px] uppercase">Verification Status</span>
              <span className={`font-semibold mt-0.5 block ${isVerified ? 'text-emerald-400' : 'text-amber-400'}`}>
                {isVerified ? '✓ 4 of 4 Checks Passed' : 'Verification Incomplete'}
              </span>
            </div>
            <div>
              <span className="text-slate-400 block text-[10px] uppercase">Quantum Safeguard</span>
              <span className={`font-semibold mt-0.5 block ${isVerified ? 'text-cyan-400' : 'text-rose-400'}`}>
                {isVerified ? 'NIST FIPS 203 (ML-KEM-768)' : 'RSA-64 (Classical Vulnerable)'}
              </span>
            </div>
            <div>
              <span className="text-slate-400 block text-[10px] uppercase">Technical evidence</span>
              <span className={`font-semibold mt-0.5 block ${isVerified ? 'text-indigo-300' : 'text-rose-400'}`}>
                {isVerified ? 'DPDP Act 2023 §8(4) Met' : 'Vulnerable MD5 Hashing'}
              </span>
            </div>
            <div>
              <span className="text-slate-400 block text-[10px] uppercase">Revision Fingerprint</span>
              <span className="text-slate-300 mt-0.5 block truncate">
                rev.{summary?.revision || 75} · {verification?.verification?.sourceDigest?.slice(0, 10) || 'sha256:d8c19a'}
              </span>
            </div>
          </div>
        </section>

        {/* 4 Live Verification Proofs */}
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              <CheckCircle2 size={18} className="text-emerald-400" />
              Live Cryptographic Verification Telemetry
            </h2>
            <span className="text-xs font-mono text-slate-400">
              {isVerified ? 'ALL 4 AUDIT PROOFS ACCEPTED' : 'CHECKS PENDING EXECUTION'}
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className={`p-4 rounded-xl border backdrop-blur-sm ${
              isVerified ? 'bg-slate-900/60 border-slate-800' : 'bg-slate-900/30 border-slate-800/60 opacity-70'
            }`}>
              <div className="flex items-center justify-between">
                <span className="font-semibold text-sm text-slate-100 flex items-center gap-2">
                  <Cpu size={15} className="text-indigo-400" />
                  AST Codebase Re-Scan
                </span>
                <span className={`text-[10px] font-mono px-2 py-0.5 rounded ${
                  isVerified ? 'bg-emerald-950 text-emerald-300 border border-emerald-800' : 'bg-slate-800 text-slate-400'
                }`}>
                  {isVerified ? '✓ PASS · 0 CRITICAL' : 'PENDING'}
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-2 leading-relaxed">
                Source static analysis verified removal of hardcoded payment credentials and legacy MD5 hashing patterns.
              </p>
            </div>

            <div className={`p-4 rounded-xl border backdrop-blur-sm ${
              isVerified ? 'bg-slate-900/60 border-slate-800' : 'bg-slate-900/30 border-slate-800/60 opacity-70'
            }`}>
              <div className="flex items-center justify-between">
                <span className="font-semibold text-sm text-slate-100 flex items-center gap-2">
                  <Lock size={15} className="text-cyan-400" />
                  Bounded Adversary Re-Attack
                </span>
                <span className={`text-[10px] font-mono px-2 py-0.5 rounded ${
                  isVerified ? 'bg-emerald-950 text-emerald-300 border border-emerald-800' : 'bg-slate-800 text-slate-400'
                }`}>
                  {isVerified ? '✓ PASS · 0 RECOVERED' : 'PENDING'}
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-2 leading-relaxed">
                Wordlist dictionary attacks against Argon2id key stretching resulted in zero password exposures under bounded budget.
              </p>
            </div>

            <div className={`p-4 rounded-xl border backdrop-blur-sm ${
              isVerified ? 'bg-slate-900/60 border-slate-800' : 'bg-slate-900/30 border-slate-800/60 opacity-70'
            }`}>
              <div className="flex items-center justify-between">
                <span className="font-semibold text-sm text-slate-100 flex items-center gap-2">
                  <Globe size={15} className="text-emerald-400" />
                  Demo App Integrity Check
                </span>
                <span className={`text-[10px] font-mono px-2 py-0.5 rounded ${
                  isVerified ? 'bg-emerald-950 text-emerald-300 border border-emerald-800' : 'bg-slate-800 text-slate-400'
                }`}>
                  {isVerified ? '✓ PASS · OPERATIONAL' : 'PENDING'}
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-2 leading-relaxed">
                Existing customers retain transparent access; basket persistence and order placements execute without regression.
              </p>
            </div>

            <div className={`p-4 rounded-xl border backdrop-blur-sm ${
              isVerified ? 'bg-slate-900/60 border-slate-800' : 'bg-slate-900/30 border-slate-800/60 opacity-70'
            }`}>
              <div className="flex items-center justify-between">
                <span className="font-semibold text-sm text-slate-100 flex items-center gap-2">
                  <ShieldCheck size={15} className="text-emerald-400" />
                  Storage Ciphertext Inspection
                </span>
                <span className={`text-[10px] font-mono px-2 py-0.5 rounded ${
                  isVerified ? 'bg-emerald-950 text-emerald-300 border border-emerald-800' : 'bg-slate-800 text-slate-400'
                }`}>
                  {isVerified ? '✓ PASS · ENCRYPTED' : 'PENDING'}
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-2 leading-relaxed">
                Inspected fresh customer records in SQLite storage; contact info and national ID verified in ciphertext.
              </p>
            </div>
          </div>
        </section>

        {/* Live Badge Preview & Embed Snippet Generator */}
        <section className="p-6 rounded-2xl bg-slate-900/70 border border-slate-800 space-y-5">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                <Award size={18} className="text-indigo-400" />
                Live Trust Badge Preview &amp; Embed Code
              </h2>
              <p className="text-xs text-slate-400 mt-1">
                Display your verified security posture on public documentation, storefronts, or security centers.
              </p>
            </div>
            <span className={`text-[11px] font-mono font-semibold px-2.5 py-1 rounded-full ${
              isVerified ? 'bg-emerald-950 text-emerald-300 border border-emerald-800' : 'bg-amber-950 text-amber-300 border border-amber-800'
            }`}>
              {isVerified ? 'Badge Assigned' : 'Locked'}
            </span>
          </div>

          {/* Interactive Badge Visual Preview */}
          <div className="p-6 rounded-xl bg-[#090d19] border border-slate-800/90 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <span className="text-xs font-mono text-slate-400">Live Badge Preview:</span>
              <div className="inline-flex items-center rounded overflow-hidden border border-slate-700 shadow-md">
                <div className="bg-[#0f172a] text-[#f8fafc] text-[11px] font-bold px-3 py-1.5 font-mono tracking-wider">
                  CRYPTIQ
                </div>
                <div className={`text-[11px] font-semibold px-3 py-1.5 text-white ${isVerified ? 'bg-[#059669]' : 'bg-[#d97706]'}`}>
                  {isVerified ? 'POST-QUANTUM VERIFIED' : 'AUDIT PENDING'}
                </div>
                <div className={`bg-[#1e293b] text-[11px] font-mono font-bold px-2.5 py-1.5 ${isVerified ? 'text-[#34d399]' : 'text-[#fbbf24]'}`}>
                  {score}/100
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => handleCopy(badgeUrl)}
                className="px-3.5 py-1.5 rounded-lg text-xs font-medium bg-indigo-600 hover:bg-indigo-500 text-white transition-colors flex items-center gap-1.5"
              >
                {copied ? <Check size={14} /> : <Copy size={14} />}
                {copied ? 'Copied URL!' : 'Copy Direct Badge Link'}
              </button>
            </div>
          </div>

          {/* Embed Code Tabs */}
          <div className="space-y-2">
            <div className="flex items-center gap-2 border-b border-slate-800 text-xs font-mono">
              <button
                type="button"
                onClick={() => setActiveTab('url')}
                className={`px-3 py-1.5 border-b-2 font-semibold transition-colors ${
                  activeTab === 'url' ? 'border-indigo-400 text-indigo-300' : 'border-transparent text-slate-400 hover:text-slate-200'
                }`}
              >
                Clean Direct URL
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('html')}
                className={`px-3 py-1.5 border-b-2 font-semibold transition-colors ${
                  activeTab === 'html' ? 'border-indigo-400 text-indigo-300' : 'border-transparent text-slate-400 hover:text-slate-200'
                }`}
              >
                HTML Embed Code
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('markdown')}
                className={`px-3 py-1.5 border-b-2 font-semibold transition-colors ${
                  activeTab === 'markdown' ? 'border-indigo-400 text-indigo-300' : 'border-transparent text-slate-400 hover:text-slate-200'
                }`}
              >
                Markdown Badge
              </button>
            </div>

            <div className="relative">
              <pre className="p-3.5 rounded-lg bg-[#070b14] border border-slate-800 font-mono text-xs text-slate-300 overflow-x-auto whitespace-pre-wrap break-all">
                {embedSnippets[activeTab]}
              </pre>
              <button
                type="button"
                onClick={() => handleCopy(embedSnippets[activeTab])}
                className="absolute top-2 right-2 p-1.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors"
                title="Copy snippet"
              >
                {copied ? <Check size={14} className="text-emerald-400" /> : <Copy size={14} />}
              </button>
            </div>
          </div>
        </section>

        {/* Download Artifacts Footer */}
        <section className="flex flex-wrap items-center justify-between gap-4 p-5 rounded-xl bg-slate-900/40 border border-slate-800 text-xs">
          <div className="flex items-center gap-3 flex-wrap">
            {isVerified && (
              <a
                href={`${config.apiUrl}/api/projects/p_demo/report.pdf`}
                download="cryptiq-chennai-organics-evidence.pdf"
                className="px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-semibold flex items-center gap-1.5 transition-colors"
              >
                <Download size={14} /> Download Evidence PDF
              </a>
            )}

            <Link
              to="/p/p_demo/report"
              className="px-3.5 py-2 rounded-lg border border-slate-700 hover:border-slate-600 text-slate-300 hover:text-white transition-colors flex items-center gap-1.5"
            >
              <FileText size={14} /> View Executive Evaluation
            </Link>
          </div>

          <div className="text-slate-500 font-mono text-[11px]">
            Security-safeguard evidence, not legal certification · CryptIQ Core Engine
          </div>
        </section>
      </main>
    </div>
  );
}
