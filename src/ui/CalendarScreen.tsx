import React,{useState} from 'react';
import {View,Text,Pressable} from 'react-native';
import {calendarById} from '../game/calendar';
import type {NavTab} from '../game/hudPlaceholders';
import type {GameUniverse,GameDefinition} from '../simulation/universe';
import {formatCampaignDate} from '../simulation/campaignTime';
import {calendarWindow} from '../simulation/calendar';
import {selectCalendarMonth} from '../simulation/calendar/monthView';
import {selectEventDetail} from '../simulation/calendar/eventDetail';
import {Action,Card,Chip,Disclosure,EmptyState,Screen,Section,styles,ui} from './design/system';
import {CircuitArt} from './art/CircuitArt';

const MONTHS=['January','February','March','April','May','June','July','August','September','October','November','December'];
type Props={universe:GameUniverse;definition:GameDefinition;onNavigate:(tab:NavTab)=>void};
export function CalendarScreen({universe,definition,onNavigate}:Props){
 const calendar=calendarById(universe.calendarId),window=calendarWindow(calendar,universe.currentDate);
 const [month,setMonth]=useState(Number((window.next?.weekendStartDate??universe.currentDate).slice(5,7))),[selected,setSelected]=useState<string|null>(null);
 const model=selectCalendarMonth(universe,month),detail=selected?selectEventDetail(universe,definition,selected):null;
 const next=window.next?selectEventDetail(universe,definition,window.next.id):null;
 return <Screen key={selected??'calendar'} title={detail?'Race weekend':'Race calendar'} kicker={`THE SEASON / ${calendar.season}`} subtitle={formatCampaignDate(universe.currentDate)} tab="RACE" onNavigate={onNavigate}>
  {detail?<>
   <Action label="Back to calendar" onPress={()=>setSelected(null)} secondary/>
   <Card accent={ui.gold} hero>
    <View style={styles.between}><Text style={styles.eyebrow}>ROUND {String(detail.round).padStart(2,'0')} · {detail.country}</Text>{detail.sprint?<Chip text="SPRINT" tone="red"/>:null}</View>
    <View style={styles.row}><View style={{flex:1,gap:7}}><Text accessibilityRole="header" style={[styles.title,{fontSize:33}]}>{detail.venue}</Text><Text style={styles.muted}>{detail.dates}</Text><Text style={styles.muted}>{detail.type.charAt(0)+detail.type.slice(1).toLowerCase()} circuit</Text></View><CircuitArt trackId={calendar.events.find(e=>e.id===detail.id)!.trackId} height={90} width={112}/></View>
   </Card>
   <View style={{gap:9,paddingVertical:4}}>
    <Text accessibilityRole="header" style={[styles.heading,{color:ui.green}]}>CAR FIT — {detail.fit?.label??'UNAVAILABLE'}</Text>
    <View style={{flexDirection:'row',gap:16}}><View style={{flex:1,gap:4}}><Text style={styles.eyebrow}>KEY STRENGTH</Text><Text style={styles.body}>{detail.fit?.strengths[0]??'No standout strength yet'}</Text></View><View style={{flex:1,gap:4}}><Text style={styles.eyebrow}>MAIN CONCERN</Text><Text style={styles.body}>{detail.fit?.concerns[0]??'No major shortfall'}</Text></View></View>
   </View>
   <Section title="Defining demands"/>
   <View testID="event-defining-demands" style={{flexDirection:'row',gap:10}}>{detail.demands.filter(d=>d.level==='VERY HIGH'||d.level==='HIGH').sort((a,b)=>Number(b.level==='VERY HIGH')-Number(a.level==='VERY HIGH')).slice(0,3).map(d=><View key={d.axis} style={{flex:1,paddingVertical:9,borderTopWidth:2,borderTopColor:ui.gold,gap:6}}><Text style={styles.muted}>{d.label}</Text><Text style={{color:ui.ink,fontSize:11,fontWeight:'800'}}>{d.level}</Text></View>)}</View>
   <Disclosure title="More details">
    <Text style={styles.eyebrow}>TRACK CHARACTER</Text><Text style={styles.body}>{detail.rationale}</Text>
    <Text style={styles.muted}>{detail.playerTeam??'No player team'} · {detail.status}</Text>
    <Text style={styles.eyebrow}>STRENGTHS</Text><Text style={styles.body}>{detail.fit?.strengths.join(' · ')||'No standout strengths yet.'}</Text>
    <Text style={styles.eyebrow}>CONCERNS</Text><Text style={styles.body}>{detail.fit?.concerns.join(' · ')||'No major technical shortfall.'}</Text>
    {detail.provisional?<Text style={{color:ui.gold,fontSize:13}}>Provisional profile · new circuit; technical balance is subject to review.</Text>:null}
    {detail.demands.map(d=><View key={d.axis} style={styles.between}><Text style={[styles.muted,{flex:1}]}>{d.label}</Text><Text style={[styles.body,{fontWeight:'700'}]}>{d.level}</Text></View>)}
    <Text style={styles.muted}>Driver, weather and strategy effects are not included. Illustration is stylized, not to scale.</Text>
   </Disclosure>
   <Text style={styles.muted}>Weekend sessions and results are not available yet.</Text>
  </>:<>
   {next?<Card accent={ui.gold} hero onPress={()=>setSelected(next.id)} accessibilityLabel="View weekend">
    <View style={styles.between}><Text style={[styles.eyebrow,{color:ui.gold}]}>NEXT RACE · ROUND {next.round}</Text>{next.sprint?<Chip text="SPRINT" tone="red"/>:null}</View>
    <View style={styles.row}><View style={{flex:1,gap:7}}><Text accessibilityRole="header" style={[styles.title,{fontSize:36,lineHeight:38}]}>{next.venue}</Text><Text style={styles.muted}>{next.dates}</Text></View><CircuitArt trackId={window.next!.trackId} height={84} width={114}/></View>
    <View style={[styles.between,{paddingBottom:8}]}><Text style={{fontSize:25,fontWeight:'900',color:ui.gold}}>{window.current?'THIS WEEKEND':`${window.daysUntil} DAYS`}</Text><Text style={{fontSize:11,fontWeight:'800',color:ui.green}}>CAR FIT · {next.fit?.label??'UNAVAILABLE'}</Text></View>
    <View style={[styles.between,{borderTopWidth:1,borderTopColor:'#3A5164',paddingTop:11}]}><Text style={{color:ui.ink,fontWeight:'800',fontSize:13}}>View weekend</Text><Text style={{fontSize:22,color:ui.gold}}>›</Text></View>
   </Card>:<EmptyState title="Season dates finished" text="Browse this season's circuits. Race results have not been generated."/>}
   <View style={{gap:8,borderTopWidth:1,borderTopColor:ui.line,paddingTop:4}}>
    <View style={styles.between}><Pressable accessibilityRole="button" accessibilityLabel="Previous month" accessibilityState={{disabled:month===1}} disabled={month===1} onPress={()=>setMonth(month-1)} style={{width:44,height:44,alignItems:'center',justifyContent:'center',opacity:month===1?.3:1}}><Text style={{color:ui.accent,fontSize:25}}>‹</Text></Pressable><Text accessibilityRole="header" style={[styles.heading,{fontSize:19}]}>{MONTHS[month-1]} {model.season}</Text><Pressable accessibilityRole="button" accessibilityLabel="Next month" accessibilityState={{disabled:month===12}} disabled={month===12} onPress={()=>setMonth(month+1)} style={{width:44,height:44,alignItems:'center',justifyContent:'center',opacity:month===12?.3:1}}><Text style={{color:ui.accent,fontSize:25}}>›</Text></Pressable></View>
    <View style={{flexDirection:'row'}}>{['MON','TUE','WED','THU','FRI','SAT','SUN'].map((d,i)=><Text key={i} style={{width:'14.285714%',textAlign:'center',fontSize:10,fontWeight:'800',color:ui.muted,paddingBottom:5}}>{d}</Text>)}</View>
    <View style={{flexDirection:'row',flexWrap:'wrap'}}>{model.cells.map((cell,index)=><View key={index} style={{width:'14.285714%',height:46,paddingHorizontal:1,paddingVertical:1}}>{cell?<Pressable accessibilityRole={cell.event?'button':undefined} accessibilityLabel={`${cell.date}${cell.current?', current date':''}${cell.event?`, ${cell.event.venue}, ${cell.event.status}`:''}`} disabled={!cell.event} onPress={()=>cell.event&&setSelected(cell.event.id)} style={{flex:1,borderRadius:cell.current?22:2,alignItems:'center',justifyContent:'center',borderWidth:cell.current?1:0,borderColor:ui.gold,backgroundColor:cell.event?(cell.event.status==='COMPLETED'?'#29333D':cell.event.next?'#396485':'#263E52'):'transparent'}}><Text style={{fontSize:15,fontWeight:cell.event||cell.current?'900':'500',color:cell.current?ui.gold:cell.event?.status==='COMPLETED'?ui.muted:ui.ink}}>{cell.day}</Text>{cell.event?<View style={{height:3,width:cell.event.sprint?13:5,borderRadius:2,backgroundColor:cell.event.sprint?ui.red:ui.accent,marginTop:2}}/>:null}</Pressable>:null}</View>)}</View>
    <View style={[styles.row,{justifyContent:'center',gap:16}]}><Text style={[styles.muted,{fontSize:10}]}>◌ TODAY</Text><Text style={[styles.muted,{fontSize:10,color:ui.accent}]}>● WEEKEND</Text><Text style={[styles.muted,{fontSize:10,color:ui.red}]}>━ SPRINT</Text></View>
   </View>
   <Section title="This month" meta={`${model.events.length} weekends`}/>
   {model.events.length?model.events.map(e=><Pressable key={e.id} accessibilityRole="button" accessibilityLabel={`Open ${e.venue} event`} onPress={()=>setSelected(e.id)} style={{paddingVertical:12,paddingHorizontal:14,borderBottomWidth:1,borderBottomColor:ui.line,borderLeftWidth:3,borderLeftColor:e.next?ui.gold:ui.line,gap:5}}><View style={styles.between}><Text style={[styles.heading,{fontSize:17}]}>{e.venue}</Text>{e.sprint?<Chip text="SPRINT" tone="red"/>:<Text style={styles.muted}>R{e.round} →</Text>}</View><Text style={styles.muted}>{e.dates} · {e.status}</Text></Pressable>):<Text style={styles.muted}>No race weekends scheduled this month.</Text>}
   <Text style={styles.muted}>{calendar.events.length} rounds · {calendar.events.filter(e=>e.sprint).length} Sprint weekends. Passed dates do not create results.</Text>
  </>}
 </Screen>;
}
