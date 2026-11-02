import React from 'react';
import {Pressable,Text,View} from 'react-native';
import {formatCampaignDate} from '../../simulation/campaignTime';
import {WORKDAYS,type HqDevelopment,type PlaybackFrame,type PlaybackSpeed,type WeekTimeline} from '../../simulation/developmentLoop';
import {Action,Chip,useDesign} from '../design/system';

const short=(date:string|null)=>date?formatCampaignDate(date as Parameters<typeof formatCampaignDate>[0]).replace(/, \d{4}$/,''):'after the final race';
const CATEGORY=(c:string)=>c.toUpperCase();
export type PendingDecision={projectId:string;part:string;title:string;text:string;options:Array<{id:string;label:string;detail:string;costM:number;available:boolean}>};
export type LivePlayback={frame:PlaybackFrame;timeline:WeekTimeline;speed:PlaybackSpeed;setSpeed:(s:PlaybackSpeed)=>void;skip:()=>void;weekOf?:string|null;
 decision?:(PendingDecision&{onChoose:(choiceId:string)=>void;onLater:()=>void})|null};

/** HQ = PLAY. What the factory is building, what needs attention and, during a replay, the live week. */
export function HqDevelopmentCard({hq,live,onOpen}:{hq:HqDevelopment;live:LivePlayback|null;onOpen:()=>void}){
 const {ui,styles}=useDesign();
 const shell={backgroundColor:ui.surface,borderColor:ui.border,borderWidth:1,borderRadius:8,padding:12,gap:7,shadowColor:ui.shadow,shadowOpacity:.18,shadowRadius:10,shadowOffset:{width:0,height:4}} as const;
 if(live)return <LiveWeek live={live}/>;
 const f=hq.focus;
 const race=<Text style={styles.muted} numberOfLines={1}>Next race · {hq.nextRace.venue} · {hq.nextRace.detail}</Text>;
 if(hq.mode==='IDLE'||!f)return <View accessibilityLabel="Factory idle" style={shell}>
  <Text style={[styles.eyebrow,{color:ui.gold}]}>FACTORY IDLE</Text>
  <Text style={styles.body}>No active development project.</Text>{race}
  <Action label="START PROJECT" onPress={onOpen}/></View>;
 if(hq.mode==='DECISION')return <View accessibilityLabel="Engineering decision required" style={[shell,{borderColor:ui.gold,borderWidth:1.5}]}>
  <Text style={[styles.eyebrow,{color:ui.gold}]}>ENGINEERING DECISION REQUIRED</Text>
  <Text style={[styles.heading,{fontSize:17}]} numberOfLines={1}>{f.pendingEvent!.title}</Text>
  <Text style={styles.muted} numberOfLines={2}>{f.name} · {f.pendingEvent!.text}</Text>
  <Action label="REVIEW" onPress={onOpen}/></View>;
 const ready=f.stage==='READY';
 return <View accessibilityLabel={ready?'Part ready':'In development'} style={shell}>
  <View style={styles.between}><Text style={[styles.eyebrow,{color:ready?ui.green:ui.muted}]}>{ready?'PART READY':'IN DEVELOPMENT'}</Text>
   {hq.others?<Text style={styles.muted}>+{hq.others} more</Text>:null}</View>
  <View style={styles.between}><Text style={[styles.heading,{fontSize:18,flex:1}]} numberOfLines={1}>{f.name}</Text><Chip text={f.stageLabel.toUpperCase()} tone={ready?'green':'accent'}/></View>
  <Bar pct={f.wholeProgress}/>
  <Text style={styles.body} numberOfLines={1}>{ready?(f.hold?'Held back from the next weekend':`Fits at ${f.fitsAt?.name??'—'}`):`Expected ready ${short(f.readyDate)} · fit ${f.fitsAt?.name??'—'}`}</Text>
  {hq.quality&&hq.quality!=='As planned'?<Chip text={hq.quality.toUpperCase()} tone={hq.quality==='Compromised'?'red':'green'}/>:null}
  {race}
  <Action label="VIEW PROJECT" onPress={onOpen} secondary/></View>;
}

function Bar({pct,tone}:{pct:number;tone?:string}){const {ui}=useDesign();
 return <View accessibilityLabel={`${pct}% complete`} style={{flexDirection:'row',alignItems:'center',gap:8}}>
  <View style={{flex:1,height:8,backgroundColor:ui.line,borderRadius:4,overflow:'hidden'}}><View style={{width:`${pct}%`,height:8,backgroundColor:tone??ui.accent,borderRadius:4}}/></View>
  <Text style={{color:ui.ink,fontSize:13,fontWeight:'900',minWidth:38,textAlign:'right'}}>{pct}%</Text></View>;}

/** The replay is held on the day a decision came up; answering is the existing domain command. */
function DecisionPrompt({d,day}:{d:NonNullable<LivePlayback['decision']>;day:string}){
 const {ui,styles}=useDesign();
 return <View accessibilityLabel="Week paused: engineering decision required" style={{backgroundColor:ui.surface,borderColor:ui.gold,borderWidth:1.5,borderRadius:8,padding:12,gap:7}}>
  <Text style={[styles.eyebrow,{color:ui.gold}]}>WEEK PAUSED · {day} · DECISION REQUIRED</Text>
  <Text style={[styles.heading,{fontSize:17}]}>{d.title}</Text>
  <Text style={styles.muted}>{d.part} · {d.text}</Text>
  {d.options.map(o=><Action key={o.id} secondary={!o.available} label={`${o.label} — ${o.detail}${o.costM?` ($${o.costM}M)`:''}${o.available?'':' · over budget'}`} onPress={()=>{if(o.available)d.onChoose(o.id);}}/>)}
  <Pressable accessibilityRole="button" accessibilityLabel="Decide later" onPress={d.onLater} style={{minHeight:44,justifyContent:'center'}}>
   <Text style={styles.muted}>Decide later · if unanswered, the first option is taken on Monday</Text></Pressable>
 </View>;
}

function LiveWeek({live}:{live:LivePlayback}){
 const {ui,styles}=useDesign();
 if(live.decision)return <DecisionPrompt d={live.decision} day={WORKDAYS[live.frame.day]!}/>;
 const {frame,timeline,speed}=live,state=timeline.states[frame.state]!;
 const swing=[...timeline.callouts].filter(c=>c.day<=frame.day&&(c.kind==='STALL'||c.kind==='SETBACK'||c.kind==='BREAKTHROUGH'||c.kind==='DECISION')).pop();
 const stage=[...timeline.callouts].filter(c=>c.day===frame.day&&(c.kind==='STAGE_COMPLETE'||c.kind==='PART_READY')).pop();
 const swingTone=swing?.kind==='BREAKTHROUGH'?ui.green:swing?.kind==='DECISION'?ui.muted:ui.gold;
 return <View accessibilityLabel={`The team is working, ${WORKDAYS[frame.day]}`} style={{backgroundColor:ui.surface,borderColor:swing&&swing.kind!=='DECISION'?swingTone:ui.border,borderWidth:1,borderRadius:8,padding:12,gap:7}}>
  <View style={styles.between}><Text style={styles.eyebrow}>THE TEAM IS WORKING</Text>
   <View style={{flexDirection:'row',gap:3}}>{WORKDAYS.map((d,i)=><Text key={d} style={{fontSize:10,fontWeight:'900',letterSpacing:.4,paddingHorizontal:3,
    color:i===frame.day?ui.onAccent:i<frame.day?ui.ink:ui.muted,backgroundColor:i===frame.day?ui.accent:'transparent',borderRadius:3,opacity:i>frame.day?.55:1}}>{d}</Text>)}</View></View>
  {live.weekOf?<Text style={styles.muted}>Week of {short(live.weekOf)} · results already decided, now replaying</Text>:null}
  {state.projects.slice(0,2).map(p=><View key={p.projectId} style={{gap:4}}>
   <View style={styles.between}><Text style={[styles.body,{fontWeight:'900',flex:1}]} numberOfLines={1}>{p.name}</Text><Text style={styles.muted}>{p.stage}</Text></View>
   <Bar pct={p.pct}/>
   <Text style={styles.muted} numberOfLines={1}>Ready about {short(p.ready)}{p.fit?` · fit ${p.fit}`:''}</Text></View>)}
  {Object.keys(state.counters).length?<View style={{flexDirection:'row',flexWrap:'wrap',gap:6}}>{Object.entries(state.counters).map(([c,v])=><Chip key={c} text={`+${v} ${CATEGORY(c)}`} tone="accent"/>)}</View>:null}
  {swing?<View style={{gap:2}}><Text style={{color:swingTone,fontSize:11,fontWeight:'900',letterSpacing:.8}}>{swing.kind==='BREAKTHROUGH'?'BREAKTHROUGH':swing.kind==='DECISION'?'DECISION':'SETBACK'} · {swing.title.toUpperCase()}</Text>
   {swing.text?<Text style={styles.muted} numberOfLines={2}>{swing.text}</Text>:null}</View>:null}
  {stage?<Text style={{color:ui.green,fontSize:11,fontWeight:'900',letterSpacing:.8}}>{stage.title.toUpperCase()}{stage.text?` · ${stage.text.toUpperCase()}`:''}</Text>:null}
  <View style={{flexDirection:'row',gap:8,justifyContent:'flex-end'}}>
   {([1,2] as const).map(s=><Pressable key={s} accessibilityRole="button" accessibilityLabel={`Playback speed ${s}x`} accessibilityState={{selected:speed===s}} onPress={()=>live.setSpeed(s)}
    style={{minHeight:44,minWidth:48,justifyContent:'center',alignItems:'center',borderRadius:6,borderWidth:1,borderColor:speed===s?ui.accent:ui.border,backgroundColor:speed===s?ui.accentMuted:'transparent'}}>
    <Text style={{color:ui.ink,fontSize:12,fontWeight:'900'}}>{s}×</Text></Pressable>)}
   <Pressable accessibilityRole="button" accessibilityLabel="Skip replay" onPress={live.skip} style={{minHeight:44,minWidth:64,justifyContent:'center',alignItems:'center',borderRadius:6,borderWidth:1,borderColor:ui.border}}>
    <Text style={{color:ui.ink,fontSize:12,fontWeight:'900'}}>SKIP</Text></Pressable>
  </View>
 </View>;
}
