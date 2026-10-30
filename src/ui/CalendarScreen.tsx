import React,{useEffect,useRef,useState} from 'react';
import {SafeAreaView,ScrollView,View,Text,Pressable,StyleSheet} from 'react-native';
import {calendarById} from '../game/calendar';
import type {NavTab} from '../game/hudPlaceholders';
import type {GameUniverse,GameDefinition} from '../simulation/universe';
import {formatCampaignDate} from '../simulation/campaignTime';
import {calendarEventViews} from '../simulation/calendar';
import {selectEventDetail} from '../simulation/calendar/eventDetail';
import {BottomNav} from './components/BottomNav';
import {theme} from './theme';

type Props={universe:GameUniverse;definition:GameDefinition;onNavigate:(tab:NavTab)=>void};
/** Calendar browsing/technical disclosure only. No results, advance command or race prediction. */
export function CalendarScreen({universe,definition,onNavigate}:Props) {
 const [selected,setSelected]=useState<string|null>(null),[notice,setNotice]=useState('');
 const scroll=useRef<ScrollView>(null);
 const calendar=calendarById(universe.calendarId),events=calendarEventViews(calendar,universe.currentDate);
 const detail=selected?selectEventDetail(universe,definition,selected):null;
 useEffect(()=>{scroll.current?.scrollTo({y:0,animated:false});},[selected]);
 return <SafeAreaView style={s.safe}>
  <View style={s.header}>
   <Text style={s.kicker}>FORMULA TYCOON / {calendar.season}</Text>
   <Text accessibilityRole="header" style={s.title}>{detail?'Circuit briefing':'Calendar'}</Text>
   <Text style={s.subtitle}>{formatCampaignDate(universe.currentDate)} · {events.length} rounds · {events.filter(e=>e.sprint).length} Sprint weekends</Text>
  </View>
  {notice?<Text accessibilityRole="alert" style={s.body}>{notice}</Text>:null}
  <ScrollView ref={scroll} style={{flex:1}} contentContainerStyle={s.content}>
   {detail?<>
    <Pressable accessibilityRole="button" accessibilityLabel="Back to calendar" onPress={()=>setSelected(null)} style={s.back}><Text style={s.link}>← BACK TO CALENDAR</Text></Pressable>
    <View style={s.card}>
     <Text style={s.kicker}>ROUND {detail.round} · {detail.country}</Text>
     <Text accessibilityRole="header" style={s.venue}>{detail.venue}</Text>
     <Text style={s.body}>{detail.dates}{detail.sprint?' · SPRINT':''}</Text>
     <Text style={s.meta}>{detail.type.charAt(0)+detail.type.slice(1).toLowerCase()} circuit · {detail.status}</Text>
     <Text style={s.body}>{detail.rationale}</Text>
     {detail.provisional?<Text style={s.warning}>Provisional profile · new circuit; technical balance is subject to review.</Text>:null}
    </View>
    <View style={s.card}>
     <Text style={s.kicker}>TRACK CHARACTER</Text>
     <View style={s.demands}>{detail.demands.map(d=><View key={d.axis} style={s.demand}><Text style={s.meta}>{d.label}</Text><Text style={s.level}>{d.level}</Text></View>)}</View>
    </View>
    <View style={s.card}>
     <Text style={s.kicker}>{detail.playerTeam??'NO PLAYER TEAM'}</Text>
     <Text accessibilityRole="header" style={s.fit}>CAR FIT — {detail.fit?.label??'UNAVAILABLE'}</Text>
     <Text style={s.meta}>Technical suitability only. Driver, weather and strategy effects are not included.</Text>
     <Text style={s.section}>STRENGTHS</Text>
     <Text style={s.body}>{detail.fit?.strengths.length?detail.fit.strengths.join(' · '):'No standout strength against these demands yet.'}</Text>
     <Text style={s.section}>CONCERNS</Text>
     <Text style={s.body}>{detail.fit?.concerns.length?detail.fit.concerns.join(' · '):'No major technical shortfall at this level.'}</Text>
    </View>
   </>:<>
    <Text style={s.meta}>Explore the circuits and how your fitted car suits each one. Sprint markers identify the shorter-format weekends; sessions are not simulated yet.</Text>
    {events.map(e=><Pressable key={e.id} accessibilityRole="button" accessibilityLabel={`Open ${e.venue} event`} onPress={()=>setSelected(e.id)} style={[s.card,e.next&&s.nextCard]}>
     <View style={s.topline}><Text style={s.kicker}>ROUND {String(e.round).padStart(2,'0')}</Text>{e.next?<Text style={s.next}>NEXT EVENT</Text>:null}{e.sprint?<Text style={s.sprint}>SPRINT</Text>:null}</View>
     <Text style={s.venue}>{e.venue}</Text><Text style={s.meta}>{e.country}</Text>
     <Text style={s.body}>{e.dates}</Text><Text style={s.status}>{e.status}</Text>
    </Pressable>)}
   </>}
   <Text style={s.footnote}>Completed means the calendar date has passed. No race results or finishing predictions are generated.</Text>
  </ScrollView>
  <BottomNav active="RACE" onSelect={(tab,available)=>available?onNavigate(tab):setNotice(`${tab} · Coming soon`)}/>
 </SafeAreaView>;
}
const s=StyleSheet.create({
 safe:{flex:1,backgroundColor:theme.background},header:{padding:18,borderBottomWidth:1,borderColor:theme.panelBorder},
 kicker:{fontSize:10,fontWeight:'800',letterSpacing:1,color:'#A2B5C9',textTransform:'uppercase'},
 title:{fontSize:27,fontWeight:'900',color:theme.text,marginTop:5},subtitle:{fontSize:12,color:'#A2B5C9',marginTop:6},
 content:{padding:14,gap:12,paddingBottom:24},card:{backgroundColor:theme.panel,borderWidth:1,borderColor:theme.panelBorder,borderRadius:13,padding:16,gap:5},
 nextCard:{borderColor:'#A37B2B',borderLeftWidth:3},topline:{flexDirection:'row',flexWrap:'wrap',gap:12,alignItems:'center'},
 next:{fontSize:10,fontWeight:'900',letterSpacing:.6,color:theme.warning},sprint:{fontSize:10,fontWeight:'900',color:'#F38990'},
 venue:{fontSize:23,fontWeight:'800',color:theme.text,marginTop:2},body:{fontSize:13,lineHeight:21,color:'#D5DFEA'},
 meta:{fontSize:12,lineHeight:19,color:'#A2B5C9'},status:{fontSize:10,fontWeight:'800',color:'#88C9B6',marginTop:4,letterSpacing:.8},
 back:{paddingVertical:10},link:{fontSize:11,fontWeight:'800',color:'#AFCAE5'},warning:{fontSize:12,lineHeight:19,color:theme.warning,marginTop:5},
 demands:{flexDirection:'row',flexWrap:'wrap',gap:8,marginTop:8},demand:{width:'48%',minHeight:57,backgroundColor:'#1C2A3B',padding:9,borderRadius:7},
 level:{fontSize:11,fontWeight:'900',color:'#BFD8EF',marginTop:3},fit:{fontSize:20,fontWeight:'900',color:'#8FDEC2',marginTop:4},
 section:{fontSize:10,fontWeight:'900',color:'#9EB6CE',letterSpacing:1,marginTop:12},footnote:{fontSize:11,lineHeight:18,color:'#91A4BA',padding:4}
});
