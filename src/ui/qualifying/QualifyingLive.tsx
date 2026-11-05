import React,{useMemo,useState} from 'react';
import {Pressable,Text,View} from 'react-native';
import type {NavTab} from '../../game/hudPlaceholders';
import type {GameDefinition,GameUniverse} from '../../simulation/universe';
import {BEATS_PER_MINUTE,CALL_LABEL,FORMAT,SEGMENTS,TYRE_LABEL,activeBeats,breakOf,liveTiming,replayTarget,segmentAtBeat,segmentOf,selectQualifyingCall,wetLabel,
 type Call,type CallAction,type Segment,type SegmentPlan,type TowerRow,type Tyre} from '../../simulation/qualifying';
import {useSessionReplay,type ReplaySpeed} from '../hooks/useSessionReplay';
import {Action,Card,Chip,Screen,Section,Segmented,useDesign} from '../design/system';
import {BreakCard} from './BreakCard';
import {Commentary} from './Commentary';
import {LiveTower,PHASE,SectorLegend,SectorStrip} from './LiveTower';

type Props={universe:GameUniverse;definition:GameDefinition;eventId:string;from:number;onBeat:(b:number)=>void;
 /** Breaks the player has already continued from (presentation memory for this app session). */
 acked:number[];onAck:(beat:number)=>void;
 onCall:(calls:Record<string,Call>)=>void;onContinueBreak:(plans:Record<string,SegmentPlan>)=>void;onFinish:()=>void;onNavigate:(tab:NavTab)=>void};
/** End-of-part beats: Q1 and Q2 always stop here, whether or not the session itself is waiting. */
const BREAK_BEATS:Array<{beat:number;done:Segment;next:Segment}>=[{beat:FORMAT.Q2.offset*BEATS_PER_MINUTE,done:'Q1',next:'Q2'},{beat:FORMAT.Q3.offset*BEATS_PER_MINUTE,done:'Q2',next:'Q3'}];

/** Live view: replays the stored session sector by sector, stopping at every call and break. */
export function QualifyingLive({universe,definition,eventId,from,onBeat,acked,onAck,onCall,onContinueBreak,onFinish,onNavigate}:Props){
 const {ui,styles}=useDesign();
 const session=universe.qualifying!.sessions[eventId]!,engineTarget=replayTarget(session)*BEATS_PER_MINUTE;
 const [seen,setSeen]=useState(acked);
 const pendingBreak=BREAK_BEATS.find(b=>b.beat<=engineTarget&&!seen.includes(b.beat));
 const target=pendingBreak?.beat??engineTarget;
 const active=useMemo(()=>activeBeats(session),[session]);
 const replay=useSessionReplay(target,from,b=>active.has(b),onBeat);
 const live=liveTiming(universe,session,replay.beat);
 const [focus,setFocus]=useState(false);
 const atBreak=!replay.playing&&!!pendingBreak&&replay.beat===pendingBreak.beat;
 const engineBreak=atBreak&&breakOf(session.status)?.done===pendingBreak!.done;
 const call=!replay.playing&&!atBreak&&segmentOf(session.status)?selectQualifyingCall(universe,definition):null;
 const done=!replay.playing&&!atBreak&&session.status==='COMPLETE';
 const mine=live.rows.filter(r=>r.mine),teamColor=mine[0]?.color??ui.accent;
 const names=Object.fromEntries(live.rows.map(r=>[r.driverId,r.name]));
 const breakPlans:Record<string,SegmentPlan>=engineBreak?Object.fromEntries(mine.filter(r=>r.position<=FORMAT[pendingBreak!.done].cars-FORMAT[pendingBreak!.done].out).map(r=>[r.driverId,session.plans[r.driverId]![pendingBreak!.next]])):{};
 const continueBreak=(plans:Record<string,SegmentPlan>)=>{const b=pendingBreak!.beat;
  if(engineBreak){const changed=Object.fromEntries(Object.entries(plans).filter(([id,p])=>JSON.stringify(p)!==JSON.stringify(breakPlans[id])));onContinueBreak(changed);}
  setSeen(s=>[...s,b]);onAck(b);};
 return <Screen title={`Qualifying · ${live.segment}`} kicker="SATURDAY · LIVE TIMING" subtitle={live.finished?`${live.segment} complete`:`${live.remaining} min left · ${wetLabel(live.track.wet)}`} tab="HQ" onNavigate={onNavigate}>
  <View style={[styles.between,{flexWrap:'wrap'}]}>
   <View style={{flexDirection:'row',gap:6}}>{SEGMENTS.map(s=>{const i=SEGMENTS.indexOf(s),cur=SEGMENTS.indexOf(segmentAtBeat(replay.beat));
    return <Chip key={s} text={s} tone={i===cur?'accent':i<cur?'green':'muted'}/>;})}</View>
   <View style={{flexDirection:'row',gap:6,flexWrap:'wrap'}} accessibilityLabel="Replay controls">
    {([1,2,4] as ReplaySpeed[]).map(sp=><Pressable key={sp} accessibilityRole="button" accessibilityLabel={`Replay at ${sp}x`} accessibilityState={{selected:replay.speed===sp}} onPress={()=>replay.setSpeed(sp)}
     style={{minWidth:44,minHeight:44,borderRadius:5,borderWidth:1,borderColor:replay.speed===sp?ui.accent:ui.line,alignItems:'center',justifyContent:'center'}}><Text style={{color:ui.ink,fontWeight:'800'}}>{sp}×</Text></Pressable>)}
    <Pressable accessibilityRole="button" accessibilityLabel="Skip to the next stop" disabled={!replay.playing} onPress={replay.skip}
     style={{minWidth:58,minHeight:44,borderRadius:5,borderWidth:1,borderColor:ui.line,alignItems:'center',justifyContent:'center',opacity:replay.playing?1:.4}}><Text style={{color:ui.ink,fontWeight:'800'}}>SKIP</Text></Pressable>
    <Pressable accessibilityRole="switch" accessibilityLabel="Focus mode: only your cars and the drop-zone battle" accessibilityState={{checked:focus}} onPress={()=>setFocus(f=>!f)}
     style={{minWidth:64,minHeight:44,paddingHorizontal:8,borderRadius:5,borderWidth:1,borderColor:focus?ui.accent:ui.line,backgroundColor:focus?ui.accent:'transparent',alignItems:'center',justifyContent:'center'}}>
     <Text style={{color:focus?ui.onAccent:ui.ink,fontWeight:'800'}}>FOCUS</Text></Pressable>
   </View>
  </View>
  <View accessibilityLabel={`Track: ${wetLabel(live.track.wet)}`} style={{height:6,borderRadius:3,backgroundColor:ui.chip,overflow:'hidden'}}>
   <View style={{width:`${Math.round(live.track.wet*100)}%`,height:6,backgroundColor:ui.gold}}/></View>
  {atBreak?<BreakCard key={pendingBreak!.beat} done={pendingBreak!.done} next={pendingBreak!.next} rows={live.rows} plans={breakPlans} editable={engineBreak} onContinue={continueBreak}/>:null}
  {call?<CallCard model={call} onCall={onCall}/>:null}
  {done?<Card accent={ui.green}><Text accessibilityRole="header" style={styles.heading}>Chequered flag</Text><Text style={styles.body}>The grid is set. See how your drivers did and why.</Text>
   <Action label="SEE THE RESULT" onPress={onFinish}/></Card>:null}
  {!call&&!done&&!atBreak?<View testID="your-cars" style={{gap:8}}>
   <Section title="Your cars"/>
   {mine.map(r=><MyCar key={r.driverId} row={r} cutoff={live.cutoff}/>)}
  </View>:null}
  <Commentary lines={live.commentary} names={names} teamColor={teamColor}/>
  <LiveTower rows={live.rows} cutoff={live.cutoff} finished={live.finished} focus={focus}/>
  <SectorLegend/>
  <Text style={styles.muted}>Times are shown as gaps. This replays the session your team has already run; replay speed, Skip and Focus don't change it.</Text>
 </Screen>;
}

function MyCar({row,cutoff}:{row:TowerRow;cutoff:number|null}){const {ui,styles}=useDesign();
 const danger=cutoff!==null&&row.position>cutoff;
 return <View accessibilityLabel={`${row.name}, ${PHASE[row.phase]}, P${row.position}, ${row.gap}${row.predicted?`, on pace for P${row.predicted}`:''}`} style={{gap:6,padding:10,borderRadius:6,backgroundColor:ui.accentMuted,borderLeftWidth:5,borderLeftColor:ui.accent}}>
  <View style={styles.between}><Text style={[styles.body,{fontWeight:'900'}]}>{row.name}</Text>
   <Chip text={row.time===null?'NO TIME':`P${row.position}${danger?' · IN DANGER':''}`} tone={row.time===null||danger?'red':'green'}/></View>
  <View style={[styles.between,{flexWrap:'wrap'}]}><Text style={[styles.muted,{fontWeight:'800'}]}>{PHASE[row.phase].toUpperCase()}</Text>
   {row.predicted?<Text style={{color:cutoff!==null&&row.predicted>cutoff?ui.danger:ui.green,fontWeight:'900',fontSize:12}}>ON PACE FOR P{row.predicted}</Text>:<Text style={styles.muted}>{row.gap}</Text>}</View>
  <SectorStrip sectors={row.sectors} large/>
 </View>;
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
