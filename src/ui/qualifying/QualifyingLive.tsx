import React,{useEffect,useMemo,useState} from 'react';
import {Pressable,ScrollView,Text,View,useWindowDimensions} from 'react-native';
import type {NavTab} from '../../game/hudPlaceholders';
import type {GameDefinition,GameUniverse} from '../../simulation/universe';
import {BEATS_PER_MINUTE,CALL_LABEL,FORMAT,SEGMENTS,TYRE_LABEL,activeBeats,breakOf,liveTiming,replayTarget,segmentAtBeat,segmentOf,selectQualifyingCall,wetLabel,
 type Call,type CallAction,type Segment,type SegmentPlan,type TowerRow,type Tyre} from '../../simulation/qualifying';
import {useSessionReplay,type ReplaySpeed} from '../hooks/useSessionReplay';
import {Action,Card,Chip,ChoiceList,Screen,Section,Segmented,useDesign} from '../design/system';
import {BreakCard} from './BreakCard';
import {Commentary} from './Commentary';
import {LiveTower,PHASE,SectorLegend,SectorStrip,WIDE_TOWER} from './LiveTower';
import {TowerDetail} from './TowerDetail';
import {BroadcastTheme} from '../theme';

type Props={universe:GameUniverse;definition:GameDefinition;eventId:string;from:number;onBeat:(b:number)=>void;
 /** Breaks the player has already continued from (presentation memory for this app session). */
 acked:number[];onAck:(beat:number)=>void;
 onCall:(calls:Record<string,Call>)=>void;onContinueBreak:(plans:Record<string,SegmentPlan>)=>void;onFinish:()=>void;onNavigate:(tab:NavTab)=>void};
/** End-of-part beats: Q1 and Q2 always stop here, whether or not the session itself is waiting. */
const BREAK_BEATS:Array<{beat:number;done:Segment;next:Segment}>=[{beat:FORMAT.Q2.offset*BEATS_PER_MINUTE,done:'Q1',next:'Q2'},{beat:FORMAT.Q3.offset*BEATS_PER_MINUTE,done:'Q2',next:'Q3'}];

/** Live view on the broadcast surface: replays the stored session sector by sector, stopping at every call and break. */
export function QualifyingLive(props:Props){return <BroadcastTheme><LiveView {...props}/></BroadcastTheme>;}
function LiveView({universe,definition,eventId,from,onBeat,acked,onAck,onCall,onContinueBreak,onFinish,onNavigate}:Props){
 const {ui,styles}=useDesign();
 const session=universe.qualifying!.sessions[eventId]!,engineTarget=replayTarget(session)*BEATS_PER_MINUTE;
 const [seen,setSeen]=useState(acked);
 const pendingBreak=BREAK_BEATS.find(b=>b.beat<=engineTarget&&!seen.includes(b.beat));
 const target=pendingBreak?.beat??engineTarget;
 const active=useMemo(()=>activeBeats(session),[session]);
 const replay=useSessionReplay(target,from,b=>active.has(b),onBeat);
 const live=liveTiming(universe,session,replay.beat);
 const [focus,setFocus]=useState(false);
 const [selected,setSelected]=useState<string|null>(null),[hovered,setHovered]=useState<string|null>(null),[towerWidth,setTowerWidth]=useState(0);
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
 const {width,height}=useWindowDimensions(),wide=width>=1000;
 // While a call is open, show the drop-zone battle by default so the decision is made in sight of the cut.
 const [sheetOpen,setSheetOpen]=useState(true);
 useEffect(()=>{if(call){setFocus(true);setSheetOpen(true);}},[!!call]);
 const controls=<View style={[styles.between,{flexWrap:'wrap',gap:8}]}>
   <SessionProgress beat={replay.beat} finished={live.finished} remaining={live.remaining}/>
   <View style={{flexDirection:'row',gap:6,flexWrap:'wrap'}} accessibilityLabel="Replay controls">
    {([1,2,4] as ReplaySpeed[]).map(sp=><Pressable key={sp} accessibilityRole="button" accessibilityLabel={`Replay at ${sp}x`} accessibilityState={{selected:replay.speed===sp}} onPress={()=>replay.setSpeed(sp)}
     style={{minWidth:44,minHeight:44,borderRadius:5,borderWidth:1,borderColor:replay.speed===sp?ui.accent:ui.line,backgroundColor:replay.speed===sp?ui.accentMuted:'transparent',alignItems:'center',justifyContent:'center'}}><Text style={[styles.figure,{color:ui.ink}]}>{sp}×</Text></Pressable>)}
    <Pressable accessibilityRole="button" accessibilityLabel="Skip to the next stop" disabled={!replay.playing} onPress={replay.skip}
     style={{minWidth:58,minHeight:44,borderRadius:5,borderWidth:1,borderColor:ui.line,alignItems:'center',justifyContent:'center',opacity:replay.playing?1:.4}}><Text style={{color:ui.ink,fontWeight:'800'}}>SKIP</Text></Pressable>
    <Pressable accessibilityRole="switch" accessibilityLabel="Focus mode: only your cars and the drop-zone battle" accessibilityState={{checked:focus}} onPress={()=>setFocus(f=>!f)}
     style={{minWidth:64,minHeight:44,paddingHorizontal:8,borderRadius:5,borderWidth:1,borderColor:focus?ui.accent:ui.line,backgroundColor:focus?ui.accent:'transparent',alignItems:'center',justifyContent:'center'}}>
     <Text style={{color:focus?ui.onAccent:ui.ink,fontWeight:'800'}}>FOCUS</Text></Pressable>
   </View>
  </View>;
 const breakCard=atBreak?<BreakCard key={pendingBreak!.beat} done={pendingBreak!.done} next={pendingBreak!.next} rows={live.rows} plans={breakPlans} editable={engineBreak} onContinue={continueBreak}/>:null;
 const doneCard=done?<Card accent={ui.green}><Text accessibilityRole="header" style={styles.heading}>Chequered flag</Text><Text style={styles.body}>The grid is set. See how your drivers did and why.</Text>
   <Action label="SEE THE RESULT" onPress={onFinish}/></Card>:null;
 const yourCars=<View testID="your-cars" style={{gap:8}}><Section title="Your cars"/>{mine.map(r=><MyCar key={r.driverId} row={r} cutoff={live.cutoff}/>)}</View>;
 const tower=<View style={{gap:10}}>
   {focus?<Text style={styles.muted}>Focus: your cars and the drop-zone battle. Turn off Focus for the full field.</Text>:null}
   <TowerDetail row={live.rows.find(r=>r.driverId===(selected??hovered))} onClose={()=>{setSelected(null);setHovered(null);}}/>
   <View onLayout={e=>setTowerWidth(e.nativeEvent.layout.width)}>
    <LiveTower rows={live.rows} cutoff={live.cutoff} finished={live.finished} focus={focus} wide={towerWidth>=WIDE_TOWER} selected={selected}
     onSelect={id=>setSelected(s=>s===id?null:id)} onHover={setHovered}/></View>
   <SectorLegend/></View>;
 const commentary=<Commentary lines={live.commentary} names={names} teamColor={teamColor}/>;
 const note=<Text style={styles.muted}>Times are shown as gaps. This replays the session your team has already run; replay speed, Skip and Focus don't change it.</Text>;
 const title=`Qualifying · ${live.segment}`,kicker='SATURDAY · LIVE TIMING',subtitle=live.finished?`${live.segment} complete`:wetLabel(live.track.wet);
 if(wide)return <Screen title={title} kicker={kicker} subtitle={subtitle} tab="HQ" onNavigate={onNavigate} maxWidth={2200}>
  {controls}
  <View style={{flexDirection:'row',gap:24,alignItems:'flex-start'}}>
   <View style={{flex:1.6,minWidth:0}}>{tower}</View>
   <View style={{flex:1,minWidth:340,maxWidth:560,gap:14}}>{breakCard}{call?<CallCard model={call} onCall={onCall}/>:null}{doneCard}{yourCars}{commentary}</View>
  </View>
  {note}
 </Screen>;
 // Phone: the call is a bottom sheet over the tower, collapsible to see the whole field.
 const sheet=call?<View style={{position:'absolute',left:0,right:0,bottom:0,maxHeight:sheetOpen?height*.46:56,backgroundColor:ui.surface,borderTopWidth:3,borderTopColor:ui.gold,
   borderTopLeftRadius:12,borderTopRightRadius:12,shadowColor:ui.shadow,shadowOpacity:.25,shadowRadius:12,shadowOffset:{width:0,height:-4}}}>
   <Pressable accessibilityRole="button" accessibilityLabel={sheetOpen?'Collapse the call to see the timing':'Open the pit wall call'} onPress={()=>setSheetOpen(o=>!o)}
    style={{minHeight:48,flexDirection:'row',alignItems:'center',justifyContent:'space-between',paddingHorizontal:16}}>
    <Text style={[styles.eyebrow,{color:ui.gold}]}>PIT WALL CALL · {call.segment} · {call.remaining} MIN LEFT</Text><Text style={{color:ui.accent,fontSize:18,fontWeight:'900'}}>{sheetOpen?'▾':'▴'}</Text></Pressable>
   {sheetOpen?<ScrollView contentContainerStyle={{paddingHorizontal:16,paddingBottom:16}}><CallCard model={call} onCall={onCall} bare/></ScrollView>:null}
  </View>:null;
 return <Screen title={title} kicker={kicker} subtitle={subtitle} tab="HQ" onNavigate={onNavigate} overlay={sheet}>
  {call?tower:null}
  {controls}
  {breakCard}{doneCard}
  {!call?tower:null}
  {!call&&!atBreak&&!done?yourCars:null}
  {!call?commentary:null}
  {!call?note:null}
  {call?<View style={{height:sheetOpen?height*.46:56}}/>:null}
 </Screen>;
}

/** Session progress: Q1/Q2/Q3 as large steps and a bar for the current part with a time-left marker. */
function SessionProgress({beat,finished,remaining}:{beat:number;finished:boolean;remaining:number}){
 const {ui,styles}=useDesign(),seg=segmentAtBeat(beat),local=beat-FORMAT[seg].offset*BEATS_PER_MINUTE,share=Math.max(0,Math.min(1,local/(FORMAT[seg].minutes*BEATS_PER_MINUTE)));
 return <View style={{flex:1,minWidth:240,gap:6}} accessibilityLabel={`${seg}, ${finished?'complete':`${remaining} minutes left`}`}>
  <View style={{flexDirection:'row',gap:6}}>{SEGMENTS.map(s=>{const i=SEGMENTS.indexOf(s),cur=SEGMENTS.indexOf(seg);
   return <View key={s} style={{minWidth:52,height:32,paddingHorizontal:10,borderRadius:5,alignItems:'center',justifyContent:'center',
    backgroundColor:i===cur?ui.accent:i<cur?ui.surfaceElevated:'transparent',borderWidth:1,borderColor:i===cur?ui.accent:ui.line}}>
    <Text style={[styles.heading,{color:i===cur?ui.onAccent:i<cur?ui.ink:ui.muted,fontSize:20}]}>{s}{i<cur?' ✓':''}</Text></View>;})}</View>
  <View style={{height:12,borderRadius:6,backgroundColor:ui.surfaceElevated,borderWidth:1,borderColor:ui.line,overflow:'visible'}}>
   <View style={{width:`${share*100}%`,height:10,borderRadius:6,backgroundColor:ui.accent}}/>
  </View>
  <Text style={[styles.figure,{fontSize:15}]}>{finished?`${seg} complete`:`${remaining} min left in ${seg}`}</Text>
 </View>;
}

function MyCar({row,cutoff}:{row:TowerRow;cutoff:number|null}){const {ui,styles,teamInk}=useDesign();
 const danger=cutoff!==null&&row.position>cutoff;
 return <View accessibilityLabel={`${row.name}, ${PHASE[row.phase]}, P${row.position}, ${row.gap}${row.predicted?`, on pace for P${row.predicted}`:''}`} style={{gap:6,padding:12,borderRadius:8,backgroundColor:ui.surface,borderLeftWidth:6,borderLeftColor:row.color}}>
  <View style={styles.between}><View style={{flex:1,minWidth:0}}><Text numberOfLines={1} style={styles.heading}>{row.time===null?'':`P${row.position}  `}{row.name}</Text>
   <Text style={{color:teamInk(row.color),fontSize:11,fontWeight:'800',letterSpacing:.8}}>{row.team.toUpperCase()}</Text></View>
   <Chip text={row.time===null?'NO TIME':`P${row.position}${danger?' · IN DANGER':''}`} tone={row.time===null||danger?'red':'green'}/></View>
  <View style={[styles.between,{flexWrap:'wrap'}]}><Text style={[styles.muted,{fontWeight:'800'}]}>{PHASE[row.phase].toUpperCase()}</Text>
   {row.predicted?<Text style={{color:cutoff!==null&&row.predicted>cutoff?ui.danger:ui.green,fontWeight:'900',fontSize:12}}>ON PACE FOR P{row.predicted}</Text>:<Text style={[styles.figure,{color:ui.muted}]}>{row.gap}</Text>}</View>
  <SectorStrip sectors={row.sectors} large/>
 </View>;
}

const HINT:Record<CallAction,string>={PLAN:'Run the laps already planned for this part.',GO_NOW:'Cleaner track and a lap banked early, but less grip.',
 GO_LATE:'Best grip, but traffic risk and no second chance.',STAY_IN:'Save the tyres for later; risky if the cars behind improve.'};
function CallCard({model,onCall,bare=false}:{model:NonNullable<ReturnType<typeof selectQualifyingCall>>;onCall:(c:Record<string,Call>)=>void;bare?:boolean}){
 const {ui,styles}=useDesign();
 const t=model.target,stakes=t.source===null||t.offPole===null?null:model.cutoff===null
  ?(t.source==='NOW'?'Pole is the target.':`Pole is the target. In ${t.source}, the top 10 were covered by ${t.offPole.toFixed(3)}.`)
  :t.source==='NOW'?`To get through: about +${t.offPole.toFixed(3)} off P1 (P${t.position} pace right now).`
  :`To get through: in ${t.source}, P${t.position} pace was about +${t.offPole.toFixed(3)} off P1.`;
 const [calls,setCalls]=useState<Record<string,Call>>(()=>Object.fromEntries(model.drivers.map(d=>[d.driverId,d.recommended])));
 const actions:CallAction[]=['PLAN','GO_NOW','GO_LATE','STAY_IN'];
 const body=<>
  {!bare?<Text style={[styles.eyebrow,{color:ui.gold}]}>PIT WALL CALL · {model.segment} · {model.remaining} MIN LEFT</Text>:null}
  <Text style={styles.body}>Track: {model.track.label}, {model.track.trend}. Forecast: {model.forecast.headline.toLowerCase()} ({model.forecast.confidence.toLowerCase()}).</Text>
  {stakes?<Text style={[styles.body,{fontWeight:'800'}]}>{stakes}</Text>:<Text style={styles.muted}>Not enough laps set yet to know the pace needed to get through.</Text>}
  {model.drivers.map(d=>{const c=calls[d.driverId]!;const rec=d.recommended;
   const tyres:Array<Tyre|'KEEP'>=['KEEP',...(['INTER','NEW_SOFT'] as const).filter(t=>t!==d.plannedTyre)];
   return <View key={d.driverId} style={{gap:8,borderTopWidth:1,borderTopColor:ui.line,paddingTop:10}}>
    <View style={styles.between}><Text style={[styles.body,{fontWeight:'900'}]}>{d.name}</Text>
     <Chip text={d.position===null?'NO TIME':`P${d.position}${d.danger?' · IN DANGER':''}`} tone={d.position===null||d.danger?'red':'green'}/></View>
    <Text style={styles.muted}>{d.position===null?'No lap time yet':`Gap ${d.gap}`}{d.toLine!==null&&model.cutoff?` · ${d.toLine<=0?`${Math.abs(d.toLine).toFixed(3)} inside the cut`:`needs ${d.toLine.toFixed(3)} to get through`}`:''} · {d.newSoftsLeft} new softs left · {d.plannedRunsLeft} planned {d.plannedRunsLeft===1?'run':'runs'} left</Text>
    <ChoiceList label="Call" value={c.action} onChange={action=>setCalls(p=>({...p,[d.driverId]:{...p[d.driverId]!,action}}))}
     options={actions.map(a=>({value:a,label:CALL_LABEL[a],hint:a==='PLAN'?`${HINT.PLAN} ${d.plannedRunsLeft===0?'None left: he stays in.':d.plannedRunsLeft===1?'One run left.':`${d.plannedRunsLeft} runs left.`}`:HINT[a],tag:a===rec.action?'Recommended':undefined}))}/>
    {model.track.tyreChoice?<Segmented label="Tyres for the rest of the segment" value={c.tyre??'KEEP'} onChange={t=>setCalls(p=>{const {tyre:_old,...rest}=p[d.driverId]!;return {...p,[d.driverId]:t==='KEEP'?rest:{...rest,tyre:t}};})}
     options={tyres.map(t=>({value:t,label:t==='KEEP'?`As planned (${TYRE_LABEL[d.plannedTyre]})`:TYRE_LABEL[t],note:(rec.tyre??'KEEP')===t?'Recommended':undefined}))}/>:null}
   </View>;})}
  <Action label="SEND CALLS" onPress={()=>onCall(calls)}/>
 </>;
 return bare?<View style={{gap:12}}>{body}</View>:<Card hero accent={ui.gold}>{body}</Card>;
}
