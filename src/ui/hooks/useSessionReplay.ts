import {useEffect,useRef,useState} from 'react';

/** 1x: 0.7 s per session minute (Q1 to its call ~6 s, the whole session ~32 s); 2x halves it. */
export const MINUTE_MS:Record<1|2,number>={1:700,2:350};
const TICK_MS=100;
/**
 * Presentation clock for replaying an ALREADY resolved qualifying session up to `target` (the open
 * call, or the flag). It only moves a whole-minute pointer over stored laps; speed and Skip can never
 * change a result. `from` lets a reopened screen continue where the player left the replay.
 */
export function useSessionReplay(target:number,from:number,onMinute:(m:number)=>void){
 const [speed,setSpeed]=useState<1|2>(1);
 const [minute,setMinute]=useState(Math.min(from,target));
 const speedRef=useRef(speed);speedRef.current=speed;
 const posRef=useRef(Math.min(from,target));
 const skipRef=useRef(false);
 const shownRef=useRef(Math.min(from,target));
 const report=useRef(onMinute);report.current=onMinute;
 useEffect(()=>{
  skipRef.current=false;
  if(posRef.current>=target){shownRef.current=target;setMinute(target);report.current(target);return;}
  let last=Date.now();
  const timer=setInterval(()=>{
   const now=Date.now();
   posRef.current=skipRef.current?target:Math.min(target,posRef.current+(now-last)/MINUTE_MS[speedRef.current]);last=now;
   const whole=Math.floor(posRef.current+1e-9);
   if(whole!==shownRef.current){shownRef.current=whole;setMinute(whole);report.current(whole);}
   if(posRef.current>=target){skipRef.current=false;clearInterval(timer);}
  },TICK_MS);
  return ()=>clearInterval(timer);
 },[target]);
 return {minute,speed,setSpeed,skip:()=>{skipRef.current=true;},playing:minute<target};
}
