import React,{useState} from 'react';
import {View,Text} from 'react-native';
import type {NavTab} from '../game/hudPlaceholders';
import type {GameUniverse,GameDefinition} from '../simulation/universe';
import {selectTeamOverview} from '../simulation/managementViews';
import {Action,Card,Chip,CompactRow,Disclosure,EmptyState,Fact,Screen,Section,styles,ui} from './design/system';
import {CarArt,DriverIdentity,GarageArt} from './art/IdentityArt';
import {DriverProfile} from './DriverProfile';
type Props={universe:GameUniverse;definition:GameDefinition;onNavigate:(tab:NavTab)=>void;onScout:(id:string)=>void;onOption:(id:string)=>void};
export function TeamScreen(props:Props){
 const {universe,definition,onNavigate}=props,model=selectTeamOverview(universe,definition);
 const [view,setView]=useState<'overview'|'car'|'development'|'organization'>('overview'),[driver,setDriver]=useState<string|null>(null);
 return <Screen key={driver??view} title={driver?'Driver dossier':view==='overview'?'Your team':view==='car'?'Your car':view==='development'?'Development':'Your headquarters'} kicker={model.brand.name} subtitle={view==='overview'?model.brand.philosophy:undefined} tab="TEAM" onNavigate={onNavigate}>
  {driver?<DriverProfile {...props} world={universe.drivers!} observer={universe.playerTeamId!} id={driver} onBack={()=>setDriver(null)} backLabel="Back to team"/>:view!=='overview'?<>
   <Action label="Back to team" onPress={()=>setView('overview')} secondary/>
   {view==='car'?<><Card accent={model.brand.color}><CarArt color={model.brand.color}/><Text style={styles.heading}>Ready for {model.briefing?.venue??'the next chapter'}</Text><Chip text={model.briefing?.fit?.label??'No upcoming event'} tone="green"/><Text style={styles.muted}>Circuit-specific suitability of the fitted car. Driver comfort is separate.</Text></Card>
    <Card><Section title="Strengths"/><Text style={styles.body}>{model.briefing?.fit?.strengths.join(' · ')||'No standout strengths against these demands.'}</Text><Section title="Concerns"/><Text style={styles.body}>{model.briefing?.fit?.concerns.join(' · ')||'No major technical shortfall.'}</Text></Card>
    <Disclosure title="Fitted components">{model.fittedParts.map(p=><Fact key={p.id} label={p.name} value={`Spec ${p.spec}`}/>)}</Disclosure></>:view==='development'?<>
     <Card><CarArt color={model.brand.color}/><Text style={styles.heading}>The next evolution.</Text><Text style={styles.muted}>Follow the work taking shape at the factory.</Text></Card>
     {model.projects.length?model.projects.map(p=><Card key={p.id}><Text style={styles.heading}>{p.name}</Text><Chip text={p.stage}/><Text style={styles.muted}>{p.progress}% of current stage</Text><View style={{height:5,backgroundColor:ui.line,borderRadius:4}}><View style={{height:5,width:`${p.progress}%`,backgroundColor:ui.accent,borderRadius:4}}/></View></Card>):<EmptyState title="No active projects" text="Your team has no development work in progress. Project management controls are not available yet."/>}
    </>:<><Card><GarageArt/><Text style={styles.heading}>People make the difference.</Text><Fact label="Working" value={String(model.staff.WORKING)}/><Fact label="Arriving" value={String(model.staff.WALKING)}/><Fact label="Idle" value={String(model.staff.IDLE)}/></Card><Text style={styles.muted}>These are the visible headquarters workers. Facilities construction, finances and organization-wide morale are not simulated yet.</Text><Action label="Go to HQ" onPress={()=>onNavigate('HQ')}/></>}
  </>:<>
   <View style={{flexDirection:'row',flexWrap:'wrap',gap:8}}><Chip text={`${model.drivers.length} race drivers`} tone="accent"/><Chip text={`${model.staff.WORKING} at work`} tone="green"/><Chip text={model.projects.length?`${model.projects.length} projects`:'No active projects'}/></View>
   <Card accent={model.brand.color} style={{backgroundColor:'#192C3D'}}><View style={styles.between}><Text style={styles.eyebrow}>THE CAR</Text><Chip text={model.briefing?.fit?.label??'No upcoming event'} tone="green"/></View><CarArt color={model.brand.color}/><Text style={styles.heading}>Built for the next challenge.</Text><Text style={styles.muted}>{model.briefing?`Suitability at ${model.briefing.venue}`:'No upcoming event in this calendar'}</Text><Action label="View car" onPress={()=>setView('car')}/></Card>
   <Section title="Your drivers" meta={`${model.drivers.length} race seats`}/>
   {model.drivers.map(d=><CompactRow key={d.id} label={d.name} detail={d.form} accessibilityLabel={`View ${d.name}`} onPress={()=>setDriver(d.id)} leading={<DriverIdentity name={d.name} color={model.brand.color}/>} trailing={<Chip text={d.contractEnd?`Through ${d.contractEnd}`:'Available'}/>}/>)}
   <Action label="Manage drivers" onPress={()=>onNavigate('DRIVERS')} secondary/>
   <Card><Text style={styles.eyebrow}>DEVELOPMENT</Text><Text style={styles.heading}>{model.projects.length?model.projects[0]!.name:'No active projects'}</Text><Text style={styles.muted}>{model.projects.length?`${model.projects[0]!.stage} · ${model.projects[0]!.progress}% of current stage`:'Your next upgrade starts here.'}</Text><Action label="View development" onPress={()=>setView('development')} secondary/></Card>
   <Card><View style={styles.between}><View style={{flex:1,gap:6}}><Text style={styles.eyebrow}>ORGANIZATION</Text><Text style={styles.heading}>Inside headquarters</Text><Text style={styles.muted}>{model.staff.WORKING} staff at work</Text></View><GarageArt/></View><Action label="View organization" onPress={()=>setView('organization')} secondary/></Card>
  </>}
 </Screen>;
}
