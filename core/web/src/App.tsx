import { useEffect, useRef } from 'react';
import { ArrowRight, ArrowUpRight, ChevronRight, FileCheck2,
  Fingerprint, LayoutDashboard, ListChecks, LockKeyhole, ScanLine, ShieldCheck, Wrench } from 'lucide-react';
import { Link, Navigate, NavLink, Outlet, Route, Routes, useLocation, useParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { config } from '@/lib/config';
import { MockPreview } from '@/components/MockPreview';
import { LiveProjectPage } from '@/pages/LiveWorkspace';
import { DemoEntrance } from '@/pages/DemoEntrance';
import { ProjectSetup } from '@/pages/ProjectSetup';
import { HackerObservatory } from '@/pages/HackerObservatory';
import { PartnerPortfolio } from '@/pages/PartnerPortfolio';
import { VerificationPanel } from '@/pages/VerificationPanel';
import { currentPlan } from '@/lib/demoSession';
import './experience.css';
import logoUrl from '../../../shared/theme/logo.svg';

const sections = [
  { title: 'Overview', path: '', icon: LayoutDashboard, description: 'Your data security, at a glance.',
    detail: 'Your security score and data map will appear here after a scan.', next: 'findings', nextLabel: 'Explore findings' },
  { title: 'Findings', path: 'findings', icon: ListChecks, description: 'Understand what needs attention.',
    detail: 'Evidence, severity and guidance will appear here when the scanner is connected.', next: 'attack', nextLabel: 'Explore Attack Lab' },
  { title: 'Attack Lab', path: 'attack', icon: Fingerprint, description: 'See the risk. Understand the impact.',
    detail: 'Password attack results and the clearly labelled RSA simulation will appear here. No attacks are available yet.', next: 'fix', nextLabel: 'Explore Fix & Verify' },
  { title: 'Fixes', path: 'fix', icon: Wrench, description: 'Review the change. Verify the protection.',
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
        {sections.filter(s => s.path !== 'attack').map(({ title, path, icon: Icon }) => <NavLink key={title} end to={`${projectPath}${path ? `/${path}` : ''}`}
          className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
          <Icon size={18} aria-hidden="true" /><span>{title}</span>
        </NavLink>)}
      <NavLink className="nav-item" to={`${projectPath}/verify`}><ShieldCheck size={18}/>Verification</NavLink></nav>
      <Link className="nav-item mt-5" to="/hacker"><Fingerprint size={18}/>Hacker observatory ↗</Link><Link className="nav-item" to="/">Demo experiences ↗</Link>
      <div className="sidebar-bottom"><ShieldCheck size={20} aria-hidden="true" /><p>Local by design<span>Security starts with your data.</span></p></div>
    </aside>
    <div className="workspace">
      <header className="topbar"><div className="breadcrumb">Workspace <ChevronRight size={14} aria-hidden="true" /><span>{isProject ? projectName : 'Start a scan'}</span></div>
        <Link to="/#plans" className="plan-pill">{currentPlan()} demo · change plan</Link><span className="status-badge"><span /> {config.useMocks ? 'Mock data · development preview' : 'Local workspace | live scans'}</span>
      </header>
      <main id="main-content" className="main-content" tabIndex={-1}><Outlet /></main>
      <footer className="footer"><span>Security-safeguard evidence, not legal certification.</span><span className="font-mono">CRYPTIQ / CORE</span></footer>
    </div>
    <RouteFocus />
  </div>;
}

function ProjectPage({ section }: { section: typeof sections[number] }) {
  const { id } = useParams();
  const Icon = section.icon;
  if (!config.useMocks) return <LiveProjectPage page={section.title} />;
  return <>
    <div className="eyebrow">PROJECT WORKSPACE <span className="eyebrow-divider">/</span> DEMO DATA</div>
    <div className="page-heading"><h1 tabIndex={-1}>{section.title}</h1><p>{section.description}</p></div>
    {config.useMocks ? <MockPreview page={section.title} /> : null}
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
  useLocation(); // Re-evaluate demo plan gates after entering a new experience.
  return <Routes>
    <Route path="/" element={<DemoEntrance />} /><Route path="/hacker" element={<HackerObservatory />} /><Route path="/partner-demo" element={<PartnerPortfolio />} /><Route path="/scan" element={<ProjectSetup />} />
    <Route element={<Layout />}><Route path="*" element={<NotFound />} /></Route>
    <Route path="/p/:id" element={<Layout />}>
      <Route path="verify" element={currentPlan() === "free" ? <div className="lock-panel"><h1>Verification requires Starter</h1><Link to="/#plans">Explore plans</Link></div> : <><h1>Evidence, step by step.</h1><VerificationPanel /></>} />{sections.map((section) => section.path === ''
        ? <Route index key={section.title} element={<ProjectPage section={section} />} />
        : <Route key={section.title} path={section.path} element={section.path === 'attack' ? <Navigate to="/hacker" replace /> : <ProjectPage section={section} />} />)}
      <Route path="*" element={<NotFound />} />
    </Route>
  </Routes>;
}
