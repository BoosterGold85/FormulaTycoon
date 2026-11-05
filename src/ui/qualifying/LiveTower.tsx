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
   style={{...(large?{flex:1,maxWidth:120,height:32}:{width:14,height:8}),borderRadius:3,backgroundColor:p?.bg??ui.chip,alignItems:'center',justifyContent:'center'}}>
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
 const shown=focus?rows.filter(r=>r.mine||(cutoff!==null?r.position>=cutoff-2&&r.position<=cutoff+3:r.position<=3)):rows;
 const cutIndex=cutoff===null?null:shown.filter(r=>r.position<=cutoff).length;
 const line=cutIndex!==null&&cutIndex>0&&cutIndex<shown.length;
 const y=(i:number)=>i*ROW_H+(line&&i>=cutIndex!?CUT_H:0);
 return <View testID="timing-tower" style={{height:shown.length*ROW_H+(line?CUT_H:0),borderTopWidth:1,borderTopColor:ui.line}}>
  {shown.map((r,i)=><TowerRowView key={r.driverId} row={r} top={y(i)}/>)}
  {line?<View pointerEvents="none" accessibilityLabel={finished?'Knocked out below this line':'Drop zone below this line'} style={{position:'absolute',left:0,right:0,top:cutIndex!*ROW_H,height:CUT_H,flexDirection:'row',alignItems:'center',gap:8}}>
   <View style={{flex:1,height:3,backgroundColor:ui.danger}}/><Text style={[styles.eyebrow,{color:ui.danger,fontSize:10}]}>{finished?'KNOCKED OUT BELOW':'DROP ZONE'}</Text><View style={{width:24,height:3,backgroundColor:ui.danger}}/></View>:null}
 </View>;
}
function TowerRowView({row,top:y}:{row:TowerRow;top:number}){
 const {ui,styles,teamInk}=useDesign(),reduced=useReducedMotion();
 const top=useRef(new Animated.Value(y)).current,pulse=useRef(new Animated.Value(1)).current;
 useEffect(()=>{if(reduced)top.setValue(y);else Animated.timing(top,{toValue:y,duration:450,useNativeDriver:false}).start();},[y,reduced,top]);
 const pulsing=row.nearCut&&!row.mine&&!reduced;
 useEffect(()=>{
  if(!pulsing){pulse.setValue(1);return;}
  const loop=Animated.loop(Animated.sequence([Animated.timing(pulse,{toValue:.45,duration:500,useNativeDriver:false}),Animated.timing(pulse,{toValue:1,duration:500,useNativeDriver:false})]));
  loop.start();return ()=>loop.stop();
 },[pulsing,pulse]);
 const flying=row.phase==='FLYING';
 const tag=flying?'FLYING':row.phase==='OUT_LAP'?'OUT LAP':row.phase==='IN_LAP'?'IN LAP':row.phase==='OFF'?'OFF':null;
 return <Animated.View accessibilityLabel={`P${row.position} ${row.name}, ${row.team}, ${row.gap}, ${PHASE[row.phase]}${row.nearCut?', fighting at the drop zone':''}`}
  style={{position:'absolute',left:0,right:0,top,height:ROW_H,flexDirection:'row',alignItems:'center',gap:8,paddingHorizontal:8,borderBottomWidth:1,borderBottomColor:ui.line,
   backgroundColor:row.mine?ui.accentMuted:row.nearCut?ui.surfaceElevated:'transparent',borderLeftWidth:row.mine?5:3,borderLeftColor:row.mine?ui.accent:row.justFinished?ui.gold:'transparent',
   opacity:Animated.multiply(pulse,row.mine||flying?1:.42)}}>
  <Text style={{width:22,color:ui.ink,fontWeight:'900',textAlign:'right'}}>{row.position}</Text>
  <View style={{width:4,height:ROW_H-16,borderRadius:2,backgroundColor:row.color}}/>
  <View style={{flex:1,minWidth:0}}><Text numberOfLines={1} style={{color:ui.ink,fontWeight:row.mine?'900':'700',fontSize:row.mine?14:13}}>{row.name}</Text>
   <Text numberOfLines={1} style={{color:teamInk(row.color),fontSize:11,fontWeight:'700'}}>{row.team}{tag?` · ${tag}`:''}</Text></View>
  <SectorStrip sectors={row.sectors}/>
  <Text style={[styles.body,{fontVariant:['tabular-nums'],fontWeight:row.justFinished||row.mine?'900':'700',minWidth:66,textAlign:'right',color:row.time===null?ui.muted:ui.ink}]}>{row.gap}</Text>
 </Animated.View>;
}
