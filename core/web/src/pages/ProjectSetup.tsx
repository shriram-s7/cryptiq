import { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowRight, ArrowLeft, Globe, FolderOpen, ShoppingBag, ShieldCheck, Lock, Check, Layers
} from 'lucide-react';
import { LiveScanPage } from './LiveWorkspace';
import { currentPlan, planLimits, savedProjects, useCount } from '@/lib/demoSession';

export function ProjectSetup() {
  const [step, setStep] = useState(0);
  const [source, setSource] = useState('demo');
  const [name, setName] = useState('Chennai Organics');
  const [url, setUrl] = useState('');
  const [consent, setConsent] = useState(false);
  const [fresh, setFresh] = useState(false);

  const plan = currentPlan();
  const projects = savedProjects();
  const used = useCount();

  return (
    <div className="setup-page">
      <header className="experience-header">
        <Link to="/" className="wordmark">
          <ShieldCheck />
          cryptiq
        </Link>
        <Link to="/#plans" className="plan-pill">
          {plan} demo · change plan
        </Link>
      </header>

      <main className="setup-content">
        <div className="setup-kicker">
          <span className="micro-label">NEW ASSESSMENT</span>
          <span>{used} / {planLimits[plan]} monthly demo scans</span>
        </div>

        <ol className="setup-steps">
          {['Choose a source', 'Define the project', 'Confirm & assess'].map((s, i) => (
            <li key={s} className={step === i ? 'current' : step > i ? 'complete' : ''}>
              <span>{step > i ? <Check size={14} /> : i + 1}</span>
              {s}
            </li>
          ))}
        </ol>

        {step === 0 ? (
          <>
            <h1>What would you like<br />to protect?</h1>
            <p className="lead">
              Start with the right evidence. Website checks and source inspection cover different parts of your security.
            </p>

            <div className="source-choice-grid">
              {[
                {
                  id: 'demo',
                  icon: ShoppingBag,
                  title: 'Explore Chennai Organics',
                  text: 'Our working demo shop. Follow real source, fake customer data, repairs and verification.',
                },
                {
                  id: 'url',
                  icon: Globe,
                  title: 'A public website',
                  text: 'External configuration only. No access to code, passwords or a private database.',
                },
                {
                  id: 'zip',
                  icon: FolderOpen,
                  title: 'Your source archive',
                  text: 'Upload a ZIP of your application. Python pattern coverage; files are never executed.',
                },
              ].map(({ icon: Icon, ...s }) => (
                <button
                  key={s.id}
                  type="button"
                  className={`source-choice ${source === s.id ? 'selected' : ''}`}
                  onClick={() => setSource(s.id)}
                >
                  <Icon size={30} />
                  <h2>{s.title}</h2>
                  <p>{s.text}</p>
                  <span>
                    {s.id === 'zip' && plan === 'free'
                      ? 'Starter or Business required'
                      : s.id === 'url'
                      ? 'Preview · service not connected'
                      : 'Available locally'}
                    <ArrowRight size={16} />
                  </span>
                </button>
              ))}
            </div>

            <div className="setup-bottom">
              <span className="flex items-center gap-2">
                <Layers size={16} /> Save the project. Return to its evidence later.
              </span>
              <button className="action-primary" onClick={() => setStep(1)}>
                Continue <ArrowRight size={18} />
              </button>
            </div>

            {projects.length > 0 ? (
              <section className="recent-projects">
                <span className="micro-label">CONTINUE AN EXISTING PROJECT</span>
                {projects.map((p) => (
                  <Link key={p.id} to={`/p/${p.id}`}>
                    <strong>{p.name}</strong>
                    <span>
                      {p.source} · {new Date(p.savedAt).toLocaleDateString()}
                    </span>
                    <ArrowRight size={17} />
                  </Link>
                ))}
              </section>
            ) : null}
          </>
        ) : step === 1 ? (
          <>
            <h1>A little context.<br />A clearer assessment.</h1>
            <p className="lead">This becomes your saved project, so its findings and verification stay together.</p>

            <div className="setup-form">
              <label htmlFor="setup-project-name">
                Project name
                <input
                  id="setup-project-name"
                  aria-label="Project name"
                  maxLength={100}
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  disabled={source === 'demo'}
                />
              </label>

              {source === 'url' ? (
                <label htmlFor="setup-url">
                  Website URL
                  <input
                    id="setup-url"
                    aria-label="Website URL"
                    type="url"
                    placeholder="https://your-business.example"
                    value={url}
                    onChange={(e) => setUrl(e.target.value)}
                  />
                </label>
              ) : null}

              <label htmlFor="setup-role">
                Your role
                <select id="setup-role">
                  <option>Business owner</option>
                  <option>Developer</option>
                  <option>Security reviewer</option>
                </select>
              </label>

              <label htmlFor="setup-priority">
                What matters most?
                <select id="setup-priority">
                  <option>Customer data and passwords</option>
                  <option>Website configuration</option>
                  <option>Understanding existing risks</option>
                </select>
              </label>

              <label className="check-row">
                <input
                  type="checkbox"
                  checked={consent}
                  onChange={(e) => setConsent(e.target.checked)}
                />
                <span>I own this project or have permission to assess it. Save it in this demo workspace.</span>
              </label>

              {source === 'demo' ? (
                <label className="check-row">
                  <input
                    type="checkbox"
                    checked={fresh}
                    onChange={(e) => setFresh(e.target.checked)}
                  />
                  <span>
                    Start a fresh vulnerable demonstration. This restores the 3,000 fake records and removes earlier demo
                    signups, orders and results.
                  </span>
                </label>
              ) : null}
            </div>

            <div className="setup-bottom">
              <button className="action-secondary" onClick={() => setStep(0)}>
                <ArrowLeft size={16} /> Back
              </button>
              <button
                className="action-primary"
                disabled={!consent || !name.trim() || (source === 'url' && !/^https?:\/\//.test(url))}
                onClick={() => setStep(2)}
              >
                Confirm project <ArrowRight size={16} />
              </button>
            </div>
          </>
        ) : (
          <>
            <div className="setup-bottom mb-6">
              <button className="action-secondary" onClick={() => setStep(1)}>
                <ArrowLeft size={16} /> Project setup
              </button>
              <span className="plan-pill">
                {name} · {plan}
              </span>
            </div>

            {source === 'url' ? (
              <div className="scope-message">
                <Globe size={40} />
                <h1>Website checks are coming.</h1>
                <p>
                  The URL has not been scanned. This path will check public TLS, headers and web configuration. Try the
                  connected demo to see the complete experience.
                </p>
                <button
                  className="action-primary"
                  onClick={() => {
                    setSource('demo');
                    setName('Chennai Organics');
                    setStep(1);
                  }}
                >
                  Use Chennai Organics
                </button>
              </div>
            ) : source === 'zip' && plan === 'free' ? (
              <div className="scope-message">
                <Lock size={40} />
                <h1>Source inspection needs Starter.</h1>
                <p>
                  Your Free view includes the demo risk overview. Choose a paid demo plan to explore source uploads and
                  repairs.
                </p>
                <Link className="action-primary" to="/#plans">
                  Compare plans
                </Link>
              </div>
            ) : used >= planLimits[plan] ? (
              <div className="scope-message">
                <Lock size={40} />
                <h1>Demo scan allowance reached.</h1>
                <p>
                  You have used {used} scans for this plan this month in this browser. Existing results remain available.
                </p>
                <Link className="action-primary" to="/#plans">
                  Explore plans
                </Link>
              </div>
            ) : (
              <div className="setup-live-scan-wrapper">
                <LiveScanPage initialSource={source === 'zip' ? 'zip' : 'demo'} projectName={name} freshDemo={fresh} />
              </div>
            )}
          </>
        )}
      </main>
    </div>
  );
}
