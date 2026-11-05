import React,{useEffect,useRef} from 'react';
import {Animated,Text,View} from 'react-native';
import type {LivePhase,LiveSector,SectorColor,TowerRow} from '../../simulation/qualifying';
import {useReducedMotion} from '../hooks/useReducedMotion';
import {useDesign} from '../design/system';

export const ROW_H=44;
const CUT_H=22;
export const PHASE:Record<LivePhase,string>={GARAGE:'In the garage',OUT_LAP:'Out lap',FLYING:'Flying lap',IN_LAP:'In lap',OFF:'Off — lap lost',MISSED:'Missed the flag'};
const COLOR_WORD:Record<SectorColor,string>={PURPLE:'fastest',GREEN:'personal best',YELLOW:'slower'};

export function useSector(){const {ui}=useDesign();
 return (c:SectorColor)=>({bg:c==='PURPLE'?ui.sectorPurple:c==='GREEN'?ui.sectorGreen:ui.sectorYellow,ink:c==='YELLOW'?ui.onSectorYellow:ui.onSector});
}
export function SectorStrip({sectors,large=false}:{sectors:LiveSector[];large?:boolean}){const {ui}=useDesign(),paint=useSector();
 return <View style={{flexDirection:'row',gap:large?6:3}}>{sectors.map((s,i)=>{const p=s?paint(s.color):null;
  return <View key={i} accessibilityLabel={s?`Sector ${i+1}: ${COLOR_WORD[s.color]}`:`Sector ${i+1}: not yet`}
   style={{...(large?{flex:1,maxWidth:120,height:32}:{width:14,height:8}),borderRadius:3,backgroundColor:p?.bg??ui.border,alignItems:'center',justifyContent:'center'}}>
   {large?<Text numberOfLines={1} style={{color:p?.ink??ui.muted,fontSize:12,fontWeight:'900',fontVariant:['tabular-nums']}}>{s?(s.delta===0?`S${i+1}  best`:`S${i+1}  +${s.delta.toFixed(3)}`):`S${i+1}`}</Text>:null}</View>;})}</View>;
}
export function SectorLegend(){const {styles}=useDesign(),paint=useSector();
 return <View style={{flexDirection:'row',flexWrap:'wrap',gap:12}}>{(['PURPLE','GREEN','YELLOW'] as const).map(c=><View key={c} style={{flexDirection:'row',alignItems:'center',gap:5}}>
  <View style={{width:14,height:8,borderRadius:2,backgroundColor:paint(c).bg}}/><Text style={styles.muted}>{c==='PURPLE'?'Purple: fastest so far':c==='GREEN'?'Green: personal best':'Yellow: slower than personal best'}</Text></View>)}</View>;
}

/**
 * The timing tower. Rows slide to their new place; only cars on a flying lap are at full strength, the
 * player's cars are always loudest, and rivals fighting around the drop zone pulse while they're flying.
 */
export function LiveTower({rows,cutoff,finished,focus}:{rows:TowerRow[];cutoff:number|null;finished:boolean;focus:boolean}){
 const {ui,styles}=useDesign();
 // Focus: the battle around the cut once enough cars have times; before that, the timing board so far.
 const timedAll=rows.filter(r=>r.time!==null).length,early=cutoff!==null&&timedAll<cutoff;
 const shown=focus?rows.filter(r=>r.mine||(early?r.time!==null:cutoff!==null?r.position>=cutoff-2&&r.position<=cutoff+3:r.position<=3)):rows;
 // Dividers: the drop zone (only between timed cars) and the start of the "no time yet" group.
 const timed=shown.filter(r=>r.time!==null).length,cutIndex=cutoff===null?null:shown.filter(r=>r.position<=cutoff).length;
 const dividers:Array<{at:number;kind:'CUT'|'NOTIME'}>=[];
 if(!early&&cutIndex!==null&&cutIndex>0&&cutIndex<=timed&&cutIndex<shown.length)dividers.push({at:cutIndex,kind:'CUT'});
 if(timed<shown.length)dividers.push({at:timed,kind:'NOTIME'});
 const y=(i:number)=>i*ROW_H+dividers.filter(d=>d.at<=i).length*CUT_H;
 const dy=(d:{at:number;kind:string})=>d.at*ROW_H+dividers.filter(o=>o.at<d.at||(o.at===d.at&&o.kind==='CUT'&&d.kind==='NOTIME')).length*CUT_H;
 return <View testID="timing-tower" style={{height:shown.length*ROW_H+dividers.length*CUT_H,borderTopWidth:1,borderTopColor:ui.line}}>
  {shown.map((r,i)=><TowerRowView key={r.driverId} row={r} top={y(i)}/>)}
  {dividers.map(d=><View key={d.kind} pointerEvents="none" accessibilityLabel={d.kind==='NOTIME'?'Cars below have no lap time yet':finished?'Knocked out below this line':'Drop zone below this line'}
   style={{position:'absolute',left:0,right:0,top:dy(d),height:CUT_H,flexDirection:'row',alignItems:'center',gap:8}}>
   <View style={{flex:1,height:d.kind==='CUT'?3:1,backgroundColor:d.kind==='CUT'?ui.danger:ui.line}}/>
   <Text style={[styles.eyebrow,{color:d.kind==='CUT'?ui.danger:ui.muted,fontSize:10}]}>{d.kind==='NOTIME'?'NO TIME YET':finished?'KNOCKED OUT BELOW':'DROP ZONE'}</Text>
   <View style={{width:24,height:d.kind==='CUT'?3:1,backgroundColor:d.kind==='CUT'?ui.danger:ui.line}}/></View>)}
 </View>;
}
function TowerRowView({row,top:y}:{row:TowerRow;top:number}){
 const {ui,styles,teamInk}=useDesign(),reduced=useReducedMotion();
 const top=useRef(new Animated.Value(y)).current,pulse=useRef(new Animated.Value(1)).current,flash=useRef(new Animated.Value(0)).current;
 // A finished lap flashes the row once instead of leaving a lasting marker.
 useEffect(()=>{if(!row.justFinished)return;flash.setValue(reduced?0:.55);if(!reduced)Animated.timing(flash,{toValue:0,duration:1400,useNativeDriver:false}).start();},[row.justFinished,reduced,flash]);
 useEffect(()=>{if(reduced)top.setValue(y);else Animated.timing(top,{toValue:y,duration:450,useNativeDriver:false}).start();},[y,reduced,top]);
 const pulsing=row.nearCut&&!row.mine&&!reduced;
 useEffect(()=>{
  if(!pulsing){pulse.setValue(1);return;}
  const loop=Animated.loop(Animated.sequence([Animated.timing(pulse,{toValue:.45,duration:500,useNativeDriver:false}),Animated.timing(pulse,{toValue:1,duration:500,useNativeDriver:false})]));
  loop.start();return ()=>loop.stop();
 },[pulsing,pulse]);
 const flying=row.phase==='FLYING';
 const tag=flying?'FLYING':row.phase==='OUT_LAP'?'OUT LAP':row.phase==='IN_LAP'?'IN LAP':row.phase==='OFF'?'OFF':null;
 return <Animated.View accessibilityLabel={`${row.time===null?'No time':`P${row.position}`} ${row.name}, ${row.team}${row.time===null?'':`, ${row.gap}`}, ${PHASE[row.phase]}${row.nearCut?', fighting at the drop zone':''}`}
  style={{position:'absolute',left:0,right:0,top,height:ROW_H,flexDirection:'row',alignItems:'center',gap:8,paddingHorizontal:8,borderBottomWidth:1,borderBottomColor:ui.line,
   backgroundColor:row.mine?ui.accentMuted:row.nearCut?ui.surfaceElevated:'transparent',borderLeftWidth:row.mine?5:3,borderLeftColor:row.mine?ui.accent:'transparent',
   opacity:Animated.multiply(pulse,row.mine||flying?1:.42)}}>
  <Animated.View pointerEvents="none" style={{position:'absolute',left:0,right:0,top:0,bottom:0,backgroundColor:ui.gold,opacity:flash}}/>
  <Text style={{width:22,color:row.time===null?ui.muted:ui.ink,fontWeight:'900',textAlign:'right'}}>{row.time===null?'–':row.position}</Text>
  <View style={{width:4,height:ROW_H-16,borderRadius:2,backgroundColor:row.color}}/>
  <View style={{flex:1,minWidth:0}}><Text numberOfLines={1} style={{color:ui.ink,fontWeight:row.mine?'900':'700',fontSize:row.mine?14:13}}>{row.name}</Text>
   <Text numberOfLines={1} style={{color:teamInk(row.color),fontSize:11,fontWeight:'700'}}>{row.team}{tag?` · ${tag}`:''}</Text></View>
  {row.time!==null||row.sectors.some(Boolean)?<SectorStrip sectors={row.sectors}/>:null}
  <Text style={[styles.body,{fontVariant:['tabular-nums'],fontWeight:row.justFinished||row.mine?'900':'700',minWidth:66,textAlign:'right',color:row.time===null?ui.muted:ui.ink}]}>{row.gap}</Text>
 </Animated.View>;
}
