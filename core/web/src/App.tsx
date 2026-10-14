import { useEffect, useRef } from 'react';
import { ArrowRight, ArrowUpRight, Check, ChevronRight, CircleDot, FileCheck2,
  Fingerprint, LayoutDashboard, ListChecks, LockKeyhole, ScanLine, ShieldCheck, Wrench } from 'lucide-react';
import { Link, Navigate, NavLink, Outlet, Route, Routes, useLocation, useParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { config } from '@/lib/config';
import logoUrl from '../../../shared/theme/logo.svg';

const sections = [
  { title: 'Overview', path: '', icon: LayoutDashboard, description: 'Your data security, at a glance.',
    detail: 'Your security score and data map will appear here after a scan.', next: 'findings', nextLabel: 'Explore findings' },
  { title: 'Findings', path: 'findings', icon: ListChecks, description: 'Understand what needs attention.',
    detail: 'Evidence, severity and guidance will appear here when the scanner is connected.', next: 'attack', nextLabel: 'Explore Attack Lab' },
  { title: 'Attack Lab', path: 'attack', icon: Fingerprint, description: 'See the risk. Understand the impact.',
    detail: 'Password attack results and the clearly labelled RSA simulation will appear here. No attacks are available yet.', next: 'fix', nextLabel: 'Explore Fix & Verify' },
  { title: 'Fix & Verify', path: 'fix', icon: Wrench, description: 'Review the change. Verify the protection.',
    detail: 'Reviewable fixes and four verification checks will appear here. No changes have been applied.', next: 'report', nextLabel: 'Explore reports' },
  { title: 'Report', path: 'report', icon: FileCheck2, description: 'Evidence you can take with you.',
    detail: 'Your evidence report and cryptographic inventory will be available after the underlying checks are implemented.', next: '', nextLabel: 'Back to overview' },
] as const;

function RouteFocus() {
  const { pathname } = useLocation();
  const previous = useRef(pathname);
  useEffect(() => {
    const heading = document.querySelector('h1');
    document.title = `${heading?.textContent ?? 'Workspace'} · CryptIQ`;
    if (previous.current !== pathname) {
      heading?.focus();
      window.scrollTo(0, 0);
    }
    previous.current = pathname;
  }, [pathname]);
  return null;
}

function Layout() {
  const { pathname } = useLocation();
  const { id } = useParams();
  const projectId = id || 'p_demo';
  const projectPath = `/p/${encodeURIComponent(projectId)}`;
  const isProject = Boolean(id);
  const projectName = projectId === 'p_demo' ? 'Chennai Organics' : projectId;
  return <div className="app-shell">
    <a className="skip-link" href="#main-content">Skip to content</a>
    <aside className="sidebar">
      <a href={`${config.hubUrl}/`} className="brand" aria-label="CryptIQ home on Hub">
        <img src={logoUrl} alt="CryptIQ" width="142" height="32" />
      </a>
      <div className="workspace-label">CORE WORKSPACE</div>
      <Link className={`scan-link ${pathname === '/scan' ? 'is-current' : ''}`} to="/scan" aria-current={pathname === '/scan' ? 'page' : undefined}>
        <ScanLine size={19} aria-hidden="true" /> Start a scan <span className="shortcut">01</span>
      </Link>
      <div className="project-label"><span className="project-monogram">CO</span><div><strong>{projectName}</strong><span>Demo project</span></div></div>
      <nav aria-label="Project navigation">
        {sections.map(({ title, path, icon: Icon }) => <NavLink key={title} end to={`${projectPath}${path ? `/${path}` : ''}`}
          className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
          <Icon size={18} aria-hidden="true" /><span>{title}</span>
        </NavLink>)}
      </nav>
      <div className="sidebar-bottom"><ShieldCheck size={20} aria-hidden="true" /><p>Local by design<span>Security starts with your data.</span></p></div>
    </aside>
    <div className="workspace">
      <header className="topbar"><div className="breadcrumb">Workspace <ChevronRight size={14} aria-hidden="true" /><span>{isProject ? projectName : 'Start a scan'}</span></div>
        <span className="status-badge"><span /> Development preview</span>
      </header>
      <main id="main-content" className="main-content" tabIndex={-1}><Outlet /></main>
      <footer className="footer"><span>Security-safeguard evidence, not legal certification.</span><span className="font-mono">CRYPTIQ / CORE</span></footer>
    </div>
    <RouteFocus />
  </div>;
}

function ScanPage() {
  return <>
    <div className="eyebrow"><span /> YOUR FIRST STEP</div>
    <div className="page-heading"><h1 tabIndex={-1}>Know what your data is up against.</h1><p>One workspace to understand risk, review fixes and see the evidence.</p></div>
    <div className="scan-grid">
      <Card className="demo-card">
        <div className="flex items-center justify-between"><div className="icon-tile"><ScanLine size={24} aria-hidden="true" /></div><span className="small-badge">DEMO PROJECT</span></div>
        <div className="demo-copy"><h2>Chennai Organics</h2><p>A local grocery shop. A practical place to explore how CryptIQ will protect customer data.</p></div>
        <div className="project-facts"><span><CircleDot size={15} aria-hidden="true" /> E-commerce</span><span><LockKeyhole size={15} aria-hidden="true" /> Local environment</span></div>
        <div className="preview-note"><strong>The workspace is ready to explore.</strong><p>Scanning is not connected yet. These screens contain no scan results.</p></div>
        <Button asChild className="w-full"><Link to="/p/p_demo">Explore demo workspace <ArrowRight size={17} aria-hidden="true" /></Link></Button>
      </Card>
      <div className="journey"><span className="eyebrow">THE PATH TO PROTECTION</span><h2>From uncertainty<br />to evidence.</h2>
        {[
          ['01', 'Scan', 'Find weak cryptography and exposed personal data.'],
          ['02', 'Attack', 'Understand the impact through controlled demonstrations.'],
          ['03', 'Fix', 'Review the proposed changes before applying them.'],
          ['04', 'Prove', 'Verify the result with four independent checks.'],
        ].map(([number, title, text]) => <div className="journey-step" key={number}><span>{number}</span><div><h3>{title}</h3><p>{text}</p></div></div>)}
      </div>
    </div>
    <div className="build-note"><Check size={17} aria-hidden="true" /><span>Core workspace navigation is available. Scan tools and data connections are coming next.</span></div>
  </>;
}

function ProjectPage({ section }: { section: typeof sections[number] }) {
  const { id } = useParams();
  const Icon = section.icon;
  return <>
    <div className="eyebrow">PROJECT WORKSPACE <span className="eyebrow-divider">/</span> DEMO DATA</div>
    <div className="page-heading"><h1 tabIndex={-1}>{section.title}</h1><p>{section.description}</p></div>
    <Card className="empty-state">
      <div className="empty-icon"><Icon size={30} aria-hidden="true" /></div>
      <span className="small-badge">COMING NEXT</span>
      <h2>{section.title === 'Overview' ? 'Your security story starts with a scan.' : `${section.title} is being built.`}</h2>
      <p>{section.detail}</p>
      <Button asChild><Link to={`/p/${encodeURIComponent(id || 'p_demo')}${section.next ? `/${section.next}` : ''}`}>{section.nextLabel}<ArrowRight size={17} aria-hidden="true" /></Link></Button>
      {section.title === 'Report' ? <a className="secondary-link" href={`${config.hubUrl}/badge/chennai-organics`}>Open public badge on Hub <ArrowUpRight size={15} aria-hidden="true" /></a> : null}
    </Card>
    <div className="build-note"><LockKeyhole size={17} aria-hidden="true" /><span>No security score, attack result or verification claim is shown until the corresponding tools are connected.</span></div>
  </>;
}

function NotFound() {
  return <div className="empty-state"><span className="eyebrow">404 / PAGE NOT FOUND</span><h1 tabIndex={-1}>This page isn’t in your workspace.</h1><p>Return to the scan page to find your way.</p><Button asChild><Link to="/scan">Back to start <ArrowRight size={16} aria-hidden="true" /></Link></Button></div>;
}

export default function App() {
  return <Routes>
    <Route path="/" element={<Navigate to="/scan" replace />} />
    <Route element={<Layout />}><Route path="/scan" element={<ScanPage />} /><Route path="*" element={<NotFound />} /></Route>
    <Route path="/p/:id" element={<Layout />}>
      {sections.map((section) => section.path === ''
        ? <Route index key={section.title} element={<ProjectPage section={section} />} />
        : <Route key={section.title} path={section.path} element={<ProjectPage section={section} />} />)}
      <Route path="*" element={<NotFound />} />
    </Route>
  </Routes>;
}
