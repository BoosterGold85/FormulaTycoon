import React,{useState} from 'react';
import {Pressable,Text,View} from 'react-native';
import type {NavTab} from '../../game/hudPlaceholders';
import type {GameDefinition,GameUniverse} from '../../simulation/universe';
import {CALL_LABEL,SEGMENTS,TYRE_LABEL,replayTarget,segmentAt,selectQualifyingCall,towerAt,type Call,type CallAction,type TowerRow,type Tyre} from '../../simulation/qualifying';
import {useSessionReplay} from '../hooks/useSessionReplay';
import {Action,Card,Chip,Screen,Segmented,useDesign} from '../design/system';

type Props={universe:GameUniverse;definition:GameDefinition;eventId:string;from:number;onMinute:(m:number)=>void;
 onCall:(calls:Record<string,Call>)=>void;onFinish:()=>void;onNavigate:(tab:NavTab)=>void};
/** Live view: replays the stored session minute by minute up to the open call (or the flag). */
export function QualifyingLive({universe,definition,eventId,from,onMinute,onCall,onFinish,onNavigate}:Props){
 const {ui,styles}=useDesign();
 const session=universe.qualifying!.sessions[eventId]!,target=replayTarget(session);
 const replay=useSessionReplay(target,from,onMinute);
 const tower=towerAt(universe,session,replay.minute);
 const call=!replay.playing&&session.status!=='COMPLETE'?selectQualifyingCall(universe,definition):null;
 const done=!replay.playing&&session.status==='COMPLETE';
 return <Screen title={`Qualifying · ${tower.segment}`} kicker="SATURDAY · LIVE TIMING" subtitle={tower.finished?`${tower.segment} complete`:`${tower.remaining} min left · ${tower.track.label}`} tab="HQ" onNavigate={onNavigate}>
  <View style={[styles.between,{flexWrap:'wrap'}]}>
   <View style={{flexDirection:'row',gap:6}}>{SEGMENTS.map(s=>{const i=SEGMENTS.indexOf(s),cur=SEGMENTS.indexOf(segmentAt(replay.minute));
    return <Chip key={s} text={s} tone={i===cur?'accent':i<cur?'green':'muted'}/>;})}</View>
   <View style={{flexDirection:'row',gap:6}} accessibilityLabel="Replay speed">
    {([1,2] as const).map(sp=><Pressable key={sp} accessibilityRole="button" accessibilityLabel={`Replay at ${sp}x`} accessibilityState={{selected:replay.speed===sp}} onPress={()=>replay.setSpeed(sp)}
     style={{minWidth:44,minHeight:44,borderRadius:5,borderWidth:1,borderColor:replay.speed===sp?ui.accent:ui.line,alignItems:'center',justifyContent:'center'}}><Text style={{color:ui.ink,fontWeight:'800'}}>{sp}×</Text></Pressable>)}
    <Pressable accessibilityRole="button" accessibilityLabel="Skip to the next call" disabled={!replay.playing} onPress={replay.skip}
     style={{minWidth:64,minHeight:44,borderRadius:5,borderWidth:1,borderColor:ui.line,alignItems:'center',justifyContent:'center',opacity:replay.playing?1:.4}}><Text style={{color:ui.ink,fontWeight:'800'}}>SKIP</Text></Pressable>
   </View>
  </View>
  <View accessibilityLabel={`Track: ${tower.track.label}`} style={{height:6,borderRadius:3,backgroundColor:ui.chip,overflow:'hidden'}}>
   <View style={{width:`${Math.round(tower.track.wet*100)}%`,height:6,backgroundColor:ui.gold}}/></View>
  {call?<CallCard model={call} onCall={onCall}/>:null}
  {done?<Card accent={ui.green}><Text accessibilityRole="header" style={styles.heading}>Chequered flag</Text><Text style={styles.body}>The grid is set. See how your drivers did and why.</Text>
   <Action label="SEE THE RESULT" onPress={onFinish}/></Card>:null}
  <View testID="timing-tower" style={{borderTopWidth:1,borderTopColor:ui.line}}>
   {tower.rows.map((r,i)=><React.Fragment key={r.driverId}>
    {tower.cutoff!==null&&i===tower.cutoff?<Text style={[styles.eyebrow,{color:ui.danger,paddingVertical:4}]}>{tower.finished?'KNOCKED OUT':'KNOCKOUT ZONE'}</Text>:null}
    <TowerLine row={r}/>
   </React.Fragment>)}
  </View>
  <Text style={styles.muted}>Times are shown as gaps. This replays the session your team has already run; replay speed and Skip don't change it.</Text>
 </Screen>;
}

function TowerLine({row}:{row:TowerRow}){const {ui,styles,teamInk}=useDesign();
 return <View accessibilityLabel={`P${row.position} ${row.name}, ${row.team}, ${row.gap}${row.state==='TRACK'?', on track':''}`}
  style={{flexDirection:'row',alignItems:'center',gap:10,minHeight:40,paddingHorizontal:8,borderBottomWidth:1,borderBottomColor:ui.line,backgroundColor:row.mine?ui.accentMuted:'transparent',opacity:row.out?.6:1}}>
  <Text style={{width:24,color:ui.ink,fontWeight:'900',textAlign:'right'}}>{row.position}</Text>
  <View style={{width:4,alignSelf:'stretch',marginVertical:8,borderRadius:2,backgroundColor:row.color}}/>
  <View style={{flex:1,minWidth:0}}><Text numberOfLines={1} style={{color:ui.ink,fontWeight:row.mine?'900':'700',fontSize:13}}>{row.name}</Text>
   <Text numberOfLines={1} style={{color:teamInk(row.color),fontSize:11,fontWeight:'700'}}>{row.team}</Text></View>
  {row.state==='TRACK'?<Text style={{color:ui.green,fontSize:10,fontWeight:'900'}}>ON TRACK</Text>:null}
  <Text style={[styles.body,{fontVariant:['tabular-nums'],fontWeight:'700',minWidth:72,textAlign:'right',color:row.time===null?ui.muted:ui.ink}]}>{row.gap}</Text>
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
