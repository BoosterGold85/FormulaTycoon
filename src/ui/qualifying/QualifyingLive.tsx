import React,{useMemo,useState} from 'react';
import {Pressable,Text,View} from 'react-native';
import type {NavTab} from '../../game/hudPlaceholders';
import type {GameDefinition,GameUniverse} from '../../simulation/universe';
import {BEATS_PER_MINUTE,CALL_LABEL,SEGMENTS,TYRE_LABEL,activeBeats,liveTiming,replayTarget,segmentAtBeat,selectQualifyingCall,wetLabel,
 type Call,type CallAction,type LivePhase,type LiveSector,type SectorColor,type TowerRow,type Tyre} from '../../simulation/qualifying';
import {useSessionReplay} from '../hooks/useSessionReplay';
import {Action,Card,Chip,Screen,Section,Segmented,useDesign} from '../design/system';

type Props={universe:GameUniverse;definition:GameDefinition;eventId:string;from:number;onBeat:(b:number)=>void;
 onCall:(calls:Record<string,Call>)=>void;onFinish:()=>void;onNavigate:(tab:NavTab)=>void};
const PHASE:Record<LivePhase,string>={GARAGE:'In the garage',OUT_LAP:'Out lap',FLYING:'Flying lap',IN_LAP:'In lap',OFF:'Off — lap lost',MISSED:'Missed the flag'};
const COLOR_WORD:Record<SectorColor,string>={PURPLE:'fastest',GREEN:'personal best',YELLOW:'slower'};

/** Live view: replays the stored session sector by sector up to the open call (or the flag). */
export function QualifyingLive({universe,definition,eventId,from,onBeat,onCall,onFinish,onNavigate}:Props){
 const {ui,styles}=useDesign();
 const session=universe.qualifying!.sessions[eventId]!,target=replayTarget(session)*BEATS_PER_MINUTE;
 const active=useMemo(()=>activeBeats(session),[session]);
 const replay=useSessionReplay(target,from,b=>active.has(b),onBeat);
 const live=liveTiming(universe,session,replay.beat);
 const call=!replay.playing&&session.status!=='COMPLETE'?selectQualifyingCall(universe,definition):null;
 const done=!replay.playing&&session.status==='COMPLETE';
 const mine=live.rows.filter(r=>r.mine);
 return <Screen title={`Qualifying · ${live.segment}`} kicker="SATURDAY · LIVE TIMING" subtitle={live.finished?`${live.segment} complete`:`${live.remaining} min left · ${wetLabel(live.track.wet)}`} tab="HQ" onNavigate={onNavigate}>
  <View style={[styles.between,{flexWrap:'wrap'}]}>
   <View style={{flexDirection:'row',gap:6}}>{SEGMENTS.map(s=>{const i=SEGMENTS.indexOf(s),cur=SEGMENTS.indexOf(segmentAtBeat(replay.beat));
    return <Chip key={s} text={s} tone={i===cur?'accent':i<cur?'green':'muted'}/>;})}</View>
   <View style={{flexDirection:'row',gap:6}} accessibilityLabel="Replay speed">
    {([1,2] as const).map(sp=><Pressable key={sp} accessibilityRole="button" accessibilityLabel={`Replay at ${sp}x`} accessibilityState={{selected:replay.speed===sp}} onPress={()=>replay.setSpeed(sp)}
     style={{minWidth:44,minHeight:44,borderRadius:5,borderWidth:1,borderColor:replay.speed===sp?ui.accent:ui.line,alignItems:'center',justifyContent:'center'}}><Text style={{color:ui.ink,fontWeight:'800'}}>{sp}×</Text></Pressable>)}
    <Pressable accessibilityRole="button" accessibilityLabel="Skip to the next call" disabled={!replay.playing} onPress={replay.skip}
     style={{minWidth:64,minHeight:44,borderRadius:5,borderWidth:1,borderColor:ui.line,alignItems:'center',justifyContent:'center',opacity:replay.playing?1:.4}}><Text style={{color:ui.ink,fontWeight:'800'}}>SKIP</Text></Pressable>
   </View>
  </View>
  <View accessibilityLabel={`Track: ${wetLabel(live.track.wet)}`} style={{height:6,borderRadius:3,backgroundColor:ui.chip,overflow:'hidden'}}>
   <View style={{width:`${Math.round(live.track.wet*100)}%`,height:6,backgroundColor:ui.gold}}/></View>
  {call?<CallCard model={call} onCall={onCall}/>:null}
  {done?<Card accent={ui.green}><Text accessibilityRole="header" style={styles.heading}>Chequered flag</Text><Text style={styles.body}>The grid is set. See how your drivers did and why.</Text>
   <Action label="SEE THE RESULT" onPress={onFinish}/></Card>:null}
  {!call&&!done?<View testID="your-cars" style={{gap:8}}>
   <Section title="Your cars"/>
   {mine.map(r=><MyCar key={r.driverId} row={r} cutoff={live.cutoff}/>)}
   <View testID="live-feed" style={{minHeight:72,gap:3,borderLeftWidth:3,borderLeftColor:ui.gold,paddingLeft:10}}>
    {live.feed.length?live.feed.map((f,i)=><Text key={f+i} style={i===0?[styles.body,{fontWeight:'800'}]:styles.muted}>{f}</Text>):<Text style={styles.muted}>Cars are leaving the pit lane.</Text>}
   </View>
  </View>:null}
  <View testID="timing-tower" style={{borderTopWidth:1,borderTopColor:ui.line}}>
   {live.rows.map((r,i)=><React.Fragment key={r.driverId}>
    {live.cutoff!==null&&i===live.cutoff?<Text style={[styles.eyebrow,{color:ui.danger,paddingVertical:4}]}>{live.finished?'KNOCKED OUT':'KNOCKOUT ZONE'}</Text>:null}
    <TowerLine row={r}/>
   </React.Fragment>)}
  </View>
  <SectorLegend/>
  <Text style={styles.muted}>Times are shown as gaps. This replays the session your team has already run; replay speed and Skip don't change it.</Text>
 </Screen>;
}

function useSector(){const {ui}=useDesign();
 return (c:SectorColor)=>({bg:c==='PURPLE'?ui.sectorPurple:c==='GREEN'?ui.sectorGreen:ui.sectorYellow,ink:c==='YELLOW'?ui.onSectorYellow:ui.onSector});
}
function SectorStrip({sectors,large=false}:{sectors:LiveSector[];large?:boolean}){const {ui}=useDesign(),paint=useSector();
 return <View style={{flexDirection:'row',gap:large?6:3}}>{sectors.map((s,i)=>{const p=s?paint(s.color):null;
  return <View key={i} accessibilityLabel={s?`Sector ${i+1}: ${COLOR_WORD[s.color]}`:`Sector ${i+1}: not yet`}
   style={{...(large?{flex:1,maxWidth:120,height:32}:{width:14,height:8}),borderRadius:3,backgroundColor:p?.bg??ui.chip,alignItems:'center',justifyContent:'center'}}>
   {large?<Text numberOfLines={1} style={{color:p?.ink??ui.muted,fontSize:12,fontWeight:'900',fontVariant:['tabular-nums']}}>{s?(s.delta===0?`S${i+1}  best`:`S${i+1}  +${s.delta.toFixed(3)}`):`S${i+1}`}</Text>:null}</View>;})}</View>;
}
function MyCar({row,cutoff}:{row:TowerRow;cutoff:number|null}){const {ui,styles}=useDesign();
 return <View accessibilityLabel={`${row.name}, ${PHASE[row.phase]}, P${row.position}, ${row.gap}`} style={{gap:6,padding:10,borderRadius:6,backgroundColor:ui.accentMuted}}>
  <View style={styles.between}><Text style={[styles.body,{fontWeight:'900'}]}>{row.name}</Text>
   <Chip text={row.time===null?'NO TIME':`P${row.position}${cutoff!==null&&row.position>cutoff?' · IN DANGER':''}`} tone={row.time===null||(cutoff!==null&&row.position>cutoff)?'red':'green'}/></View>
  <View style={[styles.between,{flexWrap:'wrap'}]}><Text style={[styles.muted,{fontWeight:'800'}]}>{PHASE[row.phase].toUpperCase()}</Text><Text style={styles.muted}>{row.gap}</Text></View>
  <SectorStrip sectors={row.sectors} large/>
 </View>;
}
function TowerLine({row}:{row:TowerRow}){const {ui,styles,teamInk}=useDesign();
 const tag=row.phase==='FLYING'?'FLYING':row.phase==='OUT_LAP'?'OUT LAP':row.phase==='IN_LAP'?'IN LAP':row.phase==='OFF'?'OFF':null;
 return <View accessibilityLabel={`P${row.position} ${row.name}, ${row.team}, ${row.gap}, ${PHASE[row.phase]}`}
  style={{flexDirection:'row',alignItems:'center',gap:8,minHeight:42,paddingHorizontal:8,borderBottomWidth:1,borderBottomColor:ui.line,
   backgroundColor:row.mine?ui.accentMuted:'transparent',borderLeftWidth:3,borderLeftColor:row.justFinished?ui.gold:'transparent',opacity:row.out?.6:1}}>
  <Text style={{width:22,color:ui.ink,fontWeight:'900',textAlign:'right'}}>{row.position}</Text>
  <View style={{width:4,alignSelf:'stretch',marginVertical:8,borderRadius:2,backgroundColor:row.color}}/>
  <View style={{flex:1,minWidth:0}}><Text numberOfLines={1} style={{color:ui.ink,fontWeight:row.mine?'900':'700',fontSize:13}}>{row.name}</Text>
   <Text numberOfLines={1} style={{color:teamInk(row.color),fontSize:11,fontWeight:'700'}}>{row.team}{tag?` · ${tag}`:''}</Text></View>
  <SectorStrip sectors={row.sectors}/>
  <Text style={[styles.body,{fontVariant:['tabular-nums'],fontWeight:row.justFinished?'900':'700',minWidth:66,textAlign:'right',color:row.time===null?ui.muted:ui.ink}]}>{row.gap}</Text>
 </View>;
}
function SectorLegend(){const {styles}=useDesign(),paint=useSector();
 return <View style={{flexDirection:'row',flexWrap:'wrap',gap:12}}>{(['PURPLE','GREEN','YELLOW'] as const).map(c=><View key={c} style={{flexDirection:'row',alignItems:'center',gap:5}}>
  <View style={{width:14,height:8,borderRadius:2,backgroundColor:paint(c).bg}}/><Text style={styles.muted}>{c==='PURPLE'?'Purple: fastest so far':c==='GREEN'?'Green: personal best':'Yellow: slower than personal best'}</Text></View>)}</View>;
}

function CallCard({model,onCall}:{model:NonNullable<ReturnType<typeof selectQualifyingCall>>;onCall:(c:Record<string,Call>)=>void}){
 const {ui,styles}=useDesign();
 const [calls,setCalls]=useState<Record<string,Call>>(()=>Object.fromEntries(model.drivers.map(d=>[d.driverId,d.recommended])));
 const actions:CallAction[]=['PLAN','GO_NOW','GO_LATE','STAY_IN'];
 return <Card hero accent={ui.gold}>
  <Text style={[styles.eyebrow,{color:ui.gold}]}>PIT WALL CALL · {model.segment} · {model.remaining} MIN LEFT</Text>
  <Text style={styles.body}>Track: {model.track.label}, {model.track.trend}. Forecast: {model.forecast.headline.toLowerCase()} ({model.forecast.confidence.toLowerCase()}).</Text>
  {model.drivers.map(d=>{const c=calls[d.driverId]!;const rec=d.recommended;
   const tyres:Array<Tyre|'KEEP'>=['KEEP',...(['INTER','NEW_SOFT'] as const).filter(t=>t!==d.plannedTyre)];
   return <View key={d.driverId} style={{gap:8,borderTopWidth:1,borderTopColor:ui.line,paddingTop:10}}>
    <View style={styles.between}><Text style={[styles.body,{fontWeight:'900'}]}>{d.name}</Text>
     <Chip text={d.position===null?'NO TIME':`P${d.position}${d.danger?' · IN DANGER':''}`} tone={d.position===null||d.danger?'red':'green'}/></View>
    <Text style={styles.muted}>{d.position===null?'No lap time yet':`Gap ${d.gap}`}{model.cutoff?` · top ${model.cutoff} go through`:''} · {d.newSoftsLeft} new softs left · {d.plannedRunsLeft} planned {d.plannedRunsLeft===1?'run':'runs'} left</Text>
    <Segmented label="Call" value={c.action} onChange={action=>setCalls(p=>({...p,[d.driverId]:{...p[d.driverId]!,action}}))}
     options={actions.map(a=>({value:a,label:CALL_LABEL[a],note:a===rec.action?'Recommended':undefined}))}/>
    {model.track.tyreChoice?<Segmented label="Tyres for the rest of the segment" value={c.tyre??'KEEP'} onChange={t=>setCalls(p=>{const {tyre:_old,...rest}=p[d.driverId]!;return {...p,[d.driverId]:t==='KEEP'?rest:{...rest,tyre:t}};})}
     options={tyres.map(t=>({value:t,label:t==='KEEP'?`As planned (${TYRE_LABEL[d.plannedTyre]})`:TYRE_LABEL[t],note:(rec.tyre??'KEEP')===t?'Recommended':undefined}))}/>:null}
   </View>;})}
  <Action label="SEND CALLS" onPress={()=>onCall(calls)}/>
 </Card>;
}
