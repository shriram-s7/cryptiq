import { useState } from 'react';
import { RotateCcw, X, ShieldAlert, CheckCircle2, Server, Database, Sliders, Sparkles, RefreshCw } from 'lucide-react';
import { requestJson } from '@/lib/api';
import { currentPlan, type Plan } from '@/lib/demoSession';
import { triggerConfetti } from '@/lib/confetti';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onResetComplete?: () => void;
}

export function SettingsModal({ isOpen, onClose, onResetComplete }: SettingsModalProps) {
  const [activeTab, setActiveTab] = useState<'demo' | 'plan' | 'diagnostics'>('demo');
  const [isResetting, setIsResetting] = useState(false);
  const [resetStage, setResetStage] = useState(0);
  const [resetSuccess, setResetSuccess] = useState(false);
  const [resetError, setResetError] = useState('');
  const [confirmPrompt, setConfirmPrompt] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<Plan>(currentPlan());

  if (!isOpen) return null;

  const resetStages = [
    'Connecting to demo storage orchestrator...',
    'Restoring 3,000 baseline fake customer accounts...',
    'Reverting cryptographic scheme to before-mode (MD5 & RSA-Demo)...',
    'Invalidating verification publication & clearing stale attack runs...',
    'Demo environment baseline restored!'
  ];

  async function handleResetDemo() {
    setIsResetting(true);
    setResetError('');
    setResetSuccess(false);
    setResetStage(0);

    const stepInterval = setInterval(() => {
      setResetStage(s => Math.min(s + 1, resetStages.length - 2));
    }, 800);

    try {
      await requestJson('/api/demo/reset', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ confirm: true }),
      });

      // Clear local storage demo caches
      localStorage.removeItem('cryptiq-review-p_demo');
      localStorage.removeItem('cryptiq-attack-p_demo');

      clearInterval(stepInterval);
      setResetStage(resetStages.length - 1);
      setResetSuccess(true);
      setConfirmPrompt(false);
      triggerConfetti(2500);

      if (onResetComplete) {
        onResetComplete();
      }
    } catch (err) {
      clearInterval(stepInterval);
      setResetError(err instanceof Error ? err.message : 'Demo reset failed. Check if Core API is running.');
    } finally {
      setIsResetting(false);
    }
  }

  function handleSavePlan(plan: Plan) {
    setSelectedPlan(plan);
    localStorage.setItem('cryptiq-demo-plan', plan);
    window.location.reload();
  }

  return (
    <div className="settings-modal-overlay" role="dialog" aria-modal="true" aria-labelledby="settings-title">
      <div className="settings-modal-container">
        {/* Header */}
        <div className="settings-header">
          <div className="flex items-center gap-3">
            <div className="settings-icon-badge">
              <Sliders size={18} />
            </div>
            <div>
              <h2 id="settings-title" className="text-base font-semibold text-slate-100">Workspace Settings & Controls</h2>
              <p className="text-xs text-slate-400">Manage demo environment, reset state, and configure tier capabilities</p>
            </div>
          </div>
          <button onClick={onClose} className="settings-close-btn" aria-label="Close settings">
            <X size={18} />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="settings-tabs">
          <button
            className={`settings-tab-btn ${activeTab === 'demo' ? 'active' : ''}`}
            onClick={() => setActiveTab('demo')}
          >
            <Database size={15} />
            Demo Environment & Reset
          </button>
          <button
            className={`settings-tab-btn ${activeTab === 'plan' ? 'active' : ''}`}
            onClick={() => setActiveTab('plan')}
          >
            <Sparkles size={15} />
            Plan & Capabilities
          </button>
          <button
            className={`settings-tab-btn ${activeTab === 'diagnostics' ? 'active' : ''}`}
            onClick={() => setActiveTab('diagnostics')}
          >
            <Server size={15} />
            Telemetry & Health
          </button>
        </div>

        {/* Tab Content */}
        <div className="settings-body">
          {activeTab === 'demo' && (
            <div className="settings-section">
              <div className="demo-status-banner">
                <div>
                  <span className="micro-badge">LOCAL TESTBED</span>
                  <h3 className="text-sm font-semibold text-slate-200 mt-1">Chennai Organics Demo Environment</h3>
                  <p className="text-xs text-slate-400 mt-1">
                    Operates with 3,000 synthetic customer records, intentional cryptographic vulnerabilities (MD5, small RSA), and local SQLite storage.
                  </p>
                </div>
              </div>

              {resetSuccess ? (
                <div className="reset-success-card">
                  <CheckCircle2 size={28} className="text-emerald-400 flex-shrink-0" />
                  <div>
                    <h4 className="text-sm font-semibold text-emerald-300">Environment Reset Successfully</h4>
                    <p className="text-xs text-emerald-100/80 mt-1">
                      Restored 3,000 vulnerable customer records, removed demo orders and signups, and cleared verification evidence. You can now run a fresh scan or test the attacks.
                    </p>
                    <button
                      className="reset-dismiss-btn mt-3"
                      onClick={() => {
                        setResetSuccess(false);
                        onClose();
                        localStorage.removeItem('cryptiq-review-p_demo');
                        localStorage.removeItem('cryptiq-attack-p_demo');
                        window.location.href = '/p/p_demo';
                      }}
                    >
                      Return to Workspace
                    </button>
                  </div>
                </div>
              ) : (
                <div className="reset-action-card">
                  <div className="flex items-start gap-4">
                    <div className="p-3 rounded-lg bg-rose-500/10 text-rose-400 border border-rose-500/20 flex-shrink-0">
                      <RotateCcw size={22} />
                    </div>
                    <div>
                      <h4 className="text-sm font-semibold text-slate-200">Reset Demo to Initial Vulnerable State</h4>
                      <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                        Reverts Chennai Organics database to its baseline before-mode. Restores Priya S (#1) with password <code className="text-slate-300 bg-slate-800 px-1.5 py-0.5 rounded">priya@123</code>, reapplies MD5 hashes, resets tiny-RSA keys, and wipes active attack records.
                      </p>

                      {isResetting ? (
                        <div className="reset-progress-box mt-4">
                          <div className="flex items-center gap-2 text-xs font-mono text-cyan-400">
                            <RefreshCw size={14} className="animate-spin" />
                            <span>{resetStages[resetStage]}</span>
                          </div>
                          <div className="reset-progress-bar mt-2">
                            <div
                              className="reset-progress-fill"
                              style={{ width: `${((resetStage + 1) / resetStages.length) * 100}%` }}
                            />
                          </div>
                        </div>
                      ) : confirmPrompt ? (
                        <div className="confirm-prompt-box mt-4">
                          <p className="text-xs font-medium text-amber-300 flex items-center gap-2">
                            <ShieldAlert size={15} />
                            Confirm reset: this will revert any merged fixes and clear current verification proofs.
                          </p>
                          <div className="flex items-center gap-3 mt-3">
                            <button
                              className="btn-danger-confirm"
                              onClick={handleResetDemo}
                              disabled={isResetting}
                            >
                              Yes, Reset Demo Now
                            </button>
                            <button
                              className="btn-cancel"
                              onClick={() => setConfirmPrompt(false)}
                            >
                              Cancel
                            </button>
                          </div>
                        </div>
                      ) : (
                        <button
                          className="btn-reset-demo mt-4"
                          onClick={() => setConfirmPrompt(true)}
                        >
                          <RotateCcw size={15} />
                          Reset Demo Environment
                        </button>
                      )}

                      {resetError && (
                        <p className="text-xs text-rose-400 mt-3 font-mono">
                          Error: {resetError}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {activeTab === 'plan' && (
            <div className="settings-section">
              <p className="text-xs text-slate-400 mb-4">
                Toggle simulation plan tiers to test different client workflows without actual billing:
              </p>
              <div className="grid grid-cols-2 gap-3">
                {[
                  { id: 'free', name: 'Free Tier', scans: '1 scan/mo', desc: 'Read-only discovery risk overview' },
                  { id: 'starter', name: 'Starter Tier', scans: '4 scans/mo', desc: 'Source ZIP upload & reviewed repairs' },
                  { id: 'business', name: 'Business Tier', scans: '12 scans/mo', desc: 'Complete Fix, Verify & PDF Evidence' },
                  { id: 'partner', name: 'Partner Portfolio', scans: 'Multi-client', desc: 'Enterprise multi-tenant overview' },
                ].map(p => (
                  <button
                    key={p.id}
                    className={`plan-toggle-card ${selectedPlan === p.id ? 'active' : ''}`}
                    onClick={() => handleSavePlan(p.id as Plan)}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-sm text-slate-200">{p.name}</span>
                      {selectedPlan === p.id && <CheckCircle2 size={16} className="text-cyan-400" />}
                    </div>
                    <span className="text-[11px] text-cyan-400/90 font-mono mt-1 block">{p.scans}</span>
                    <p className="text-xs text-slate-400 mt-1">{p.desc}</p>
                  </button>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'diagnostics' && (
            <div className="settings-section">
              <div className="diagnostics-grid">
                <div className="diag-row">
                  <span className="text-xs text-slate-400">Core Engine API</span>
                  <span className="diag-pill online">ONLINE · localhost:8000</span>
                </div>
                <div className="diag-row">
                  <span className="text-xs text-slate-400">Demo Shop Service</span>
                  <span className="diag-pill online">ACTIVE · localhost:5050</span>
                </div>
                <div className="diag-row">
                  <span className="text-xs text-slate-400">Database Storage</span>
                  <span className="text-xs font-mono text-slate-300">SQLite (3,000 records)</span>
                </div>
                <div className="diag-row">
                  <span className="text-xs text-slate-400">Argon2id KDF Library</span>
                  <span className="text-xs font-mono text-emerald-400">Loaded & Ready</span>
                </div>
                <div className="diag-row">
                  <span className="text-xs text-slate-400">Post-Quantum Module</span>
                  <span className="text-xs font-mono text-emerald-400">ML-KEM-768 Simulated</span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="settings-footer">
          <span className="text-[11px] text-slate-400 font-mono">CRYPTIQ / CONTROL CENTER · v0.2.0</span>
          <button className="settings-done-btn" onClick={onClose}>
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
