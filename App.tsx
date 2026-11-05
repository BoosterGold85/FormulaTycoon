import React,{useCallback,useMemo,useRef,useState} from 'react';
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
import {buildWeekTimeline,decideProjectEvent,nextTurnTarget,selectDepartmentActivity,selectDevelopmentHub,selectHqDevelopment} from './src/simulation/developmentLoop';
import {answerQualifyingCall,sessionAwaitingCall,setQualifyingPlan,type Call,type DriverPlan} from './src/simulation/qualifying';
import {QualifyingPlan} from './src/ui/qualifying/QualifyingPlan';
import {QualifyingLive} from './src/ui/qualifying/QualifyingLive';
import {QualifyingReport} from './src/ui/qualifying/QualifyingReport';

export default function App(){return <ThemeProvider><GameApplication/></ThemeProvider>;}
function GameApplication() {
 const session=useGameUniverse(DEFAULT_GAME_DEFINITION);
 const [tab,setTab]=useState<NavTab>('HQ');
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
 // Qualifying weekend screens are presentation over the saved session; the domain gates the turn as well.
 const D=DEFAULT_GAME_DEFINITION,u=session.universe,target=nextTurnTarget(u),awaiting=sessionAwaitingCall(u);
 const [weekend,setWeekend]=useState<{view:'PLAN'|'LIVE'|'REPORT';eventId:string}|null>(null);
 const replayAt=useRef<Record<string,number>>({});
 const navigate=(next:NavTab)=>{setWeekend(null);if(next==='TEAM')setTeamEntry(e=>({key:e.key+1,view:'overview'}));setTab(next);};
 // Gated: an unanswered decision takes the player to it on HQ instead of advancing (domain refuses too).
 const continueTurn=()=>{if(playing)return;setTab('HQ');if(pending.length){setWeekend(null);return;}
  if(awaiting){session.dismissReport();setWeekend({view:'LIVE',eventId:awaiting.eventId});return;}
  if(target?.kind==='QUALIFYING'&&!u.qualifying?.sessions[target.eventId!]?.planLocked){session.dismissReport();setWeekend({view:'PLAN',eventId:target.eventId!});return;}
  setWeekend(null);session.continueTurn();};
 const lockPlan=(plans:Record<string,DriverPlan>)=>{const eventId=weekend!.eventId;
  if(!session.runDevelopment(x=>setQualifyingPlan(x,D,plans)).ok)return;
  if(session.continueTurn().ok)setWeekend({view:'LIVE',eventId});};
 const sendCalls=(calls:Record<string,Call>)=>{session.runDevelopment(x=>answerQualifyingCall(x,D,calls));};
 const reviewDecision=()=>{session.dismissReport();setTab('HQ');};
 return <View style={{flex:1}}>
  <GameHud currentDate={session.universe.currentDate} nextEvent={selectNextEvent(session.universe)}
   turn={{target:nextTurnTarget(session.universe),pendingDecisions:hasTeam?selectDevelopmentHub(session.universe,DEFAULT_GAME_DEFINITION).pendingDecisions:0,
    onContinue:continueTurn,onNextDay:()=>{const r=session.nextDay();if(!r.ok&&r.reason.startsWith('QUALIFYING'))continueTurn();},playing,blocked:pending.length,qualifyingCall:!!awaiting}}/>
  <View style={{flex:1,flexDirection:'row'}}>
   <BottomNav active={tab} onSelect={navigate} sidebar/>
   <View style={{flex:1,minWidth:0}}>
   {weekend?<View style={{position:'absolute',top:0,left:0,right:0,bottom:0,zIndex:5}}>
    {weekend.view==='PLAN'?<QualifyingPlan universe={u} definition={D} onLock={lockPlan} onNavigate={navigate}/>
     :weekend.view==='LIVE'&&u.qualifying?.sessions[weekend.eventId]?<QualifyingLive universe={u} definition={D} eventId={weekend.eventId} from={replayAt.current[weekend.eventId]??0}
      onBeat={b=>{replayAt.current[weekend.eventId]=b;}} onCall={sendCalls} onFinish={()=>setWeekend({view:'REPORT',eventId:weekend.eventId})} onNavigate={navigate}/>
     :weekend.view==='REPORT'?<QualifyingReport universe={u} eventId={weekend.eventId} onClose={()=>setWeekend(null)} onNavigate={navigate}/>:null}
   </View>:null}
   <View style={{flex:1,display:tab==='HQ'?'flex':'none'}}>
     <HeadquartersScreen activity={hasTeam?selectDepartmentActivity(session.universe,DEFAULT_GAME_DEFINITION):{}} hq={hasTeam?selectHqDevelopment(session.universe,DEFAULT_GAME_DEFINITION):null}
      replay={playing&&timeline?{timeline,key:reportKey!,weekOf:session.report!.weekOf}:null} onReplayDone={onReplayDone} onOpenDevelopment={openDevelopment} showCard={!session.report} pending={pending} lastWeek={session.lastWork} onDecide={onDecide}
      state={session.universe.headquarters} restartDay={session.restartHeadquarters} onNavigate={setTab}/>
   </View>
   {tab==='RACE'?<CalendarScreen universe={session.universe} definition={DEFAULT_GAME_DEFINITION} onNavigate={setTab}/>:null}
   {tab==='DRIVERS'&&session.universe.drivers&&session.universe.playerTeamId?<DriversScreen universe={session.universe} definition={DEFAULT_GAME_DEFINITION} world={session.universe.drivers} observer={session.universe.playerTeamId} onNavigate={setTab} onScout={session.scoutDriver} onOption={session.exerciseOption}/>:null}
   {tab==='TEAM'&&session.universe.drivers&&session.universe.playerTeamId?<TeamScreen key={teamEntry.key} initialView={teamEntry.view} run={session.runDevelopment} universe={session.universe} definition={DEFAULT_GAME_DEFINITION} onNavigate={navigate} onScout={session.scoutDriver} onOption={session.exerciseOption}/>:null}
   {tab==='HISTORY'?<HistoryScreen onNavigate={setTab}/>:null}
   {session.report&&!playing&&!weekend?<View pointerEvents="box-none" style={wide?{position:'absolute',top:48,right:14,width:400}:{position:'absolute',left:12,right:12,bottom:82}}>
    <TurnReportCard key={`${session.report.from}>${session.report.to}`} report={{...session.report,newEvents:session.report.newEvents.filter(e=>pending.some(p=>p.projectId===e.projectId))}} onClose={session.dismissReport} onOpenDevelopment={pending.length?reviewDecision:openDevelopment} onContinueWeek={continueTurn}
     continueLabel={target?.kind==='QUALIFYING'?'PLAN QUALIFYING':'CONTINUE WEEK'} weekendNote={u.qualifying?'Next: plan Saturday qualifying. The race itself is not simulated yet.':undefined}/></View>:null}
   </View>
  </View>
 </View>;
}
