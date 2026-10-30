import React from 'react';
import {View,Text} from 'react-native';
import {BUCKETS,type DriverWorld} from '../game/drivers/types';
import {BUCKET_LABELS,driverView,selectDriverCarFit} from '../simulation/drivers';
import type {GameDefinition,GameUniverse} from '../simulation/universe';
import {teamBrand} from '../game/brandRegistry';
import {DriverIdentity} from './art/IdentityArt';
import {Action,Card,Chip,Disclosure,Fact,GradeBadge,Section,styles,ui} from './design/system';

type Props={universe:GameUniverse;definition:GameDefinition;world:DriverWorld;observer:string;id:string;onBack:()=>void;onScout:(id:string)=>void;onOption:(id:string)=>void;backLabel?:string};
export function DriverProfile({universe,definition,world,observer,id,onBack,onScout,onOption,backLabel='Back to drivers'}:Props){
 const d=driverView(world,observer,id,universe.currentDate),fit=selectDriverCarFit(universe,definition,id),color=d.teamId?teamBrand(d.teamId).color:ui.accent;
 return <>
  <Action label={backLabel} onPress={onBack} secondary/>
  <Card accent={color}>
   <View style={styles.row}><DriverIdentity name={d.name} color={color} large/><View style={{flex:1,gap:8}}><Text style={styles.eyebrow}>{d.team}</Text><Text accessibilityRole="header" style={[styles.title,{fontSize:27}]}>{d.name}</Text><Chip text={d.raceSeat?'RACE DRIVER':d.teamId?'RESERVE':'AVAILABLE'} tone="accent"/></View></View>
   <Text style={styles.muted}>{d.nationality} · Age {d.age} · {d.stage.replaceAll('_',' ')}</Text>
  </Card>
  <Section title="Driver strengths" meta="Six distinct categories"/>
  <View style={{flexDirection:'row',flexWrap:'wrap',gap:8}}>{BUCKETS.map(key=><GradeBadge key={key} label={BUCKET_LABELS[key]} grade={d.grades[key]} large/>)}</View>
  <Card><Text style={styles.eyebrow}>CURRENT STATUS</Text><View style={{flexDirection:'row',flexWrap:'wrap',gap:8}}><Chip text={d.form} tone="green"/><Chip text={`Car · ${fit??'Unassigned'}`} tone="accent"/><Chip text={d.familiarity}/></View><Text style={styles.muted}>Driver comfort is separate from circuit suitability.</Text></Card>
  <Section title="Specialties"/>
  <View style={{flexDirection:'row',flexWrap:'wrap',gap:8}}>{d.specialties.map(trait=><Chip key={trait} text={trait} tone="gold"/>)}{d.unknownTraits?<Chip text="Other traits unconfirmed"/>:null}</View>
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
   <Text style={styles.body}>{d.summary}</Text><Text style={styles.eyebrow}>COMMERCIAL REACH</Text><Text style={styles.body}>{d.commercial}</Text>
   <Text style={styles.body}>{d.familiarity} · Current car: {fit??'No assigned car'}.</Text>
  </Disclosure>
  <Disclosure title="Career history"><Text style={styles.body}>{d.history.length?`${d.history.length} recorded Formula Tycoon seasons.`:'No recorded Formula Tycoon seasons yet.'}</Text><Text style={styles.muted}>Race, qualifying and championship records will belong to this career when those systems are available.</Text></Disclosure>
 </>;
}
