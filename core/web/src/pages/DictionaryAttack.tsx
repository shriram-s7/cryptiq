import { useEffect, useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import { requestJson } from '@/lib/api';
export type Attack = { id:string; status:string; lines:string[]; tried:number; cracked:number; total:number; durationMs:number; budgetExhausted?:boolean; error?:string; revealed:{customerId:number;field:string;value:string}[] };
export function DictionaryAttack({ onResult, masked }: { onResult:(value:Attack|null)=>void; masked:boolean }) {
  const [run,setRun]=useState<Attack|null>(null);
  const [error,setError]=useState('');
  const [busy,setBusy]=useState(false);
  const control=useRef<AbortController|null>(null);
  useEffect(()=>()=>control.current?.abort(),[]);
  async function start(kind = 'dictionary') {
    if(busy) return;
    const abort=new AbortController(); control.current=abort;
    setBusy(true);setRun(null);setError('');onResult(null);
    try {
      const {attackId}=await requestJson<{attackId:string}>('/api/projects/p_demo/attacks',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({kind,budgetSeconds:5}),signal:abort.signal});
      while(!abort.signal.aborted) {
        const value=await requestJson<Attack>(`/api/attacks/${attackId}`,{signal:abort.signal});
        setRun(value);
        if(value.status==='error') throw new Error(value.error||'Attack failed');
        if(value.status==='done') {onResult(value);break;}
        await new Promise(resolve=>setTimeout(resolve,300));
      }
    } catch(reason) {if(!abort.signal.aborted) {setError(reason instanceof Error?reason.message:'Attack failed');onResult(null);}}
    finally {if(!abort.signal.aborted)setBusy(false);}
  }
  return <section className="attack-terminal" aria-label="Password attack"><span className="text-[10px] tracking-wider">REAL DICTIONARY DEMONSTRATION</span><h2 className="text-lg text-white mt-2">Can these passwords be guessed?</h2><p className="text-xs opacity-80 mt-2">20 curated guesses against fake stored hashes. Five-second budget; real measured work.</p><Button className="w-full mt-4" disabled={busy} onClick={() => start()}>{busy?'Testing passwords…':'Crack demo passwords'}</Button><button className="text-xs underline mt-3" disabled={busy} onClick={() => start('shor_sim')}>Run RSA simulation (tiny demo key)</button><div className="attack-output" role="status" aria-live="polite">{run ? <><p>{run.tried.toLocaleString()} work iterations</p><p>{run.cracked.toLocaleString()} / {run.total.toLocaleString()} recovered · {run.durationMs} ms</p>{run.status==='done'?run.lines.slice(1).map(line=><p key={line}>{line}</p>):<p>Testing the dictionary against stored hashes…</p>}</> : <p>No attack run yet.</p>}</div>{error?<p role="alert" className="text-xs text-red-200 mt-3">{error}</p>:null}{run?.status==='done'&&run.cracked>0?<details className="text-xs mt-3"><summary>Recovered examples ({run.cracked})</summary><div className="attack-examples">{run.revealed.slice(0,8).map(row=><p key={`${row.customerId}-${row.field}`}>Customer {row.customerId}: {masked?'••••••':row.value}</p>)}</div></details>:null}<p className="text-[10px] opacity-70 mt-3">No recovery within this budget does not prove a password is safe. Strong hashing slows guesses; weak passwords can still be recovered.</p></section>;
}
