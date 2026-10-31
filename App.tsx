import React,{useState} from 'react';
import {View} from 'react-native';
import {DEFAULT_GAME_DEFINITION} from './src/game/defaultGame';
import type {NavTab} from './src/game/hudPlaceholders';
import {useGameUniverse} from './src/ui/hooks/useGameUniverse';
import {HeadquartersScreen} from './src/ui/HeadquartersScreen';
import {selectNextEvent} from './src/simulation/calendar';
import {CalendarScreen} from './src/ui/CalendarScreen';
import {DriversScreen} from './src/ui/DriversScreen';
import {TeamScreen} from './src/ui/TeamScreen';
import {ThemeProvider} from './src/ui/theme';
import {GameHud} from './src/ui/components/GameHud';
import {BottomNav} from './src/ui/components/BottomNav';
import {HistoryScreen} from './src/ui/HistoryScreen';
import {TurnReportCard} from './src/ui/components/TurnReportCard';
import {nextTurnTarget,selectDepartmentActivity,selectDevelopmentHub} from './src/simulation/developmentLoop';

export default function App(){return <ThemeProvider><GameApplication/></ThemeProvider>;}
function GameApplication() {
 const session=useGameUniverse(DEFAULT_GAME_DEFINITION);
 const [tab,setTab]=useState<NavTab>('HQ');
 const [teamEntry,setTeamEntry]=useState<{key:number;view:'overview'|'development'}>({key:0,view:'overview'});
 const openDevelopment=()=>{session.dismissReport();setTeamEntry(e=>({key:e.key+1,view:'development'}));setTab('TEAM');};
 const hasTeam=!!session.universe.playerTeamId;
 return <View style={{flex:1}}>
  <GameHud currentDate={session.universe.currentDate} nextEvent={selectNextEvent(session.universe)}
   turn={{target:nextTurnTarget(session.universe),pendingDecisions:hasTeam?selectDevelopmentHub(session.universe,DEFAULT_GAME_DEFINITION).pendingDecisions:0,
    onContinue:session.continueTurn,onNextDay:session.nextDay}}/>
  <View style={{flex:1,flexDirection:'row'}}>
   <BottomNav active={tab} onSelect={next=>{if(next==='TEAM')setTeamEntry(e=>({key:e.key+1,view:'overview'}));setTab(next);}} sidebar/>
   <View style={{flex:1,minWidth:0}}>
   <View style={{flex:1,display:tab==='HQ'?'flex':'none'}}>
     <HeadquartersScreen activity={hasTeam?selectDepartmentActivity(session.universe,DEFAULT_GAME_DEFINITION):{}} report={session.report} nextEvent={selectNextEvent(session.universe)} currentDate={session.universe.currentDate} state={session.universe.headquarters} restartDay={session.restartHeadquarters} onNavigate={setTab}/>
   </View>
   {tab==='RACE'?<CalendarScreen universe={session.universe} definition={DEFAULT_GAME_DEFINITION} onNavigate={setTab}/>:null}
   {tab==='DRIVERS'&&session.universe.drivers&&session.universe.playerTeamId?<DriversScreen universe={session.universe} definition={DEFAULT_GAME_DEFINITION} world={session.universe.drivers} observer={session.universe.playerTeamId} onNavigate={setTab} onScout={session.scoutDriver} onOption={session.exerciseOption}/>:null}
   {tab==='TEAM'&&session.universe.drivers&&session.universe.playerTeamId?<TeamScreen key={teamEntry.key} initialView={teamEntry.view} run={session.runDevelopment} universe={session.universe} definition={DEFAULT_GAME_DEFINITION} onNavigate={next=>{setTeamEntry(e=>({key:e.key+1,view:'overview'}));setTab(next);}} onScout={session.scoutDriver} onOption={session.exerciseOption}/>:null}
   {tab==='HISTORY'?<HistoryScreen onNavigate={setTab}/>:null}
   {session.report?<View pointerEvents="box-none" style={{position:'absolute',left:12,right:12,bottom:12,maxWidth:560,alignSelf:'center'}}>
    <TurnReportCard key={`${session.report.from}>${session.report.to}`} report={session.report} onClose={session.dismissReport} onOpenDevelopment={openDevelopment}/></View>:null}
   </View>
  </View>
 </View>;
}
