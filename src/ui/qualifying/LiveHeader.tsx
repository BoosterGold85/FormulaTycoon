import React,{useEffect,useRef,useState} from 'react';
import {Animated,Text,View} from 'react-native';
import {BEATS_PER_MINUTE,FORMAT,SEGMENTS,segmentAtBeat} from '../../simulation/qualifying';
import {useReducedMotion} from '../hooks/useReducedMotion';
import {useDesign} from '../design/system';

/** One replay beat is a third of a session minute. */
const BEAT_SECONDS=60/BEATS_PER_MINUTE;
export type LiveState='LIVE'|'PAUSED'|'FINAL';

/** Session clock (mm:ss left in the current part) read from the replay beat plus its glide toward the next. */
export function useSessionClock(beat:number,progress:Animated.Value){
 const seg=segmentAtBeat(beat),local=beat-FORMAT[seg].offset*BEATS_PER_MINUTE,total=FORMAT[seg].minutes*60;
 const left=(p:number)=>Math.max(0,Math.ceil(total-(local+p)*BEAT_SECONDS));
 const [secs,setSecs]=useState(()=>left(0));
 const ref=useRef(left);ref.current=left;
 useEffect(()=>{setSecs(ref.current(0));const id=progress.addListener(({value})=>setSecs(s=>{const n=ref.current(value);return n===s?s:n;}));return ()=>progress.removeListener(id);},[beat,progress]);
 return {seg,secs,share:Math.max(0,Math.min(1,1-secs/total))};
}
const mmss=(s:number)=>`${String(Math.floor(s/60)).padStart(2,'0')}:${String(s%60).padStart(2,'0')}`;

/** Broadcast header: pulsing LIVE dot, the venue, Q1/Q2/Q3 badges, the countdown and a part-progress bar. */
export function LiveHeader({venue,beat,progress,state,controls}:{venue:string;beat:number;progress:Animated.Value;state:LiveState;controls:React.ReactNode}){
 const {ui,styles}=useDesign(),reduced=useReducedMotion(),{seg,secs,share}=useSessionClock(beat,progress);
 const pulse=useRef(new Animated.Value(1)).current,live=state==='LIVE';
 useEffect(()=>{if(!live||reduced){pulse.setValue(1);return;}
  const loop=Animated.loop(Animated.sequence([Animated.timing(pulse,{toValue:.3,duration:600,useNativeDriver:false}),Animated.timing(pulse,{toValue:1,duration:600,useNativeDriver:false})]));
  loop.start();return ()=>loop.stop();},[live,reduced,pulse]);
 const cur=SEGMENTS.indexOf(seg);
 return <View testID="live-header" style={{gap:10}}>
  <View style={{flexDirection:'row',flexWrap:'wrap',alignItems:'center',gap:14,rowGap:10}}>
   <View accessibilityLabel={state==='LIVE'?'Live':state==='PAUSED'?'Paused for your call':'Session finished'} style={{flexDirection:'row',alignItems:'center',gap:8}}>
    <Animated.View style={{width:10,height:10,borderRadius:5,backgroundColor:state==='FINAL'?ui.muted:ui.danger,opacity:pulse}}/>
    <Text style={[styles.eyebrow,{color:state==='FINAL'?ui.muted:ui.danger,fontSize:13,letterSpacing:1.5}]}>{state}</Text></View>
   <Text style={[styles.heading,{fontSize:22}]}>{venue.toUpperCase()} · QUALIFYING</Text>
   <View style={{flexDirection:'row',alignItems:'center',gap:8,marginLeft:'auto'}}>
    {SEGMENTS.map((s,i)=><View key={s} accessibilityLabel={`${s}${i<cur?', complete':i===cur?', current':''}`} style={{minWidth:44,height:32,paddingHorizontal:8,borderRadius:6,alignItems:'center',justifyContent:'center',
     backgroundColor:i===cur?ui.accent:ui.chip}}><Text style={[styles.heading,{fontSize:18,color:i===cur?ui.onAccent:i<cur?ui.ink:ui.muted}]}>{s}{i<cur?' ✓':''}</Text></View>)}
    <Text accessibilityLabel={`${Math.floor(secs/60)} minutes ${secs%60} seconds left in ${seg}`} style={[styles.figure,{fontSize:26,marginLeft:6},ui.fonts.monoBold?{fontFamily:ui.fonts.monoBold}:null]}>{mmss(secs)}</Text>
   </View>
  </View>
  <View style={{height:4,borderRadius:2,backgroundColor:ui.chip}}><View style={{width:`${share*100}%`,height:4,borderRadius:2,backgroundColor:ui.danger}}/></View>
  {controls}
 </View>;
}
