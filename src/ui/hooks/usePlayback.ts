import {useEffect,useState} from 'react';
import {useReducedMotion} from './useReducedMotion';

/** Presentation clock 0 -> 1 for replaying an ALREADY processed turn. Restarts when key changes.
 * Each consumer runs its own short clock so the app root never re-renders per frame. */
export function usePlayback(key:string|undefined,durationMs=3000,enabled=true):number {
 const reduced=useReducedMotion();
 const [t,setT]=useState(enabled&&!reduced&&key?0:1);
 useEffect(()=>{
  if(!key||!enabled||reduced){setT(1);return;}
  setT(0);const start=Date.now();
  const timer=setInterval(()=>{const next=Math.min(1,(Date.now()-start)/durationMs);setT(next);if(next>=1)clearInterval(timer);},100);
  return ()=>clearInterval(timer);
 },[key,durationMs,enabled,reduced]);
 return t;
}
