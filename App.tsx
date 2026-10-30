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

export default function App(){return <ThemeProvider><GameApplication/></ThemeProvider>;}
function GameApplication() {
 const session=useGameUniverse(DEFAULT_GAME_DEFINITION);
 const [tab,setTab]=useState<NavTab>('HQ');
 return <View style={{flex:1}}>
  <GameHud currentDate={session.universe.currentDate} nextEvent={selectNextEvent(session.universe)}/>
  <View style={{flex:1,flexDirection:'row'}}>
   <BottomNav active={tab} onSelect={next=>setTab(next)} sidebar/>
   <View style={{flex:1,minWidth:0}}>
   <View style={{flex:1,display:tab==='HQ'?'flex':'none'}}>
     <HeadquartersScreen nextEvent={selectNextEvent(session.universe)} currentDate={session.universe.currentDate} state={session.universe.headquarters} restartDay={session.restartHeadquarters} onNavigate={setTab}/>
   </View>
   {tab==='RACE'?<CalendarScreen universe={session.universe} definition={DEFAULT_GAME_DEFINITION} onNavigate={setTab}/>:null}
   {tab==='DRIVERS'&&session.universe.drivers&&session.universe.playerTeamId?<DriversScreen universe={session.universe} definition={DEFAULT_GAME_DEFINITION} world={session.universe.drivers} observer={session.universe.playerTeamId} onNavigate={setTab} onScout={session.scoutDriver} onOption={session.exerciseOption}/>:null}
   {tab==='TEAM'&&session.universe.drivers&&session.universe.playerTeamId?<TeamScreen universe={session.universe} definition={DEFAULT_GAME_DEFINITION} onNavigate={setTab} onScout={session.scoutDriver} onOption={session.exerciseOption}/>:null}
   {tab==='HISTORY'?<HistoryScreen onNavigate={setTab}/>:null}
   </View>
  </View>
 </View>;
}
