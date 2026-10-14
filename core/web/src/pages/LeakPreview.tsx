import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowUpRight, Database, RefreshCw, ShieldAlert } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { DictionaryAttack, type Attack } from './DictionaryAttack';
import { requestJson } from '@/lib/api';

type Row = { id: number; name: string; phone: string; email: string; password_hash: string; id_number: string; created_at: string };
type Preview = { rows: Row[]; total: number; mode: string; capturedAt: string; newestCustomerId: number | null };

export function LeakPreview({ id }: { id: string }) {
  const [attack, setAttack] = useState<Attack | null>(null);
  const [preview, setPreview] = useState<Preview | null>(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const [refresh, setRefresh] = useState(0);
  const [masked, setMasked] = useState(false);
  const [selected, setSelected] = useState<Row | null>(null);
  const dialog = useRef<HTMLDialogElement>(null);
  useEffect(() => { if (selected) dialog.current?.showModal(); }, [selected]);
  useEffect(() => {
    if (id !== 'p_demo') { setLoading(false); return; }
    const controller = new AbortController();
    setLoading(true); setError(''); setPreview(null); setAttack(null);
    requestJson<Preview>(`/api/projects/${id}/leak-preview?limit=8`, { signal: controller.signal })
      .then(setPreview).catch(reason => { if (!controller.signal.aborted) setError(reason.message); })
      .finally(() => { if (!controller.signal.aborted) setLoading(false); });
    return () => controller.abort();
  }, [id, refresh]);
  if (id !== 'p_demo') return <Card className="p-7"><h2>Database preview is demo-only.</h2><p className="text-sm text-slate-500 mt-3">ZIP scans inspect source files. They do not connect to or expose a customer database.</p><Link className="secondary-link mt-4" to="/scan">Scan Chennai Organics to explore the demonstration</Link></Card>;
  const visible = (value: string) => masked ? '••••••' : value || '(empty)';
  return <><div className="leak-layout"><Card className="leak-panel"><div className="leak-toolbar"><div><span className="small-badge">LIVE DATABASE · FAKE DEMO DATA</span><h2 className="text-lg mt-3">If your database leaked</h2></div><Button variant="outline" size="sm" disabled={loading} onClick={() => setRefresh(n => n + 1)}><RefreshCw size={14} />Refresh</Button></div>
    <p className="text-xs text-slate-500 mt-2">Stored fake records. Recovered passwords turn red after a real dictionary match.</p>
    <div className="flex justify-between gap-3 items-center my-4"><span className="text-xs text-slate-500">{preview ? `${preview.rows.length} of ${preview.total.toLocaleString()} customers · newest first` : 'Reading local storage'}</span><label className="text-xs flex gap-2 items-center"><input type="checkbox" checked={masked} onChange={e => { setMasked(e.target.checked); dialog.current?.close(); }} />Show masked</label></div>
    {error ? <div role="alert" className="error-notice"><ShieldAlert size={18} /><span>Could not load storage. {error} Use Refresh to retry.</span></div> : loading ? <p role="status" className="p-6 text-sm">Reading demo records…</p> : !preview?.rows.length ? <p className="p-6 text-sm">No customers yet. Create a test customer, then refresh.</p> : <div className="leak-table-scroll"><table className="leak-table"><caption className="sr-only">Actual stored demo customer records</caption><thead><tr><th>Customer</th><th>Phone / email</th><th>Password / ID</th><th><span className="sr-only">Details</span></th></tr></thead><tbody>{preview.rows.map((row,i) => <tr key={row.id} className={i === 0 ? 'newest-row' : ''}><td><strong>{visible(row.name)}</strong>{i === 0 ? <span className="newest-tag">NEWEST</span> : null}</td><td><span>{visible(row.phone)}</span><span>{visible(row.email)}</span></td><td className="font-mono"><span className={attack?.revealed.some(r => r.customerId === row.id && r.field === 'password') ? 'recovered-password' : ''}>{visible(attack?.revealed.find(r => r.customerId === row.id && r.field === 'password')?.value || row.password_hash)}</span><span className={attack?.revealed.some(r => r.customerId === row.id && r.field === 'id_number') ? 'recovered-password' : ''}>{visible(attack?.revealed.find(r => r.customerId === row.id && r.field === 'id_number')?.value || row.id_number)}</span></td><td><button className="text-emerald-700 underline text-xs" aria-label={`Inspect customer ${row.id}`} onClick={() => setSelected(row)}>Inspect</button></td></tr>)}</tbody></table></div>}
    {preview ? <p className="text-[10px] text-slate-500 mt-3">Snapshot {new Date(preview.capturedAt).toLocaleTimeString()} · {preview.mode === 'after' ? 'Protected storage mode. Ciphertext remains ciphertext here.' : 'Before mode: weak hashes and exposed contact fields.'}</p> : null}
    </Card><div className="leak-guide"><DictionaryAttack key={refresh} onResult={setAttack} masked={masked} /><Card className="p-5"><Database size={16} className="text-emerald-600" /><h2 className="text-sm mt-2">Try a new fake customer</h2><p className="text-xs text-slate-500 mt-2">Sign up with a test password such as chennai123, then Refresh and run the attack.</p><Button variant="outline" asChild className="mt-3 w-full"><a href="http://localhost:5050/signup" target="_blank" rel="noreferrer">Open demo signup <ArrowUpRight size={15} /></a></Button></Card></div></div>
    <p className="text-xs text-slate-500 mt-4">Simulation: classical Pollard-rho on a tiny demo RSA key. No quantum hardware or RSA-2048 attack.</p>
    <dialog ref={dialog} className="finding-dialog" onClose={() => setSelected(null)}><div className="flex justify-between items-center"><h2 className="text-lg">Stored record</h2><button className="border rounded px-3 py-1" onClick={() => dialog.current?.close()}>Close</button></div><p className="text-xs text-slate-500 mt-3">Fake demo data · raw storage, no decryption</p>{selected ? <dl className="mt-6 space-y-5">{Object.entries(selected).map(([key,value]) => <div key={key}><dt className="text-xs text-slate-500">{key}</dt><dd className="text-xs font-mono break-all mt-1">{masked ? '••••••' : String(value) || '(empty)'}</dd></div>)}</dl> : null}</dialog></>;
}
