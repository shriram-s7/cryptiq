import { config } from './config';
import type { MockScenario, WorkspaceData, Scan, AttackRun, PullRequest, Verification } from './contracts';
import { mockWorkspace } from '@/mocks/workspace';

export class ApiError extends Error {
  constructor(message: string, public readonly status: number) { super(message); this.name = 'ApiError'; }
}

export async function requestJson<T>(path: string, options: RequestInit = {}): Promise<T> {
  const response = await fetch(`${config.apiUrl}${path}`, { ...options, headers: { Accept: 'application/json', ...options.headers } });
  if (!response.ok) {
    const error = await response.json().catch(() => null) as { detail?: unknown } | null;
    throw new ApiError(typeof error?.detail === 'string' ? error.detail : `Request failed (${response.status})`, response.status);
  }
  return response.json() as Promise<T>;
}

export const api = {
  scan: (id: string, signal?: AbortSignal) => requestJson<Scan>(`/api/scans/${encodeURIComponent(id)}`, { signal }),
  attack: (id: string, signal?: AbortSignal) => requestJson<AttackRun>(`/api/attacks/${encodeURIComponent(id)}`, { signal }),
  pullRequest: (id: string, signal?: AbortSignal) => requestJson<PullRequest>(`/api/pull-requests/${encodeURIComponent(id)}`, { signal }),
  verification: (id: string, signal?: AbortSignal) => requestJson<Verification>(`/api/verifications/${encodeURIComponent(id)}`, { signal }),
  async workspace(projectId: string, scenario: MockScenario, signal?: AbortSignal): Promise<WorkspaceData> {
    if (config.useMocks) return mockWorkspace(scenario);
    const project = await requestJson<{ latestScanId?: string }>(`/api/projects/${encodeURIComponent(projectId)}`, { signal });
    if (!project.latestScanId) throw new Error('No scan available yet.');
    // Live pages will request independent resources as their backend jobs are implemented.
    throw new Error('Live workspace aggregation is not connected yet. Mock data was not substituted.');
  },
};
