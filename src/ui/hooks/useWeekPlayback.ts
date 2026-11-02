import {useEffect,useRef,useState} from 'react';
import {DAY_MS,playbackFrame,type PlaybackFrame,type PlaybackSpeed,type WeekTimeline} from '../../simulation/developmentLoop';
import {useReducedMotion} from './useReducedMotion';

const TICK_MS=100;
/**
 * Presentation clock for replaying an ALREADY processed week. It reads the immutable timeline and
 * never touches the universe: speed only scales time, Skip jumps to the final frame. It only
 * re-renders when the visible day/state changes (about ten times per week), not every frame.
 */
export function useWeekPlayback(timeline:WeekTimeline|null,runKey:string|undefined,onDone:()=>void){
 const reduced=useReducedMotion();
 const [speed,setSpeed]=useState<PlaybackSpeed>(1);
 const [frame,setFrame]=useState<PlaybackFrame|null>(null);
 const speedRef=useRef(speed);speedRef.current=speed;
 const doneRef=useRef(onDone);doneRef.current=onDone;
 const skipRef=useRef(false);
 useEffect(()=>{
  if(!timeline||!runKey){setFrame(null);return;}
  skipRef.current=false;
  const finish=()=>{setFrame(playbackFrame(timeline,0,1,true));doneRef.current();};
  if(reduced){finish();return;}
  // Progress is kept in 1x milliseconds so a speed change mid-week continues from the same moment.
  let units=0,last=Date.now(),shown='';
  const update=()=>{
   const now=Date.now();units+=(now-last)*DAY_MS[1]/DAY_MS[speedRef.current];last=now;
   const next=playbackFrame(timeline,units,1,skipRef.current);
   const key=`${next.day}:${next.state}:${next.done}`;
   if(key!==shown){shown=key;setFrame(next);}
   if(next.done){clearInterval(timer);doneRef.current();}
  };
  const timer=setInterval(update,TICK_MS);update();
  return ()=>clearInterval(timer);
 },[timeline,runKey,reduced]);
 return {frame,speed,setSpeed,skip:()=>{skipRef.current=true;},playing:!!frame&&!frame.done};
}
