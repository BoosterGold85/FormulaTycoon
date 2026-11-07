import {expect,test} from '@jest/globals';
import {createHash} from 'crypto';
import {readFileSync} from 'fs';
import {join} from 'path';
import {DEFAULT_GAME_DEFINITION as definition} from '../../game/defaultGame';
import {calendarById} from '../../game/calendar';
import {advanceCampaignTo,createGameUniverse,type GameUniverse} from '../universe';
import {dueCampaignEvents} from '../universe/campaignEvents';
import type {CampaignDate} from '../campaignTime';
import {advancePlayerDay,continuePlayerTurn,nextTurnTarget,startPlayerProject} from '../developmentLoop';
import {acceptRecommendation,answerQualifyingCall,closeQualifying,fieldAtTrack,forecastAccuracy,policyCall,policyPlan,progressSession,recommendedCalls,
 activeBeats,continueQualifying,liveTiming,recommendedPlans,runQualifyingDay,selectQualifyingCall,sessionAtBreak,sessionAwaitingCall,sessionAwaitingPlayer,setQualifyingPlan,teamForecast,towerAt,upcomingBriefing,
 type Call,type DriverPlan,type QualifyingSession,type SegmentPlan,type Weather} from '../qualifying';
import {SAVE_V7,SAVE_V8} from '../../persistence/contracts';
import {createSaveEnvelope,deserializeSave,serializeSave,validateSave,type SaveResult} from '../../persistence/saveEnvelope';
import v7 from '../../persistence/__tests__/fixtures/driver-world-v7.json';

const teamId='team.wellington',melbourne='event.2026.melbourne';
const d=(s:string)=>s as CampaignDate;
const FRI=d('2026-03-06'),SAT=d('2026-03-07'),SUN=d('2026-03-08');
const meta={gameVersion:'0.8.0',saveId:'qualifying-v1',createdAt:'2026-11-04T12:00:00.000Z',updatedAt:'2026-11-04T12:00:00.000Z'};
const value=<T,>(r:SaveResult<T>):T=>{if(!r.ok)throw new Error(r.error.message);return r.value;};
const ok=(r:{ok:boolean;universe?:GameUniverse;reason?:string})=>{if(!r.ok)throw new Error(String(r.reason));return r.universe!;};
const reload=(u:GameUniverse)=>value(deserializeSave(value(serializeSave(value(createSaveEnvelope(u,meta,definition)),definition)),definition)).universe;
const atFP1=(seed:number)=>advanceCampaignTo(createGameUniverse(definition,seed),definition,FRI);
const session=(u:GameUniverse,id=melbourne)=>u.qualifying!.sessions[id]!;
const mine=(u:GameUniverse)=>upcomingBriefing(u,definition)!.entrants.filter(e=>e.teamId===teamId).map(e=>e.driverId);
const plan=(p:Partial<SegmentPlan>):DriverPlan=>({Q1:{tyre:'NEW_SOFT',runs:1,timing:'MIDDLE',traffic:'FIND_SPACE',...p},Q2:{tyre:'NEW_SOFT',runs:1,timing:'MIDDLE',traffic:'FIND_SPACE'},Q3:{tyre:'NEW_SOFT',runs:1,timing:'MIDDLE',traffic:'FIND_SPACE'}});
/** Locks a plan, forces the weather if asked (test input), then plays the session with fixed or recommended calls. */
function play(u:GameUniverse,plans?:Record<string,DriverPlan>,calls?:(u:GameUniverse)=>Record<string,Call>,weather?:Weather):QualifyingSession{
 u=ok(setQualifyingPlan(u,definition,plans??recommendedPlans(u,definition)));
 if(weather)u={...u,qualifying:{...u.qualifying!,sessions:{...u.qualifying!.sessions,[melbourne]:{...session(u),weather}}}};
 u=advanceCampaignTo(u,definition,SAT);
 while(sessionAwaitingPlayer(u))u=sessionAtBreak(u)?ok(continueQualifying(u,definition)):ok(answerQualifyingCall(u,definition,calls?calls(u):recommendedCalls(u,definition)));
 return session(u);
}
const both=(u:GameUniverse,p:DriverPlan)=>Object.fromEntries(mine(u).map(id=>[id,p]));
const fixedCalls=(action:Call['action'])=>(u:GameUniverse)=>Object.fromEntries(Object.keys(recommendedCalls(u,definition)).map(id=>[id,{action}]));
type Parts=GameUniverse['development']['teams'][string]['parts'];
const pos=(s:QualifyingSession,id:string)=>s.grid!.find(g=>g.driverId===id)!.position;
const mean=(xs:number[])=>xs.reduce((a,b)=>a+b,0)/xs.length;
const SEEDS=Array.from({length:40},(_,i)=>i+1);

test('every round of a headless season produces a valid, fully classified 22-car grid with reasons; no race is simulated',()=>{
 const u=advanceCampaignTo(createGameUniverse(definition,11),definition,d('2026-12-14'));
 const sessions=Object.values(u.qualifying!.sessions),calendar=calendarById(u.calendarId);
 expect(sessions).toHaveLength(calendar.events.length);
 for(const s of sessions){
  expect(s.status).toBe('COMPLETE');
  expect(s.grid!.map(g=>g.position)).toEqual(Array.from({length:22},(_,i)=>i+1));
  expect(new Set(s.grid!.map(g=>g.driverId)).size).toBe(22);
  expect(s.grid!.map(g=>g.driverId).sort()).toEqual(s.entrants.map(e=>e.driverId).sort());
  for(const g of s.grid!){expect(g.reasons.length).toBeGreaterThanOrEqual(1);expect(g.reasons.length).toBeLessThanOrEqual(3);expect(g.reasons.at(-1)).toMatch(/^Car fit:/);}
  // Headless: the player's open calls were filled by policy and marked as defaults.
  expect(Object.entries(s.segments.Q1!.calls).filter(([id])=>s.entrants.find(e=>e.driverId===id)!.teamId===teamId).every(([,c])=>c.defaulted)).toBe(true);
 }
 // Sprint weekends run normal Saturday qualifying in V1.
 const sprint=calendar.events.find(e=>e.sprint)!;
 expect(u.qualifying!.sessions[sprint.id]!.date).toBe(d(sprint.weekendStartDate.slice(0,8)+String(Number(sprint.weekendStartDate.slice(8))+1).padStart(2,'0')));
 // Only qualifying state is new: nothing race-like exists anywhere in the universe.
 expect(Object.keys(u).sort()).toEqual(['calendarId','currentDate','definitionVersion','development','developmentRules','drivers','headquarters','playerTeamId','qualifying','seed']);
 expect(JSON.stringify(u)).not.toMatch(/"race(Result|Results|Grid)?"\s*:/i);
 expect(value(validateSave({...meta,saveVersion:8,universe:u},definition)).universe).toEqual(u);
});

test('a session cannot be processed twice: re-running instructions, re-advancing and reloading change nothing',()=>{
 const u=advanceCampaignTo(atFP1(3),definition,SUN),done=session(u);
 expect(runQualifyingDay(u,definition,melbourne)).toBe(u);
 expect(closeQualifying(u,definition,melbourne)).toBe(u);
 expect(progressSession(u,definition,melbourne,{finish:true})).toBe(u);
 expect(dueCampaignEvents(u,d('2026-03-20')).filter(e=>e.eventId===melbourne)).toHaveLength(0);
 const later=advanceCampaignTo(reload(u),definition,d('2026-04-20'));
 expect(session(later)).toEqual(done);
 expect(answerQualifyingCall(later,definition,{})).toEqual({ok:false,reason:'NO_CALL'});
 expect(setQualifyingPlan(later,definition,{})).toEqual({ok:false,reason:'NOT_PLANNING'});
});

test('same seed + same choices gives the same grid; save/reload at every status continues identically',()=>{
 const run=(withReload:boolean)=>{
  let u=ok(setQualifyingPlan(atFP1(5),definition,recommendedPlans(atFP1(5),definition)));
  if(withReload)u=reload(u);
  u=advanceCampaignTo(u,definition,SAT);
  const statuses:string[]=[];
  while(sessionAwaitingPlayer(u)){statuses.push(session(u).status);if(withReload)u=reload(u);u=sessionAtBreak(u)?ok(continueQualifying(u,definition)):ok(answerQualifyingCall(u,definition,fixedCalls('PLAN')(u)));}
  return {s:session(u),statuses,u:withReload?reload(u):u};
 };
 const a=run(false),b=run(true);
 expect(a.statuses).toEqual(['Q1_CALL','Q1_BREAK','Q2_CALL','Q2_BREAK','Q3_CALL'].slice(0,a.statuses.length));
 expect(a.statuses.length).toBeGreaterThanOrEqual(1);
 expect(b.s).toEqual(a.s);expect(b.u).toEqual(a.u);
 // A different choice gives a different session.
 const c=play(atFP1(5),both(atFP1(5),plan({timing:'EARLY',runs:2})),fixedCalls('GO_LATE'));
 expect(JSON.stringify(c.segments.Q1)).not.toBe(JSON.stringify(a.s.segments.Q1));
});

test('choices measurably change the result: weather timing, tyre choice and traffic approach',()=>{
 const rain:Weather={kind:'RAIN',changeMinute:10};
 const q1=(s:QualifyingSession,ids:string[])=>mean(ids.map(id=>s.segments.Q1!.order.indexOf(id)+1));
 const early:number[]=[],late:number[]=[],soft:number[]=[],medium:number[]=[],push:number[]=[],space:number[]=[];
 for(const seed of SEEDS.slice(0,25)){
  const u=atFP1(seed),ids=mine(u);
  early.push(q1(play(u,both(u,plan({timing:'EARLY'})),fixedCalls('STAY_IN'),rain),ids));
  late.push(q1(play(u,both(u,plan({timing:'LATE'})),fixedCalls('PLAN'),rain),ids));
  const best=(s:QualifyingSession)=>mean(ids.map(id=>Math.min(...s.segments.Q1!.laps.filter(l=>l.driverId===id&&l.time!==null).map(l=>l.time!))));
  soft.push(best(play(u,both(u,plan({tyre:'NEW_SOFT',timing:'EARLY'})),fixedCalls('STAY_IN'),{kind:'DRY',changeMinute:null})));
  medium.push(best(play(u,both(u,plan({tyre:'MEDIUM',timing:'EARLY'})),fixedCalls('STAY_IN'),{kind:'DRY',changeMinute:null})));
  const traffic=(s:QualifyingSession)=>mean(s.segments.Q1!.laps.filter(l=>ids.includes(l.driverId)).map(l=>l.traffic));
  push.push(traffic(play(u,both(u,plan({traffic:'PUSH',runs:2,timing:'MIDDLE'})),fixedCalls('PLAN'),{kind:'DRY',changeMinute:null})));
  space.push(traffic(play(u,both(u,plan({traffic:'FIND_SPACE',runs:2,timing:'MIDDLE'})),fixedCalls('PLAN'),{kind:'DRY',changeMinute:null})));
 }
 // Rain at 10 minutes: the early run beats waiting by many places.
 expect(mean(early)).toBeLessThan(mean(late)-4);
 // A new soft is clearly quicker than the medium banker, but not by an absurd margin.
 expect(mean(medium)-mean(soft)).toBeGreaterThan(0.3);expect(mean(medium)-mean(soft)).toBeLessThan(1.2);
 expect(mean(space)).toBeLessThan(mean(push));
});

test('a better car qualifies higher on average over many seeds, but not every time',()=>{
 const boost=(u:GameUniverse,by:number):GameUniverse=>{
  const team=u.development.teams[teamId]!;
  return {...u,development:{...u.development,teams:{...u.development.teams,[teamId]:{...team,parts:Object.fromEntries(Object.entries(team.parts).map(([k,p])=>[k,{...p,rating:p.rating+by}])) as Parts}}}};
 };
 const base:number[]=[],better:number[]=[];
 for(const seed of SEEDS){
  const u=atFP1(seed),ids=mine(u);
  for(const [list,car] of [[base,u],[better,boost(u,6)]] as const){
   const s=advanceCampaignTo(car,definition,SUN).qualifying!.sessions[melbourne]!;
   list.push(mean(ids.map(id=>pos(s,id))));
  }
 }
 expect(mean(better)).toBeLessThan(mean(base)-2);
 // Variation remains: the better car is not ahead in every single seed.
 expect(better.filter((b,i)=>b>=base[i]!).length).toBeGreaterThan(0);
});

test('the quicker car at the circuit wins more often, the margin is believable and results vary within limits',()=>{
 const u0=atFP1(1),track=calendarById(u0.calendarId).tracks['track.melbourne']!;
 const field=fieldAtTrack(u0,definition,track),byRank=Object.entries(field).sort((a,b)=>a[1].rank-b[1].rank).map(([id])=>id);
 let firstAhead=0,lastAhead=0;const poles:Record<string,number>={},spreads:number[]=[],positions:Record<string,number[]>={};
 for(const seed of SEEDS){
  const s=advanceCampaignTo(atFP1(seed),definition,SUN).qualifying!.sessions[melbourne]!;
  const bestOf=(t:string)=>Math.min(...s.grid!.filter(g=>g.teamId===t).map(g=>g.position));
  if(bestOf(byRank[0]!)<bestOf(byRank[1]!))firstAhead++;
  if(bestOf(byRank[0]!)<bestOf(byRank[10]!))lastAhead++;
  poles[s.grid![0]!.teamId]=(poles[s.grid![0]!.teamId]??0)+1;
  const q1=s.segments.Q1!.laps.filter(l=>l.time!==null&&l.wet===0).map(l=>l.time!);
  if(s.weather.kind==='DRY'){spreads.push(Math.max(...s.grid!.slice(16).map(g=>g.time??0))-s.grid![0]!.time!);expect(q1.length).toBeGreaterThan(20);}
  for(const g of s.grid!)(positions[g.driverId]??=[]).push(g.position);
 }
 expect(firstAhead/SEEDS.length).toBeGreaterThan(0.5);expect(firstAhead/SEEDS.length).toBeLessThan(0.97);
 expect(lastAhead/SEEDS.length).toBeGreaterThanOrEqual(0.95); // rain or a lost lap can still upset the order
 expect(Math.max(...Object.values(poles))/SEEDS.length).toBeLessThan(0.9);
 expect(Object.keys(poles).length).toBeGreaterThan(1);
 expect(mean(spreads)).toBeGreaterThan(1.0);expect(mean(spreads)).toBeLessThan(4.0);
 const sd=(xs:number[])=>Math.sqrt(mean(xs.map(x=>(x-mean(xs))**2)));
 const sds=Object.values(positions).map(sd);
 expect(mean(sds)).toBeGreaterThan(0.6);expect(Math.max(...sds)).toBeLessThan(6);
});

test('the weekend gates: plan before Saturday, answer each call, then Monday; day steps obey the same gates',()=>{
 let u=startPlayerProject(createGameUniverse(definition,8),definition,{partId:'FLOOR',objective:'PERFORMANCE',approach:'BALANCED'});
 let w=ok(u);
 w=ok(continuePlayerTurn(w,definition));expect(w.currentDate).toBe(FRI);
 const ids=mine(w),pair=(p:DriverPlan)=>Object.fromEntries(ids.map(id=>[id,p]));
 expect(nextTurnTarget(w)).toMatchObject({kind:'QUALIFYING',date:SAT,eventId:melbourne});
 expect(continuePlayerTurn(w,definition)).toEqual({ok:false,reason:'QUALIFYING_PLAN_REQUIRED',eventId:melbourne});
 expect(advancePlayerDay(w,definition)).toEqual({ok:false,reason:'QUALIFYING_PLAN_REQUIRED',eventId:melbourne});
 expect(setQualifyingPlan(w,definition,{[ids[0]!]:plan({})})).toEqual({ok:false,reason:'INVALID_PLAN'});
 expect(setQualifyingPlan(w,definition,{...pair(plan({})),'driver.verhoeven':plan({})})).toEqual({ok:false,reason:'INVALID_PLAN'});
 w=ok(setQualifyingPlan(w,definition,pair(plan({timing:'LATE'}))));
 w=ok(setQualifyingPlan(w,definition,pair(plan({timing:'EARLY'})))); // re-lock until the session starts
 expect(session(w).plans[ids[0]!]!.Q1.timing).toBe('EARLY');
 const r=continuePlayerTurn(w,definition);if(!r.ok)throw new Error(r.reason);
 w=r.universe;expect(r.target.kind).toBe('QUALIFYING');expect(w.currentDate).toBe(SAT);expect(session(w).status).toBe('Q1_CALL');
 expect(session(w).segments.Q1!.order).toEqual([]);
 expect(continuePlayerTurn(w,definition)).toEqual({ok:false,reason:'QUALIFYING_CALL_REQUIRED',eventId:melbourne});
 expect(advancePlayerDay(w,definition)).toEqual({ok:false,reason:'QUALIFYING_CALL_REQUIRED',eventId:melbourne});
 expect(setQualifyingPlan(w,definition,pair(plan({})))).toEqual({ok:false,reason:'NOT_PLANNING'});
 expect(answerQualifyingCall(w,definition,{[ids[0]!]:{action:'FLY' as Call['action']},[ids[1]!]:{action:'PLAN'}})).toEqual({ok:false,reason:'INVALID_CALL'});
 for(let i=0;i<5&&sessionAwaitingPlayer(w);i++){
  if(sessionAtBreak(w)){expect(continuePlayerTurn(w,definition)).toEqual({ok:false,reason:'QUALIFYING_CALL_REQUIRED',eventId:melbourne});w=ok(continueQualifying(w,definition));}
  else w=ok(answerQualifyingCall(w,definition,fixedCalls('GO_LATE')(w)));
 }
 expect(session(w).status).toBe('COMPLETE');
 // The player's own calls are recorded as the player's, never as defaults.
 for(const id of ids)expect(session(w).segments.Q1!.calls[id]).toEqual({action:'GO_LATE',defaulted:false});
 expect(nextTurnTarget(w)).toEqual({date:d('2026-03-09'),kind:'MONDAY'});
 expect(continuePlayerTurn(w,definition).ok).toBe(true);
});

test('rivals plan and call by AI policy from their own forecast; the player never changes their weather, forecasts or plans',()=>{
 const u=atFP1(4),track=calendarById(u.calendarId).tracks['track.melbourne']!,field=fieldAtTrack(u,definition,track);
 const a=play(u,both(u,plan({timing:'EARLY'})),fixedCalls('STAY_IN')),b=play(u,both(u,plan({tyre:'MEDIUM',runs:2})),fixedCalls('GO_NOW'));
 expect(a.weather).toEqual(b.weather);expect(a.forecasts).toEqual(b.forecasts);
 for(const e of a.entrants.filter(e=>e.teamId!==teamId)){
  const profile=definition.development.teams.find(t=>t.id===e.teamId)!;
  expect(a.plans[e.driverId]).toEqual(policyPlan({carRank:field[e.teamId]!.rank,aggression:profile.aggression,forecast:a.forecasts[e.teamId]!}));
  expect(b.plans[e.driverId]).toEqual(a.plans[e.driverId]);
  expect(a.segments.Q1!.calls[e.driverId]!.defaulted).toBe(false);
 }
});

test('forecasts improve with Research work: higher confidence and more often right, never certain',()=>{
 expect(forecastAccuracy(0)).toBeCloseTo(0.35);expect(forecastAccuracy(600)).toBeGreaterThan(0.85);expect(forecastAccuracy(1e6)).toBeLessThanOrEqual(0.9);
 const rain:Weather={kind:'RAIN',changeMinute:20};
 const right=(points:number)=>Array.from({length:400},(_,i)=>teamForecast(i,'calendar.2026.v2',melbourne,teamId,rain,points)).filter(f=>f.kind==='RAIN').length;
 expect(right(600)).toBeGreaterThan(right(0)+80);expect(right(600)).toBeLessThan(400);
 expect(teamForecast(1,'calendar.2026.v2',melbourne,teamId,rain,0).confidence).toBe('LOW');
 expect(teamForecast(1,'calendar.2026.v2',melbourne,teamId,rain,600).confidence).toBe('HIGH');
 // Research totals accumulate from the weekly work the replay shows, per team.
 const u=advanceCampaignTo(ok(startPlayerProject(createGameUniverse(definition,2),definition,{partId:'FLOOR',objective:'PERFORMANCE',approach:'BALANCED'})),definition,d('2026-04-06'));
 expect(u.qualifying!.researchPoints[teamId]).toBeGreaterThan(0);
 expect(Object.values(u.qualifying!.researchPoints).every(n=>Number.isInteger(n)&&n>=0)).toBe(true);
});

test('save v8 boundary rejects tampered grids, impossible statuses and qualifying on a v7 envelope',()=>{
 const u=advanceCampaignTo(atFP1(6),definition,SUN),env=value(createSaveEnvelope(u,meta,definition));
 const mutate=(f:(s:QualifyingSession)=>QualifyingSession)=>({...env,universe:{...env.universe,qualifying:{...env.universe.qualifying!,sessions:{[melbourne]:f(JSON.parse(JSON.stringify(session(u))))}}}});
 expect(validateSave(mutate(s=>s),definition).ok).toBe(true);
 expect(validateSave(mutate(s=>({...s,grid:[s.grid![1]!,s.grid![0]!,...s.grid!.slice(2)]})),definition).ok).toBe(false);
 expect(validateSave(mutate(s=>({...s,grid:s.grid!.slice(1)})),definition).ok).toBe(false);
 expect(validateSave(mutate(s=>({...s,status:'PLANNING'})),definition).ok).toBe(false);
 expect(validateSave(mutate(s=>({...s,entrants:[...s.entrants.slice(1),s.entrants[1]!]})),definition).ok).toBe(false);
 expect(validateSave(mutate(s=>({...s,weather:{kind:'RAIN',changeMinute:null}})),definition).ok).toBe(false);
 expect(validateSave(mutate(s=>({...s,date:d('2026-03-08')})),definition).ok).toBe(false);
 const future=advanceCampaignTo(atFP1(6),definition,FRI);
 expect(validateSave({...value(createSaveEnvelope(future,meta,definition)),universe:{...future,qualifying:{...future.qualifying!,sessions:{[melbourne]:session(u)}}}},definition).ok).toBe(false);
 const {qualifying:_q,...without}=env.universe;
 expect(validateSave({...env,universe:without},definition).ok).toBe(false);
 expect(validateSave({...v7,universe:{...v7.universe,qualifying:env.universe.qualifying}},definition).ok).toBe(false);
});

test('save v8: frozen v7 fixture migrates at FP1, keeps its released development continuation and plays qualifying',()=>{
 expect(createHash('sha256').update(readFileSync(join(__dirname,'../../persistence/__tests__/fixtures/driver-world-v7.json'))).digest('hex'))
  .toBe('594512b341397b5da8a12333bfe3b578e0677edb7bc9c5cb6731a3d0198f6412');
 expect(SAVE_V7.definition.version).toBe('development-loop-2026-v7');expect(SAVE_V8.definition.version).toBe(definition.version);
 expect(SAVE_V8.definition).toEqual(JSON.parse(JSON.stringify(definition)));
 const bytes=JSON.stringify(v7),loaded=value(deserializeSave(bytes,definition));
 expect(JSON.stringify(v7)).toBe(bytes);
 expect(loaded.saveVersion).toBe(8);expect(loaded.universe.developmentRules).toBe(3);expect(loaded.universe.currentDate).toBe('2026-05-01');
 const {definitionVersion,qualifying,...rest}=loaded.universe,{definitionVersion:_old,...original}=v7.universe;
 expect(definitionVersion).toBe(definition.version);expect(rest).toEqual(original);
 // Owner-approved estimate: research already done on current projects; nothing backfilled.
 expect(qualifying!.sessions).toEqual({});expect(qualifying!.researchPoints[teamId]).toBeGreaterThan(0);
 // Golden continuation recorded from the released v7 build: qualifying never touches development.
 const cont=advanceCampaignTo(loaded.universe,definition,d('2026-06-29'));
 expect(createHash('sha256').update(JSON.stringify(cont.development)).digest('hex')).toBe('0867369c8a8efde169f4fa9861dea6435553c3a7d1845cd4ec80be9010361c4a');
 // Migrated on the FP1 Friday: the player plans tomorrow's session normally; earlier rounds have no grid.
 let u=loaded.universe;const event=nextTurnTarget(u)!;
 expect(event.kind).toBe('QUALIFYING');
 u=acceptRecommendation(u,definition)!;
 u=ok(continuePlayerTurn(u,definition) as {ok:boolean;universe?:GameUniverse});
 while(sessionAwaitingPlayer(u))u=acceptRecommendation(u,definition)!;
 expect(u.qualifying!.sessions[event.eventId!]!.grid).toHaveLength(22);
 expect(Object.keys(u.qualifying!.sessions)).toEqual([event.eventId]);
 expect(reload(u)).toEqual(u);
});

test('the pit wall only calls a place "safe" once enough cars have set a time',()=>{
 const base={segment:'Q1' as const,position:7,hasTime:true,remainingRuns:1,nextRunMinute:16,plannedTyre:'NEW_SOFT' as const,wetNow:0,wetBefore:0,
  forecast:{kind:'DRY' as const,changeMinute:null,confidence:'LOW' as const}};
 expect(policyCall({...base,timedCars:5}).action).toBe('PLAN');
 expect(policyCall({...base,timedCars:18}).action).toBe('STAY_IN');
 expect(policyCall({...base,timedCars:18,position:15}).action).toBe('PLAN');
});

test('the recommended call is built from exactly the timing screen the player sees at the call',()=>{
 for(const seed of [1,2,3,4,5,6]){
  let u=atFP1(seed);u=ok(setQualifyingPlan(u,definition,recommendedPlans(u,definition)));u=advanceCampaignTo(u,definition,SAT);
  const s=session(u),card=selectQualifyingCall(u,definition)!,tower=towerAt(u,s,9);
  expect(card.segment).toBe('Q1');
  for(const d of card.drivers){
   const row=tower.rows.find(r=>r.driverId===d.driverId)!;
   expect(d.position).toBe(row.time===null?null:row.position);
   if(s.weather.kind!=='DRY')continue;
   const seen={segment:'Q1' as const,position:d.position,hasTime:row.time!==null,timedCars:tower.rows.filter(r=>r.time!==null).length,remainingRuns:d.plannedRunsLeft,
    nextRunMinute:null,plannedTyre:s.plans[d.driverId]!.Q1.tyre,wetNow:0,wetBefore:0,forecast:s.forecasts[teamId]!};
   expect(policyCall(seen)).toEqual(d.recommended);
  }
 }
});

test('sectors: every timed lap splits into three sectors summing to its time; a lost lap stops where it went off; lap times unchanged',()=>{
 const u=advanceCampaignTo(createGameUniverse(definition,11),definition,d('2026-06-01'));
 let lost=0;
 for(const s of Object.values(u.qualifying!.sessions))for(const seg of ['Q1','Q2','Q3'] as const)for(const l of s.segments[seg]!.laps){
  expect(l.sectors).toHaveLength(3);
  if(l.time!==null){expect(l.sectors.every(x=>x!==null)).toBe(true);expect(Math.abs(l.sectors.reduce((a,b)=>a!+b!,0)!-l.time)).toBeLessThan(0.0015);}
  else{expect(l.sectors.some(x=>x===null)).toBe(true);const off=l.sectors.findIndex(x=>x===null);expect(l.sectors.slice(off).every(x=>x===null)).toBe(true);lost++;}
 }
 expect(lost).toBeGreaterThan(0);
});

test('live timing: a lap goes out lap -> flying (S1, S2, S3) -> in lap -> garage; colours follow fastest / personal best / slower',()=>{
 const u=advanceCampaignTo(atFP1(3),definition,SUN),s=session(u);
 const lap=s.segments.Q1!.laps.find(l=>l.time!==null)!,id=lap.driverId,row=(b:number)=>liveTiming(u,s,b).rows.find(r=>r.driverId===id)!;
 expect(row(lap.slot*3).phase).toBe('OUT_LAP');
 expect(row((lap.slot+1)*3).phase).toBe('FLYING');expect(row((lap.slot+1)*3).sectors.every(x=>x===null)).toBe(true);
 expect(row((lap.slot+1)*3+1).sectors.filter(Boolean)).toHaveLength(1);
 expect(row((lap.slot+1)*3+2).sectors.filter(Boolean)).toHaveLength(2);
 expect(row((lap.slot+2)*3).phase).toBe('IN_LAP');expect(row((lap.slot+2)*3).justFinished).toBe(true);expect(row((lap.slot+2)*3).time).toBe(lap.time);
 // Colours: at every beat, a purple sector is the fastest completed so far; yellow is slower than that driver's best.
 for(const b of [12,24,36,54]){
  const rows=liveTiming(u,s,b).rows;
  for(let i=0;i<3;i++){
   const shown=rows.map(r=>r.sectors[i]).filter((x):x is NonNullable<typeof x>=>!!x);
   const purple=shown.filter(x=>x.color==='PURPLE');
   if(shown.length){expect(purple.length).toBeGreaterThan(0);expect(purple.every(x=>x.time===Math.min(...shown.map(y=>y.time)))).toBe(true);}
  }
 }
 // Whole-minute view is the same timing screen the call card reads.
 expect(towerAt(u,s,9).rows.map(r=>[r.driverId,r.time])).toEqual(liveTiming(u,s,27).rows.map(r=>[r.driverId,r.time]));
 // The replay lingers only where something happens; the session end is always a beat to stop on.
 const beats=activeBeats(s);expect(beats.has(54)).toBe(true);expect(beats.size).toBeLessThan(45*3);
 expect(liveTiming(u,s,54).commentary.some(f=>f.kind==='ANNOUNCER'&&f.text.startsWith('Q1 over'))).toBe(true);
});

/** Golden results recorded before the presentation/flow pass (breaks, commentary, pacing): lap times, orders
 * and grids must stay byte-identical for the same seed and the same choices. */
const core=(s:QualifyingSession)=>({laps:(['Q1','Q2','Q3'] as const).map(q=>s.segments[q]!.laps),orders:(['Q1','Q2','Q3'] as const).map(q=>s.segments[q]!.order),grid:s.grid});
const hash=(x:unknown)=>createHash('sha256').update(JSON.stringify(x)).digest('hex');
test('golden: headless season and recommended player sessions are unchanged by breaks and presentation',()=>{
 const u=advanceCampaignTo(createGameUniverse(definition,11),definition,d('2026-12-14'));
 expect(hash(Object.values(u.qualifying!.sessions).map(core))).toBe('8a0b2dfda8a35dba9c929394ca497381eab0afd96c1875a0249a6e6382b23291');
 const out:unknown[]=[];
 for(const seed of [1,2,3,4,5]){let v=atFP1(seed);v=acceptRecommendation(v,definition)!;v=advanceCampaignTo(v,definition,SAT);
  while(sessionAwaitingPlayer(v))v=acceptRecommendation(v,definition)!;out.push(core(session(v)));}
 expect(hash(out)).toBe('0e965cf457fa77818ad7a42dbc905d225bf6448690a5afc391df1b43686992ce');
});

test('breaks: the session stops after Q1 and Q2, nothing of the next part runs before Continue, and re-planning applies to it',()=>{
 let u=atFP1(2);u=ok(setQualifyingPlan(u,definition,recommendedPlans(u,definition)));u=advanceCampaignTo(u,definition,SAT);
 u=ok(answerQualifyingCall(u,definition,recommendedCalls(u,definition)));
 const s=session(u);
 if(s.status!=='Q1_BREAK'){expect(s.status).toBe('COMPLETE');return;} // both cars out in Q1: nothing to wait for
 expect(s.segments.Q2).toBeUndefined();expect(answerQualifyingCall(u,definition,{})).toEqual({ok:false,reason:'NO_CALL'});
 const through=s.segments.Q1!.order.slice(0,16).filter(id=>s.entrants.find(e=>e.driverId===id)!.teamId===teamId);
 const medium={tyre:'MEDIUM' as const,runs:1 as const,timing:'EARLY' as const,traffic:'FIND_SPACE' as const};
 expect(continueQualifying(u,definition,{'driver.verhoeven':medium})).toEqual({ok:false,reason:'INVALID_PLAN'});
 const v=ok(continueQualifying(u,definition,Object.fromEntries(through.map(id=>[id,medium]))));
 expect(session(v).status).toBe('Q2_CALL');
 for(const id of through){expect(session(v).plans[id]!.Q2).toEqual(medium);expect(session(v).segments.Q2!.laps.filter(l=>l.driverId===id).every(l=>l.tyre==='MEDIUM')).toBe(true);}
 expect(reload(v)).toEqual(v);expect(reload(u)).toEqual(u);
});

test('commentary: the announcer covers the field, radio is only for the player, and nothing is said before it happens',()=>{
 const u=advanceCampaignTo(atFP1(3),definition,SUN),s=session(u),ids=s.entrants.filter(e=>e.teamId===teamId).map(e=>e.driverId);
 let radio=0,announcer=0;
 for(let b=0;b<=135;b+=3){
  const live=liveTiming(u,s,b),local=b-(live.segment==='Q1'?0:live.segment==='Q2'?54:99);
  for(const line of live.commentary){
   expect(line.at).toBeLessThanOrEqual(local+0.5);
   if(line.kind==='RADIO'){radio++;expect(ids).toContain(line.driverId);}else announcer++;
  }
  for(const r of live.rows)if(!r.mine)expect(r.predicted).toBeNull();
 }
 expect(radio).toBeGreaterThan(0);expect(announcer).toBeGreaterThan(0);
 // The same beat always reads the same, however it was reached (speed, Skip or Focus are presentation only).
 expect(liveTiming(u,s,40)).toEqual(liveTiming(u,s,40));
});

test('call stakes come from the current timing screen, or else the previous part, never from laps still to come',()=>{
 for(const seed of [1,2,3,4]){
  let u=atFP1(seed);u=ok(setQualifyingPlan(u,definition,recommendedPlans(u,definition)));u=advanceCampaignTo(u,definition,SAT);
  for(let i=0;i<5&&sessionAwaitingPlayer(u);i++){
   const card=selectQualifyingCall(u,definition);
   if(card){
    const s=session(u),tower=towerAt(u,s,(card.segment==='Q1'?0:card.segment==='Q2'?18:33)+card.minute),timed=tower.rows.filter(r=>r.time!==null);
    if(card.target.source==='NOW'){const line=timed[(card.cutoff??1)-1]!;expect(card.target.offPole).toBeCloseTo(line.time!-timed[0]!.time!,3);}
    else if(card.segment==='Q1')expect(card.target.source).toBeNull();
    else expect(card.target.source).toBe(card.segment==='Q2'?'Q1':'Q2');
   }
   u=acceptRecommendation(u,definition)!;
  }
 }
});
