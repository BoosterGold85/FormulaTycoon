import React from 'react';
import {ScrollView,Text,View,useWindowDimensions} from 'react-native';
import {formatCampaignDate,type CampaignDate} from '../../simulation/campaignTime';
import type {SessionTurnReport} from '../hooks/useGameUniverse';
import {Action,Chip,useDesign} from '../design/system';

const LABEL_TONE=(label:string)=>label==='ABOVE EXPECTATION'?'green':label==='ON TARGET'||label.endsWith('READY')||label.endsWith('FIXED')?'accent':'red';
const short=(d:CampaignDate|null)=>d?formatCampaignDate(d).replace(/, \d{4}$/,''):'after the final race';
const SWING_LABEL={SETBACK:'SETBACK',STALL:'SETBACK',BREAKTHROUGH:'BREAKTHROUGH'} as const;

/** End-of-turn confirmation. The HQ has already replayed the week; this only states the authoritative
 * outcome. Quiet weeks stay quiet. Nothing here changes the career. */
export function TurnReportCard({report,onClose,onOpenDevelopment}:{report:SessionTurnReport;onClose:()=>void;onOpenDevelopment:()=>void}){
 const {styles,ui}=useDesign();
 const tall=useWindowDimensions().height;
 const weekend=report.weekend;
 const body=weekend?<>
  <Text style={[styles.eyebrow,{color:ui.accent}]}>RACE WEEKEND</Text>
  <Text accessibilityRole="header" style={[styles.heading,{fontSize:22}]}>{weekend.venue.toUpperCase()}</Text>
  <View style={styles.between}><Text style={styles.muted}>Car suitability</Text><Chip text={weekend.suitability} tone="accent"/></View>
  <Text style={styles.body}>Latest development: {weekend.fitted.length?`${weekend.fitted.join(' · ')} fitted`:'no new parts this weekend'}</Text>
  {report.fitted.map(f=><View key={f.part+f.venue} style={{gap:2}}><View style={styles.between}><Text style={[styles.body,{flex:1,fontWeight:'800'}]}>{f.part}</Text><Chip text={f.label} tone={LABEL_TONE(f.label)}/></View>
   {f.reason?<Text style={styles.muted}>Reason: {f.reason.toLowerCase()}.</Text>:null}</View>)}
  {report.carChange?<CarChange report={report}/>:null}
  <Text style={styles.muted}>Practice, qualifying and the race are not simulated yet. This week's factory work is reported on Monday.</Text>
 </>:<>
  <Text style={styles.eyebrow}>WEEK COMPLETE · {short(report.to)}</Text>
  {report.stories.map(s=>{const row=report.projects.find(p=>p.id===s.projectId)!;const swing=SWING_LABEL[s.swing as keyof typeof SWING_LABEL];
   const moved=s.readyBefore!==s.readyAfter,fitMoved=s.fitBefore!==s.fitAfter;
   return <View key={s.projectId} style={{gap:4}}>
    <Text accessibilityRole="header" style={[styles.heading,{fontSize:17}]}>{s.name.toUpperCase()}</Text>
    <View style={{flexDirection:'row',flexWrap:'wrap',gap:6}}>{segmentsByCategory(row.segments).map(([c,v])=><Chip key={c} text={`+${v} ${c.toUpperCase()}`} tone={swing==='BREAKTHROUGH'?'green':'accent'}/>)}
     {!row.segments.some(x=>x.points>0)?<Chip text="NO PROGRESS" tone="red"/>:null}</View>
    <Text style={styles.body}>Progress {row.from}% → {row.to}%{row.stage!=='Ready'?` · ${row.stage}`:''}</Text>
    {swing&&s.title?<View style={{gap:1}}><Text style={{color:swing==='BREAKTHROUGH'?ui.green:ui.gold,fontSize:12,fontWeight:'900',letterSpacing:.8}}>{s.title.toUpperCase()===swing?swing:`${swing} · ${s.title.toUpperCase()}`}</Text>
     <Text style={styles.muted}>{s.text} Expected about +{s.expected}, delivered +{s.actual}.{s.quality>0?' The part should be better than first predicted.':s.quality<0?' The part has lost some of its predicted performance.':''}</Text></View>
     :s.decisionDelay&&s.title?<Text style={styles.muted}>{s.text}</Text>:null}
    {moved||fitMoved?<Text style={[styles.body,{fontWeight:'700'}]}>Ready estimate {short(s.readyBefore)} → {short(s.readyAfter)}{fitMoved?` · now fits ${s.fitAfter??'—'} (was ${s.fitBefore??'—'})`:''}</Text>:null}
   </View>;})}
  {report.completed.map(c=><View key={c.name} style={{gap:2,borderTopWidth:1,borderTopColor:ui.line,paddingTop:6}}>
   <Text style={[styles.eyebrow,{color:ui.green}]}>{c.name.toUpperCase()} COMPLETE</Text>
   {c.predicted?<Text style={styles.body}>Expected: {c.predicted.toLowerCase()} improvement · development quality: {c.quality!.toLowerCase()}</Text>:null}
   {c.reason?<Text style={styles.muted}>{c.reason}. The real result is only known once the part runs on the car.</Text>:null}
   <Text style={[styles.body,{fontWeight:'800'}]}>{c.held?'Held back from the next weekend':c.readyFor?`Fits at ${c.readyFor}`:'No race weekend left to fit it'}</Text>
  </View>)}
  {report.fitted.map(f=><View key={f.part+f.venue} style={styles.between}><Text style={[styles.body,{flex:1}]}>{f.part} fitted at {f.venue}</Text><Chip text={f.label} tone={LABEL_TONE(f.label)}/></View>)}
  {report.waiting.map(r=><View key={r.name} style={styles.between}><Text style={[styles.body,{flex:1,fontWeight:'800'}]}>{r.name} ready</Text>
   <Chip text={r.held?'HELD BACK':r.readyFor?`FITS AT ${r.readyFor.toUpperCase()}`:'NO WEEKEND LEFT'} tone="green"/></View>)}
  {!report.stories.length&&!report.completed.length&&!report.waiting.length?<Text style={styles.muted}>{report.projects.length?'A quiet week in the factory.':'Your factory is idle. Start a project to put the team to work.'}</Text>:null}
 </>;
 return <View accessibilityLabel="Turn report" style={{backgroundColor:ui.surface,borderColor:ui.border,borderWidth:1,borderRadius:8,maxHeight:tall*0.62,overflow:'hidden'}}>
  <ScrollView contentContainerStyle={{padding:14,gap:8}}>
   {body}
   {report.newEvents.map(e=><View key={e.part} style={{gap:2,borderTopWidth:1,borderTopColor:ui.line,paddingTop:6}}>
    <Text style={[styles.eyebrow,{color:ui.gold}]}>ENGINEERING DECISION REQUIRED</Text>
    <Text style={[styles.body,{fontWeight:'800'}]}>{e.part}: {e.title}</Text></View>)}
   {report.rivalNews.length?<View style={{gap:2,borderTopWidth:1,borderTopColor:ui.line,paddingTop:6}}>
    <Text style={styles.eyebrow}>PADDOCK</Text>
    {report.rivalNews.map(n=><Text key={n} style={styles.muted}>{n}</Text>)}
   </View>:null}
  </ScrollView>
  <View style={{flexDirection:'row',gap:8,padding:14,paddingTop:6}}>
   <View style={{flex:1}}><Action label={report.newEvents.length?'REVIEW':'View development'} onPress={onOpenDevelopment} secondary={!report.newEvents.length}/></View>
   <View style={{flex:1}}><Action label={weekend?'ENTER WEEKEND':'CONTINUE'} onPress={onClose} secondary={!!report.newEvents.length}/></View>
  </View>
 </View>;
}

function segmentsByCategory(segments:Array<{category:string;points:number}>):Array<[string,number]>{
 const m=new Map<string,number>();for(const s of segments)if(s.points>0)m.set(s.category,(m.get(s.category)??0)+s.points);return [...m];
}
function CarChange({report}:{report:SessionTurnReport}){
 const {styles,ui}=useDesign();const c=report.carChange!;
 return <View style={{gap:3,borderTopWidth:1,borderTopColor:ui.line,paddingTop:6}}>
  <Text style={styles.eyebrow}>WHAT CHANGED ON THE CAR</Text>
  {c.up.length?<Text style={[styles.body,{color:ui.green}]}>▲ {c.up.join(' · ')}</Text>:null}
  {c.down.length?<Text style={[styles.body,{color:ui.gold}]}>▼ {c.down.join(' · ')}</Text>:null}
  {!c.up.length&&!c.down.length?<Text style={styles.muted}>No measurable change. The new part did not deliver.</Text>:null}
  {c.venue&&c.venue.before!==c.venue.after?<Text style={styles.body}>{c.venue.name} suitability: {c.venue.before} → {c.venue.after}</Text>:null}
 </View>;
}
