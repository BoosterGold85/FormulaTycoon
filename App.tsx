import React,{useState} from 'react';
import {View} from 'react-native';
import {DEFAULT_GAME_DEFINITION} from './src/game/defaultGame';
import type {NavTab} from './src/game/hudPlaceholders';
import {useGameUniverse} from './src/ui/hooks/useGameUniverse';
import {HeadquartersScreen} from './src/ui/HeadquartersScreen';
import {DriversScreen} from './src/ui/DriversScreen';

export default function App() {
 const session=useGameUniverse(DEFAULT_GAME_DEFINITION);
 const [tab,setTab]=useState<NavTab>('HQ');
 return <View style={{flex:1}}>
   <View style={{flex:1,display:tab==='HQ'?'flex':'none'}}>
     <HeadquartersScreen state={session.universe.headquarters} restartDay={session.restartHeadquarters} onNavigate={setTab}/>
   </View>
   {tab!=='HQ'&&session.universe.drivers&&session.universe.playerTeamId?<DriversScreen universe={session.universe} definition={DEFAULT_GAME_DEFINITION} world={session.universe.drivers} observer={session.universe.playerTeamId} tab={tab} onNavigate={setTab} onScout={session.scoutDriver} onOption={session.exerciseOption}/>:null}
 </View>;
}
