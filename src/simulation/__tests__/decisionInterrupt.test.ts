import {expect,test} from '@jest/globals';
import {readFileSync} from 'fs';
import {join} from 'path';
import {DEFAULT_GAME_DEFINITION as definition} from '../../game/defaultGame';
import {createGameUniverse,type GameUniverse} from '../universe';
import {advancePlayerDay,blockingDecisions,buildWeekTimeline,continuePlayerTurn,decideProjectEvent,DECISION_EFFECT_NOTE,DAY_MS,eventDefinition,
 pendingEvent,selectHqDevelopment,startPlayerProject,stepPlayback,stopTime,summarizeWeek} from '../developmentLoop';
import {resolvePendingDefaults} from '../developmentLoop/step';
import {acceptRecommendation} from '../qualifying';
import {developmentView} from '../campaignTime/developmentView';
import {createSaveEnvelope,deserializeSave,serializeSave,type SaveResult} from '../../persistence/saveEnvelope';

const teamId='team.wellington';
const meta={gameVersion:'0.7.1',saveId:'decision-interrupt',createdAt:'2026-11-03T12:00:00.000Z',updatedAt:'2026-11-03T12:00:00.000Z'};
const value=<T,>(r:SaveResult<T>):T=>{if(!r.ok)throw new Error(r.error.message);return r.value;};
const reload=(u:GameUniverse)=>value(deserializeSave(value(serializeSave(value(createSaveEnvelope(u,meta,definition)),definition)),definition)).universe;
const ok=(r:{ok:boolean;universe?:GameUniverse})=>{if(!r.ok)throw new Error('refused');return r.universe!;};
/** The gated turn; a qualifying plan or call (save v8) is answered with the recommendation, as a quick player would. */
const playTurn=(u:GameUniverse)=>{let r=continuePlayerTurn(u,definition);for(let k=0;k<4&&!r.ok&&r.reason.startsWith('QUALIFYING');k++){u=acceptRecommendation(u,definition)!;r=continuePlayerTurn(u,definition);}return r;};
function career(seed:number){
 let u=createGameUniverse(definition,seed);
 for(const partId of ['FRONT_WING','FLOOR','REAR_SUSPENSION'] as const)u=ok(startPlayerProject(u,definition,{partId,objective:'PERFORMANCE',approach:'BALANCED'}));
 return u;
}
/** Plays the gated player turn until the player's own decision is pending; returns the turn that raised it. */
function untilDecision(seed=1){
 let u=career(seed);
 for(let i=0;i<30;i++){
  const r=playTurn(u);if(!r.ok)throw new Error(r.reason);
  if(blockingDecisions(r.universe).length)return {before:u,after:r.universe};
  u=r.universe;
 }
 throw new Error('no decision');
}
/** First option the player can afford, as a real player would pick. */
function choose(u:GameUniverse,projectId:string,pick=0){
 const p=u.development.teams[teamId]!.projects.find(x=>x.id===projectId)!;
 const def=eventDefinition(pendingEvent(p)!.type)!;
 for(const c of [def.choices[pick]!,...def.choices]){const r=decideProjectEvent(u,definition,projectId,c.id);if(r.ok)return {u:r.universe,choice:c.id};}
 throw new Error('no affordable choice');
}

test('an unanswered player decision refuses Continue and +1 day; nothing advances and nothing is defaulted',()=>{
 const {after}=untilDecision();
 const [projectId]=blockingDecisions(after);
 const refused=continuePlayerTurn(after,definition);
 expect(refused).toEqual({ok:false,reason:'DECISION_REQUIRED',projectIds:[projectId]});
 expect(advancePlayerDay(after,definition)).toEqual({ok:false,reason:'DECISION_REQUIRED',projectIds:[projectId]});
 // Refusal is not a partial advance: the caller keeps the same universe; the event stays pending, undefaulted.
 const p=after.development.teams[teamId]!.projects.find(x=>x.id===projectId)!;
 expect(pendingEvent(p)).toMatchObject({choice:null,defaulted:false});
});

test('resolving the decision allows advancement and records the player choice exactly once (never a default)',()=>{
 const {after}=untilDecision();
 const [projectId]=blockingDecisions(after);
 const {u:decided,choice}=choose(after,projectId!);
 expect(decideProjectEvent(decided,definition,projectId!,choice)).toEqual({ok:false,reason:'NOT_AVAILABLE'});
 expect(blockingDecisions(decided)).toEqual([]);
 const next=playTurn(decided);expect(next.ok).toBe(true);
 const later=next.ok?next.universe:decided;
 const project=later.development.teams[teamId]!.projects.find(x=>x.id===projectId);
 const events=(project?.events??[]).filter(e=>e.choice===choice);
 expect(events.length).toBeGreaterThanOrEqual(1);
 expect(events.every(e=>!e.defaulted)).toBe(true);
 // The kernel default has nothing left to resolve for it.
 const view=developmentView(decided.development,decided.currentDate);
 expect(resolvePendingDefaults(view,definition.development).teams[teamId]).toEqual(view.teams[teamId]);
});

test('HQ surfaces the decision first, then a ready part, then work in progress',()=>{
 const {after}=untilDecision();
 const hq=selectHqDevelopment(after,definition);
 const pending=after.development.teams[teamId]!.projects.find(p=>pendingEvent(p))!;
 expect(hq.mode).toBe('DECISION');
 expect(hq.focus!.id).toBe(pending.id);
 expect(hq.focus!.pendingEvent!.title).toBe(eventDefinition(pendingEvent(pending)!.type)!.title);
 expect(hq.focus!.pendingEvent!.options.map(o=>o.id)).toEqual(eventDefinition(pendingEvent(pending)!.type)!.choices.map(c=>c.id));
 // Find a moment with a READY part and active work but no decision: READY outranks ACTIVE.
 let u=career(2),found=false;
 for(let i=0;i<40&&!found;i++){
  for(const id of blockingDecisions(u))u=choose(u,id).u;
  const team=u.development.teams[teamId]!;
  if(team.projects.some(p=>p.stage==='READY')&&team.projects.some(p=>p.stage!=='READY')){
   const v=selectHqDevelopment(u,definition);expect(v.mode).toBe('READY');expect(v.focus!.stage).toBe('READY');found=true;
  }
  const r=playTurn(u);if(!r.ok)break;u=r.universe;
 }
 expect(found).toBe(true);
 expect(selectHqDevelopment(createGameUniverse(definition,3),definition).mode).toBe('IDLE');
});

test('neither Skip nor 2x can pass a pending decision in the replay; with no decision they run to the end',()=>{
 const {before,after}=untilDecision();
 const report=summarizeWeek(before,after,definition)!,timeline=buildWeekTimeline(report);
 expect(timeline.decisions.length).toBeGreaterThan(0);
 const hold=stopTime(timeline.decisions[0]!),end=timeline.days*DAY_MS[1];
 expect(stepPlayback(0,0,1,hold,true,timeline.days)).toEqual({units:hold,held:true,skipped:false});
 expect(stepPlayback(0,60_000,2,hold,false,timeline.days)).toEqual({units:hold,held:true,skipped:false});
 let units=0;for(let i=0;i<500;i++)units=stepPlayback(units,100,2,hold,false,timeline.days).units;
 expect(units).toBe(hold);
 expect(stepPlayback(hold,0,1,null,true,timeline.days)).toEqual({units:end,held:false,skipped:true});
 expect(stepPlayback(hold,100,2,null,false,timeline.days).units).toBeCloseTo(hold+100*DAY_MS[1]/DAY_MS[2],6);
 // And the domain gate still holds after the replay has finished.
 expect(continuePlayerTurn(after,definition).ok).toBe(false);
});

test('save/reload keeps the pending decision and the gate; deciding after reload equals deciding before',()=>{
 const {after}=untilDecision();
 const loaded=reload(after);
 expect(loaded).toEqual(after);
 expect(blockingDecisions(loaded)).toEqual(blockingDecisions(after));
 expect(continuePlayerTurn(loaded,definition).ok).toBe(false);
 const [id]=blockingDecisions(after);
 const a=choose(after,id!).u,b=choose(loaded,id!).u;
 expect(b).toEqual(a);
 const na=playTurn(a),nb=playTurn(reload(b));
 expect(nb.ok&&na.ok&&nb.universe).toEqual(na.ok&&na.universe);
});

test('same seed + same decisions gives the same career; a different decision gives a different one',()=>{
 const play=(pick:number)=>{let u=career(5);
  for(let i=0;i<18;i++){for(const id of blockingDecisions(u))u=choose(u,id,pick).u;const r=playTurn(u);if(!r.ok)break;u=r.universe;}
  return u;};
 expect(play(0)).toEqual(play(0));
 expect(JSON.stringify(play(1).development.teams[teamId])).not.toBe(JSON.stringify(play(0).development.teams[teamId]));
});

test('rival teams resolve their own events by AI policy and never block the player',()=>{
 let u=career(7),rivalDecided=0;
 for(let i=0;i<24;i++){
  for(const [id,team] of Object.entries(u.development.teams)){
   if(id===teamId)continue;
   expect(team.projects.some(p=>pendingEvent(p))).toBe(false);
   rivalDecided+=team.projects.flatMap(p=>p.events??[]).filter(e=>e.choice!==null&&e.type!=='REFINE').length;
  }
  for(const id of blockingDecisions(u))u=choose(u,id).u;
  const r=playTurn(u);if(!r.ok)break;u=r.universe;
 }
 expect(rivalDecided).toBeGreaterThan(0);
 // Even an (artificial) pending rival event is never a player gate.
 const rival=Object.keys(u.development.teams).find(id=>id!==teamId&&u.development.teams[id]!.projects.length)!;
 const forced={...u,development:{...u.development,teams:{...u.development.teams,[rival]:{...u.development.teams[rival]!,projects:u.development.teams[rival]!.projects.map((p,i)=>i===0?
  {...p,events:[{type:'MATERIAL_SHORTAGE',stage:'MANUFACTURING' as const,choice:null,defaulted:false}]}:p)}}}};
 expect(blockingDecisions(forced)).toEqual(blockingDecisions(u));
});

test('ordinary variation never pauses time: weeks without a raised decision have no replay stops',()=>{
 let u=career(3),swings=0;
 for(let i=0;i<24;i++){
  for(const id of blockingDecisions(u))u=choose(u,id).u;
  const r=playTurn(u);if(!r.ok)break;
  const report=summarizeWeek(u,r.universe,definition)!,t=buildWeekTimeline(report);
  if(!report.newEvents.length){expect(t.decisions).toEqual([]);swings+=report.stories.filter(s=>s.swing!=='NORMAL').length;}
  else expect(t.decisions.map(d=>d.projectId).sort()).toEqual(report.newEvents.map(e=>e.projectId).sort());
  u=r.universe;
 }
 expect(swings).toBeGreaterThan(0);
});

test('presentation never claims a mid-replay decision changed the already-processed week',()=>{
 const {before,after}=untilDecision();
 const report=summarizeWeek(before,after,definition)!;
 const snapshot=JSON.stringify(report);
 const [id]=blockingDecisions(after);
 const decided=choose(after,id!).u;
 // The processed week is unchanged: same date, same fitted parts, rivals untouched, the report is a snapshot.
 expect(decided.currentDate).toBe(after.currentDate);
 expect(decided.development.submissions).toEqual(after.development.submissions);
 for(const t of Object.keys(after.development.teams).filter(t=>t!==teamId))expect(decided.development.teams[t]).toEqual(after.development.teams[t]);
 expect(JSON.stringify(report)).toBe(snapshot);
 // The prompt says so explicitly.
 expect(DECISION_EFFECT_NOTE).toMatch(/already in/);
 expect(readFileSync(join(__dirname,'../../ui/components/HqDevelopmentCard.tsx'),'utf8')).toContain('DECISION_EFFECT_NOTE');
});
