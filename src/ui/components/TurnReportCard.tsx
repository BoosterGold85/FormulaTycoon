import React from 'react';
import {Text,View} from 'react-native';
import {formatCampaignDate} from '../../simulation/campaignTime';
import type {SessionTurnReport} from '../hooks/useGameUniverse';
import {Action,Card,Chip,useDesign} from '../design/system';

const LABEL_TONE=(label:string)=>label==='ABOVE EXPECTATION'?'green':label==='ON TARGET'||label.endsWith('READY')||label.endsWith('FIXED')?'accent':'red';
/** Summary of the turn just processed. Display only; nothing here changes the career. */
export function TurnReportCard({report,onClose,onOpenDevelopment}:{report:SessionTurnReport;onClose:()=>void;onOpenDevelopment:()=>void}){
 const {styles}=useDesign();
 const title=report.target.kind==='FP1'?`${report.target.venue} · race weekend`:`Weekly report · ${formatCampaignDate(report.to)}`;
 const quiet=!report.points.length&&!report.changes.length&&!report.fitted.length&&!report.newEvents.length;
 return <Card accessibilityLabel="Turn report" style={{gap:8}}>
  <Text accessibilityRole="header" style={[styles.heading,{fontSize:17}]}>{title}</Text>
  {report.points.length?<View style={{flexDirection:'row',flexWrap:'wrap',gap:6}}>{report.points.map(p=><Chip key={p.category} text={`+${p.points} ${p.category}`} tone="accent"/>)}</View>:null}
  {report.changes.map(c=><Text key={c} style={styles.body}>{c}</Text>)}
  {report.fitted.map(f=><View key={f.part+f.venue} style={styles.between}><Text style={[styles.body,{flex:1}]}>{f.part} fitted at {f.venue}</Text><Chip text={f.label} tone={LABEL_TONE(f.label)}/></View>)}
  {report.newEvents.map(e=><Text key={e.part} style={[styles.body,{fontWeight:'800'}]}>Decision needed · {e.part}: {e.title}</Text>)}
  {report.rivalUpgrades?<Text style={styles.muted}>Rival teams fitted {report.rivalUpgrades} {report.rivalUpgrades===1?'upgrade':'upgrades'}.</Text>:null}
  {quiet?<Text style={styles.muted}>{report.target.kind==='FP1'?'Nothing new fitted this weekend.':'A quiet week in the factory.'}</Text>:null}
  {report.target.kind==='FP1'?<Text style={styles.muted}>Practice, qualifying and the race are not simulated yet. Continue to the next Monday.</Text>:null}
  <View style={{flexDirection:'row',gap:8}}><View style={{flex:1}}><Action label="View development" onPress={onOpenDevelopment}/></View><View style={{flex:1}}><Action label="Close" onPress={onClose} secondary/></View></View>
 </Card>;
}
