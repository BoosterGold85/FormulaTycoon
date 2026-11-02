import React,{useEffect,useRef} from 'react';
import {Animated,Easing,StyleSheet,Text,View} from 'react-native';
import type {DepartmentDefinition} from '../../game/models';
import type {Callout,Piece} from '../../simulation/developmentLoop';
import {gridToScreen,type Projection} from '../isometric';

const CATEGORY_LABEL:Record<string,string>={Research:'RESEARCH',Aero:'AERO',Technical:'TECHNICAL',Manufacturing:'MANUFACTURING'};
const CALLOUT_TONE={STALL:'#EDC475',SETBACK:'#EDC475',BREAKTHROUGH:'#F2B544',DECISION:'#9FB4CC',STAGE_COMPLETE:'#63E6A8',PART_READY:'#63E6A8'} as const;

/**
 * Replay layer: each piece of the week's AUTHORITATIVE work rises from the department that did it and
 * travels to the development card (sink). Callouts mark stalls, breakthroughs and stage changes over
 * the department. Display only; every number comes from the processed week's timeline.
 */
export function WorkBubbles({departments,projection,pieces,callouts,sink,runKey,speedScale}:{departments:DepartmentDefinition[];projection:Projection;
 pieces:Piece[];callouts:Callout[];sink:{x:number;y:number};runKey:string;speedScale:number}){
 const anchor=(id:string)=>{const d=departments.find(x=>x.id===id)??departments[0]!;return gridToScreen(d.labelPoint,projection,d.labelHeight);};
 const byDept=new Map<string,number>();
 return <View pointerEvents="none" style={[StyleSheet.absoluteFill,{zIndex:2600}]}>
  {callouts.map(c=>{const p=anchor(c.department);return <View key={`${runKey}:c:${c.projectId}:${c.kind}:${c.day}`} style={[styles.calloutSlot,{left:p.x,top:p.y-58}]}>
   <View style={[styles.callout,{borderColor:CALLOUT_TONE[c.kind]}]}><Text style={[styles.calloutText,{color:CALLOUT_TONE[c.kind]}]} numberOfLines={1}>{c.title.toUpperCase()}</Text></View></View>;})}
  {pieces.map((piece,i)=>{const p=anchor(piece.department),n=byDept.get(piece.department)??0;byDept.set(piece.department,n+1);
   return <Bubble key={`${runKey}:${piece.day}:${i}`} piece={piece} from={{x:p.x,y:p.y-30}} to={sink} delay={n*180*speedScale} speedScale={speedScale}/>;})}
 </View>;
}

function Bubble({piece,from,to,delay,speedScale}:{piece:Piece;from:{x:number;y:number};to:{x:number;y:number};delay:number;speedScale:number}){
 const rise=useRef(new Animated.Value(0)).current,travel=useRef(new Animated.Value(0)).current;
 useEffect(()=>{
  const run=Animated.sequence([Animated.delay(delay),
   Animated.timing(rise,{toValue:1,duration:420*speedScale,easing:Easing.out(Easing.quad),useNativeDriver:true}),
   Animated.timing(travel,{toValue:1,duration:520*speedScale,easing:Easing.in(Easing.quad),useNativeDriver:true})]);
  run.start();return ()=>run.stop();
 },[rise,travel,delay,speedScale]);
 const dx=to.x-from.x,dy=to.y-from.y+18;
 const style={opacity:Animated.multiply(rise,travel.interpolate({inputRange:[0,0.8,1],outputRange:[1,0.7,0]})),
  transform:[{translateX:travel.interpolate({inputRange:[0,1],outputRange:[0,dx]})},
   {translateY:Animated.add(rise.interpolate({inputRange:[0,1],outputRange:[0,-18]}),travel.interpolate({inputRange:[0,1],outputRange:[0,dy]}))},
   {scale:travel.interpolate({inputRange:[0,1],outputRange:[piece.accent?1.12:1,0.6]})}]};
 return <Animated.View accessibilityElementsHidden style={[styles.bubble,piece.accent&&styles.accent,{left:from.x,top:from.y},style]}>
  <Text style={[styles.bubbleText,piece.accent&&styles.accentText]}>+{piece.points} {CATEGORY_LABEL[piece.category]}</Text>
 </Animated.View>;
}

const styles=StyleSheet.create({
 bubble:{position:'absolute',marginLeft:-34,paddingHorizontal:7,paddingVertical:3,borderRadius:8,backgroundColor:'rgba(17,29,42,0.94)',borderWidth:1,borderColor:'#63E6A8'},
 accent:{borderColor:'#F2B544',borderWidth:1.5,paddingHorizontal:9,paddingVertical:4},
 bubbleText:{color:'#F6F2E9',fontSize:10,fontWeight:'900',letterSpacing:.4},
 accentText:{color:'#F7D58A',fontSize:12},
 calloutSlot:{position:'absolute',marginLeft:-120,width:240,alignItems:'center'},
 callout:{paddingVertical:3,paddingHorizontal:8,borderRadius:6,borderWidth:1,backgroundColor:'rgba(10,16,25,0.9)'},
 calloutText:{fontSize:9,fontWeight:'900',letterSpacing:.6}
});
