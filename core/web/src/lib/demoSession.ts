export type Plan = 'free' | 'starter' | 'business';
export function currentPlan(): Plan {
  const plan = localStorage.getItem('cryptiq-demo-plan');
  return plan === 'free' || plan === 'starter' ? plan : 'business';
}
export const planLimits = { free: 1, starter: 4, business: 12 };
export type SavedProject = { id: string; name: string; source: string; savedAt: string };
export function savedProjects(): SavedProject[] { try { return JSON.parse(localStorage.getItem('cryptiq-demo-projects') || '[]'); } catch { return []; } }
export function saveProject(project: SavedProject) {
 localStorage.setItem('cryptiq-demo-projects', JSON.stringify([...savedProjects().filter(p => p.id !== project.id), project]));
}
export function useCount() { return Number(localStorage.getItem(`cryptiq-demo-usage-${currentPlan()}-${new Date().toISOString().slice(0,7)}`) || 0); }
export function countScan() { localStorage.setItem(`cryptiq-demo-usage-${currentPlan()}-${new Date().toISOString().slice(0,7)}`, String(useCount()+1)); }
