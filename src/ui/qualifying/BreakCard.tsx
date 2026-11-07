import React,{useState} from 'react';
import {Text,View} from 'react-native';
import {FORMAT,TIMING_LABEL,TRAFFIC_LABEL,TYRE_LABEL,type Segment,type SegmentPlan,type TowerRow} from '../../simulation/qualifying';
import {Action,Card,Chip,Segmented,useDesign} from '../design/system';

/**
 * Between parts: who is out, whether the player's cars made it, the order going into the next part, and
 * (when the session is waiting) the plan for the next part. Nothing resumes until Continue.
 */
export function BreakCard({done,next,rows,plans,editable,onContinue}:{done:Segment;next:Segment;rows:TowerRow[];
 plans:Record<string,SegmentPlan>;editable:boolean;onContinue:(plans:Record<string,SegmentPlan>)=>void}){
 const {ui,styles,teamInk}=useDesign();
 const cut=FORMAT[done].cars-FORMAT[done].out,out=rows.slice(cut),through=rows.slice(0,cut),mine=rows.filter(r=>r.mine);
 const [draft,setDraft]=useState(plans);
 const set=(id:string,patch:Partial<SegmentPlan>)=>setDraft(p=>({...p,[id]:{...p[id]!,...patch}}));
 return <Card hero accent={ui.gold}>
  <Text style={[styles.eyebrow,{color:ui.gold}]}>{done} COMPLETE · BREAK</Text>
  <View style={{gap:4}}>{mine.map(r=><View key={r.driverId} style={styles.between}><Text style={[styles.body,{fontWeight:'900'}]}>{r.name}</Text>
   <Chip text={r.position<=cut?`THROUGH · P${r.position}`:`KNOCKED OUT · P${r.position}`} tone={r.position<=cut?'green':'red'}/></View>)}</View>
  <View style={{gap:3}}><Text style={styles.eyebrow}>KNOCKED OUT</Text>
   <Text style={styles.body}>{out.map(r=>`P${r.position} ${r.name}`).join(' · ')}</Text></View>
  <View style={{gap:3}}><Text style={styles.eyebrow}>INTO {next}</Text>
   <View style={{flexDirection:'row',flexWrap:'wrap',columnGap:12,rowGap:2}}>{through.map(r=><Text key={r.driverId} style={{color:r.mine?ui.ink:teamInk(r.color),fontWeight:r.mine?'900':'600',fontSize:12}}>{r.position}. {r.name.split(' ').slice(-1)[0]}</Text>)}</View></View>
  {editable?Object.keys(draft).map(id=>{const p=draft[id]!,name=rows.find(r=>r.driverId===id)!.name;
   return <View key={id} style={{gap:8,borderTopWidth:1,borderTopColor:ui.line,paddingTop:10}}>
    <Text style={[styles.body,{fontWeight:'900'}]}>{name} · {next} plan</Text>
    <Segmented label="Tyres" value={p.tyre} onChange={tyre=>set(id,{tyre})} options={(['NEW_SOFT','USED_SOFT','MEDIUM','INTER'] as const).map(v=>({value:v,label:TYRE_LABEL[v]}))}/>
    <Segmented label="Runs" value={p.runs} onChange={runs=>set(id,{runs})} options={[{value:1 as const,label:'1 run'},{value:2 as const,label:'2 runs'}]}/>
    <Segmented label="Go out" value={p.timing} onChange={timing=>set(id,{timing})} options={(['EARLY','MIDDLE','LATE'] as const).map(v=>({value:v,label:TIMING_LABEL[v]}))}/>
    <Segmented label="Traffic" value={p.traffic} onChange={traffic=>set(id,{traffic})} options={(['FIND_SPACE','PUSH'] as const).map(v=>({value:v,label:TRAFFIC_LABEL[v]}))}/>
   </View>;}):null}
  <Action label={`CONTINUE TO ${next}`} onPress={()=>onContinue(draft)}/>
 </Card>;
}
