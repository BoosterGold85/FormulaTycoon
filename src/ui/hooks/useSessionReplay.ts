import {useEffect,useRef,useState} from 'react';
import {Animated,Easing} from 'react-native';
import {useReducedMotion} from './useReducedMotion';

/** 1x: a beat with a sector or lap completing holds ~2.3 s; a quiet beat ~0.75 s (Q1 reaches its call in
 * about 45 s). 2x and 4x divide both. */
export const BEAT_MS={active:2300,quiet:750};
export type ReplaySpeed=1|2|4;
/**
 * Presentation clock for replaying an ALREADY resolved qualifying session, one sector beat at a time,
 * up to `target` (the next call, break or the flag). Speed and Skip never change a result. `from` lets a
 * reopened screen continue where the player left it.
 *
 * `progress` (0..1) runs linearly from the shown beat toward the next one while the replay plays, so cars,
 * mini-sectors and the clock can move smoothly between beats. It is purely visual: it never runs past the
 * next beat, holds at 0 when the replay stops, and stays 0 with reduced motion.
 */
export function useSessionReplay(target:number,from:number,active:(beat:number)=>boolean,onBeat:(b:number)=>void){
 const reduced=useReducedMotion();
 const [speed,setSpeed]=useState<ReplaySpeed>(1);
 const [beat,setBeat]=useState(Math.min(from,target));
 const speedRef=useRef(speed);speedRef.current=speed;
 const reducedRef=useRef(reduced);reducedRef.current=reduced;
 const posRef=useRef(Math.min(from,target));
 const activeRef=useRef(active);activeRef.current=active;
 const report=useRef(onBeat);report.current=onBeat;
 const kick=useRef<()=>void>(()=>{});
 const progress=useRef(new Animated.Value(0)).current;
 useEffect(()=>{
  let timer:ReturnType<typeof setTimeout>|undefined,stopped=false;
  const glide=(ms:number)=>{progress.stopAnimation();progress.setValue(0);
   if(!reducedRef.current)Animated.timing(progress,{toValue:1,duration:ms,easing:Easing.linear,useNativeDriver:false}).start();};
  const halt=()=>{progress.stopAnimation();progress.setValue(0);};
  const show=(b:number)=>{posRef.current=b;setBeat(b);report.current(b);};
  const schedule=(ms:number)=>{timer=setTimeout(step,ms);glide(ms);};
  const step=()=>{
   if(stopped)return;
   show(Math.min(target,posRef.current+1));
   if(posRef.current>=target){halt();return;}
   schedule((activeRef.current(posRef.current+1)?BEAT_MS.active:BEAT_MS.quiet)/speedRef.current);
  };
  // Skip jumps straight to the next stop (a call, a break or the flag); it can never pass one.
  kick.current=()=>{if(timer)clearTimeout(timer);halt();if(posRef.current<target)show(target);};
  if(posRef.current>=target){halt();show(target);}
  else schedule(BEAT_MS.quiet/speedRef.current);
  return ()=>{stopped=true;if(timer)clearTimeout(timer);halt();};
 },[target,progress]);
 return {beat,speed,setSpeed,skip:()=>kick.current(),playing:beat<target,progress};
}
