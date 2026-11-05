import {useEffect,useRef,useState} from 'react';

/** 1x: a beat with a sector or lap completing holds ~1.1 s; a quiet beat ~0.35 s. 2x halves both. */
export const BEAT_MS={active:1100,quiet:350};
/**
 * Presentation clock for replaying an ALREADY resolved qualifying session, one sector beat at a time,
 * up to `target` (the open call, or the flag). Speed and Skip never change a result. `from` lets a
 * reopened screen continue where the player left it.
 */
export function useSessionReplay(target:number,from:number,active:(beat:number)=>boolean,onBeat:(b:number)=>void){
 const [speed,setSpeed]=useState<1|2>(1);
 const [beat,setBeat]=useState(Math.min(from,target));
 const speedRef=useRef(speed);speedRef.current=speed;
 const posRef=useRef(Math.min(from,target));
 const skipRef=useRef(false);
 const activeRef=useRef(active);activeRef.current=active;
 const report=useRef(onBeat);report.current=onBeat;
 useEffect(()=>{
  skipRef.current=false;
  let timer:ReturnType<typeof setTimeout>|undefined;
  const step=()=>{
   posRef.current=skipRef.current?target:Math.min(target,posRef.current+1);
   setBeat(posRef.current);report.current(posRef.current);
   if(posRef.current>=target){skipRef.current=false;return;}
   const ms=(activeRef.current(posRef.current+1)?BEAT_MS.active:BEAT_MS.quiet)/speedRef.current;
   timer=setTimeout(step,skipRef.current?0:ms);
  };
  if(posRef.current>=target){setBeat(target);report.current(target);}
  else timer=setTimeout(step,BEAT_MS.quiet);
  return ()=>{if(timer)clearTimeout(timer);};
 },[target]);
 return {beat,speed,setSpeed,skip:()=>{skipRef.current=true;},playing:beat<target};
}
