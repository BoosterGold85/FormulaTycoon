import React,{useState} from 'react';
import {View,Text,Pressable} from 'react-native';
import type {DriverWorld} from '../game/drivers/types';
import type {NavTab} from '../game/hudPlaceholders';
import {selectDriverRoster} from '../simulation/managementViews';
import type {GameUniverse,GameDefinition} from '../simulation/universe';
import {DriverProfile} from './DriverProfile';
import {DriverRosterRow} from './components/DriverRosterRow';
import {Screen,EmptyState,Section,ui} from './design/system';

type Props={universe:GameUniverse;definition:GameDefinition;world:DriverWorld;observer:string;onNavigate:(tab:NavTab)=>void;onScout:(id:string)=>void;onOption:(id:string)=>void};
export function DriversScreen(props:Props){
 const {universe,onNavigate}=props,[selected,setSelected]=useState<string|null>(null),[filter,setFilter]=useState<'available'|'prospects'|'reserves'|'grid'>('available');
 const roster=selectDriverRoster(universe);
 const row=(d:typeof roster.yourDrivers[number],featured=false)=><DriverRosterRow key={d.id} driver={d} featured={featured} onPress={()=>setSelected(d.id)}/>;
 return <Screen key={selected??'roster'} title={selected?'Driver dossier':'Drivers'} kicker="THE PEOPLE BEHIND THE PACE" subtitle={selected?undefined:'Your pairing. Your next opportunity.'} tab="DRIVERS" onNavigate={onNavigate}>
  {selected?<DriverProfile {...props} id={selected} onBack={()=>setSelected(null)}/>:<>
   <Section title="Your drivers" meta={`${roster.yourDrivers.length} race seats`}/>
   <View testID="your-drivers" style={{gap:8}}>{roster.yourDrivers.length?roster.yourDrivers.map(d=>row(d,true)):<EmptyState title="Your next pairing" text="No active race-seat contracts."/>}</View>
   <Section title="Driver market" meta="Explore the paddock"/>
   <View style={{flexDirection:'row',flexWrap:'wrap',gap:6}}>{(['available','prospects','reserves','grid'] as const).map(key=><Pressable key={key} accessibilityRole="button" accessibilityLabel={key==='grid'?'Starting grid':key[0]!.toUpperCase()+key.slice(1)} accessibilityState={{selected:filter===key}} onPress={()=>setFilter(key)} style={{minHeight:44,justifyContent:'center',flexGrow:1,paddingVertical:13,paddingHorizontal:9,borderRadius:8,backgroundColor:filter===key?ui.accent:ui.raised}}><Text style={{fontSize:11,fontWeight:'800',textAlign:'center',color:filter===key?ui.bg:ui.ink}}>{key==='grid'?'Grid':key[0]!.toUpperCase()+key.slice(1)} · {roster[key].length}</Text></Pressable>)}</View>
   <Section title={filter==='grid'?'The full starting grid':filter==='available'?'Available drivers':filter}/>
   <View testID="driver-market-list" style={{gap:12}}>{roster[filter].length?roster[filter].map(d=>row(d)):<EmptyState title="No drivers here" text="Try another part of the market."/>}</View>
  </>}
 </Screen>;
}
