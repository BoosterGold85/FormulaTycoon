import React,{useState} from 'react';
import {View,Text,Pressable} from 'react-native';
import type {NavTab} from '../game/hudPlaceholders';
import type {GameUniverse,GameDefinition} from '../simulation/universe';
import {selectTeamOverview} from '../simulation/managementViews';
import {Action,Card,CompactRow,Disclosure,EmptyState,Fact,Screen,Section,styles,ui} from './design/system';
import {CarArt,GarageArt} from './art/IdentityArt';
import {TeamDriverPortrait} from './art/DriverPortrait';
import {DevelopmentSummary,WorkshopArt} from './components/DevelopmentSummary';
import {DriverProfile} from './DriverProfile';

type Props={universe:GameUniverse;definition:GameDefinition;onNavigate:(tab:NavTab)=>void;onScout:(id:string)=>void;onOption:(id:string)=>void};
export function TeamScreen(props:Props){
 const {universe,definition,onNavigate}=props,model=selectTeamOverview(universe,definition);
 const [view,setView]=useState<'overview'|'car'|'development'|'organization'>('overview'),[driver,setDriver]=useState<string|null>(null);
 return <Screen key={driver??view} title={driver?'Driver dossier':view==='overview'?'Your team':view==='car'?'Your car':view==='development'?'Development':'Your headquarters'} kicker={model.brand.name} subtitle={view==='overview'?'Race control / Your organization':undefined} tab="TEAM" onNavigate={onNavigate}>
  {driver?<DriverProfile {...props} world={universe.drivers!} observer={universe.playerTeamId!} id={driver} onBack={()=>setDriver(null)} backLabel="Back to team"/>:view!=='overview'?<>
   <Action label="Back to team" onPress={()=>setView('overview')} secondary/>
   {view==='car'?<>
    <Card accent={model.brand.color} hero><CarArt color={model.brand.color}/><Text style={styles.heading}>Ready for {model.briefing?.venue??'the next chapter'}</Text><Text style={[styles.heading,{color:ui.green}]}>{model.briefing?.fit?.label??'No upcoming event'}</Text><Text style={styles.muted}>Circuit-specific suitability of the fitted car. Driver comfort is separate.</Text></Card>
    <Section title="Strengths"/><Text style={styles.body}>{model.briefing?.fit?.strengths.join(' · ')||'No standout strengths against these demands.'}</Text>
    <Section title="Concerns"/><Text style={styles.body}>{model.briefing?.fit?.concerns.join(' · ')||'No major technical shortfall.'}</Text>
    <Disclosure title="Fitted components">{model.fittedParts.map(p=><Fact key={p.id} label={p.name} value={`Spec ${p.spec}`}/>)}</Disclosure>
   </>:view==='development'?<>
    <Section title="Factory work"/><Text style={styles.muted}>Follow each project from research through manufacture. Progress describes the current stage.</Text>
    {model.projects.length?model.projects.map(p=><DevelopmentSummary key={p.id} project={p}/>):<EmptyState title="No active projects" text="Your team has no development work in progress. Project management controls are not available yet." art={<WorkshopArt/>}/>}
   </>:<>
    <GarageArt/><Text style={styles.heading}>People make the difference.</Text><Text style={styles.muted}>{model.brand.philosophy}</Text><Fact label="Working" value={String(model.staff.WORKING)}/><Fact label="Arriving" value={String(model.staff.WALKING)}/><Fact label="Idle" value={String(model.staff.IDLE)}/>
    <Text style={styles.muted}>These are the visible headquarters workers. Facilities construction, finances and organization-wide morale are not simulated yet.</Text><Action label="Go to HQ" onPress={()=>onNavigate('HQ')}/>
   </>}
  </>:<>
   <Card hero accent={model.brand.color} onPress={()=>setView('car')} accessibilityLabel="View car">
    <Text style={styles.eyebrow}>CURRENT CAR · {model.briefing?.venue??'NO UPCOMING EVENT'}</Text>
    <View style={styles.row}><View style={{flex:1,gap:6}}><Text testID="team-car-suitability" style={[styles.heading,{fontSize:20,lineHeight:25,color:ui.green}]}>{model.briefing?.fit?.label??'UNAVAILABLE'}</Text><Text style={styles.muted}>Next-race suitability</Text></View><CarArt color={model.brand.color} compact/></View>
    <View style={{flexDirection:'row',gap:14}}><View style={{flex:1,gap:4}}><Text style={styles.eyebrow}>STRENGTH</Text><Text style={styles.muted}>{model.briefing?.fit?.strengths[0]??'No standout strength'}</Text></View><View style={{flex:1,gap:4}}><Text style={styles.eyebrow}>CONCERN</Text><Text style={styles.muted}>{model.briefing?.fit?.concerns[0]??'No major shortfall'}</Text></View></View>
    <View style={[styles.between,{borderTopWidth:1,borderTopColor:ui.line,paddingTop:10}]}><Text style={{fontSize:12,fontWeight:'800',color:ui.ink}}>View car</Text><Text style={{fontSize:20,color:model.brand.color}}>›</Text></View>
   </Card>
   <View style={styles.between}><Section title="Your drivers"/><Pressable accessibilityRole="button" accessibilityLabel="Manage drivers" onPress={()=>onNavigate('DRIVERS')} style={{minHeight:44,justifyContent:'center'}}><Text style={{fontSize:12,color:ui.accent,fontWeight:'800'}}>Manage drivers ›</Text></Pressable></View>
   <View>{model.drivers.map(d=><CompactRow key={d.id} label={d.name} detail={`${d.form} · ${d.contractEnd?`Through ${d.contractEnd}`:'Available'}`} accessibilityLabel={`View ${d.name}`} onPress={()=>setDriver(d.id)} leading={<TeamDriverPortrait teamId={d.teamId} size={50}/>}/>)}</View>
   <Section title="Development"/>
   <Pressable accessibilityRole="button" accessibilityLabel="View development" onPress={()=>setView('development')} style={({pressed})=>({paddingVertical:6,borderBottomWidth:1,borderBottomColor:ui.line,backgroundColor:pressed?ui.panel:'transparent'})}>
    {model.projects.length?<DevelopmentSummary project={model.projects[0]!}/>:<View style={styles.row}><WorkshopArt/><View style={{flex:1,gap:5}}><Text style={[styles.heading,{fontSize:17}]}>No active projects</Text><Text style={styles.muted}>View development</Text></View><Text style={{fontSize:23,color:ui.accent}}>›</Text></View>}
   </Pressable>
   <Section title="Organization"/>
   <Pressable accessibilityRole="button" accessibilityLabel="View organization" onPress={()=>setView('organization')} style={{minHeight:70,flexDirection:'row',alignItems:'center',gap:12}}><View style={{flex:1,gap:6}}><Text style={[styles.heading,{fontSize:17}]}>Inside headquarters</Text><Text style={styles.muted}>{model.staff.WORKING} staff at work · View organization</Text></View><GarageArt/><Text style={{fontSize:23,color:ui.accent}}>›</Text></Pressable>
  </>}
 </Screen>;
}
