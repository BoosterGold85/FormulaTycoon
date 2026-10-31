import {expect,jest,test} from '@jest/globals';
import {createHash} from 'crypto';
import {readFileSync} from 'fs';
import {join} from 'path';
import {DEFAULT_GAME_DEFINITION as definition} from '../../game/defaultGame';
import {calendarById} from '../../game/calendar';
import {TEAM_BRANDS} from '../../game/brandRegistry';
import {addCampaignDays,campaignContext,compareCampaignDates,legacyWeekDate,parseCampaignDate as date,type CampaignDate} from '../campaignTime';
import {developmentView} from '../campaignTime/developmentView';
import {spendingLimit,startProject,type DevelopmentProject} from '../development';
import {advanceCampaignTo,createGameUniverse,startUniverseSeason,type GameUniverse} from '../universe';
import {BONUS_CAP,decideProjectEvent,DEVELOPMENT_EVENTS,nextTurnTarget,outcomeLabel,refinePlayerProject,selectDevelopmentHub,selectPartOptions,
 setProjectHold,startPlayerProject,summarizeTurn,POINTS_PER_WEEK} from '../developmentLoop';
import {createSaveEnvelope,deserializeSave,serializeSave,validateSave,type SaveResult} from '../../persistence/saveEnvelope';
import v5 from '../../persistence/__tests__/fixtures/driver-world-v5.json';

const teamId='team.wellington';
const meta={gameVersion:'0.6.0',saveId:'development-loop',createdAt:'2026-10-31T12:00:00.000Z',updatedAt:'2026-10-31T12:00:00.000Z'};
const value=<T,>(r:SaveResult<T>):T=>{if(!r.ok)throw new Error(r.error.message);return r.value;};
const ok=(r:ReturnType<typeof startPlayerProject>):GameUniverse=>{if(!r.ok)throw new Error(r.reason);return r.universe;};
const reload=(u:GameUniverse)=>value(deserializeSave(value(serializeSave(value(createSaveEnvelope(u,meta,definition)),definition)),definition)).universe;
const player=(u:GameUniverse)=>u.development.teams[teamId]!;
function daily(u:GameUniverse,target:CampaignDate){let c=u;while(c.currentDate!==target)c=advanceCampaignTo(c,definition,addCampaignDays(c.currentDate,1));return c;}
function withProjects(seed=3){
 let u=createGameUniverse(definition,seed);
 u=ok(startPlayerProject(u,definition,{partId:'FLOOR',objective:'PERFORMANCE',approach:'BALANCED'}));
 u=ok(startPlayerProject(u,definition,{partId:'FRONT_WING',objective:'PERFORMANCE',approach:'AGGRESSIVE'}));
 return ok(startPlayerProject(u,definition,{partId:'REAR_SUSPENSION',objective:'PERFORMANCE',approach:'CONSERVATIVE'}));
}

test('new careers run development rules 2 and save as v6; the v5 fixture is frozen',()=>{
 const u=createGameUniverse(definition,1);
 expect(u.developmentRules).toBe(2);
 expect(value(createSaveEnvelope(u,meta,definition)).saveVersion).toBe(6);
 expect(createHash('sha256').update(readFileSync(join(__dirname,'../../persistence/__tests__/fixtures/driver-world-v5.json'))).digest('hex'))
  .toBe('9539ffa5f57ef5306b38fbf741934e35edec1eb1ee11f7d19fd35eac88b386c5');
});

test('frozen v5 career migrates to rules 1 unchanged and keeps its released cadence',()=>{
 const before=JSON.stringify(v5);
 const loaded=value(deserializeSave(before,definition));
 expect(JSON.stringify(v5)).toBe(before);
 const {developmentRules,definitionVersion,...rest}=loaded.universe;
 const {definitionVersion:_old,...original}=v5.universe;
 expect(developmentRules).toBe(1);expect(definitionVersion).toBe(definition.version);expect(rest).toEqual(original);
 expect(loaded.saveVersion).toBe(6);
 // Rules 1 never raises events or real-weekend fittings: every new submission uses legacy event IDs.
 const later=advanceCampaignTo(loaded.universe,definition,date('2026-10-05'));
 const legacyIds=new Set(definition.development.calendar.map(e=>e.id));
 expect(later.development.submissions.every(s=>legacyIds.has(s.eventId))).toBe(true);
 expect(Object.values(later.development.teams).flatMap(t=>t.projects).every(p=>p.events===undefined&&p.bonusPoints===undefined)).toBe(true);
 expect(reload(later)).toEqual(later);
});

test('player projects use the same start rules as rivals: slots, budget, homologation, ownership',()=>{
 let u=withProjects();
 expect(startPlayerProject(u,definition,{partId:'REAR_WING',objective:'PERFORMANCE',approach:'BALANCED'})).toEqual({ok:false,reason:'NO_SLOT'});
 const fresh=createGameUniverse(definition,3);
 const view=developmentView(fresh.development,fresh.currentDate),profile=definition.development.teams.find(t=>t.id===teamId)!;
 const direct=startProject(view.teams[teamId]!,profile,definition.development,{partId:'FLOOR',reason:'PERFORMANCE',ambition:0.6,week:view.week,season:view.season});
 if(!direct.ok)throw new Error(direct.reason);
 const viaCommand=ok(startPlayerProject(fresh,definition,{partId:'FLOOR',objective:'PERFORMANCE',approach:'BALANCED'}));
 expect(player(viaCommand)).toEqual(direct.team);
 const broke={...fresh,development:{...fresh.development,teams:{...fresh.development.teams,[teamId]:{...player(fresh),spent:spendingLimit(profile,definition.development)}}}};
 expect(startPlayerProject(broke,definition,{partId:'FLOOR',objective:'PERFORMANCE',approach:'BALANCED'})).toEqual({ok:false,reason:'OVER_BUDGET'});
 const nose={...fresh,development:{...fresh.development,teams:{...fresh.development.teams,[teamId]:{...player(fresh),parts:{...player(fresh).parts,NOSE:{...player(fresh).parts.NOSE,upgradesThisSeason:2}}}}}};
 expect(startPlayerProject(nose,definition,{partId:'NOSE',objective:'PERFORMANCE',approach:'BALANCED'})).toEqual({ok:false,reason:'HOMOLOGATION_LIMIT'});
 expect(startPlayerProject(fresh,definition,{partId:'FLOOR',objective:'CIRCUIT_SPECIFIC',approach:'BALANCED'})).toEqual({ok:false,reason:'NOT_AVAILABLE'});
 expect(startPlayerProject({...fresh,playerTeamId:null},definition,{partId:'FLOOR',objective:'PERFORMANCE',approach:'BALANCED'})).toEqual({ok:false,reason:'NO_PLAYER_TEAM'});
 expect(setProjectHold({...u,developmentRules:1},definition,player(u).projects[0]!.id,true)).toEqual({ok:false,reason:'RULES'});
});

test('turn target is the next Monday or an earlier FP1, and stops at the season boundary',()=>{
 const u=createGameUniverse(definition,1);
 expect(nextTurnTarget(u)).toEqual({date:'2026-03-06',kind:'FP1',eventId:'event.2026.melbourne',venue:'Melbourne'});
 expect(nextTurnTarget({...u,currentDate:date('2026-03-06')})).toEqual({date:'2026-03-09',kind:'MONDAY'});
 expect(nextTurnTarget({...u,currentDate:date('2026-04-06')})).toEqual({date:'2026-04-13',kind:'MONDAY'});
 expect(nextTurnTarget({...u,currentDate:legacyWeekDate(1,52)})).toBeNull();
});

test('rules 2: daily == jump == save/reload with player projects, events and refine; no Math.random',()=>{
 const random=jest.spyOn(Math,'random').mockImplementation(()=>{throw new Error('Unseeded RNG');});
 try {
  const initial=withProjects(),target=date('2026-08-10');
  const jumped=advanceCampaignTo(initial,definition,target);
  expect(jumped).toEqual(daily(initial,target));
  const mid=advanceCampaignTo(initial,definition,date('2026-05-21'));
  expect(advanceCampaignTo(reload(mid),definition,target)).toEqual(jumped);
  expect(advanceCampaignTo(jumped,definition,target)).toBe(jumped);
 } finally { random.mockRestore(); }
});

test('rules 2 fits READY work at the first FP1 on or after it is built, exactly once, with real event identity',()=>{
 const end=advanceCampaignTo(withProjects(),definition,date('2026-12-07'));
 const calendar=calendarById(end.calendarId);
 const keys=end.development.submissions.map(s=>`${s.eventId}:${s.teamId}:${s.partId}`);
 expect(new Set(keys).size).toBe(keys.length);
 for(const s of end.development.submissions){
  const event=calendar.events.find(e=>e.id===s.eventId)!;
  expect(event).toBeDefined();
  expect(s.week).toBe(campaignContext(event.weekendStartDate).week);
 }
 const mine=end.development.submissions.filter(s=>s.teamId===teamId);
 expect(mine.map(s=>s.partId).sort()).toEqual(['FLOOR','FRONT_WING','REAR_SUSPENSION']);
 // Nothing is fitted before the first race weekend and nothing at a Monday.
 expect(end.development.submissions.every(s=>calendar.events.find(e=>e.id===s.eventId)!.weekendStartDate>='2026-03-06')).toBe(true);
 // The fitting happens when ENTERING FP1, not the day before.
 const first=mine[0]!,weekend=calendar.events.find(e=>e.id===first.eventId)!.weekendStartDate;
 const dayBefore=advanceCampaignTo(withProjects(),definition,addCampaignDays(weekend,-1));
 expect(dayBefore.development.submissions.some(s=>s.teamId===teamId&&s.partId===first.partId)).toBe(false);
 const on=advanceCampaignTo(dayBefore,definition,weekend);
 expect(on.development.submissions.filter(s=>s.teamId===teamId&&s.partId===first.partId)).toHaveLength(1);
});

test('hold keeps a built part back across weekends and save/reload; release fits it at the next FP1',()=>{
 let u=createGameUniverse(definition,5);
 u=ok(startPlayerProject(u,definition,{partId:'FRONT_WING',objective:'PERFORMANCE',approach:'CONSERVATIVE'}));
 const id=player(u).projects[0]!.id;
 u=ok(setProjectHold(u,definition,id,true));
 const held=reload(advanceCampaignTo(u,definition,date('2026-07-20')));
 const project=player(held).projects.find(p=>p.id===id)!;
 expect(project.stage).toBe('READY');expect(project.hold).toBe(true);
 expect(held.development.submissions.some(s=>s.teamId===teamId)).toBe(false);
 const released=ok(setProjectHold(held,definition,id,false));
 expect(player(released).projects[0]!.hold).toBeUndefined();
 const fitted=advanceCampaignTo(released,definition,date('2026-07-27'));
 expect(fitted.development.submissions.filter(s=>s.teamId===teamId).map(s=>s.eventId)).toEqual(['event.2026.budapest']);
});

function findEventCareer(){
 for(let seed=1;seed<60;seed++){
  let u=withProjects(seed);
  for(let w=0;w<12;w++){
   const t=nextTurnTarget(u)!;u=advanceCampaignTo(u,definition,t.date);
   const p=player(u).projects.find(x=>x.events?.some(e=>e.choice===null));
   if(p)return {u,project:p};
  }
 }
 throw new Error('no event found');
}
test('player events: decided once with bounded effects, or defaulted once at the next Monday',()=>{
 const {u,project}=findEventCareer();
 const pending=project.events!.find(e=>e.choice===null)!;
 const event=DEVELOPMENT_EVENTS.find(e=>e.type===pending.type)!;
 // Answer: the record is settled and cannot be answered again.
 const chosen=decideProjectEvent(u,definition,project.id,event.choices[1]!.id);
 if(!chosen.ok)throw new Error(chosen.reason);
 const after=player(chosen.universe).projects.find(p=>p.id===project.id)!;
 expect(after.events!.find(e=>e.type===pending.type)).toMatchObject({choice:event.choices[1]!.id,defaulted:false});
 expect(decideProjectEvent(chosen.universe,definition,project.id,event.choices[0]!.id)).toEqual({ok:false,reason:'NOT_AVAILABLE'});
 // Ignore it instead: the first option is applied exactly once on entering the next Monday.
 let ignored=u;
 while(nextTurnTarget(ignored)!.kind!=='MONDAY')ignored=advanceCampaignTo(ignored,definition,nextTurnTarget(ignored)!.date);
 ignored=advanceCampaignTo(ignored,definition,nextTurnTarget(ignored)!.date);
 const settled=player(ignored).projects.find(p=>p.id===project.id);
 const record=settled?.events?.find(e=>e.type===pending.type)??(()=>{throw new Error('project gone');})();
 expect(record).toMatchObject({choice:event.choices[0]!.id,defaulted:true});
 expect(settled!.events!.filter(e=>e.choice===null).length).toBeLessThanOrEqual(1);
 expect(reload(ignored)).toEqual(ignored);
});

test('refine adds bounded quality once; the bonus raises the fitted prediction, capped at 25%',()=>{
 let u=createGameUniverse(definition,8);
 u=ok(startPlayerProject(u,definition,{partId:'FRONT_WING',objective:'PERFORMANCE',approach:'BALANCED'}));
 while(player(u).projects[0]!.stage!=='DESIGN')u=advanceCampaignTo(u,definition,nextTurnTarget(u)!.date);
 const before=player(u);
 const refined=ok(refinePlayerProject(u,definition,before.projects[0]!.id));
 const p=player(refined).projects[0]!;
 expect(p.bonusPoints).toBe(10);expect(p.delayWeeks).toBe(1);
 expect(player(refined).spent).toBeCloseTo(before.spent+before.projects[0]!.cost*0.1,9);
 expect(refinePlayerProject(refined,definition,p.id)).toEqual({ok:false,reason:'NOT_AVAILABLE'});
 // Over-cap bonus is clamped at fitting; submission records the adjusted prediction.
 const boosted={...refined,development:{...refined.development,teams:{...refined.development.teams,[teamId]:{...player(refined),
  projects:[{...p,bonusPoints:58} as DevelopmentProject]}}}};
 const end=advanceCampaignTo(boosted,definition,date('2026-07-27'));
 const sub=end.development.submissions.find(s=>s.teamId===teamId)!;
 expect(sub.expectedGain).toBeCloseTo(p.expectedGain*(1+BONUS_CAP/100),9);
});

test('read models derive from simulation truth: points, progress, turn report and outcome labels',()=>{
 const u=withProjects();
 const next=advanceCampaignTo(u,definition,date('2026-03-09'));
 const report=summarizeTurn(u,next,definition)!;
 const delta=player(next).projects.reduce((sum,p)=>sum+p.progress-u.development.teams[teamId]!.projects.find(q=>q.id===p.id)!.progress,0);
 expect(report.points.reduce((s,p)=>s+p.points,0)).toBe(Math.round(delta*POINTS_PER_WEEK));
 const hub=selectDevelopmentHub(next,definition);
 for(const p of hub.projects){
  expect(p.wholeProgress).toBeGreaterThanOrEqual(0);expect(p.wholeProgress).toBeLessThanOrEqual(100);
  expect(p.points.map(x=>x.category)[0]).toBe('Research');
  expect(p.readyDate&&compareCampaignDates(p.readyDate,next.currentDate)>0).toBe(true);
 }
 expect(hub.budget.remainingM).toBeLessThan(45);
 const options=selectPartOptions(next,definition);
 expect(options).toHaveLength(8);
 expect(options.find(o=>o.id==='FLOOR')!.unavailable).toBe('Already in development');
 expect(outcomeLabel({expectedGain:2,actualGain:2.4,outcome:'DELIVERED',reason:'PERFORMANCE'} as never)).toBe('ABOVE EXPECTATION');
 expect(outcomeLabel({expectedGain:2,actualGain:2.2,outcome:'DELIVERED',reason:'PERFORMANCE'} as never)).toBe('ON TARGET');
 expect(outcomeLabel({expectedGain:2,actualGain:0,outcome:'REVERTED',reason:'PERFORMANCE'} as never)).toBe("DIDN'T WORK — REVERTED");
});

test('a full rules-2 season keeps every team valid: budgets, homologation, events and saves',()=>{
 let u=withProjects(11);
 for(let w=0;w<52;w++){
  u=advanceCampaignTo(u,definition,legacyWeekDate(1,w+1));
  // Keep the player factory busy, as an engaged player would.
  for(const partId of ['DIFFUSER_REAR_EDGE','REAR_WING','FRONT_SUSPENSION','NOSE'] as const){
   const r=startPlayerProject(u,definition,{partId,objective:'PERFORMANCE',approach:'BALANCED'});if(r.ok)u=r.universe;
  }
  if(w%4===0)expect(createSaveEnvelope(u,meta,definition).ok).toBe(true);
 }
 for(const profile of definition.development.teams){
  const team=u.development.teams[profile.id]!;
  expect(team.spent).toBeLessThanOrEqual(spendingLimit(profile,definition.development)+1e-9);
  expect(team.parts.NOSE.upgradesThisSeason).toBeLessThanOrEqual(2);
  for(const p of team.projects)expect(p.events?.filter(e=>e.choice===null).length??0).toBeLessThanOrEqual(1);
 }
 // Rival decisions are taken by policy immediately; only the player can have one pending.
 const rivalEvents=Object.entries(u.development.teams).filter(([id])=>id!==teamId).flatMap(([,t])=>t.projects.flatMap(p=>p.events??[]));
 expect(rivalEvents.every(e=>e.choice!==null)).toBe(true);
 expect(u.development.submissions.length).toBeGreaterThan(50);
 expect(value(createSaveEnvelope(u,meta,definition)).saveVersion).toBe(6);
 const next=startUniverseSeason(u,definition,TEAM_BRANDS.map(t=>t.id));
 expect(next.developmentRules).toBe(2);
});

test.each([
 ['rules-1 career carrying rules-2 fields',(s:any)=>{s.universe.developmentRules=1;s.universe.development.teams[teamId].projects[0].bonusPoints=5;}],
 ['unknown event type',(s:any)=>{s.universe.development.teams[teamId].projects[0].events=[{type:'ALIENS',stage:'RESEARCH',choice:null,defaulted:false}];}],
 ['choice outside the catalogue',(s:any)=>{s.universe.development.teams[teamId].projects[0].events=[{type:'MATERIAL_SHORTAGE',stage:'MANUFACTURING',choice:'TELEPORT',defaulted:false}];}],
 ['event from a stage not reached',(s:any)=>{s.universe.development.teams[teamId].projects[0].events=[{type:'MATERIAL_SHORTAGE',stage:'MANUFACTURING',choice:null,defaulted:false}];}],
 ['two events on one stage',(s:any)=>{s.universe.development.teams[teamId].projects[0].events=[{type:'WIND_TUNNEL_CORRELATION',stage:'RESEARCH',choice:'TRUST_CFD',defaulted:false},{type:'RIG_CORRELATION',stage:'RESEARCH',choice:'PROCEED',defaulted:false}];}],
 ['hold false instead of absent',(s:any)=>{s.universe.development.teams[teamId].projects[0].hold=false;}],
 ['negative delay',(s:any)=>{s.universe.development.teams[teamId].projects[0].delayWeeks=-1;}],
 ['missing rules identity',(s:any)=>{delete s.universe.developmentRules;}],
 ['legacy event id in a rules-2 career',(s:any)=>{s.universe.development.submissions=[{season:1,week:10,eventId:'BHR',teamId,partId:'FLOOR',reason:'PERFORMANCE',description:'x',expectedGain:1,actualGain:1,outcome:'DELIVERED',cost:1}];}],
 ['future weekend submission',(s:any)=>{s.universe.development.submissions=[{season:1,week:40,eventId:'event.2026.yas_marina',teamId,partId:'FLOOR',reason:'PERFORMANCE',description:'x',expectedGain:1,actualGain:1,outcome:'DELIVERED',cost:1}];}]
])('v6 boundary rejects %s',(_label,mutate)=>{
 const save=value(createSaveEnvelope(withProjects(),meta,definition));mutate(save);
 expect(validateSave(save,definition).ok).toBe(false);
});
