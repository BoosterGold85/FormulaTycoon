import {calendarById} from '../game/calendar';
import {teamBrand} from '../game/brandRegistry';
import {displayTeam} from '../game/roster';
import {calendarWindow,eventDateLabel,eventStatus} from './calendar';
import {computeCarProfile} from './development/carModel';
import {driverView,gradeFor} from './drivers';
import {formLabel} from './drivers/performance';
import {selectDevelopmentHub} from './developmentLoop';
import {evaluateTeamAtTrack,AXIS_LABELS} from './trackPerformance';
import {driverCodes} from './qualifying/codes';
import {fieldAtTrack} from './qualifying/campaign';
import {campaignContext} from './campaignTime';
import type {GameDefinition,GameUniverse} from './universe/types';

/**
 * Team screen read model. Presentation only: it reads saved state and existing derivations, and never
 * writes, rolls RNG or adds a rating. Where the game has no data yet it says so instead of showing 0.
 */
export type Tone='good'|'even'|'poor';
export type CarBar={key:'power'|'downforce'|'reliability'|'tyres';label:string;delta:number;tone:Tone;
 tag:{kind:'STRENGTH'|'CONCERN';text:string}|null};

// Which fit statements belong on which bar (labels come from the circuit-fit verdict).
const BAR_OF:Record<string,CarBar['key']>={[AXIS_LABELS.straightLine]:'power',
 [AXIS_LABELS.lowSpeed]:'downforce',[AXIS_LABELS.mediumSpeed]:'downforce',[AXIS_LABELS.highSpeed]:'downforce',
 [AXIS_LABELS.reliability]:'reliability',[AXIS_LABELS.cooling]:'reliability',[AXIS_LABELS.tyrePreservation]:'tyres'};
const tone=(delta:number):Tone=>delta>=2?'good':delta<=-2?'poor':'even';
const level=(value:number):Tone=>value>=65?'good':value>=40?'even':'poor';
const FORM_WORD={EXCELLENT:'Excellent',GOOD:'Good',NORMAL:'Steady',POOR:'Poor',STRUGGLING:'Struggling'} as const;
const moraleWord=(m:number)=>m>=80?'High':m>=65?'Good':m>=45?'Okay':'Low';
/** Weekend target from where the car stands at this circuit among 11 (same source as the qualifying plan). */
const weekendTarget=(rank:number)=>rank<=1?'fight for the front row':rank<=4?'reach Q3':rank<=7?'reach Q2':'get out of Q1';

function carSection(universe:GameUniverse,definition:GameDefinition,teamId:string,track:Parameters<typeof evaluateTeamAtTrack>[3]|null){
 const profiles=definition.development.teams.map(p=>({id:p.id,car:computeCarProfile(universe.development.teams[p.id]!,p)}));
 const mine=profiles.find(p=>p.id===teamId)!.car,mean=(f:(c:typeof mine)=>number)=>profiles.reduce((s,p)=>s+f(p.car),0)/profiles.length;
 const fit=track?evaluateTeamAtTrack(universe,definition,teamId,track):null;
 const bars:CarBar[]=([
  ['power','Power',(c:typeof mine)=>c.attributes.power],['downforce','Downforce',(c:typeof mine)=>c.attributes.downforce],
  ['reliability','Reliability',(c:typeof mine)=>c.reliability],['tyres','Tyre wear',(c:typeof mine)=>c.attributes.tyreManagement]
 ] as const).map(([key,label,f])=>{const delta=Math.round(f(mine)-mean(f));return {key,label,delta,tone:tone(delta),tag:null};});
 const other:Array<{kind:'STRENGTH'|'CONCERN';text:string}>=[];
 for(const [kind,list] of [['STRENGTH',fit?.strengths??[]],['CONCERN',fit?.concerns??[]]] as const)for(const text of list){
  // A tag sits on its bar only when the two agree; a circuit strength on a below-average bar (or the reverse)
  // is real but reads as a contradiction, so it is listed as a circuit note instead.
  const bar=bars.find(b=>b.key===BAR_OF[text]);
  const agrees=bar&&(kind==='STRENGTH'?bar.tone!=='poor':bar.tone!=='good');
  if(bar&&agrees&&!bar.tag)bar.tag={kind,text};else other.push({kind,text});
 }
 // Circuit-independent pace: the pre-season prediction (owner decision A). Not a championship standing.
 const rank=[...profiles].sort((a,b)=>b.car.pace-a.car.pace||(a.id<b.id?-1:1)).findIndex(p=>p.id===teamId)+1;
 return {fit:fit?{label:fit.label,tone:(fit.score>=70?'good':fit.score>=60?'even':'poor') as Tone}:null,bars,other,rank};
}

export function selectTeamScreen(universe:GameUniverse,definition:GameDefinition){
 const teamId=universe.playerTeamId;
 if(!teamId||!universe.drivers)throw new Error('No player team');
 const brand=teamBrand(teamId),shown=displayTeam(teamId),calendar=calendarById(universe.calendarId);
 const window=calendarWindow(calendar,universe.currentDate),next=window.next,nextTrack=next?calendar.tracks[next.trackId]!:null;
 const hub=selectDevelopmentHub(universe,definition),car=carSection(universe,definition,teamId,nextTrack);
 const completed=calendar.events.filter(e=>eventStatus(e,universe.currentDate)==='COMPLETED');
 const sessions=universe.qualifying?.sessions??{},codes=driverCodes(universe),season=campaignContext(universe.currentDate).season;

 // Race drivers in seat order, with what the save actually knows about their weekend.
 const views=Object.keys(universe.drivers.drivers).map(id=>driverView(universe.drivers!,teamId,id,universe.currentDate))
  .filter(d=>d.raceSeat&&d.teamId===teamId);
 const graded=completed.map(e=>sessions[e.id]?.grid?{event:e,grid:sessions[e.id]!.grid!}:null).filter(x=>x!==null);
 const last=graded[graded.length-1]??null;
 const nextDone=!!(next&&sessions[next.id]?.grid);
 const rankHere=nextTrack?fieldAtTrack(universe,definition,nextTrack)[teamId]!.rank:null;
 const drivers=views.map(d=>{
  const truth=universe.drivers!.drivers[d.id]!,form=truth.dynamic.form,morale=truth.dynamic.morale;
  const lastPos=last?.grid.find(g=>g.driverId===d.id)?.position??null;
  const lastText=lastPos!==null?`Qualified P${lastPos} in ${calendar.tracks[last!.event.trackId]!.name}`:null;
  const target=next&&rankHere!==null&&!nextDone?`Target ${window.current||(window.daysUntil??99)<=7?'this weekend':`in ${nextTrack!.name}`}: ${weekendTarget(rankHere)}`:null;
  const tag=d.stage==='ROOKIE'?'Rookie season':d.contractEnd===season?'Contract year':null;
  const story=[target??lastText,target?lastText:null,tag].filter((x):x is string=>!!x).slice(0,2).join(' · ')||null;
  return {id:d.id,name:d.name,code:codes[d.id]!,number:d.number,nationality:d.nationality,age:d.age,story,
   form:{value:form,word:FORM_WORD[formLabel(form)],tone:level(form)},morale:{value:morale,word:moraleWord(morale),tone:level(morale)},
   chips:[d.specialties[0]??null,d.contractEnd?`Contract to ${d.contractEnd}`:null,`Talent ${d.grades.talent}`].filter((x):x is string=>!!x)};
 });

 // Teammate battle: qualifying head-to-heads only (no race is simulated yet).
 const [a,b]=drivers;
 const duels=a&&b?graded.map(g=>{const pa=g.grid.find(x=>x.driverId===a.id)?.position,pb=g.grid.find(x=>x.driverId===b.id)?.position;
  return pa!==undefined&&pb!==undefined?(pa<pb?0:1):null;}).filter((x):x is 0|1=>x!==null):[];
 const wins:[number,number]=[duels.filter(x=>x===0).length,duels.filter(x=>x===1).length];
 const battle=a&&b?{codes:[a.code,b.code] as [string,string],wins,sessions:duels.length,
  text:duels.length?`Qualifying ${wins[0]}–${wins[1]}`:next?`First qualifying in ${nextTrack!.name}`:'No sessions this season'}:null;

 // Organisation: the real HQ departments, staff from the HQ roster, quality only where a rating exists.
 const profile=definition.development.teams.find(t=>t.id===teamId)!,layout=definition.headquarters.layout;
 const deptOf=Object.fromEntries(layout.stations.map(s=>[s.id,s.departmentId]));
 const quality:Record<string,string|null>={AERO:gradeFor(profile.staff.aero),WORKSHOP:gradeFor(profile.staff.vehicleDynamics),
  SIMULATOR:`Level ${profile.facilities.rig}`,MANUFACTURING:`Level ${profile.facilities.manufacturing}`};
 const organisation=layout.departments.map(dep=>{const headcount=definition.headquarters.roster.filter(w=>deptOf[w.stationId]===dep.id).length;
  return {id:dep.id,name:dep.shortName,headcount,quality:quality[dep.id]??null};});

 const focus=hub.focus;
 const budget=hub.budget;
 const upcoming=next?calendar.events.filter(e=>e.round>=next.round).slice(0,3):[];
 return {
  team:{id:teamId,name:brand.name,shortName:shown?.shortName??brand.name,base:shown?.base??null,identity:brand.philosophy,colors:brand.colors},
  tiles:[
   {key:'championship',label:'Championship',value:`P${car.rank}`,caption:completed.length?'Car-based prediction · races not simulated yet':'Pre-season prediction'},
   {key:'target',label:'Target',value:brand.expectedPerformance==='FRONT_RUNNING'?'Front-runner':'Building',caption:'Board expectation'},
   {key:'budget',label:'Budget',value:`$${budget.remainingM}M`,caption:budget.spentM>0?`$${budget.spentM}M committed`:'Unspent'},
   {key:'next',label:'Next race',value:!next?'Done':window.current?'This weekend':window.daysUntil===1?'1 day':`${window.daysUntil} days`,
    caption:next?`${nextTrack!.name} · Round ${next.round}`:'Season complete'}
  ],
  car:{venue:nextTrack?.name??null,...car},
  drivers,battle,
  factory:focus?{idle:false as const,title:focus.name,stage:focus.stageLabel,progress:focus.wholeProgress,
    line:focus.pendingEvent?`Decision needed · ${focus.pendingEvent.title}`:`$${budget.remainingM}M left this season`,more:hub.projects.length-1}
   :{idle:true as const,title:'Factory idle',line:`$${budget.remainingM}M ready to spend`},
  organisation,
  season:{
   results:graded.slice(-3).map(g=>({eventId:g.event.id,round:g.event.round,venue:calendar.tracks[g.event.trackId]!.name,
    positions:drivers.map(d=>({code:d.code,position:g.grid.find(x=>x.driverId===d.id)?.position??null}))})),
   firstVenue:calendar.tracks[calendar.events[0]!.trackId]!.name,
   upcoming:upcoming.map(e=>({eventId:e.id,round:e.round,trackId:e.trackId,venue:calendar.tracks[e.trackId]!.name,
    dates:eventDateLabel(e).replace(/, \d{4}$/,''),isNext:e.id===next?.id})),
   completed:completed.length,total:calendar.events.length
  }
 };
}
export type TeamScreenModel=ReturnType<typeof selectTeamScreen>;
