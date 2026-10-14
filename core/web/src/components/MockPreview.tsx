import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { api } from '@/lib/api';
import type { MockScenario, WorkspaceData } from '@/lib/contracts';
import { Card } from './ui/card';

export function MockPreview({ page }: { page: string }) {
  const { id = 'p_demo' } = useParams();
  const [scenario, setScenario] = useState<MockScenario>('before');
  const [data, setData] = useState<WorkspaceData | null>(null);
  const [error, setError] = useState('');
  useEffect(() => {
    const controller = new AbortController();
    setData(null); setError('');
    api.workspace(id, scenario, controller.signal).then(value => {
      if (!controller.signal.aborted) setData(value);
    }).catch((reason: unknown) => {
      if (!controller.signal.aborted) setError(reason instanceof Error ? reason.message : 'Unable to load fixture');
    });
    return () => controller.abort();
  }, [id, scenario]);
  return <Card className="mb-6 p-5" aria-label="Mock data preview">
    <div className="flex flex-wrap items-center justify-between gap-3"><strong className="text-sm text-amber-700">Mock data · not a live scan</strong>
      <label className="text-sm">Scenario <select className="ml-2 rounded border p-2" value={scenario} onChange={e => setScenario(e.target.value as MockScenario)}><option value="before">Before</option><option value="after">After</option><option value="error">Error</option></select></label></div>
    {error ? <p role="alert" className="mt-4 text-danger-600">{error}</p> : !data ? <p role="status">Loading fixture…</p> : <div className="mt-4 text-sm" data-testid="mock-results">
      <p className="mb-3">Fixture score: <strong>{data.scan.score}/100</strong> · Critical: {data.scan.counts.critical} · High: {data.scan.counts.high} · Low: {data.scan.counts.low}</p>
      {page === 'Findings' ? <ul className="space-y-2">{data.scan.findings.map(f => <li key={f.id}>{f.titleOwner} — <strong>{f.status}</strong></li>)}</ul> : null}
      {page === 'Overview' || page === 'Scan' ? <div className="grid gap-2 sm:grid-cols-3">{data.scan.dataMap.map(d => <div className="rounded bg-slate-50 p-3" key={d.dataType}>{d.dataType}<br /><span className="font-mono text-xs">{d.protection}</span></div>)}</div> : null}
      {page === 'Attack Lab' ? <div>{data.attacks.map(a => <p key={a.id}>{a.kind === 'shor_sim' ? 'Shor simulation' : 'Dictionary attack'}: {a.verdict} · {a.cracked} recovered (fixture)</p>)}<p className="mt-2 text-slate-500">Simulation and attack outputs are examples only.</p></div> : null}
      {page === 'Fix & Verify' ? <><p>{data.pullRequest.title} · {data.pullRequest.status}</p><pre className="my-3 whitespace-pre-wrap rounded bg-slate-50 p-3 text-xs">{data.pullRequest.files[0].diff}</pre>{data.verification.checks.map(c => <p key={c.key}>{c.label}: {c.status}</p>)}</> : null}
      {page === 'Report' ? <p>Verification fixture: {data.verification.status}. PDF and CBOM downloads are not available yet.</p> : null}
    </div>}
  </Card>;
}
