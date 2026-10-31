import React,{useState} from 'react';
import {Text,View} from 'react-native';
import {formatCampaignDate} from '../simulation/campaignTime';
import {decideProjectEvent,refinePlayerProject,selectDevelopmentHub,setProjectHold,startPlayerProject,selectPartOptions,
 type Approach,type CommandResult,type Objective,type ProjectView} from '../simulation/developmentLoop';
import type {GameDefinition,GameUniverse} from '../simulation/universe';
import type {PartId} from '../game/development';
import {Action,Card,Chip,Disclosure,EmptyState,Fact,Section,useDesign} from './design/system';
import {WorkshopArt} from './components/DevelopmentSummary';

type Run=(command:(u:GameUniverse)=>CommandResult)=>CommandResult;
const FAILURE:Record<string,string>={NO_SLOT:'That department is already at capacity.',OVER_BUDGET:'Not enough development budget left.',
 BUSY:'That part is already in development.',HOMOLOGATION_LIMIT:'No more changes to this part are allowed this season.',
 PACKAGE_EXISTS:'You already have that track package.',NOT_AVAILABLE:'That option is not available now.'};
const shortDate=(d:string)=>formatCampaignDate(d as never).replace(/, \d{4}$/,'');

/** Development management hub. Every value comes from developmentLoop read models; actions are domain commands. */
export function DevelopmentHub({universe,definition,run}:{universe:GameUniverse;definition:GameDefinition;run:Run}){
 const {styles,ui}=useDesign();
 const hub=selectDevelopmentHub(universe,definition);
 const [choosing,setChoosing]=useState(false),[message,setMessage]=useState('');
 const act=(command:(u:GameUniverse)=>CommandResult)=>{const r=run(command);setMessage(r.ok?'':FAILURE[r.reason]??'Not possible right now.');return r.ok;};
 const free=hub.slots.aero.used<hub.slots.aero.total||hub.slots.chassis.used<hub.slots.chassis.total;
 if(choosing)return <PartSelector universe={universe} definition={definition} onBack={()=>{setChoosing(false);setMessage('');}}
  onStart={(partId,objective,approach)=>{if(act(u=>startPlayerProject(u,definition,{partId,objective,approach})))setChoosing(false);}} message={message}/>;
 return <View style={{gap:14}}>
  <Card style={{gap:6}}>
   <Text style={styles.eyebrow}>DEVELOPMENT BUDGET</Text>
   <Text testID="dev-budget" style={[styles.heading,{fontSize:22}]}>${hub.budget.remainingM}M left</Text>
   <Text style={styles.muted}>${hub.budget.spentM}M committed of ${hub.budget.limitM}M this season. This is development spend, not team finances.</Text>
   <Fact label="Aero department" value={`${hub.slots.aero.used} of ${hub.slots.aero.total} projects`}/>
   <Fact label="Chassis department" value={`${hub.slots.chassis.used} of ${hub.slots.chassis.total} projects`}/>
  </Card>
  {message?<Text accessibilityRole="alert" style={[styles.body,{color:ui.red}]}>{message}</Text>:null}
  <Section title="Projects" meta={hub.projects.length?`${hub.projects.length} active`:undefined}/>
  {hub.projects.length?hub.projects.map(p=><ProjectCard key={p.id} project={p} act={act} definition={definition}/>)
   :<EmptyState title="Your factory is idle" text="Choose a part to develop. Your departments start work immediately and progress is credited each Monday." art={<WorkshopArt/>}/>}
  {free?<Action label="Start a project" onPress={()=>{setMessage('');setChoosing(true);}}/>:<Text style={styles.muted}>All departments are busy. A slot frees up when a project is fitted.</Text>}
  <Section title="Recent upgrades"/>
  {hub.outcomes.length?hub.outcomes.map(o=><View key={o.key} style={[styles.between,{paddingVertical:4}]}>
   <View style={{flex:1}}><Text style={styles.body}>{o.part} · {o.venue}</Text>{o.reliabilityConcern?<Text style={[styles.muted,{color:ui.gold}]}>Reliability concern</Text>:null}</View>
   <Chip text={o.label} tone={o.label==='ABOVE EXPECTATION'?'green':o.label==="DIDN'T WORK — REVERTED"||o.label==='BELOW EXPECTATION'?'red':'accent'}/></View>)
   :<Text style={styles.muted}>No upgrades fitted yet. {hub.rules===2?'Finished parts are fitted at the next race weekend.':'Finished parts are fitted at the next introduction window.'}</Text>}
 </View>;
}

function ProjectCard({project:p,act,definition}:{project:ProjectView;act:(c:(u:GameUniverse)=>CommandResult)=>boolean;definition:GameDefinition}){
 const {styles,ui}=useDesign();
 return <Card accessibilityLabel={`${p.name} project`} style={{gap:9}}>
  <View style={styles.between}><View style={{flex:1,gap:3}}><Text style={styles.heading}>{p.name}</Text><Text style={styles.muted}>{p.area} · {p.objective} · {p.approach}</Text></View>
   <Chip text={p.stageLabel.toUpperCase()} tone={p.stage==='READY'?'green':'accent'}/></View>
  <View accessibilityLabel={`${p.wholeProgress}% complete`} style={{height:6,backgroundColor:ui.line,borderRadius:3}}><View style={{width:`${p.wholeProgress}%`,height:6,backgroundColor:ui.accent,borderRadius:3}}/></View>
  <View style={{flexDirection:'row',flexWrap:'wrap',gap:10}}>{p.points.map(s=><Text key={s.stage} style={[styles.muted,{fontWeight:s.stage===p.stage?'800':'400'}]}>{s.category} {Math.min(s.done,s.required)}/{s.required}</Text>)}</View>
  {p.rate?<Text style={styles.body}>This week: +{p.rate.points} {p.rate.category}{p.delayWeeks?` · ${p.delayWeeks} week delay`:''}</Text>:null}
  <Text style={styles.body}>{p.stage==='READY'?'Built.':p.readyDate?`Ready about ${shortDate(p.readyDate)}.`:'Will not be finished this season.'} {p.hold?'Held back from the next race.':p.fitsAt?`Fits at ${p.fitsAt.name} (${shortDate(p.fitsAt.date)}).`:p.missesFinalRace?'Misses the final race.':''}</Text>
  {p.predicted?<Text style={styles.muted}>Predicted gain: {p.predicted}{p.bonusPoints?` · quality bonus ${p.bonusPoints>0?'+':''}${p.bonusPoints}`:''}</Text>:null}
  {p.pendingEvent?<View style={{gap:6,borderTopWidth:1,borderTopColor:ui.line,paddingTop:8}}>
   <Text style={[styles.body,{fontWeight:'900'}]}>{p.pendingEvent.title}</Text><Text style={styles.muted}>{p.pendingEvent.text} If you do nothing, the first option is taken on Monday.</Text>
   {p.pendingEvent.options.map(o=><Action key={o.id} label={`${o.label} — ${o.detail}${o.costM?` ($${o.costM}M)`:''}`} secondary={!o.available} onPress={()=>act(u=>decideProjectEvent(u,definition,p.id,o.id))}/>)}
  </View>:null}
  {p.refine?<Action secondary label={`Refine design — better part, about a week longer ($${p.refine.costM}M)`} onPress={()=>act(u=>refinePlayerProject(u,definition,p.id))}/>:null}
  {p.canHold?<Action secondary label={p.hold?'Release for the next race weekend':'Hold back from the next race weekend'} onPress={()=>act(u=>setProjectHold(u,definition,p.id,!p.hold))}/>:null}
  {p.eventHistory.length?<Disclosure title="Decisions">{p.eventHistory.map((e,i)=><Fact key={i} label={e.title} value={`${e.choice}${e.defaulted?' (default)':''}`}/>)}</Disclosure>:null}
 </Card>;
}

function PartSelector({universe,definition,onBack,onStart,message}:{universe:GameUniverse;definition:GameDefinition;onBack:()=>void;
 onStart:(partId:PartId,objective:Objective,approach:Approach)=>void;message:string}){
 const {styles,ui}=useDesign();
 const options=selectPartOptions(universe,definition);
 const [pick,setPick]=useState<{partId:PartId;objective:Objective;approach:Approach;label:string}|null>(null);
 return <View style={{gap:14}}>
  <Action label="Back to development" onPress={onBack} secondary/>
  <Text style={styles.muted}>Pick a part and how hard to push. Aggressive work takes longer and costs more but can bring a bigger gain, with more risk.</Text>
  {message?<Text accessibilityRole="alert" style={[styles.body,{color:ui.red}]}>{message}</Text>:null}
  {options.map(o=><Card key={o.id} accessibilityLabel={`${o.name} option`} style={{gap:7,opacity:o.unavailable?0.65:1}}>
   <View style={styles.between}><Text style={[styles.heading,{fontSize:18,flex:1}]}>{o.name}</Text><Chip text={o.area.toUpperCase()}/></View>
   <Text style={styles.muted}>{o.role}. Spec {o.spec} fitted · reliability {o.reliability >= 90 ? 'good' : o.reliability >= 82 ? 'fair' : 'concern'}.</Text>
   {o.helps.length?<Text style={styles.body}>Helps: {o.helps.join(' · ')}</Text>:null}
   {o.pressure.length?<Text style={[styles.body,{color:ui.green}]}>Valuable for: {o.pressure.join(', ')}</Text>:null}
   {o.homologationLeft!==null?<Text style={styles.muted}>{o.homologationLeft} {o.homologationLeft===1?'change':'changes'} left this season</Text>:null}
   {o.unavailable?<Text style={[styles.body,{fontWeight:'800'}]}>{o.unavailable}</Text>:<>
    {o.approaches.map(a=><Action key={a.approach} secondary label={`${a.approach[0]}${a.approach.slice(1).toLowerCase()} · ~${a.weeks} wks · $${a.costM}M · ${a.predicted} gain`}
     onPress={()=>setPick({partId:o.id,objective:'PERFORMANCE',approach:a.approach,label:`${o.name} (${a.approach.toLowerCase()}) for $${a.costM}M, about ${a.weeks} weeks`})}/>)}
    <Disclosure title="Other work">
     <Action secondary label={`Reliability fix · ~${o.reliabilityFix.weeks} wks · $${o.reliabilityFix.costM}M`} onPress={()=>setPick({partId:o.id,objective:'RELIABILITY',approach:'BALANCED',label:`a ${o.name.toLowerCase()} reliability fix for $${o.reliabilityFix.costM}M`})}/>
     {o.trackPackage?<Action secondary label={`${o.trackPackage.name} · ~${o.trackPackage.weeks} wks · $${o.trackPackage.costM}M`} onPress={()=>setPick({partId:o.id,objective:'CIRCUIT_SPECIFIC',approach:'BALANCED',label:`the ${o.trackPackage!.name.toLowerCase()} for $${o.trackPackage!.costM}M`})}/>:null}
    </Disclosure>
   </>}
   {pick&&pick.partId===o.id?<View style={{gap:8,borderTopWidth:1,borderTopColor:ui.line,paddingTop:10}}><Text style={[styles.body,{fontWeight:'800'}]}>Start {pick.label}?</Text>
    <View style={{flexDirection:'row',gap:8}}><View style={{flex:1}}><Action label="Confirm" onPress={()=>onStart(pick.partId,pick.objective,pick.approach)}/></View><View style={{flex:1}}><Action label="Cancel" onPress={()=>setPick(null)} secondary/></View></View></View>:null}
  </Card>)}
 </View>;
}
