import React,{useState} from 'react';
import {Text,View,useWindowDimensions} from 'react-native';
import type {NavTab} from '../../game/hudPlaceholders';
import type {GameDefinition,GameUniverse} from '../../simulation/universe';
import {FORMAT,SEGMENTS,TIMING_LABEL,TRAFFIC_LABEL,TYRE_LABEL,selectQualifyingPlan,type DriverPlan,type Segment,type SegmentPlan} from '../../simulation/qualifying';
import {Action,Card,Chip,Disclosure,Screen,Section,Segmented,useDesign} from '../design/system';

const summary=(p:SegmentPlan)=>`${TYRE_LABEL[p.tyre]} · ${p.runs===1?'1 run':'2 runs'} · ${TIMING_LABEL[p.timing]} · ${TRAFFIC_LABEL[p.traffic]}`;
const same=(a:DriverPlan,b:DriverPlan)=>JSON.stringify(a)===JSON.stringify(b);

/** Pre-session plan for the player's two cars. It only edits a draft; the plan is saved by the domain command on lock. */
export function QualifyingPlan({universe,definition,onLock,onNavigate}:{universe:GameUniverse;definition:GameDefinition;onLock:(plans:Record<string,DriverPlan>)=>void;onNavigate:(tab:NavTab)=>void}){
 const {ui,styles}=useDesign(),wide=useWindowDimensions().width>=1000;
 const model=selectQualifyingPlan(universe,definition);
 const [draft,setDraft]=useState<Record<string,DriverPlan>>(()=>Object.fromEntries((model?.drivers??[]).map(d=>[d.driverId,d.plan])));
 if(!model)return null;
 const set=(id:string,seg:Segment,patch:Partial<SegmentPlan>)=>setDraft(p=>({...p,[id]:{...p[id]!,[seg]:{...p[id]![seg],...patch}}}));
 return <Screen title="Qualifying plan" kicker={`ROUND ${String(model.round).padStart(2,'0')} · ${model.venue.toUpperCase()}`} subtitle={`Saturday · ${model.date}`} tab="HQ" onNavigate={onNavigate}>
  <Card hero accent={ui.gold}>
   <View style={styles.between}><Text style={[styles.eyebrow,{color:ui.gold}]}>FORECAST</Text><View style={{flexDirection:'row',gap:6}}>{model.sprint?<Chip text="SPRINT WEEKEND" tone="red"/>:null}<Chip text={model.forecast.confidence.toUpperCase()} tone="gold"/></View></View>
   <Text accessibilityRole="header" style={[styles.heading,{fontSize:22}]}>{model.forecast.headline}</Text>
   <Text style={styles.body}>{model.forecast.detail}</Text>
   <Text style={styles.muted}>Forecasts get more reliable as your team does more Research work.</Text>
   <View style={{borderTopWidth:1,borderTopColor:ui.line,paddingTop:10,gap:4}}>
    <Text style={styles.eyebrow}>CAR FIT</Text>
    <Text style={[styles.body,{fontWeight:'800'}]}>{model.carFit.standing}</Text>
    {model.carFit.strengths.length||model.carFit.concerns.length?<Text style={styles.muted}>{[model.carFit.strengths[0]&&`Strong: ${model.carFit.strengths[0]}`,model.carFit.concerns[0]&&`Weak: ${model.carFit.concerns[0]}`].filter(Boolean).join(' · ')}</Text>:null}
   </View>
   <Text style={styles.muted}>{model.allowance}{model.sprint?' Sprint weekends run normal qualifying for now.':''}</Text>
  </Card>
  <Text style={styles.muted}>Q1 knocks out 6 cars, Q2 another 6, and Q3 decides the top 10. Going out early means a clean track with less grip, and it's safe if rain comes. Going out late means the most grip, but more traffic and weather risk. Waiting to find space late in a segment can cost you the lap.</Text>
  <View style={{flexDirection:wide?'row':'column',gap:18}}>
   {model.drivers.map(d=>{const plan=draft[d.driverId]!,recommended=same(plan,d.recommended);
    return <View key={d.driverId} style={{flex:1,gap:8}} testID={`plan-${d.driverId}`}>
     <Section title={d.name} meta={recommended?'Recommended plan':'Your plan'}/>
     {SEGMENTS.map(seg=><Disclosure key={seg} title={`${seg} — ${summary(plan[seg])}`}>
      <Text style={styles.muted}>{FORMAT[seg].minutes} minutes{FORMAT[seg].out?` · ${FORMAT[seg].out} knocked out`:' · top-10 shoot-out'}</Text>
      <Segmented label="Tyres" value={plan[seg].tyre} onChange={tyre=>set(d.driverId,seg,{tyre})} options={(['NEW_SOFT','USED_SOFT','MEDIUM','INTER'] as const).map(v=>({value:v,label:TYRE_LABEL[v]}))}/>
      <Segmented label="Runs" value={plan[seg].runs} onChange={runs=>set(d.driverId,seg,{runs})} options={[{value:1 as const,label:'1 run'},{value:2 as const,label:'2 runs'}]}/>
      <Segmented label="Go out" value={plan[seg].timing} onChange={timing=>set(d.driverId,seg,{timing})} options={(['EARLY','MIDDLE','LATE'] as const).map(v=>({value:v,label:TIMING_LABEL[v]}))}/>
      <Segmented label="Traffic" value={plan[seg].traffic} onChange={traffic=>set(d.driverId,seg,{traffic})} options={(['FIND_SPACE','PUSH'] as const).map(v=>({value:v,label:TRAFFIC_LABEL[v]}))}/>
     </Disclosure>)}
     {!recommended?<Action label="Use recommended plan" secondary onPress={()=>setDraft(p=>({...p,[d.driverId]:d.recommended}))}/>:null}
    </View>;})}
  </View>
  <Action label="LOCK PLAN AND START QUALIFYING" onPress={()=>onLock(draft)}/>
 </Screen>;
}
