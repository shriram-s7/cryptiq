import { config } from '@/lib/config';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowUpRight, ShieldCheck, Building2, ShoppingBag, ArrowRight, Check, Cpu } from 'lucide-react';
import { currentPlan, type Plan } from '@/lib/demoSession';

export function DemoEntrance() {
  const navigate = useNavigate();

  function enter(plan: Plan) {
    localStorage.setItem('cryptiq-demo-plan', plan);
    navigate('/scan');
  }

  return (
    <div className="experience-home">
      <header className="experience-header">
        <Link to="/" className="wordmark">
          <ShieldCheck className="text-indigo-400" size={26} />
          <span>CRYPTIQ // INTELLIGENCE</span>
        </Link>
        <a href="#plans" className="text-sm font-medium hover:text-indigo-400 flex items-center gap-1.5">
          Explore plans <ArrowUpRight size={15} />
        </a>
      </header>

      <section className="experience-hero">
        <div>
          <span className="micro-label">POST-QUANTUM CRYPTOGRAPHY. AUDITED &amp; VERIFIED.</span>
          <h1>
            See the exposure.<br />
            <em>Prove the protection.</em>
          </h1>
          <p>
            Track your sensitive customer data from vulnerable legacy algorithms to verified post-quantum resilience. Continuous Section 8 DPDP Act posture intelligence.
          </p>
          <div className="hero-actions">
            <button className="action-primary" onClick={() => enter(currentPlan())}>
              Enter Business Workspace <ArrowRight size={18} />
            </button>
            <a href="#experiences" className="action-secondary">
              Explore Enterprise Portals ↓
            </a>
          </div>
          <span className="demo-disclosure">
            Local verification testbed · Synthetic identities only · Hardware security boundary
          </span>
        </div>

        <div className="signal-orbit" aria-hidden="true">
          <div className="orbit orbit-one" />
          <div className="orbit orbit-two" />
          <div className="orbit orbit-three" />
          <ShieldCheck size={72} className="text-indigo-400 z-10" />
          <span className="orbit-chip chip-one">01 / DISCOVERY</span>
          <span className="orbit-chip chip-two">02 / REMEDIATION</span>
          <span className="orbit-chip chip-three">03 / VERIFIED PQC</span>
        </div>
      </section>

      {/* 3 Clean Enterprise Perspectives (Hacker Observatory strictly separated) */}
      <section id="experiences" className="perspectives">
        <div className="section-intro">
          <span className="micro-label">CONNECTED ENTERPRISE ARCHITECTURE</span>
          <h2>Select where your analysis begins.</h2>
          <p>Dedicated environments for developers, live application testing, and advisory partners.</p>
        </div>

        <div className="perspective-grid-three">
          {[
            {
              icon: ShieldCheck,
              name: 'Business Workspace',
              text: 'Inspect repository ASTs, review atomic repairs, and execute cryptographic verification gates.',
              url: '/scan',
              tag: 'OWNER / DEVELOPER',
              isExternal: false,
            },
            {
              icon: ShoppingBag,
              name: 'Chennai Organics Store',
              text: 'Working e-commerce storefront with live signups, checkout sessions, and local database storage.',
              url: config.shopUrl,
              tag: 'LIVE APPLICATION NODE',
              isExternal: true,
            },
            {
              icon: Building2,
              name: 'Partner Intelligence Portal',
              text: 'Consolidated multi-tenant posture management across 7 enterprise portfolios with audit exports.',
              url: '/partner-demo',
              tag: 'ENTERPRISE ADVISORY',
              isExternal: false,
            },
          ].map(({ icon: Icon, ...p }, i) => (
            <a
              className="perspective"
              href={p.url}
              key={p.name}


            >
              <span className="perspective-number">0{i + 1}</span>
              <Icon size={28} className="text-indigo-400" />
              <span className="micro-label">{p.tag}</span>
              <h3>{p.name}</h3>
              <p>{p.text}</p>
              <ArrowUpRight className="perspective-arrow" />
            </a>
          ))}
        </div>
      </section>

      {/* Pricing Tiers */}
      <section id="plans" className="pricing-section">
        <div className="section-intro">
          <span className="micro-label">TIER CAPABILITIES</span>
          <h2>Scalable cryptographic protection.</h2>
          <p>Configure plan capabilities for this browser session. No external payment required.</p>
        </div>

        <div className="pricing-grid">
          {[
            {
              id: 'free',
              name: 'Free',
              price: '0',
              copy: 'Initial discovery and risk visibility.',
              items: [
                '1 project · 1 scan / month',
                'Public endpoints check preview',
                'DPDP Act risk summary',
                'Remediation bundle locked',
              ],
            },
            {
              id: 'starter',
              name: 'Starter',
              price: '999',
              copy: 'Structured path to verifiable privacy.',
              items: [
                '1 project · 4 scans / month',
                'Source ZIP archive inspection',
                'Reviewed atomic demo repairs',
                'Post-repair verification tests',
              ],
            },
            {
              id: 'business',
              name: 'Business',
              price: '2,999',
              copy: 'Comprehensive cryptographic assurance.',
              items: [
                '1 project · 12 scans / month',
                'Full source & storage AST audits',
                'Automated Argon2id + ML-KEM fixes',
                'Signed CycloneDX CBOM & PDF evidence',
              ],
            },
            {
              id: 'partner',
              name: 'Partner',
              price: '1,199',
              copy: 'Multi-tenant advisory management.',
              items: [
                '3 active client workspaces included',
                '₹500 / extra active client / month',
                'Consolidated multi-client overview',
                'Read-only evidence & export portals',
              ],
            },
          ].map(p => (
            <article className={`price-plan ${p.id === 'business' ? 'featured' : ''}`} key={p.id}>
              <span className="micro-label">{p.name}</span>
              <h3>
                ₹{p.price}
                <small>/ month</small>
              </h3>
              <p>{p.copy}</p>
              <ul>
                {p.items.map(x => (
                  <li key={x}>
                    <Check size={15} />
                    {x}
                  </li>
                ))}
              </ul>
              <button
                className={p.id === 'business' ? 'action-primary' : 'action-secondary'}
                onClick={() => (p.id === 'partner' ? navigate('/partner-demo') : enter(p.id as Plan))}
              >
                Explore {p.name}
                <ArrowRight size={16} />
              </button>
            </article>
          ))}
        </div>
        <p className="demo-disclosure">
          Indicative pricing · Section 8 compliance tooling · Browser demo state isolated
        </p>
      </section>

      <footer className="experience-footer">
        <Cpu size={18} className="text-indigo-400" />
        Source evidence → atomic repairs → independent verification
        <span>Security safeguard evidence, not formal legal certification.</span>
      </footer>
    </div>
  );
}
