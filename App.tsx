import React,{useCallback,useMemo,useState,useSyncExternalStore} from 'react';
import {View,useWindowDimensions} from 'react-native';
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
import {RosterPackScreen,type RosterPackActions} from './src/ui/RosterPackScreen';
import {activeDisplayRoster,DEFAULT_ROSTER,setDisplayRoster,subscribeDisplayRoster} from './src/game/roster';
import {clearRosterPreference,readRosterPreference,writeRosterPreference} from './src/ui/rosterPreference';

// Read once at launch, before the first render: the display layer and (full packs) the new career's stats.
const STARTUP_ROSTER=readRosterPreference();
setDisplayRoster(STARTUP_ROSTER.display);
import {buildWeekTimeline,decideProjectEvent,nextTurnTarget,selectDepartmentActivity,selectDevelopmentHub,selectHqDevelopment} from './src/simulation/developmentLoop';

export default function App(){return <ThemeProvider><GameApplication/></ThemeProvider>;}
function GameApplication() {
 const session=useGameUniverse(DEFAULT_GAME_DEFINITION,1,STARTUP_ROSTER.career);
 const [tab,setTab]=useState<NavTab>('HQ');
 const [settings,setSettings]=useState(false);
 // Re-render the whole presentation when the display roster changes. The universe is untouched.
 const displayRoster=useSyncExternalStore(subscribeDisplayRoster,activeDisplayRoster,activeDisplayRoster);
 const rosterActions:RosterPackActions={
  applyCosmetic:(pack,roster)=>{setDisplayRoster(roster);writeRosterPreference({mode:'cosmetic',pack});},
  startNewCareer:(pack,roster)=>{setDisplayRoster(roster);session.startNewCareer(roster);setReplayed(undefined);
   if(pack)writeRosterPreference({mode:roster.type,pack});else clearRosterPreference();},
  reset:()=>{setDisplayRoster(DEFAULT_ROSTER);clearRosterPreference();}
 };
 const [teamEntry,setTeamEntry]=useState<{key:number;view:'overview'|'development'}>({key:0,view:'overview'});
 const openDevelopment=()=>{session.dismissReport();setTeamEntry(e=>({key:e.key+1,view:'development'}));setTab('TEAM');};
 const hasTeam=!!session.universe.playerTeamId;
 const wide=useWindowDimensions().width>=1000;
 // Presentation phases of the last processed turn: replay in the HQ, then the summary card.
 const reportKey=session.report?`${session.report.from}>${session.report.to}`:undefined;
 const timeline=useMemo(()=>session.report?buildWeekTimeline(session.report):null,[session.report]);
 const hasWork=!!timeline&&timeline.pieces.length+timeline.callouts.length>0;
 const [replayed,setReplayed]=useState<string|undefined>(undefined);
 const playing=!!reportKey&&hasWork&&replayed!==reportKey;
 const onReplayDone=useCallback(()=>setReplayed(reportKey),[reportKey]);
 const hub=hasTeam?selectDevelopmentHub(session.universe,DEFAULT_GAME_DEFINITION):null;
 const pending=(hub?.projects??[]).filter(p=>p.pendingEvent).map(p=>({projectId:p.id,part:p.name,...p.pendingEvent!}));
 const onDecide=(projectId:string,choiceId:string)=>{session.runDevelopment(u=>decideProjectEvent(u,DEFAULT_GAME_DEFINITION,projectId,choiceId));};
 // Gated: an unanswered decision takes the player to it on HQ instead of advancing (domain refuses too).
 const continueTurn=()=>{if(playing)return;setTab('HQ');if(pending.length)return;session.continueTurn();};
 const reviewDecision=()=>{session.dismissReport();setTab('HQ');};
 return <View style={{flex:1}}>
  <GameHud currentDate={session.universe.currentDate} nextEvent={selectNextEvent(session.universe)}
   turn={settings?undefined:{target:nextTurnTarget(session.universe),pendingDecisions:hasTeam?selectDevelopmentHub(session.universe,DEFAULT_GAME_DEFINITION).pendingDecisions:0,
    onContinue:continueTurn,onNextDay:session.nextDay,playing,blocked:pending.length}} onSettings={()=>setSettings(true)}/>
  <View style={{flex:1,flexDirection:'row'}}>
   <BottomNav active={tab} onSelect={next=>{if(next==='TEAM')setTeamEntry(e=>({key:e.key+1,view:'overview'}));setTab(next);}} sidebar/>
   <View style={{flex:1,minWidth:0}}>
   {settings?<View style={{position:'absolute',top:0,left:0,right:0,bottom:0,zIndex:20}}><RosterPackScreen display={displayRoster} careerRoster={session.careerRoster} actions={rosterActions}
    onClose={()=>setSettings(false)} tab={tab} onNavigate={next=>{setSettings(false);setTab(next);}}/></View>:null}
   <View style={{flex:1,display:tab==='HQ'?'flex':'none'}}>
     <HeadquartersScreen activity={hasTeam?selectDepartmentActivity(session.universe,DEFAULT_GAME_DEFINITION):{}} hq={hasTeam?selectHqDevelopment(session.universe,DEFAULT_GAME_DEFINITION):null}
      replay={playing&&timeline?{timeline,key:reportKey!,weekOf:session.report!.weekOf}:null} onReplayDone={onReplayDone} onOpenDevelopment={openDevelopment} showCard={!session.report} pending={pending} lastWeek={session.lastWork} onDecide={onDecide}
      state={session.universe.headquarters} restartDay={session.restartHeadquarters} onNavigate={setTab}/>
   </View>
   {tab==='RACE'?<CalendarScreen universe={session.universe} definition={DEFAULT_GAME_DEFINITION} onNavigate={setTab}/>:null}
   {tab==='DRIVERS'&&session.universe.drivers&&session.universe.playerTeamId?<DriversScreen universe={session.universe} definition={DEFAULT_GAME_DEFINITION} world={session.universe.drivers} observer={session.universe.playerTeamId} onNavigate={setTab} onScout={session.scoutDriver} onOption={session.exerciseOption}/>:null}
   {tab==='TEAM'&&session.universe.drivers&&session.universe.playerTeamId?<TeamScreen key={teamEntry.key} initialView={teamEntry.view} run={session.runDevelopment} universe={session.universe} definition={DEFAULT_GAME_DEFINITION} onNavigate={next=>{setTeamEntry(e=>({key:e.key+1,view:'overview'}));setTab(next);}} onScout={session.scoutDriver} onOption={session.exerciseOption}/>:null}
   {tab==='HISTORY'?<HistoryScreen onNavigate={setTab}/>:null}
   {session.report&&!playing?<View pointerEvents="box-none" style={wide?{position:'absolute',top:48,right:14,width:400}:{position:'absolute',left:12,right:12,bottom:82}}>
    <TurnReportCard key={`${session.report.from}>${session.report.to}`} report={{...session.report,newEvents:session.report.newEvents.filter(e=>pending.some(p=>p.projectId===e.projectId))}} onClose={session.dismissReport} onOpenDevelopment={pending.length?reviewDecision:openDevelopment} onContinueWeek={continueTurn}/></View>:null}
   </View>
  </View>
 </View>;
}
