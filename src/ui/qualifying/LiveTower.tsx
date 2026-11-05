import React,{useEffect,useRef} from 'react';
import {Animated,Pressable,Text,View} from 'react-native';
import type {LivePhase,LiveSector,SectorColor,TowerRow} from '../../simulation/qualifying';
import {useReducedMotion} from '../hooks/useReducedMotion';
import {useDesign} from '../design/system';
import {TyreIcon} from './TyreIcon';

const CUT_H=22;
export const PHASE:Record<LivePhase,string>={GARAGE:'In the garage',OUT_LAP:'Out lap',FLYING:'Flying lap',IN_LAP:'In lap',OFF:'Off — lap lost',MISSED:'Missed the flag'};
const TAG:Record<LivePhase,string>={GARAGE:'PIT',OUT_LAP:'OUT LAP',FLYING:'FLYING',IN_LAP:'IN LAP',OFF:'OFF',MISSED:'MISSED'};
const COLOR_WORD:Record<SectorColor,string>={PURPLE:'fastest',GREEN:'personal best',YELLOW:'slower'};

export function useSector(){const {ui}=useDesign();
 return (c:SectorColor)=>({bg:c==='PURPLE'?ui.sectorPurple:c==='GREEN'?ui.sectorGreen:ui.sectorYellow,ink:c==='YELLOW'?ui.onSectorYellow:ui.onSector});
}
export function SectorStrip({sectors,large=false}:{sectors:LiveSector[];large?:boolean}){const {ui,styles}=useDesign(),paint=useSector();
 return <View style={{flexDirection:'row',gap:large?6:3}}>{sectors.map((s,i)=>{const p=s?paint(s.color):null;
  return <View key={i} accessibilityLabel={s?`Sector ${i+1}: ${COLOR_WORD[s.color]}`:`Sector ${i+1}: not yet`}
   style={{...(large?{flex:1,maxWidth:120,height:32}:{width:14,height:8}),borderRadius:3,backgroundColor:p?.bg??ui.chip,alignItems:'center',justifyContent:'center'}}>
   {large?<Text numberOfLines={1} style={[styles.figure,{color:p?.ink??ui.muted,fontSize:12}]}>{s?(s.delta===0?`S${i+1} best`:`S${i+1} +${s.delta.toFixed(3)}`):`S${i+1}`}</Text>:null}</View>;})}</View>;
}
export function SectorLegend(){const {styles}=useDesign(),paint=useSector();
 return <View style={{flexDirection:'row',flexWrap:'wrap',gap:14}}>{(['PURPLE','GREEN','YELLOW'] as const).map(c=><View key={c} style={{flexDirection:'row',alignItems:'center',gap:6}}>
  <View style={{width:16,height:8,borderRadius:2,backgroundColor:paint(c).bg}}/><Text style={styles.muted}>{c==='PURPLE'?'Purple: fastest so far':c==='GREEN'?'Green: personal best':'Yellow: slower than personal best'}</Text></View>)}
  <Text style={styles.muted}>Dimmed: not on a flying lap</Text></View>;
}

/** Column widths. Wide (desktop) shows the full broadcast set; narrow (phone) keeps what fits at 390 pt. */
/** Narrowest tower that fits every wide column (fixed widths + gaps + a minimum status column). */
export const WIDE_TOWER=660;
const COLS={wide:{h:36,pos:34,bar:6,code:54,status:84,gap:80,int:72,last:72,sector:40,tyre:30,move:30},
 narrow:{h:44,pos:24,bar:5,code:42,status:0,gap:70,int:0,last:0,sector:14,tyre:24,move:18}};
type Cols=typeof COLS.wide;

/**
 * The broadcast timing tower. Rows slide to their new place; cars not on a flying lap are dimmed, the player's
 * cars carry a ring, and rivals fighting around the drop zone pulse while flying. Tap (or hover on web) a row to
 * inspect the driver; the tower itself never changes a result.
 */
export function LiveTower({rows,cutoff,finished,focus,wide,selected,onSelect,onHover}:{rows:TowerRow[];cutoff:number|null;finished:boolean;focus:boolean;wide:boolean;
 selected:string|null;onSelect:(id:string)=>void;onHover:(id:string|null)=>void}){
 const {ui,styles}=useDesign(),c=wide?COLS.wide:COLS.narrow;
 const timedAll=rows.filter(r=>r.time!==null).length,early=cutoff!==null&&timedAll<cutoff;
 const shown=focus?rows.filter(r=>r.mine||(early?r.time!==null:cutoff!==null?r.position>=cutoff-2&&r.position<=cutoff+3:r.position<=3)):rows;
 const timed=shown.filter(r=>r.time!==null).length,cutIndex=cutoff===null?null:shown.filter(r=>r.position<=cutoff).length;
 const dividers:Array<{at:number;kind:'CUT'|'NOTIME'}>=[];
 if(!early&&cutIndex!==null&&cutIndex>0&&cutIndex<=timed&&cutIndex<shown.length)dividers.push({at:cutIndex,kind:'CUT'});
 if(timed<shown.length)dividers.push({at:timed,kind:'NOTIME'});
 const y=(i:number)=>i*c.h+dividers.filter(d=>d.at<=i).length*CUT_H;
 const dy=(d:{at:number;kind:string})=>d.at*c.h+dividers.filter(o=>o.at<d.at||(o.at===d.at&&o.kind==='CUT'&&d.kind==='NOTIME')).length*CUT_H;
 const head=(label:string,width:number,align:'left'|'right'|'center'='left')=>width?<Text numberOfLines={1} style={[styles.eyebrow,{width,textAlign:align,fontSize:10,letterSpacing:.6}]}>{label}</Text>:null;
 return <View testID="timing-tower" style={{gap:4}}>
  <View style={{flexDirection:'row',alignItems:'center',gap:8,paddingHorizontal:8}} importantForAccessibility="no-hide-descendants">
   {head('POS',c.pos,'right')}<View style={{width:c.bar}}/>{head('DRIVER',c.code)}{wide?<View style={{flex:1}}>{head('STATUS',c.status)}</View>:<View style={{flex:1}}/>}
   {head(wide?'GAP':'GAP',c.gap,'right')}{head('INT',c.int,'right')}{head('LAST',c.last,'right')}
   {wide?<>{head('S1',c.sector,'center')}{head('S2',c.sector,'center')}{head('S3',c.sector,'center')}</>:head('SECT',c.sector*3+6,'center')}
   {wide?head('TYRE',c.tyre+8,'center'):<View style={{width:c.tyre}}/>}<View style={{width:c.move}}/>
  </View>
  <View style={{height:shown.length*c.h+dividers.length*CUT_H}}>
   {shown.map((r,i)=><TowerRowView key={r.driverId} row={r} top={y(i)} c={c} wide={wide} selected={selected===r.driverId} onSelect={onSelect} onHover={onHover}/>)}
   {dividers.map(d=><View key={d.kind} pointerEvents="none" accessibilityLabel={d.kind==='NOTIME'?'Cars below have no lap time yet':finished?'Knocked out below this line':'Drop zone below this line'}
    style={{position:'absolute',left:0,right:0,top:dy(d),height:CUT_H,flexDirection:'row',alignItems:'center',gap:10}}>
    <View style={{flex:1,height:d.kind==='CUT'?2:1,backgroundColor:d.kind==='CUT'?ui.danger:ui.line}}/>
    <Text style={[styles.eyebrow,{color:d.kind==='CUT'?ui.danger:ui.muted,fontSize:10}]}>{d.kind==='NOTIME'?'NO TIME YET':finished?'KNOCKED OUT BELOW':'KNOCKOUT ZONE'}</Text>
    <View style={{flex:1,height:d.kind==='CUT'?2:1,backgroundColor:d.kind==='CUT'?ui.danger:ui.line}}/></View>)}
  </View>
 </View>;
}

function TowerRowView({row,top:y,c,wide,selected,onSelect,onHover}:{row:TowerRow;top:number;c:Cols;wide:boolean;selected:boolean;onSelect:(id:string)=>void;onHover:(id:string|null)=>void}){
 const {ui,styles}=useDesign(),reduced=useReducedMotion(),paint=useSector();
 const top=useRef(new Animated.Value(y)).current,pulse=useRef(new Animated.Value(1)).current,flash=useRef(new Animated.Value(0)).current;
 useEffect(()=>{if(!row.justFinished)return;flash.setValue(reduced?0:.28);if(!reduced)Animated.timing(flash,{toValue:0,duration:1400,useNativeDriver:false}).start();},[row.justFinished,reduced,flash]);
 useEffect(()=>{if(reduced)top.setValue(y);else Animated.timing(top,{toValue:y,duration:450,useNativeDriver:false}).start();},[y,reduced,top]);
 const pulsing=row.nearCut&&!row.mine&&!reduced;
 useEffect(()=>{
  if(!pulsing){pulse.setValue(1);return;}
  const loop=Animated.loop(Animated.sequence([Animated.timing(pulse,{toValue:.5,duration:500,useNativeDriver:false}),Animated.timing(pulse,{toValue:1,duration:500,useNativeDriver:false})]));
  loop.start();return ()=>loop.stop();
 },[pulsing,pulse]);
 const flying=row.phase==='FLYING',timed=row.time!==null,leader=timed&&row.position===1;
 const statusColor=flying?ui.green:row.phase==='OFF'||row.phase==='MISSED'?ui.danger:ui.muted;
 const lastColor=row.last?.kind==='PB'?ui.green:row.last?.kind==='OFF'?ui.danger:ui.gold;
 const fig=(width:number,text:string|null,color=ui.ink,bold=false)=>width?<Text numberOfLines={1} style={[styles.figure,{width,textAlign:'right',color,fontSize:wide?14:13},bold&&ui.fonts.monoBold?{fontFamily:ui.fonts.monoBold}:null]}>{text??''}</Text>:null;
 const display=(size:number)=>ui.fonts.display?{fontFamily:ui.fonts.display,fontSize:size}:{fontWeight:'900' as const,fontSize:size-4};
 return <Animated.View style={{position:'absolute',left:0,right:0,top,height:c.h,opacity:Animated.multiply(pulse,row.mine||flying?1:.5)}}>
  <Pressable accessibilityRole="button" accessibilityState={{selected}}
   accessibilityLabel={`${timed?`P${row.position}`:'No time'} ${row.name}, ${row.team}${row.mine?', your car':''}${timed?`, ${row.gap}`:''}, ${PHASE[row.phase]}${row.moved>0?`, up ${row.moved}`:row.moved<0?`, down ${-row.moved}`:''}${row.nearCut?', fighting at the drop zone':''}`}
   onPress={()=>onSelect(row.driverId)} onHoverIn={()=>onHover(row.driverId)} onHoverOut={()=>onHover(null)}
   style={state=>({flex:1,flexDirection:'row',alignItems:'center',gap:8,paddingHorizontal:8,borderRadius:5,marginVertical:1,
    backgroundColor:row.mine?ui.surfaceElevated:row.nearCut?ui.accentMuted:(state as {hovered?:boolean}).hovered?ui.chip:'transparent',
    borderWidth:row.mine||selected?2:0,borderColor:selected?ui.ink:row.color})}>
   <Animated.View pointerEvents="none" style={{position:'absolute',left:0,right:0,top:0,bottom:0,borderRadius:5,backgroundColor:ui.ink,opacity:flash}}/>
   <Text style={{width:c.pos,textAlign:'right',color:timed?ui.ink:ui.muted,...display(wide?22:20)}}>{timed?row.position:'–'}</Text>
   <View style={{width:c.bar,height:c.h-14,borderRadius:2,backgroundColor:row.color}}/>
   <Text numberOfLines={1} style={{width:c.code,color:ui.ink,letterSpacing:1,...display(wide?22:20)}}>{row.code}</Text>
   <View style={{flex:1,minWidth:0}}>{wide||row.phase!=='GARAGE'?<Text numberOfLines={1} style={[styles.eyebrow,{color:statusColor,fontSize:wide?11:9,letterSpacing:1}]}>{TAG[row.phase]}</Text>:null}</View>
   {leader
    ?<View style={{width:c.gap,alignItems:'flex-end'}}><Text style={[styles.figure,{color:ui.onSector,backgroundColor:ui.sectorPurple,borderRadius:4,paddingHorizontal:5,fontSize:wide?13:12},ui.fonts.monoBold?{fontFamily:ui.fonts.monoBold}:null]}>{wide?'FASTEST':'P1'}</Text></View>
    :fig(c.gap,timed?row.gap:'NO TIME',timed?ui.ink:ui.muted,row.mine||row.justFinished)}
   {fig(c.int,row.interval,ui.muted)}
   {fig(c.last,row.last?.text??null,lastColor)}
   {wide?row.sectors.map((s,i)=><View key={i} accessibilityLabel={s?`Sector ${i+1}: ${COLOR_WORD[s.color]}`:`Sector ${i+1}: not yet`}
     style={{width:c.sector,height:12,borderRadius:3,backgroundColor:s?paint(s.color).bg:ui.chip}}/>)
    :<View style={{width:c.sector*3+6,flexDirection:'row',gap:3}}>{row.sectors.map((s,i)=><View key={i} style={{width:c.sector,height:10,borderRadius:2,backgroundColor:s?paint(s.color).bg:ui.chip}}/>)}</View>}
   <View style={{width:c.tyre+(wide?8:0),alignItems:'center'}}><TyreIcon tyre={row.tyre} size={c.tyre}/></View>
   <Text style={[styles.figure,{width:c.move,textAlign:'center',fontSize:wide?12:11,color:row.moved>0?ui.green:row.moved<0?ui.danger:ui.muted}]}>
    {row.moved>0?`▲${wide?row.moved:''}`:row.moved<0?`▼${wide?-row.moved:''}`:wide?'–':''}</Text>
  </Pressable>
 </Animated.View>;
}
