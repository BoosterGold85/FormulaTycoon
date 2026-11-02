import React,{useEffect,useRef} from 'react';
import {Animated,Easing,StyleSheet,Text,View} from 'react-native';
import type {DepartmentDefinition,HeadquartersLayout} from '../../game/models';
import {splitPoints,type Callout,type Piece} from '../../simulation/developmentLoop';
import type {HeadquartersWorker} from '../../simulation/headquarters';
import {spriteSize} from '../components/WorkerFigure';
import {gridToScreen,type Projection} from '../isometric';

const CATEGORY_LABEL:Record<string,string>={Research:'RESEARCH',Aero:'AERO',Technical:'TECHNICAL',Manufacturing:'MANUFACTURING'};
const CALLOUT_TONE={STALL:'#EDC475',SETBACK:'#EDC475',BREAKTHROUGH:'#F2B544',DECISION:'#9FB4CC',STAGE_COMPLETE:'#63E6A8',PART_READY:'#63E6A8'} as const;
const MAX_POPS_PER_PIECE=6;
/** Spread a piece's pops sideways so several from one desk stay readable. */
const fan=(p:{x:number;y:number},j:number,n:number)=>({x:p.x+(n>1?(j%2?34:-34):0),y:p.y-Math.floor(j/2)*24});

type Point={x:number;y:number};
/**
 * Replay layer. Each day's AUTHORITATIVE work pops up over the people actually working in the department
 * doing it (several small pops that sum exactly to that day's piece), rises, then drifts toward the
 * development card. Callouts mark stalls, breakthroughs and stage changes. With reduced motion the pops
 * appear in place without moving. Display only.
 */
export function WorkBubbles({layout,workers,projection,pieces,callouts,sink,runKey,dayMs,reducedMotion}:{layout:HeadquartersLayout;workers:HeadquartersWorker[];
 projection:Projection;pieces:Piece[];callouts:Callout[];sink:Point;runKey:string;dayMs:number;reducedMotion:boolean}){
 const k=projection.tileX/17,lift=spriteSize(k).height+6;
 const sign=(id:string):Point=>{const d:DepartmentDefinition=layout.departments.find(x=>x.id===id)??layout.departments[0]!;const p=gridToScreen(d.labelPoint,projection,d.labelHeight);return {x:p.x,y:p.y-30};};
 // The department's desks/benches (independent of whether the HQ workday has seated everyone yet).
 const desks=(id:string):Point[]=>layout.stations.filter(st=>st.departmentId===id).map(st=>{const p=gridToScreen(st.position,projection);return {x:p.x,y:p.y-lift};});
 void workers;
 const pops:Array<{key:string;from:Point;points:number;category:string;accent:boolean;delay:number}>=[];
 pieces.forEach((piece,i)=>{
  // One small pop per point (up to six per piece) so the factory visibly ticks; they always sum to the piece.
  const spots=desks(piece.department),n=Math.max(1,Math.min(MAX_POPS_PER_PIECE,piece.points));
  splitPoints(piece.points,Array(n).fill(1)).forEach((points,j)=>{
   if(points<=0)return;
   pops.push({key:`${runKey}:${i}:${j}`,from:fan(spots.length?spots[(i*2+j)%spots.length]!:sign(piece.department),j,n),points,category:piece.category,accent:piece.accent,
    delay:(j/n)*dayMs*0.6+i*120});
  });
 });
 const busy=[...new Set(pieces.map(p=>p.department))];
 const stalled=[...new Set(callouts.filter(c=>c.kind==='STALL'||c.kind==='SETBACK').map(c=>c.department))];
 return <View pointerEvents="none" style={[StyleSheet.absoluteFill,{zIndex:2600}]}>
  {busy.flatMap(d=>desks(d).map((p,i)=><Working key={`${runKey}:w:${d}:${i}`} at={p} still={reducedMotion} warn={stalled.includes(d)} phase={i}/>))}
  {stalled.filter(d=>!busy.includes(d)).flatMap(d=>desks(d).map((p,i)=><Working key={`${runKey}:s:${d}:${i}`} at={p} still warn phase={i}/>))}
  {callouts.map(c=>{const p=sign(c.department);return <View key={`${runKey}:c:${c.projectId}:${c.kind}:${c.day}`} style={[styles.calloutSlot,{left:p.x,top:p.y-28}]}>
   <View style={[styles.callout,{borderColor:CALLOUT_TONE[c.kind]}]}><Text style={[styles.calloutText,{color:CALLOUT_TONE[c.kind]}]} numberOfLines={1}>{c.title.toUpperCase()}</Text></View></View>;})}
  {pops.map(({key,...p})=><Pop key={key} {...p} to={sink} life={dayMs*0.95} still={reducedMotion}/>)}
 </View>;
}

/** Small "working" marker over a desk while its department produces work today (amber "!" when it is struggling). */
function Working({at,still,warn,phase}:{at:Point;still:boolean;warn:boolean;phase:number}){
 const t=useRef(new Animated.Value(0)).current;
 useEffect(()=>{if(still)return;const loop=Animated.loop(Animated.sequence([Animated.delay(phase*140),Animated.timing(t,{toValue:1,duration:520,useNativeDriver:false}),Animated.timing(t,{toValue:0,duration:520,useNativeDriver:false})]));
  loop.start();return ()=>loop.stop();},[t,still,phase]);
 return <Animated.View style={[styles.working,{left:at.x,top:at.y+12,opacity:still?1:t.interpolate({inputRange:[0,1],outputRange:[0.45,1]})},warn&&styles.workingWarn]}>
  <Text style={[styles.workingText,warn&&{color:'#17202C'}]}>{warn?'!':'•••'}</Text></Animated.View>;
}

function Pop({from,to,points,category,accent,delay,life,still}:{from:Point;to:Point;points:number;category:string;accent:boolean;delay:number;life:number;still:boolean}){
 const t=useRef(new Animated.Value(0)).current;
 useEffect(()=>{
  t.setValue(0);
  const run=Animated.sequence([Animated.delay(delay),Animated.timing(t,{toValue:1,duration:Math.max(400,life-delay),easing:Easing.linear,useNativeDriver:false})]);
  run.start();return ()=>run.stop();
 },[t,delay,life]);
 const dx=to.x-from.x,dy=to.y-from.y;
 // 0-0.12 pop in, 0.12-0.55 rise and hold over the worker, 0.55-1 drift toward the card and fade.
 const style=still?{opacity:t.interpolate({inputRange:[0,0.05,0.85,1],outputRange:[0,1,1,0]})}:{
  opacity:t.interpolate({inputRange:[0,0.08,0.7,1],outputRange:[0,1,1,0]}),
  transform:[
   {translateX:t.interpolate({inputRange:[0,0.55,1],outputRange:[0,0,dx*0.85]})},
   {translateY:t.interpolate({inputRange:[0,0.12,0.55,1],outputRange:[6,-4,-16,dy*0.85]})},
   {scale:t.interpolate({inputRange:[0,0.12,0.55,1],outputRange:[0.6,1.05,1,0.7]})}]};
 return <Animated.View accessibilityElementsHidden style={[styles.bubble,accent&&styles.accent,{left:from.x,top:from.y},style]}>
  <Text style={[styles.bubbleText,accent&&styles.accentText]} numberOfLines={1}>+{points} {CATEGORY_LABEL[category]}</Text>
 </Animated.View>;
}

const styles=StyleSheet.create({
 bubble:{position:'absolute',width:112,marginLeft:-56,marginTop:-12,alignItems:'center'},
 accent:{},
 bubbleText:{color:'#F6F2E9',fontSize:11,fontWeight:'900',letterSpacing:.3,paddingHorizontal:7,paddingVertical:3,borderRadius:9,overflow:'hidden',
  backgroundColor:'rgba(17,29,42,0.94)',borderWidth:1.5,borderColor:'#63E6A8'},
 accentText:{color:'#F7D58A',borderColor:'#F2B544'},
 working:{position:'absolute',marginLeft:-11,width:22,height:13,borderRadius:7,alignItems:'center',justifyContent:'center',backgroundColor:'rgba(17,29,42,0.9)',borderWidth:1,borderColor:'#63E6A8'},
 workingWarn:{backgroundColor:'#EDC475',borderColor:'#EDC475'},
 workingText:{color:'#63E6A8',fontSize:9,fontWeight:'900',lineHeight:11},
 calloutSlot:{position:'absolute',marginLeft:-120,width:240,alignItems:'center'},
 callout:{paddingVertical:3,paddingHorizontal:8,borderRadius:6,borderWidth:1,backgroundColor:'rgba(10,16,25,0.9)'},
 calloutText:{fontSize:10,fontWeight:'900',letterSpacing:.6}
});
