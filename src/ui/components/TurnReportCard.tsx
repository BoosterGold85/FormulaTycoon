import React,{useState} from 'react';
import {Text,View} from 'react-native';
import {formatCampaignDate} from '../../simulation/campaignTime';
import type {SessionTurnReport} from '../hooks/useGameUniverse';
import {usePlayback} from '../hooks/usePlayback';
import {Action,Card,Chip,useDesign} from '../design/system';

const LABEL_TONE=(label:string)=>label==='ABOVE EXPECTATION'?'green':label==='ON TARGET'||label.endsWith('READY')||label.endsWith('FIXED')?'accent':'red';
const DAYS=['Monday','Tuesday','Wednesday','Thursday','Friday'];

/** Summary of the turn just processed. It first REPLAYS the week's actual result (presentation only),
 * then shows outcomes. Nothing here changes the career. */
export function TurnReportCard({report,onClose,onOpenDevelopment}:{report:SessionTurnReport;onClose:()=>void;onOpenDevelopment:()=>void}){
 const {styles,ui}=useDesign();
 const working=report.points.length>0;
 const [skipped,setSkipped]=useState(false);
 const clock=usePlayback(`${report.from}>${report.to}`,3000,working);
 const t=skipped?1:clock;
 const playing=t<1;
 const title=playing?`The team is working · ${DAYS[Math.min(4,Math.floor(t*5))]}`:report.target.kind==='FP1'?`${report.target.venue} · race weekend`:`Weekly report · ${formatCampaignDate(report.to)}`;
 const quiet=!working&&!report.changes.length&&!report.fitted.length&&!report.newEvents.length;
 return <Card accessibilityLabel="Turn report" style={{gap:8}}>
  <Text accessibilityRole="header" style={[styles.heading,{fontSize:17}]}>{title}</Text>
  {working?<View style={{flexDirection:'row',flexWrap:'wrap',gap:6}}>{report.points.map(p=><Chip key={p.category} text={`+${Math.round(p.points*t)} ${p.category}`} tone="accent"/>)}</View>:null}
  {working?report.projects.map(p=>{const pct=Math.round(p.from+(p.to-p.from)*t);return <View key={p.id} style={{gap:3}}>
   <View style={styles.between}><Text style={[styles.body,{fontWeight:'800'}]}>{p.name}</Text><Text style={styles.muted}>{pct}%</Text></View>
   <View style={{height:6,backgroundColor:ui.line,borderRadius:3}}><View style={{width:`${pct}%`,height:6,backgroundColor:ui.accent,borderRadius:3}}/></View></View>;}):null}
  {!playing?<>
   {report.changes.map(c=><Text key={c} style={styles.body}>{c}</Text>)}
   {report.fitted.map(f=><View key={f.part+f.venue} style={styles.between}><Text style={[styles.body,{flex:1}]}>{f.part} fitted at {f.venue}</Text><Chip text={f.label} tone={LABEL_TONE(f.label)}/></View>)}
   {report.carChange?<View style={{gap:3,borderTopWidth:1,borderTopColor:ui.line,paddingTop:6}}>
    <Text style={styles.eyebrow}>WHAT CHANGED ON THE CAR</Text>
    {report.carChange.up.length?<Text style={[styles.body,{color:ui.green}]}>▲ {report.carChange.up.join(' · ')}</Text>:null}
    {report.carChange.down.length?<Text style={[styles.body,{color:ui.gold}]}>▼ {report.carChange.down.join(' · ')}</Text>:null}
    {!report.carChange.up.length&&!report.carChange.down.length?<Text style={styles.muted}>No measurable change — the new part did not deliver.</Text>:null}
    {report.carChange.venue?<Text style={styles.body}>{report.carChange.venue.name} suitability: {report.carChange.venue.before===report.carChange.venue.after?report.carChange.venue.after:`${report.carChange.venue.before} → ${report.carChange.venue.after}`}{report.carChange.venue.improved?' · improved':report.carChange.venue.worse?' · slightly worse':''}</Text>:null}
   </View>:null}
   {report.newEvents.map(e=><Text key={e.part} style={[styles.body,{fontWeight:'800'}]}>Decision needed · {e.part}: {e.title}</Text>)}
   {report.rivalNews.length?<View style={{gap:2,borderTopWidth:1,borderTopColor:ui.line,paddingTop:6}}>
    <Text style={styles.eyebrow}>PADDOCK NEWS</Text>
    {report.rivalNews.map(n=><Text key={n} style={styles.muted}>{n}</Text>)}
    {report.rivalUpgrades>report.rivalNews.length?<Text style={styles.muted}>…and {report.rivalUpgrades-report.rivalNews.length} more rival {report.rivalUpgrades-report.rivalNews.length===1?'change':'changes'}.</Text>:null}
   </View>:null}
   {quiet?<Text style={styles.muted}>{report.target.kind==='FP1'?'Nothing new fitted this weekend.':'A quiet week in the factory.'}</Text>:null}
   {report.target.kind==='FP1'?<Text style={styles.muted}>Practice, qualifying and the race are not simulated yet. Continue to the next Monday.</Text>:null}
  </>:null}
  <View style={{flexDirection:'row',gap:8}}><View style={{flex:1}}><Action label="View development" onPress={onOpenDevelopment}/></View><View style={{flex:1}}><Action label={playing?'Skip':'Close'} onPress={playing?()=>setSkipped(true):onClose} secondary/></View></View>
 </Card>;
}
