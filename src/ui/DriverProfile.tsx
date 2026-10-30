import React from 'react';
import {View,Text} from 'react-native';
import {BUCKETS,type DriverWorld} from '../game/drivers/types';
import {BUCKET_LABELS,driverView,selectDriverCarFit} from '../simulation/drivers';
import type {GameDefinition,GameUniverse} from '../simulation/universe';
import {teamBrand} from '../game/brandRegistry';
import {TeamDriverPortrait} from './art/DriverPortrait';
import {Action,Card,Chip,Disclosure,Fact,GradeBadge,Section,styles,ui} from './design/system';

type Props={universe:GameUniverse;definition:GameDefinition;world:DriverWorld;observer:string;id:string;onBack:()=>void;onScout:(id:string)=>void;onOption:(id:string)=>void;backLabel?:string};
export function DriverProfile({universe,definition,world,observer,id,onBack,onScout,onOption,backLabel='Back to drivers'}:Props){
 const d=driverView(world,observer,id,universe.currentDate),fit=selectDriverCarFit(universe,definition,id),color=d.teamId?teamBrand(d.teamId).color:ui.accent;
 return <>
  <Action label={backLabel} onPress={onBack} secondary/>
  <Card accent={color} hero>
   <Text style={[styles.eyebrow,{color}]}>{d.team}</Text>
   <View style={styles.row}><View style={{flex:1,minWidth:0,gap:7}}><Text accessibilityRole="header" style={[styles.title,{fontSize:32,lineHeight:34}]}>{d.name}</Text><Text style={styles.muted}>{d.nationality} · Age {d.age}</Text><Text style={[styles.eyebrow,{fontSize:10}]}>{d.raceSeat?'RACE DRIVER':d.teamId?'RESERVE':'AVAILABLE'}</Text></View><TeamDriverPortrait teamId={d.teamId} size={140}/></View>
   <View style={[styles.between,{borderTopWidth:1,borderTopColor:ui.line,paddingTop:12}]}><Chip text={d.form} tone="green"/><Text style={styles.muted}>Car · {fit??'Unassigned'}</Text></View>
  </Card>
  <Section title="Driver profile"/>
  <View style={{flexDirection:'row',flexWrap:'wrap',gap:8}}>{BUCKETS.map(key=><GradeBadge key={key} label={BUCKET_LABELS[key]} grade={d.grades[key]} large/>)}</View>
  <Section title="Specialties"/>
  <View style={{flexDirection:'row',flexWrap:'wrap',gap:8}}>{d.specialties.map(trait=><Chip key={trait} text={trait} tone="gold"/>)}{d.unknownTraits?<Chip text="Other traits unconfirmed"/>:null}</View>
  <View style={{gap:8,paddingVertical:8}}><Fact label="Driver / car fit" value={fit??'Unassigned'}/><Fact label="Familiarity" value={d.familiarity}/></View>
  <Disclosure title="Contract details">
   <Text style={styles.body}>{d.contract}</Text>
   {d.contractEnd!==null?<Text style={styles.muted}>Guaranteed through {d.contractEnd} · {d.futureGuaranteedYears} future guaranteed {d.futureGuaranteedYears===1?'year':'years'} after this season{d.futureEffectiveYears!==d.futureGuaranteedYears?` · ${d.futureEffectiveYears} including exercised option`:''}.</Text>:null}
   {d.sourceStatus?<Text style={styles.muted}>Source: {d.sourceStatus==='CONFIRMED'?'Confirmed':'Reported'} · Binding career contract.</Text>:null}
   {d.option?<Text style={styles.body}>{d.option}</Text>:null}
   {d.affiliations.length?<Text style={styles.body}>Driver system: {d.affiliations.join(' / ')}</Text>:null}
   {d.teamId===observer&&d.option?.includes('pending')&&d.contractId?<Action label={`Exercise ${d.optionYear} team option`} onPress={()=>onOption(d.contractId!)}/>:null}
   <Text style={styles.muted}>Contract terms only. Payroll is not simulated.</Text>
  </Disclosure>
  {d.category!=='GRID'?<Disclosure title="Scouting report">
   <Text style={styles.eyebrow}>SCOUTING · {d.confidence.toUpperCase()} CONFIDENCE</Text>
   <Fact label="Potential" value={d.potential}/><Text style={styles.body}>Last report {d.lastObserved}. Reports: {d.reports}.</Text>
   <Action label="Improve scouting report" onPress={()=>onScout(id)}/>
   <Text style={styles.muted}>Report review is currently free and instant. Estimates narrow as knowledge improves.</Text>
  </Disclosure>:null}
  <Disclosure title="Background & commercial">
   <Fact label="Career stage" value={d.stage.replaceAll('_',' ')}/><Text style={styles.body}>{d.summary}</Text><Text style={styles.eyebrow}>COMMERCIAL REACH</Text><Text style={styles.body}>{d.commercial}</Text>
   <Text style={styles.body}>{d.familiarity} · Current car: {fit??'No assigned car'}.</Text>
   <Text style={styles.muted}>Driver comfort is separate from circuit suitability.</Text>
  </Disclosure>
  <Disclosure title="Career history"><Text style={styles.body}>{d.history.length?`${d.history.length} recorded Formula Tycoon seasons.`:'No recorded Formula Tycoon seasons yet.'}</Text><Text style={styles.muted}>Race, qualifying and championship records will belong to this career when those systems are available.</Text></Disclosure>
 </>;
}
