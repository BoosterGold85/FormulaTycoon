import React,{useState} from 'react';
import {Text} from 'react-native';
import type {NavTab} from '../game/hudPlaceholders';
import type {GameUniverse,GameDefinition} from '../simulation/universe';
import {selectTeamOverview} from '../simulation/managementViews';
import {Action,Card,Disclosure,Fact,Screen,Section,useDesign} from './design/system';
import {CarArt,GarageArt} from './art/IdentityArt';
import {DriverProfile} from './DriverProfile';
import {DevelopmentHub} from './DevelopmentHub';
import {TeamOverview} from './team/TeamOverview';
import {type CommandResult} from '../simulation/developmentLoop';

type Props={universe:GameUniverse;definition:GameDefinition;onNavigate:(tab:NavTab)=>void;onScout:(id:string)=>void;onOption:(id:string)=>void;
 run:(command:(u:GameUniverse)=>CommandResult)=>CommandResult;initialView?:'overview'|'development'};
export function TeamScreen(props:Props){const {ui,styles}=useDesign();
 const {universe,definition,onNavigate}=props,model=selectTeamOverview(universe,definition);
 const [view,setView]=useState<'overview'|'car'|'development'|'organization'>(props.initialView??'overview'),[driver,setDriver]=useState<string|null>(null);
 if(!driver&&view==='overview')return <TeamOverview universe={universe} definition={definition} onNavigate={onNavigate} onDriver={setDriver} onView={setView}/>;
 return <Screen key={driver??view} title={driver?'Driver dossier':view==='overview'?'Your team':view==='car'?'Your car':view==='development'?'Development':'Your headquarters'} kicker={model.brand.name} subtitle={view==='overview'?'Race control / Your organization':undefined} tab="TEAM" onNavigate={onNavigate}>
  {driver?<DriverProfile {...props} world={universe.drivers!} observer={universe.playerTeamId!} id={driver} onBack={()=>setDriver(null)} backLabel="Back to team"/>:view!=='overview'?<>
   <Action label="Back to team" onPress={()=>setView('overview')} secondary/>
   {view==='car'?<>
    <Card accent={model.brand.color} hero><CarArt color={model.brand.color}/><Text style={styles.heading}>Ready for {model.briefing?.venue??'the next chapter'}</Text><Text style={[styles.heading,{color:ui.green}]}>{model.briefing?.fit?.label??'No upcoming event'}</Text><Text style={styles.muted}>Circuit-specific suitability of the fitted car. Driver comfort is separate.</Text></Card>
    <Section title="Strengths"/><Text style={styles.body}>{model.briefing?.fit?.strengths.join(' · ')||'No standout strengths against these demands.'}</Text>
    <Section title="Concerns"/><Text style={styles.body}>{model.briefing?.fit?.concerns.join(' · ')||'No major technical shortfall.'}</Text>
    <Disclosure title="Fitted components">{model.fittedParts.map(p=><Fact key={p.id} label={p.name} value={`Spec ${p.spec}`}/>)}</Disclosure>
   </>:view==='development'?<>
    <DevelopmentHub universe={universe} definition={definition} run={props.run}/>
   </>:<>
    <GarageArt/><Text style={styles.heading}>People make the difference.</Text><Text style={styles.muted}>{model.brand.philosophy}</Text><Fact label="Working" value={String(model.staff.WORKING)}/><Fact label="Arriving" value={String(model.staff.WALKING)}/><Fact label="Idle" value={String(model.staff.IDLE)}/>
    <Text style={styles.muted}>These are the visible headquarters workers. Facilities construction, finances and organization-wide morale are not simulated yet.</Text><Action label="Go to HQ" onPress={()=>onNavigate('HQ')}/>
   </>}
  </>:null}
 </Screen>;
}
