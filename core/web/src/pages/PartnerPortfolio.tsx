import { useEffect, useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowUpRight, Building2, CheckCircle2, RefreshCw, ShieldCheck,
  Users, Activity, Clock, Eye, AlertTriangle, ShieldAlert,
  Search, Sparkles, X, FileText
} from 'lucide-react';
import { requestJson } from '@/lib/api';

type Summary = {
  score: number;
  hasScan?: boolean;
  verified?: boolean;
  counts: { critical: number; high: number };
  lastScanAt: string | null;
};

type ClientFinding = {
  id: string;
  title: string;
  severity: 'critical' | 'high' | 'medium' | 'low';
  category: string;
  impact: string;
  compliance: string;
  howToFix: string;
  status: 'open' | 'remediating' | 'verified';
};

type ClientCompany = {
  id: string;
  name: string;
  sector: string;
  domain: string;
  live: boolean;
  score: number;
  grade: 'A' | 'B' | 'C' | 'F';
  counts: { critical: number; high: number; medium: number; low: number };
  quantumReady: boolean;
  lastAudit: string;
  findings: ClientFinding[];
};

export function PartnerPortfolio() {
  const [summary, setSummary] = useState<Summary | null>(null);
  const [error, setError] = useState('');
  const [refresh, setRefresh] = useState(0);
  const [busy, setBusy] = useState(false);
  const [selectedId, setSelectedId] = useState<string>('chennai-organics');
  const [tab, setTab] = useState<'Portfolio' | 'Client activity' | 'Subscription'>('Portfolio');
  const [updated, setUpdated] = useState('');
  const [filterSeverity, setFilterSeverity] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [inspectFinding, setInspectFinding] = useState<ClientFinding | null>(null);
  const [reviewModalCompany, setReviewModalCompany] = useState<ClientCompany | null>(null);

  useEffect(() => {
    const abort = new AbortController();
    let timer: ReturnType<typeof setTimeout>;

    async function load() {
      setBusy(true);
      try {
        const s = await requestJson<Summary>('/api/public/projects/chennai-organics/summary', { signal: abort.signal });
        if (!abort.signal.aborted) {
          setSummary(s);
          setError('');
          setUpdated(new Date().toLocaleTimeString());
        }
      } catch {
        if (!abort.signal.aborted) {
          setError('Live Chennai Organics connection unavailable. Displaying cached baseline.');
        }
      } finally {
        if (!abort.signal.aborted) {
          setBusy(false);
          timer = setTimeout(load, 5000);
        }
      }
    }

    void load();
    return () => {
      abort.abort();
      clearTimeout(timer);
    };
  }, [refresh]);

  // Comprehensive multi-company client database
  const clients: ClientCompany[] = useMemo(() => {
    const liveScore = summary?.hasScan === false ? 38 : summary?.score ?? 38;
    const isLiveVerified = liveScore >= 80;

    return [
      {
        id: 'chennai-organics',
        name: 'Chennai Organics',
        sector: 'Grocery & E-Commerce',
        domain: 'chennaiorganics.demo.test',
        live: true,
        score: liveScore,
        grade: liveScore >= 80 ? 'A' : liveScore >= 60 ? 'C' : 'F',
        counts: isLiveVerified
          ? { critical: 0, high: 0, medium: 1, low: 1 }
          : { critical: summary?.counts.critical ?? 2, high: summary?.counts.high ?? 2, medium: 2, low: 2 },
        quantumReady: isLiveVerified,
        lastAudit: summary?.lastScanAt ? new Date(summary.lastScanAt).toLocaleDateString() : 'Today',
        findings: isLiveVerified
          ? [
              {
                id: 'co-01',
                title: 'Argon2id Memory Hardening Deployed',
                severity: 'low',
                category: 'Authentication',
                impact: 'Passwords protected against dictionary collision.',
                compliance: 'DPDP Act §8(4) Compliant',
                howToFix: 'Maintained automatically in production.',
                status: 'verified',
              },
              {
                id: 'co-02',
                title: 'ML-KEM-768 Lattice Encryption Active',
                severity: 'low',
                category: 'Quantum Cryptography',
                impact: 'Stored identities protected against future Shor factorization.',
                compliance: 'NIST FIPS 203 Ready',
                howToFix: 'Active post-quantum key encapsulation.',
                status: 'verified',
              },
            ]
          : [
              {
                id: 'co-crit-1',
                title: 'Legacy MD5 Password Storage',
                severity: 'critical',
                category: 'Credential Security',
                impact: '1,350 fake passwords crackable in under 15ms via common wordlist.',
                compliance: 'Violates DPDP Act Data Fiduciary Safeguard',
                howToFix: 'Upgrade authentication hashing to Argon2id with random 16-byte salt.',
                status: 'open',
              },
              {
                id: 'co-crit-2',
                title: 'Quantum-Vulnerable RSA Demo Key',
                severity: 'critical',
                category: 'Asymmetric Encryption',
                impact: 'Deliberate 64-bit RSA key can be factored classically in 400ms.',
                compliance: 'NIST SP 800-131A Non-Compliant',
                howToFix: 'Migrate to Post-Quantum ML-KEM-768 + AES-256-GCM authenticated encryption.',
                status: 'open',
              },
              {
                id: 'co-high-1',
                title: 'Hardcoded Payment Gateway Secret',
                severity: 'high',
                category: 'Secret Management',
                impact: 'DEMO_PAYMENT_KEY discovered directly inside source code.',
                compliance: 'PCI-DSS v4.0 Requirement 8.3',
                howToFix: 'Move payment secret into external environment variables or AWS Secrets Manager.',
                status: 'open',
              },
              {
                id: 'co-high-2',
                title: 'Plaintext Customer PII in Database',
                severity: 'high',
                category: 'Data at Rest',
                impact: 'Phone numbers, emails, and street addresses stored unencrypted in SQLite.',
                compliance: 'DPDP Act §8(5) Mandatory Encryption',
                howToFix: 'Apply AES-256-GCM envelope encryption before persistence.',
                status: 'open',
              },
            ],
      },
      {
        id: 'finsecure-payments',
        name: 'FinSecure Payments',
        sector: 'FinTech & UPI Gateway',
        domain: 'finsecure.pay.in',
        live: false,
        score: 42,
        grade: 'F',
        counts: { critical: 3, high: 2, medium: 1, low: 0 },
        quantumReady: false,
        lastAudit: '2 days ago',
        findings: [
          {
            id: 'fs-1',
            title: 'Hardcoded Webhook Verification Key',
            severity: 'critical',
            category: 'API Security',
            impact: 'Attackers can spoof transaction callback notifications to fake credit deposits.',
            compliance: 'RBI Master Direction on Cyber Security',
            howToFix: 'Use HMAC-SHA256 signature with rotated hardware security module (HSM) keys.',
            status: 'open',
          },
          {
            id: 'fs-2',
            title: 'Unsalted SHA-256 for Transaction PINs',
            severity: 'critical',
            category: 'Credential Security',
            impact: 'GPU rainbow tables can reverse 4-digit and 6-digit MPINs in seconds.',
            compliance: 'NPCI UPI Security Directive 2025',
            howToFix: 'Switch to PBKDF2 with 600,000 iterations or Argon2id.',
            status: 'open',
          },
          {
            id: 'fs-3',
            title: 'RSA-1024 Legacy Transport Certificates',
            severity: 'critical',
            category: 'TLS Cryptography',
            impact: 'Weak public key size exposes merchant transactions to eavesdropping.',
            compliance: 'CERT-In Security Advisory',
            howToFix: 'Reissue TLS certificates using ECC (P-256) or RSA-3072 minimum.',
            status: 'open',
          },
        ],
      },
      {
        id: 'medpulse-health',
        name: 'MedPulse Healthcare',
        sector: 'Telemedicine & HealthTech',
        domain: 'medpulse.care.io',
        live: false,
        score: 54,
        grade: 'C',
        counts: { critical: 2, high: 3, medium: 2, low: 1 },
        quantumReady: false,
        lastAudit: '5 days ago',
        findings: [
          {
            id: 'mp-1',
            title: 'Unencrypted Patient Aadhaar & Health Records',
            severity: 'critical',
            category: 'Sensitive PII',
            impact: 'Direct exposure of electronic health records (EHR) upon backup leak.',
            compliance: 'DISHA Act & DPDP Act Critical Safeguard',
            howToFix: 'Implement field-level AES-GCM encryption with client-side key envelope.',
            status: 'open',
          },
          {
            id: 'mp-2',
            title: 'Deprecated SHA-1 Used in Medical PDF Signatures',
            severity: 'critical',
            category: 'Digital Signatures',
            impact: 'Cryptographic collision risk enables prescription forgery.',
            compliance: 'NIST Policy on SHA-1 Deprecation',
            howToFix: 'Upgrade document signing to SHA-256 with Ed25519 signatures.',
            status: 'open',
          },
        ],
      },
      {
        id: 'apex-logistics',
        name: 'Apex Global Logistics',
        sector: 'Freight & Fleet Tracking',
        domain: 'apexlogistics.transport',
        live: false,
        score: 78,
        grade: 'B',
        counts: { critical: 0, high: 2, medium: 3, low: 1 },
        quantumReady: false,
        lastAudit: '1 week ago',
        findings: [
          {
            id: 'al-1',
            title: 'Session Cookie Missing SameSite=Strict',
            severity: 'high',
            category: 'Web Security',
            impact: 'Driver dispatch console susceptible to cross-site request forgery.',
            compliance: 'OWASP Top 10 A01:2021',
            howToFix: 'Enforce Secure; HttpOnly; SameSite=Strict on all auth tokens.',
            status: 'open',
          },
          {
            id: 'al-2',
            title: 'GPS Telemetry Channel Uses TLS 1.1',
            severity: 'high',
            category: 'Transport Security',
            impact: 'Legacy TLS version vulnerable to POODLE and BEAST attacks.',
            compliance: 'PCI-DSS v4.0 TLS Mandate',
            howToFix: 'Require TLS 1.3 exclusively across all IoT gateway endpoints.',
            status: 'open',
          },
        ],
      },
      {
        id: 'cloudvault-saas',
        name: 'CloudVault SaaS',
        sector: 'Enterprise Cloud Storage',
        domain: 'cloudvault.corp.net',
        live: false,
        score: 94,
        grade: 'A',
        counts: { critical: 0, high: 0, medium: 1, low: 2 },
        quantumReady: true,
        lastAudit: 'Yesterday',
        findings: [
          {
            id: 'cv-1',
            title: 'ML-KEM-768 Post-Quantum Key Exchange Implemented',
            severity: 'low',
            category: 'Quantum Resilience',
            impact: 'Harvest-now, decrypt-later attacks completely neutralized.',
            compliance: 'NIST Post-Quantum Standard (FIPS 203)',
            howToFix: 'Continuously benchmark key derivation performance.',
            status: 'verified',
          },
        ],
      },
      {
        id: 'bharat-paytech',
        name: 'Bharat PayTech',
        sector: 'Micro-Lending & NeoBank',
        domain: 'bharatpaytech.in',
        live: false,
        score: 36,
        grade: 'F',
        counts: { critical: 4, high: 3, medium: 2, low: 0 },
        quantumReady: false,
        lastAudit: '3 days ago',
        findings: [
          {
            id: 'bp-1',
            title: 'Plaintext Phone Numbers Stored as Account Keys',
            severity: 'critical',
            category: 'PII Exposure',
            impact: 'Allows competitor customer harvesting via database dump.',
            compliance: 'DPDP Act Section 8 Data Minimization',
            howToFix: 'Store pseudonymized blind index hashes (HMAC-SHA256).',
            status: 'open',
          },
          {
            id: 'bp-2',
            title: 'Single-Factor Admin Session Token',
            severity: 'critical',
            category: 'Access Control',
            impact: 'Admin endpoints lack multi-factor cryptographic challenges.',
            compliance: 'RBI Digital Lending Guidelines',
            howToFix: 'Enforce FIDO2 / WebAuthn hardware-bound passkeys for admin tier.',
            status: 'open',
          },
        ],
      },
      {
        id: 'bluekite-crafts',
        name: 'BlueKite Crafts',
        sector: 'Artisanal D2C Retail',
        domain: 'bluekitecrafts.in',
        live: false,
        score: 82,
        grade: 'B',
        counts: { critical: 0, high: 1, medium: 2, low: 1 },
        quantumReady: false,
        lastAudit: '2 weeks ago',
        findings: [
          {
            id: 'bk-1',
            title: 'Session Inactivity Timeout Exceeds 24 Hours',
            severity: 'high',
            category: 'Session Management',
            impact: 'Shared devices leave retail staff accounts permanently authenticated.',
            compliance: 'CIS Controls v8 Safeguard 6.3',
            howToFix: 'Reduce session idle invalidation window to 30 minutes.',
            status: 'open',
          },
        ],
      },
    ];
  }, [summary]);

  const filteredClients = useMemo(() => {
    return clients.filter(c => {
      const matchesSearch = c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.sector.toLowerCase().includes(searchQuery.toLowerCase());
      if (!matchesSearch) return false;
      if (filterSeverity === 'all') return true;
      if (filterSeverity === 'critical') return c.score < 50;
      if (filterSeverity === 'moderate') return c.score >= 50 && c.score < 80;
      if (filterSeverity === 'hardened') return c.score >= 80;
      return true;
    });
  }, [clients, searchQuery, filterSeverity]);

  const selectedCompany = clients.find(c => c.id === selectedId) || clients[0];

  return (
    <div className="partner-shell">
      {/* Sidebar Navigation */}
      <aside className="partner-nav">
        <Link to="/" className="wordmark">
          <ShieldCheck className="text-indigo-400" size={26} />
          <span>CRYPTIQ // PARTNER</span>
        </Link>

        <div className="partner-identity">
          <div className="partner-avatar">IA</div>
          <strong>Iyer &amp; Associates Advisory</strong>
          <span>Enterprise Partner Tier · 7 Clients</span>
        </div>

        <nav className="flex flex-col gap-1 mt-4">
          <button
            className={`partner-tab-btn ${tab === 'Portfolio' ? 'active' : ''}`}
            onClick={() => setTab('Portfolio')}
          >
            <Building2 size={17} /> Portfolio Dashboard
          </button>
          <button
            className={`partner-tab-btn ${tab === 'Client activity' ? 'active' : ''}`}
            onClick={() => setTab('Client activity')}
          >
            <Activity size={17} /> Real-Time Telemetry
          </button>
          <button
            className={`partner-tab-btn ${tab === 'Subscription' ? 'active' : ''}`}
            onClick={() => setTab('Subscription')}
          >
            <Users size={17} /> Partner Plan &amp; Billing
          </button>
        </nav>

        <div className="partner-permission">
          <Eye size={18} className="text-indigo-400 mb-2" />
          <strong>Multi-Tenant Observer Role</strong>
          <p>
            You hold consolidated read-only audit posture over all connected portfolios. Companies execute their own repairs in their private workspaces.
          </p>
        </div>

        <Link to="/" className="partner-back-btn">
          ← Return to Portal Hub
        </Link>
      </aside>

      {/* Main Content Area */}
      <main className="partner-content">
        <header className="partner-top-header">
          <div className="flex items-center gap-2">
            <span className="micro-label">MANAGED SECURITY OPERATIONS</span>
            <span className="text-slate-400">/</span>
            <span className="text-xs font-mono text-slate-300">{tab.toUpperCase()}</span>
          </div>

          <div className="flex items-center gap-3">
            <button
              className="btn-partner-refresh"
              disabled={busy}
              onClick={() => setRefresh(n => n + 1)}
            >
              <RefreshCw size={14} className={busy ? 'animate-spin text-indigo-400' : ''} />
              {busy ? 'Syncing...' : 'Sync Live Evidence'}
            </button>
          </div>
        </header>

        {tab === 'Subscription' ? (
          /* BILLING & SUBSCRIPTION TAB */
          <section className="partner-billing-section">
            <div className="billing-card">
              <span className="micro-label text-indigo-400">ENTERPRISE PARTNER PROGRAM</span>
              <h2 className="text-3xl font-semibold text-slate-100 mt-2">
                ₹1,199 <small className="text-sm font-normal text-slate-400">/ month base</small>
              </h2>
              <p className="text-xs text-slate-400 mt-1 max-w-lg leading-relaxed">
                Includes 3 active client workspaces with consolidated cryptographic posture, automated continuous DPDP Act compliance checks, and read-only executive evidence dashboards.
              </p>

              <div className="billing-table mt-6">
                <div className="billing-row">
                  <span>Included base client slots</span>
                  <strong>3 Active Workspaces</strong>
                </div>
                <div className="billing-row">
                  <span>Currently active demo portfolio companies</span>
                  <strong>7 Companies (4 Additional)</strong>
                </div>
                <div className="billing-row">
                  <span>Additional active workspace tier (₹500 / slot)</span>
                  <strong>₹2,000 / month</strong>
                </div>
                <div className="billing-row total">
                  <span>Consolidated Monthly Subscription</span>
                  <strong className="text-indigo-300 text-lg">₹3,199 / month</strong>
                </div>
              </div>

              <div className="mt-6 flex items-center gap-3">
                <button className="btn-partner-action">
                  <Sparkles size={16} /> Add Client Workspace
                </button>
                <button className="btn-partner-outline">
                  <FileText size={16} /> Export Consolidated Report (PDF)
                </button>
              </div>
            </div>
          </section>
        ) : tab === 'Client activity' ? (
          /* REAL-TIME TELEMETRY TAB */
          <section className="partner-activity-section">
            <h2 className="text-xl font-semibold text-slate-100 mb-4">Portfolio Telemetry Stream</h2>
            <div className="space-y-3">
              <div className="activity-card">
                <Clock className="text-indigo-400 flex-shrink-0" size={20} />
                <div>
                  <strong>Latest Synchronized Refresh</strong>
                  <p className="text-xs text-slate-400 mt-0.5">
                    {updated ? `Last successful cryptographic verification handshake at ${updated}` : 'Polling local engine...'}
                  </p>
                </div>
              </div>

              <div className="activity-card">
                <Activity className="text-rose-400 flex-shrink-0" size={20} />
                <div>
                  <strong>Chennai Organics (Live Local Node)</strong>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Posture score: <strong className={selectedCompany.score < 50 ? 'text-rose-400' : 'text-emerald-400'}>{selectedCompany.score}/100</strong>. {selectedCompany.counts.critical} critical findings currently flagged in database layer.
                  </p>
                </div>
              </div>

              <div className="activity-card">
                <CheckCircle2 className="text-emerald-400 flex-shrink-0" size={20} />
                <div>
                  <strong>CloudVault SaaS</strong>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Automated Kyber-768 post-quantum key exchange verification completed with 0 errors. Grade A sustained.
                  </p>
                </div>
              </div>

              <div className="activity-card">
                <AlertTriangle className="text-amber-400 flex-shrink-0" size={20} />
                <div>
                  <strong>FinSecure Payments</strong>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Hardcoded payment webhook secret detected during scheduled nightly AST repository parse.
                  </p>
                </div>
              </div>
            </div>
          </section>
        ) : (
          /* PORTFOLIO VIEW */
          <>
            <div className="partner-hero-title">
              <h1>
                Client Posture Intelligence.<br />
                <em className="text-indigo-400 font-normal">Every vulnerability in crisp focus.</em>
              </h1>
              <p className="partner-lead">
                Monitor cryptographic hygiene, post-quantum readiness, and DPDP Act compliance across your entire enterprise client portfolio.
              </p>
            </div>

            {error && (
              <div className="error-banner mb-6">
                <ShieldAlert size={18} />
                <span>{error}</span>
              </div>
            )}

            {/* High-Level Portfolio Stats */}
            <div className="partner-stats-grid portfolio-metrics">
              <div className="stat-card">
                <Users size={18} className="stat-icon" />
                <strong>{clients.length}</strong>
                <span>Managed Client Accounts</span>
              </div>
              <div className="stat-card">
                <Activity size={18} className="stat-icon text-indigo-400" />
                <strong className={summary?.score === 91 ? 'text-emerald-400' : 'text-rose-400'}>
                  {summary?.score ?? clients[0].score}
                </strong>
                <span>Chennai Organics score · live</span>
              </div>
              <div className="stat-card">
                <ShieldAlert size={18} className="stat-icon text-rose-400" />
                <strong className="text-rose-400">
                  {clients.filter(c => c.score < 50).length}
                </strong>
                <span>Critical Risk Exposures (&lt;50)</span>
              </div>
              <div className="stat-card">
                <Sparkles size={18} className="stat-icon text-emerald-400" />
                <strong className="text-emerald-400">
                  {clients.filter(c => c.quantumReady).length}
                </strong>
                <span>Quantum-Resistant Clients</span>
              </div>
            </div>

            {/* Filter & Search Bar */}
            <div className="partner-filter-bar">
              <div className="search-box">
                <Search size={15} className="text-slate-500" />
                <input
                  type="text"
                  placeholder="Filter clients by company name or sector..."
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                />
              </div>

              <div className="filter-pill-group">
                {[
                  { id: 'all', label: 'All Portfolios' },
                  { id: 'critical', label: 'Critical Risk (<50)' },
                  { id: 'moderate', label: 'Moderate (50-79)' },
                  { id: 'hardened', label: 'Hardened (80+)' },
                ].map(f => (
                  <button
                    key={f.id}
                    className={`filter-pill ${filterSeverity === f.id ? 'active' : ''}`}
                    onClick={() => setFilterSeverity(f.id)}
                  >
                    {f.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Main 2-Column Master-Detail Layout */}
            <div className="partner-master-detail-grid">
              {/* Left Column: Company Cards */}
              <div className="client-list-column">
                <div className="flex items-center justify-between mb-3 px-1">
                  <span className="text-xs font-mono text-slate-400">
                    SHOWING {filteredClients.length} OF {clients.length} PORTFOLIOS
                  </span>
                </div>

                <div className="space-y-2.5">
                  {filteredClients.map(c => {
                    const isSelected = selectedId === c.id;
                    return (
                      <div
                        key={c.id}
                        role="button"
                        tabIndex={0}
                        className={`company-card ${isSelected ? 'selected' : ''}`}
                        onClick={() => setSelectedId(c.id)}
                        onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') setSelectedId(c.id); }}
                      >
                        <div className="company-monogram">
                          {c.name.split(' ').map(n => n[0]).slice(0, 2).join('')}
                        </div>

                        <div className="company-meta">
                          <div className="flex items-center gap-2">
                            <strong className="text-sm font-semibold text-slate-100">{c.name}</strong>
                            {c.live && <span className="live-pill">LIVE PROJECT</span>}
                            {c.quantumReady && <span className="pqc-pill">PQC READY</span>}
                          </div>
                          <span className="text-xs text-slate-400">{c.sector} · {c.domain}</span>
                          <div className="flex items-center gap-3 mt-1 text-[11px] font-mono">
                            <span className="text-rose-400">{c.counts.critical} Crit</span>
                            <span className="text-amber-400">{c.counts.high} High</span>
                            <span className="text-slate-400">{c.counts.medium} Med</span>
                          </div>

                          <div className="mt-2 pt-2 border-t border-slate-800/40 flex items-center justify-between">
                            <button
                              type="button"
                              className="btn-review-findings-card"
                              onClick={(e) => {
                                e.stopPropagation();
                                setSelectedId(c.id);
                                setReviewModalCompany(c);
                              }}
                            >
                              <ShieldAlert size={12} className="text-rose-400" />
                              Review findings ({c.findings.length})
                            </button>
                            <span className="text-[10px] text-slate-400 font-mono">
                              Grade {c.grade}
                            </span>
                          </div>
                        </div>

                        {/* Score Circular Preview */}
                        <div className={`score-badge ${c.score < 50 ? 'risk' : c.score < 80 ? 'warn' : 'good'}`}>
                          <strong className="text-base font-mono">{c.score}</strong>
                          <small>Score</small>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Right Column: In-Depth Findings of Selected Company */}
              <div className="client-detail-column">
                <div className="detail-container-card">
                  {/* Top Company Header with Circular Posture Gauge */}
                  <div className="detail-top-banner">
                    <div className="flex items-start justify-between">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="micro-label">CLIENT SECURITY PROFILE</span>
                          {selectedCompany.live && <span className="live-pill">CONNECTED INSTANCE</span>}
                        </div>
                        <h2 className="text-2xl font-semibold text-slate-100 mt-1">{selectedCompany.name}</h2>
                        <p className="text-xs text-slate-400 mt-0.5">{selectedCompany.domain} · {selectedCompany.sector}</p>
                      </div>

                      {/* Prominent Circular Posture Ring */}
                      <div className="circular-score-widget">
                        <svg className="w-20 h-20 -rotate-90" viewBox="0 0 100 100">
                          {/* Background track */}
                          <circle
                            cx="50"
                            cy="50"
                            r="40"
                            stroke="rgba(255, 255, 255, 0.08)"
                            strokeWidth="9"
                            fill="none"
                          />
                          {/* Progress arc */}
                          <circle
                            cx="50"
                            cy="50"
                            r="40"
                            stroke={selectedCompany.score >= 80 ? '#10b981' : selectedCompany.score >= 50 ? '#f59e0b' : '#f43f5e'}
                            strokeWidth="9"
                            strokeDasharray={251.2}
                            strokeDashoffset={251.2 - (251.2 * selectedCompany.score) / 100}
                            strokeLinecap="round"
                            fill="none"
                          />
                        </svg>
                        <div className="score-center-text">
                          <span className="text-lg font-bold font-mono text-slate-100">{selectedCompany.score}</span>
                          <span className="text-[9px] uppercase tracking-wider text-slate-400">Grade {selectedCompany.grade}</span>
                        </div>
                      </div>
                    </div>

                    {/* Breakdown Badges + Bright Review Findings Hero Trigger */}
                    <div className="mt-4 flex items-center justify-between flex-wrap gap-3">
                      <div className="severity-summary-chips">
                        <div className="chip crit">
                          <strong>{selectedCompany.counts.critical}</strong> Critical
                        </div>
                        <div className="chip high">
                          <strong>{selectedCompany.counts.high}</strong> High Risk
                        </div>
                        <div className="chip med">
                          <strong>{selectedCompany.counts.medium}</strong> Medium
                        </div>
                        <div className="chip low">
                          <strong>{selectedCompany.counts.low}</strong> Low
                        </div>
                      </div>

                      <button
                        type="button"
                        className="btn-review-findings-bright"
                        onClick={() => setReviewModalCompany(selectedCompany)}
                      >
                        <ShieldAlert size={15} />
                        Review findings ({selectedCompany.findings.length} detected)
                      </button>
                    </div>
                  </div>

                  {/* Findings Section */}
                  <div className="p-6">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-sm font-semibold text-slate-200 flex items-center gap-2">
                        <ShieldAlert size={16} className="text-rose-400" />
                        Identified Vulnerabilities &amp; Findings ({selectedCompany.findings.length})
                      </h3>
                      <span className="text-xs text-slate-500 font-mono">PRIORITY ORDERED</span>
                    </div>

                    <div className="space-y-3">
                      {selectedCompany.findings.map(f => (
                        <div key={f.id} className="finding-item-card">
                          <div className="flex items-start justify-between gap-3">
                            <div className="flex items-center gap-2">
                              <span className={`finding-sev-pill ${f.severity}`}>{f.severity}</span>
                              <strong className="text-sm text-slate-100">{f.title}</strong>
                            </div>
                            <span className="text-[11px] font-mono text-slate-400 bg-slate-800/80 px-2 py-0.5 rounded">
                              {f.category}
                            </span>
                          </div>

                          <p className="text-xs text-slate-400 mt-2 leading-relaxed">
                            {f.impact}
                          </p>

                          <div className="flex items-center justify-between mt-3 pt-3 border-t border-slate-800/60">
                            <span className="text-[11px] font-mono text-indigo-400 flex items-center gap-1.5">
                              <CheckCircle2 size={13} /> {f.compliance}
                            </span>
                            <button
                              className="btn-inspect-finding"
                              onClick={() => setInspectFinding(f)}
                            >
                              Inspect Finding Details →
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>

                    {selectedCompany.live && (
                      <div className="mt-6 p-4 rounded-xl bg-indigo-950/40 border border-indigo-800/40 flex items-center justify-between">
                        <div>
                          <strong className="text-xs font-semibold text-indigo-300 block">
                            Direct Action Available
                          </strong>
                          <p className="text-xs text-slate-400 mt-0.5">
                            Open Chennai Organics workspace to review source diffs and trigger verification.
                          </p>
                        </div>
                        <Link to="/p/p_demo" className="btn-partner-action">
                          Open Client Workspace <ArrowUpRight size={14} />
                        </Link>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </>
        )}

        {/* Finding Detail Pop-up Modal */}
        {inspectFinding && (
          <div className="finding-popup-overlay" onClick={() => setInspectFinding(null)}>
            <div className="finding-popup-modal" onClick={e => e.stopPropagation()}>
              <div className="flex items-center justify-between border-b border-slate-800 pb-4">
                <div className="flex items-center gap-2.5">
                  <span className={`finding-sev-pill ${inspectFinding.severity}`}>
                    {inspectFinding.severity}
                  </span>
                  <h3 className="text-base font-semibold text-slate-100">
                    {inspectFinding.title}
                  </h3>
                </div>
                <button
                  className="p-1.5 rounded-lg text-slate-400 hover:text-slate-100 hover:bg-slate-800"
                  onClick={() => setInspectFinding(null)}
                >
                  <X size={18} />
                </button>
              </div>

              <div className="space-y-4 my-5 text-xs text-slate-300">
                <div>
                  <strong className="text-slate-400 block font-mono text-[10px] uppercase tracking-wider mb-1">
                    VULNERABILITY CATEGORY
                  </strong>
                  <p className="text-sm font-semibold text-slate-100">{inspectFinding.category}</p>
                </div>

                <div>
                  <strong className="text-slate-400 block font-mono text-[10px] uppercase tracking-wider mb-1">
                    EXPLOIT IMPACT &amp; RISK EXPOSURE
                  </strong>
                  <p className="leading-relaxed bg-slate-900/90 p-3 rounded-lg border border-slate-800 font-mono text-slate-300">
                    {inspectFinding.impact}
                  </p>
                </div>

                <div>
                  <strong className="text-slate-400 block font-mono text-[10px] uppercase tracking-wider mb-1">
                    REGULATORY COMPLIANCE ASSESSMENT
                  </strong>
                  <p className="text-indigo-400 font-mono flex items-center gap-2">
                    <CheckCircle2 size={15} /> {inspectFinding.compliance}
                  </p>
                </div>

                <div>
                  <strong className="text-slate-400 block font-mono text-[10px] uppercase tracking-wider mb-1">
                    RECOMMENDED REMEDIATION GUIDANCE
                  </strong>
                  <p className="leading-relaxed text-slate-300 bg-emerald-950/20 p-3 rounded-lg border border-emerald-800/30">
                    {inspectFinding.howToFix}
                  </p>
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t border-slate-800">
                <button
                  className="btn-partner-outline"
                  onClick={() => setInspectFinding(null)}
                >
                  Dismiss
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Review Findings Interactive Modal (English Summary + Exact Priority Ordered) */}
        {reviewModalCompany && (
          <div className="review-modal-overlay" onClick={() => setReviewModalCompany(null)}>
            <div className="review-modal-container" onClick={e => e.stopPropagation()}>
              <div className="review-modal-header">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="micro-label">CRYPTOGRAPHIC AUDIT REVIEW</span>
                    {reviewModalCompany.live && <span className="live-pill">CONNECTED INSTANCE</span>}
                  </div>
                  <h3 className="text-xl font-bold text-slate-100 mt-1">
                    Security Findings Review: {reviewModalCompany.name}
                  </h3>
                  <p className="text-xs text-slate-400 mt-0.5">
                    {reviewModalCompany.domain} · {reviewModalCompany.sector} · Audit Status: Grade {reviewModalCompany.grade} ({reviewModalCompany.score}/100)
                  </p>
                </div>
                <button
                  type="button"
                  className="p-2 rounded-lg text-slate-400 hover:text-slate-100 hover:bg-slate-800 transition"
                  onClick={() => setReviewModalCompany(null)}
                >
                  <X size={20} />
                </button>
              </div>

              <div className="review-modal-body">
                {/* Clear Plain-English Summary Banner */}
                {(() => {
                  const crit = reviewModalCompany.counts.critical;
                  const high = reviewModalCompany.counts.high;
                  const med = reviewModalCompany.counts.medium;
                  const low = reviewModalCompany.counts.low;
                  const total = reviewModalCompany.findings.length;
                  const hasUrgent = crit > 0 || high > 0;

                  return (
                    <div className={`findings-english-summary-banner ${hasUrgent ? 'has-critical' : 'all-clean'}`}>
                      <div className="flex items-start gap-3">
                        {hasUrgent ? (
                          <ShieldAlert className="text-rose-400 flex-shrink-0 mt-0.5" size={24} />
                        ) : (
                          <CheckCircle2 className="text-emerald-400 flex-shrink-0 mt-0.5" size={24} />
                        )}
                        <div>
                          <strong className="text-sm font-semibold text-slate-100 block">
                            Audit Finding Summary in Plain English
                          </strong>
                          <p className="text-xs text-slate-300 mt-1 leading-relaxed">
                            There are currently <strong className="text-white font-bold">{total} security findings</strong> identified for <strong className="text-white font-bold">{reviewModalCompany.name}</strong>:{' '}
                            {hasUrgent ? (
                              <>
                                <strong className="text-rose-400 font-bold">{crit} Critical priority</strong> and{' '}
                                <strong className="text-amber-400 font-bold">{high} High priority</strong> vulnerabilities requiring immediate remediation
                                {med > 0 ? `, along with ${med} Medium priority items` : ''}
                                {low > 0 ? ` and ${low} Low priority safeguards` : ''}.
                              </>
                            ) : (
                              <>
                                all critical and high-priority vulnerabilities have been resolved. The remaining {low} items represent verified post-quantum security controls.
                              </>
                            )}
                          </p>
                          <div className="flex items-center gap-3 mt-3 text-[11px] font-mono text-slate-400 flex-wrap">
                            <span className="text-slate-400 font-sans font-medium">Exact Priority Breakdown:</span>
                            <span className="text-rose-400 font-bold px-2 py-0.5 rounded bg-rose-950/60 border border-rose-800/40">
                              Priority 1: {crit} Critical
                            </span>
                            <span className="text-amber-400 font-bold px-2 py-0.5 rounded bg-amber-950/60 border border-amber-800/40">
                              Priority 2: {high} High
                            </span>
                            <span className="text-yellow-400 font-bold px-2 py-0.5 rounded bg-yellow-950/60 border border-yellow-800/40">
                              Priority 3: {med} Medium
                            </span>
                            <span className="text-blue-400 font-bold px-2 py-0.5 rounded bg-blue-950/60 border border-blue-800/40">
                              Priority 4: {low} Low
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })()}

                {/* Exact Priority Ordered Findings List */}
                <div className="space-y-3 mt-2">
                  <div className="flex items-center justify-between px-1">
                    <span className="text-xs font-mono text-slate-400 font-semibold tracking-wider uppercase">
                      ALL FINDINGS ORDERED STRICTLY BY PRIORITY (CRITICAL → LOW)
                    </span>
                    <span className="text-xs font-mono text-indigo-400">
                      {reviewModalCompany.findings.length} TOTAL ITEMS
                    </span>
                  </div>

                  {(() => {
                    const priorityRankMap: Record<string, { rank: number; label: string; badgeCls: string }> = {
                      critical: { rank: 1, label: 'PRIORITY 1 · CRITICAL', badgeCls: 'p1' },
                      high: { rank: 2, label: 'PRIORITY 2 · HIGH', badgeCls: 'p2' },
                      medium: { rank: 3, label: 'PRIORITY 3 · MEDIUM', badgeCls: 'p3' },
                      low: { rank: 4, label: 'PRIORITY 4 · LOW', badgeCls: 'p4' },
                    };
                    const orderedFindings = [...reviewModalCompany.findings].sort(
                      (a, b) => priorityRankMap[a.severity].rank - priorityRankMap[b.severity].rank
                    );

                    return orderedFindings.map((f, idx) => {
                      const p = priorityRankMap[f.severity];
                      return (
                        <div key={f.id} className="priority-ordered-card">
                          <div className="flex items-start justify-between gap-3">
                            <div className="flex items-center gap-2.5">
                              <span className={`priority-rank-badge ${p.badgeCls}`}>{p.label}</span>
                              <strong className="text-sm font-semibold text-slate-100">
                                Finding #{idx + 1}: {f.title}
                              </strong>
                            </div>
                            <span className="text-[11px] font-mono text-slate-400 bg-slate-900/80 px-2 py-0.5 rounded border border-slate-800">
                              {f.category}
                            </span>
                          </div>

                          <div className="mt-3 text-xs space-y-2">
                            <div className="bg-slate-900/70 p-3 rounded-lg border border-slate-800/80">
                              <span className="text-[10px] font-mono text-rose-300 block mb-0.5 uppercase tracking-wide font-semibold">
                                Exploit Impact &amp; Threat Analysis
                              </span>
                              <p className="text-slate-300 font-mono text-[11px] leading-relaxed">
                                {f.impact}
                              </p>
                            </div>

                            <div className="flex items-center gap-2 text-[11px] font-mono text-indigo-300 bg-indigo-950/20 px-3 py-1.5 rounded border border-indigo-900/30">
                              <CheckCircle2 size={13} className="text-indigo-400 flex-shrink-0" />
                              <span>Statutory Compliance Breach: {f.compliance}</span>
                            </div>

                            <div className="bg-emerald-950/20 p-3 rounded-lg border border-emerald-800/30 text-slate-300">
                              <span className="text-[10px] font-mono text-emerald-400 block mb-0.5 uppercase tracking-wide font-semibold">
                                Recommended Remediation Action
                              </span>
                              <p className="text-[11px] leading-relaxed">{f.howToFix}</p>
                            </div>
                          </div>
                        </div>
                      );
                    });
                  })()}
                </div>
              </div>

              <div className="flex items-center justify-between p-4 bg-slate-950/60 border-t border-slate-800">
                <span className="text-xs text-slate-500 font-mono">
                  Consolidated Audit Record · CryptIQ Engine
                </span>
                <div className="flex items-center gap-3">
                  {reviewModalCompany.live && (
                    <Link to="/p/p_demo" className="btn-partner-action">
                      Open Client Workspace <ArrowUpRight size={14} />
                    </Link>
                  )}
                  <button
                    type="button"
                    className="btn-partner-outline"
                    onClick={() => setReviewModalCompany(null)}
                  >
                    Dismiss
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
