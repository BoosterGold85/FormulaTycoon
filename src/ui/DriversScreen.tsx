import {activeChampionshipSeason} from '../simulation/campaignTime';
import React,{useState,useRef,useEffect} from 'react';
import {SafeAreaView,ScrollView,View,Text,Pressable,StyleSheet} from 'react-native';
import type {DriverWorld} from '../game/drivers/types';
import {BUCKETS} from '../game/drivers/types';
import type {NavTab} from '../game/hudPlaceholders';
import {driverView,BUCKET_LABELS,selectDriverCarFit} from '../simulation/drivers';
import type {GameUniverse,GameDefinition} from '../simulation/universe';
import {teamBrand} from '../game/brandRegistry';
import {BottomNav} from './components/BottomNav';
import {theme} from './theme';

type Props={universe:GameUniverse;definition:GameDefinition;world:DriverWorld;observer:string;tab:NavTab;onNavigate:(tab:NavTab)=>void;onScout:(id:string)=>void;onOption:(id:string)=>void};
type ViewDriver=ReturnType<typeof driverView>;
function Grades({driver}:{driver:ViewDriver}) {
 return <View style={s.grades}>{BUCKETS.map(key=><View key={key} style={s.grade}><Text style={s.small}>{BUCKET_LABELS[key]}</Text><Text style={s.letter}>{driver.grades[key]}</Text></View>)}</View>;
}
function Action({label,onPress}:{label:string;onPress:()=>void}) {
 return <Pressable accessibilityRole="button" accessibilityLabel={label} onPress={onPress} style={s.action}><Text style={s.actionText}>{label}</Text></Pressable>;
}
/** Consumes disclosure selectors only; hidden numeric ability/potential never renders. */
export function DriversScreen({universe,definition,world,observer,tab,onNavigate,onScout,onOption}:Props) {
 const scroll=useRef<ScrollView>(null);
 const [filter,setFilter]=useState<'GRID'|'PROSPECT'|'RESERVE'>('GRID');
 const [selected,setSelected]=useState<string|null>(null);
 const [notice,setNotice]=useState('');
 useEffect(()=>{scroll.current?.scrollTo({y:0,animated:false});},[selected,filter,tab]);
 const all=Object.keys(world.drivers).map(id=>driverView(world,observer,id,universe.currentDate));
 const selectedDriver=selected?driverView(world,observer,selected,universe.currentDate):null;
 const fit=selectedDriver?selectDriverCarFit(universe,definition,selectedDriver.id):null;
 const comparison=tab==='TEAM';
 const visible=comparison?all.filter(d=>d.raceSeat&&d.teamId===observer):all.filter(d=>d.category===filter);
 const navigate=(next:NavTab,available:boolean)=>{if(available){setSelected(null);setNotice('');onNavigate(next);}else setNotice(`${next} · Coming soon`);};
 return <SafeAreaView style={s.safe}>
   <View style={s.header}><Text style={s.kicker}>FORMULA TYCOON / {activeChampionshipSeason(universe.currentDate)}</Text><Text style={s.title}>{comparison?'Your driver pairing':'Driver world'}</Text>
   <Text style={s.subtitle}>{comparison?teamBrand(observer).name:'22 seats. Distinct strengths. No single overall rating.'}</Text></View>
   {notice?<Text accessibilityRole="alert" style={s.notice}>{notice}</Text>:null}
   <ScrollView ref={scroll} style={s.scroll} contentContainerStyle={s.content}>
    {selectedDriver ? <>
      <Action label="Back to drivers" onPress={()=>setSelected(null)}/>
      <View style={s.card}>
       <Text style={s.kicker}>{selectedDriver.team}</Text><Text accessibilityRole="header" style={s.name}>{selectedDriver.name}</Text>
       <Text style={s.subtitle}>{selectedDriver.nationality} · Age {selectedDriver.age} · {selectedDriver.stage.replace('_',' ')}</Text>
       <Grades driver={selectedDriver}/>
       <Text style={s.body}>{selectedDriver.summary}</Text>
       <Text style={s.label}>SPECIALTIES</Text><Text style={s.body}>{selectedDriver.specialties.join(' · ')}{selectedDriver.unknownTraits?' · Other traits unconfirmed':''}</Text>
       <Text style={s.label}>CONTRACT</Text><Text style={s.body}>{selectedDriver.contract}</Text>
       {selectedDriver.contractEnd!==null?<Text style={s.body}>Guaranteed through {selectedDriver.contractEnd} · {selectedDriver.futureGuaranteedYears} future guaranteed {selectedDriver.futureGuaranteedYears===1?'year':'years'} after this season{selectedDriver.futureEffectiveYears!==selectedDriver.futureGuaranteedYears?` · ${selectedDriver.futureEffectiveYears} including exercised option`:''}.</Text>:null}
       {selectedDriver.sourceStatus?<Text style={s.small}>Source: {selectedDriver.sourceStatus==='CONFIRMED'?'Confirmed':'Reported'} · Binding career contract.</Text>:null}
       {selectedDriver.affiliations.length?<Text style={s.body}>Driver system: {selectedDriver.affiliations.join(' / ')}</Text>:null}
       {selectedDriver.option?<Text style={s.body}>{selectedDriver.option}</Text>:null}
       {selectedDriver.teamId===observer&&selectedDriver.option?.includes('pending')&&selectedDriver.contractId?<Action label={`Exercise ${selectedDriver.optionYear} team option`} onPress={()=>onOption(selectedDriver.contractId!)}/>:null}
       <Text style={s.label}>CURRENT FORM</Text><Text style={s.body}>{selectedDriver.form}</Text>
       <Text style={s.label}>COMMERCIAL REACH</Text><Text style={s.body}>{selectedDriver.commercial}</Text>
       <Text style={s.label}>TEAM & CAR KNOWLEDGE</Text><Text style={s.body}>{selectedDriver.familiarity} · Current car: {fit??'No assigned car'}. Coarse comfort estimate; no race effects yet.</Text>
       <Text style={s.label}>CAREER</Text><Text style={s.body}>Fictional reputation summary above. {selectedDriver.history.length} recorded Formula Tycoon seasons. Future results belong to this career.</Text>
       {selectedDriver.category!=='GRID'?<>
         <Text style={s.label}>SCOUTING · {selectedDriver.confidence.toUpperCase()} CONFIDENCE</Text>
         <Text style={s.body}>Potential: {selectedDriver.potential}. Last report {selectedDriver.lastObserved}. Reports: {selectedDriver.reports}.</Text>
         <Action label="Improve scouting report" onPress={()=>onScout(selectedDriver.id)}/>
         <Text style={s.small}>Prototype report review is free; scouting cost and elapsed time are future work.</Text>
       </>:null}
      </View>
    </> : <>
      {!comparison?<View style={s.filters}>{(['GRID','PROSPECT','RESERVE'] as const).map(category=><Pressable key={category} accessibilityRole="button" accessibilityLabel={category==='GRID'?'Starting grid':category==='PROSPECT'?'Prospects':'Reserves'} onPress={()=>setFilter(category)} style={[s.filter,filter===category&&s.activeFilter]}><Text style={s.actionText}>{`${category==='GRID'?'Grid':category==='PROSPECT'?'Prospects':'Market'} · ${all.filter(d=>d.category===category).length}`}</Text></Pressable>)}</View>:<Text style={s.body}>Compare the whole driver: execution, feedback and commercial value can matter as much as raw pace. Contract figures are obligations only; payroll is not simulated.</Text>}
      <Text style={s.small}>{comparison?'YOUR TWO CONTRACTED DRIVERS':filter==='GRID'?'2026 STARTING GRID':filter==='PROSPECT'?'PROSPECTS · ESTIMATES, NOT TRUE ABILITY':'RESERVES & FREE AGENTS'}</Text>
      {visible.map(driver=><Pressable key={driver.id} accessibilityRole="button" accessibilityLabel={`View ${driver.name}`} onPress={()=>setSelected(driver.id)} style={s.card}>
       <Text style={[s.kicker,{color:driver.teamId?teamBrand(driver.teamId).color:theme.textMuted}]}>{driver.team}</Text>
       <Text style={s.name}>{driver.name}</Text><Text style={s.subtitle}>{driver.nationality} · Age {driver.age}</Text>
       <Grades driver={driver}/><Text style={s.body}>{driver.contract}</Text>
       {driver.category!=='GRID'?<Text style={s.small}>{driver.confidence} confidence · Potential: {driver.potential}</Text>:null}
      </Pressable>)}
    </>}
   </ScrollView>
   <BottomNav active={tab} onSelect={navigate}/>
 </SafeAreaView>;
}
const s=StyleSheet.create({
 safe:{flex:1,backgroundColor:theme.background},header:{paddingHorizontal:18,paddingTop:12,paddingBottom:16,borderBottomWidth:1,borderBottomColor:theme.panelBorder},
 kicker:{fontSize:10,fontWeight:'800',letterSpacing:1.1,color:'#9CB1C6',textTransform:'uppercase'},title:{fontSize:26,fontWeight:'900',color:theme.text,marginTop:5},
 subtitle:{fontSize:12,lineHeight:19,color:theme.textMuted,marginTop:4},scroll:{flex:1},content:{padding:14,gap:12,paddingBottom:24},
 card:{padding:15,backgroundColor:theme.panel,borderWidth:1,borderColor:theme.panelBorder,borderRadius:13,gap:4},name:{fontSize:20,fontWeight:'800',color:theme.text},
 grades:{flexDirection:'row',flexWrap:'wrap',marginTop:10,marginBottom:5,gap:6},grade:{width:'31%',backgroundColor:'#1C2A3B',borderRadius:6,padding:7,minHeight:55},
 small:{fontSize:10,lineHeight:15,color:'#A2B4C8'},letter:{fontSize:15,fontWeight:'800',color:'#82DBC1',marginTop:3},body:{fontSize:12,lineHeight:20,color:'#D4DEE9'},
 label:{fontSize:10,fontWeight:'800',letterSpacing:1,color:'#92AAC1',marginTop:13},action:{borderWidth:1,borderColor:'#627C96',borderRadius:8,padding:11,marginVertical:6},
 actionText:{fontSize:12,fontWeight:'800',color:theme.text,textAlign:'center'},filters:{flexDirection:'row',gap:6},filter:{flex:1,paddingVertical:12,borderRadius:8,backgroundColor:'#1C2A3B'},
 activeFilter:{backgroundColor:'#6B2C3A',borderBottomWidth:2,borderBottomColor:theme.accent},notice:{color:theme.warning,fontSize:12,padding:8}
});
