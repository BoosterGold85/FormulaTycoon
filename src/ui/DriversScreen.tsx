import React,{useState} from 'react';
import {View,Text,Pressable} from 'react-native';
import type {DriverWorld} from '../game/drivers/types';
import type {NavTab} from '../game/hudPlaceholders';
import {selectDriverRoster} from '../simulation/managementViews';
import type {GameUniverse,GameDefinition} from '../simulation/universe';
import {teamBrand} from '../game/brandRegistry';
import {DriverProfile} from './DriverProfile';
import {DriverIdentity} from './art/IdentityArt';
import {Screen,Card,Chip,CompactRow,EmptyState,Section,styles,ui} from './design/system';

type Props={universe:GameUniverse;definition:GameDefinition;world:DriverWorld;observer:string;onNavigate:(tab:NavTab)=>void;onScout:(id:string)=>void;onOption:(id:string)=>void};
export function DriversScreen(props:Props){
 const {universe,onNavigate}=props,[selected,setSelected]=useState<string|null>(null),[filter,setFilter]=useState<'available'|'prospects'|'reserves'|'grid'>('available');
 const roster=selectDriverRoster(universe);
 const row=(d:typeof roster.yourDrivers[number])=><CompactRow key={d.id} label={d.name} detail={`${d.team} · ${d.contractEnd?`Through ${d.contractEnd}`:'No contract'}`} accessibilityLabel={`View ${d.name}`} onPress={()=>setSelected(d.id)} leading={<DriverIdentity name={d.name} color={d.teamId?teamBrand(d.teamId).color:ui.accent}/>} trailing={<View style={{alignItems:'flex-end',gap:4}}><Text style={{color:ui.green,fontSize:14,fontWeight:'900'}}>Talent {d.grades.talent}</Text><Text style={styles.muted}>{d.form}</Text></View>}/>;
 return <Screen key={selected??'roster'} title={selected?'Driver dossier':'Drivers'} kicker="THE PEOPLE BEHIND THE PACE" subtitle={selected?undefined:'Your pairing. Your next opportunity.'} tab="DRIVERS" onNavigate={onNavigate}>
  {selected?<DriverProfile {...props} id={selected} onBack={()=>setSelected(null)}/>:<>
   <Section title="Your drivers" meta={`${roster.yourDrivers.length} race seats`}/>
   <View testID="your-drivers" style={{gap:12}}>{roster.yourDrivers.length?roster.yourDrivers.map(row):<EmptyState title="Your next pairing" text="No active race-seat contracts."/>}</View>
   <Card style={{padding:14}}><Text style={styles.eyebrow}>THE DRIVER MARKET</Text><Text style={styles.heading}>Find your next advantage.</Text><Text style={styles.muted}>Browse identities first. Open a dossier for the full picture.</Text></Card>
   <View style={{flexDirection:'row',flexWrap:'wrap',gap:6}}>{(['available','prospects','reserves','grid'] as const).map(key=><Pressable key={key} accessibilityRole="button" accessibilityLabel={key==='grid'?'Starting grid':key[0]!.toUpperCase()+key.slice(1)} accessibilityState={{selected:filter===key}} onPress={()=>setFilter(key)} style={{minHeight:44,justifyContent:'center',flexGrow:1,paddingVertical:13,paddingHorizontal:9,borderRadius:8,backgroundColor:filter===key?ui.accent:ui.raised}}><Text style={{fontSize:11,fontWeight:'800',textAlign:'center',color:filter===key?ui.bg:ui.ink}}>{key==='grid'?'Grid':key[0]!.toUpperCase()+key.slice(1)} · {roster[key].length}</Text></Pressable>)}</View>
   <Section title={filter==='grid'?'The full starting grid':filter==='available'?'Available drivers':filter}/>
   <View testID="driver-market-list" style={{gap:12}}>{roster[filter].length?roster[filter].map(row):<EmptyState title="No drivers here" text="Try another part of the market."/>}</View>
  </>}
 </Screen>;
}
