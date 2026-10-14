import { useEffect, useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import { requestJson } from '@/lib/api';
export type Attack = { id:string; kind:'dictionary'|'shor_sim'; status:string; verdict?:string; lines:string[]; tried:number; cracked:number; total:number; durationMs:number; budgetExhausted?:boolean; error?:string; revealed:{customerId:number;field:string;value:string}[] };
const savedKey='cryptiq-attack-p_demo';
export function DictionaryAttack({ onResult, masked }: { onResult:(value:Attack|null)=>void; masked:boolean }) {
 const [run,setRun]=useState<Attack|null>(null),[error,setError]=useState(''),[busy,setBusy]=useState(false),[kind,setKind]=useState<'dictionary'|'shor_sim'>('dictionary');
 const [runId,setRunId]=useState(()=>localStorage.getItem(savedKey)||'');
 const pending=useRef(false);const creation=useRef<AbortController|null>(null);
 useEffect(()=>()=>creation.current?.abort(),[]);
 useEffect(()=>{
  if(!runId)return;const abort=new AbortController();let timer:ReturnType<typeof setTimeout>;
  async function poll(){try{
   const value=await requestJson<Attack>(`/api/attacks/${runId}`,{signal:abort.signal});
   if(abort.signal.aborted)return;
   setKind(value.kind);setRun(value);setBusy(value.status==='running');
   if(value.status==='error'){setError(value.error||'Attack failed; refresh the records and run again.');onResult(null);localStorage.removeItem(savedKey);return;}
   onResult(value.status==='done'?value:null);
   timer=setTimeout(poll,value.status==='running'?300:3000);
  }catch(reason){if(!abort.signal.aborted){setError(reason instanceof Error?reason.message:'Could not load attack');setRun(null);setBusy(false);onResult(null);}}}
  void poll();return()=>{abort.abort();clearTimeout(timer);};
 },[runId,onResult]);
 async function start(nextKind:'dictionary'|'shor_sim'){
  if(busy||pending.current)return;pending.current=true;const abort=new AbortController();creation.current=abort;
  setBusy(true);setKind(nextKind);setRunId('');setRun(null);setError('');onResult(null);
  try{const {attackId}=await requestJson<{attackId:string}>('/api/projects/p_demo/attacks',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({kind:nextKind,budgetSeconds:5}),signal:abort.signal});
   if(!abort.signal.aborted){localStorage.setItem(savedKey,attackId);setRunId(attackId);}
  }catch(reason){if(!abort.signal.aborted){setError(reason instanceof Error?reason.message:'Attack failed');setBusy(false);}}
  finally{pending.current=false;}
 }
 const rsa=kind==='shor_sim';
 return <section className="attack-terminal" aria-label="Attack operations"><span className="text-[10px] tracking-wider">{rsa?'TINY-KEY RSA SIMULATION':'REAL DICTIONARY DEMONSTRATION'}</span><h2 className="text-lg text-white mt-2">{rsa?'Can these fake IDs be recovered?':'Can these passwords be guessed?'}</h2><p className="text-xs opacity-80 mt-2">{rsa?'Classical factoring of the public demo key. Five-second budget.':'20 curated guesses against fake stored hashes. Five-second budget.'}</p><Button className="w-full mt-4" disabled={busy} onClick={()=>start('dictionary')}>{busy&&!rsa?'Testing passwords…':'Crack demo passwords'}</Button><button className="text-xs underline mt-3" disabled={busy} onClick={()=>start('shor_sim')}>{busy&&rsa?'Factoring demo key…':'Run RSA simulation (tiny demo key)'}</button><div className="attack-output" role="status" aria-live="polite">{run&&run.status!=='error'?<><p>{run.tried.toLocaleString()} work iterations</p>{run.verdict==='not_applicable'?<p>Not applicable: no active RSA storage.</p>:<p>{run.cracked.toLocaleString()} / {run.total.toLocaleString()} recovered · {run.durationMs} ms</p>}{run.status==='done'?run.lines.slice(1).map(line=><p key={line}>{line}</p>):<p>{rsa?'Factoring the public demo modulus…':'Testing the dictionary against stored hashes…'}</p>}</>:<p>{busy?'Starting actual work…':'No current attack result.'}</p>}</div>{error?<p role="alert" className="text-xs text-red-200 mt-3">{error} Run again to obtain current evidence.</p>:null}{run?.status==='done'&&run.cracked>0?<details className="text-xs mt-3"><summary>Recovered examples ({run.cracked})</summary><div className="attack-examples">{run.revealed.slice(0,8).map(row=><p key={`${row.customerId}-${row.field}`}>Customer {row.customerId} {row.field==='password'?'password':'ID'}: {masked?'••••••':row.value}</p>)}</div></details>:null}<p className="text-[10px] opacity-70 mt-3">{rsa?'Classical simulation only; no quantum hardware or RSA-2048 attack.':'No recovery within this budget does not prove a password is safe. Weak passwords can still be recovered after migration.'}</p></section>;
}
