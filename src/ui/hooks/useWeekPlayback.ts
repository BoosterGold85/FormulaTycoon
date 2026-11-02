import {useEffect,useRef,useState} from 'react';
import {playbackFrame,stepPlayback,type PlaybackFrame,type PlaybackSpeed,type WeekTimeline} from '../../simulation/developmentLoop';

const TICK_MS=100;
/**
 * Presentation clock for replaying an ALREADY processed week. It reads the immutable timeline and
 * never touches the universe: speed only scales time, Skip jumps to the final frame. It only
 * re-renders when the visible day/state changes (about ten times per week), not every frame.
 */
/** holdAt: presentation time (1x ms) of the next unanswered decision; the replay waits there. */
export function useWeekPlayback(timeline:WeekTimeline|null,runKey:string|undefined,onDone:()=>void,holdAt:number|null=null){
 const [speed,setSpeed]=useState<PlaybackSpeed>(1);
 const [frame,setFrame]=useState<PlaybackFrame|null>(null);
 const speedRef=useRef(speed);speedRef.current=speed;
 const doneRef=useRef(onDone);doneRef.current=onDone;
 const skipRef=useRef(false);
 const holdRef=useRef(holdAt);holdRef.current=holdAt;
 const [held,setHeld]=useState(false);
 useEffect(()=>{
  if(!timeline||!runKey){setFrame(null);return;}
  skipRef.current=false;
  // Reduced motion keeps the day-by-day replay (information) and only drops movement in the scene.
  // Progress is kept in 1x milliseconds so a speed change mid-week continues from the same moment.
  let units=0,last=Date.now(),shown='';
  const update=()=>{
   const now=Date.now();
   // A pending decision holds the replay; neither 2x nor Skip can pass it (stepPlayback).
   const step=stepPlayback(units,now-last,speedRef.current,holdRef.current,skipRef.current,timeline.days);last=now;
   units=step.units;if(step.held)skipRef.current=false;
   setHeld(step.held);
   const next=playbackFrame(timeline,units,1,step.skipped);
   const key=`${next.day}:${next.state}:${next.done}`;
   if(key!==shown){shown=key;setFrame(next);}
   if(next.done){clearInterval(timer);doneRef.current();}
  };
  const timer=setInterval(update,TICK_MS);update();
  return ()=>clearInterval(timer);
 },[timeline,runKey]);
 return {frame,speed,setSpeed,skip:()=>{skipRef.current=true;},playing:!!frame&&!frame.done,held};
}
