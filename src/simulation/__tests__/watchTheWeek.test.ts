import {expect,test} from '@jest/globals';
import {createHash} from 'crypto';
import {readdirSync,readFileSync,statSync} from 'fs';
import {join} from 'path';
import {DEFAULT_GAME_DEFINITION as definition} from '../../game/defaultGame';
import {getPart,type DevelopmentProject} from '../development';
import {advanceCampaignTo,createGameUniverse,type GameUniverse} from '../universe';
import {dueCampaignEvents} from '../universe/campaignEvents';
import {buildWeekTimeline,DAY_MS,departmentQuality,effectiveBonus,eventDefinition,fitAtWeekend,nextTurnTarget,pendingEvent,playbackFrame,
 rules2Week,rules3Week,selectHqDevelopment,selectProjectView,splitPoints,startPlayerProject,summarizeWeek,variationBonus,weekOdds,weekVariation,
 BONUS_CAP,reasonFor,stopTime,type WeekReport,type WeekTimeline} from '../developmentLoop';
import {developmentView} from '../campaignTime/developmentView';
import {addCampaignDays} from '../campaignTime';
import {calendarById} from '../../game/calendar';
import {SAVE_V6,SAVE_V7} from '../../persistence/contracts';
import {createSaveEnvelope,deserializeSave,serializeSave,validateSave,type SaveResult} from '../../persistence/saveEnvelope';
import v6 from '../../persistence/__tests__/fixtures/driver-world-v6.json';

const teamId='team.wellington';
const meta={gameVersion:'0.7.0',saveId:'watch-the-week',createdAt:'2026-11-02T12:00:00.000Z',updatedAt:'2026-11-02T12:00:00.000Z'};
const value=<T,>(r:SaveResult<T>):T=>{if(!r.ok)throw new Error(r.error.message);return r.value;};
const reload=(u:GameUniverse)=>value(deserializeSave(value(serializeSave(value(createSaveEnvelope(u,meta,definition)),definition)),definition)).universe;
const turn=(u:GameUniverse)=>advanceCampaignTo(u,definition,nextTurnTarget(u)!.date);
function floorCareer(seed:number){
 const r=startPlayerProject(createGameUniverse(definition,seed),definition,{partId:'FLOOR',objective:'PERFORMANCE',approach:'BALANCED'});
 if(!r.ok)throw new Error(r.reason);return r.universe;
}
type Week={before:GameUniverse;after:GameUniverse;report:WeekReport;timeline:WeekTimeline};
/** Plays clean Floor careers until a processed week matches; the first match is deterministic. */
function findWeek(match:(w:Week)=>boolean,turns=22):Week{
 for(let seed=1;seed<80;seed++){
  let u=floorCareer(seed);
  for(let i=0;i<turns&&nextTurnTarget(u);i++){
   const after=turn(u),report=summarizeWeek(u,after,definition)!,w={before:u,after,report,timeline:buildWeekTimeline(report)};
   if(match(w))return w;u=after;
  }
 }
 throw new Error('No matching week');
}
const floorStory=(w:Week)=>w.report.stories.find(s=>s.name==='Floor');
const sumPieces=(t:WeekTimeline,projectId?:string)=>t.pieces.filter(p=>!projectId||p.projectId===projectId).reduce((a,p)=>a+p.points,0);
function deepFreeze<T>(o:T):T{if(o&&typeof o==='object'){Object.values(o).forEach(deepFreeze);Object.freeze(o);}return o;}

test('new careers run rules 3; one Continue processes exactly one development week, and presentation never mutates it',()=>{
 const u=floorCareer(1);
 expect(u.developmentRules).toBe(3);
 let c=u;
 for(let i=0;i<8;i++){
  const target=nextTurnTarget(c)!;
  const weeks=dueCampaignEvents(c,target.date).filter(e=>e.kind==='DEVELOPMENT_WEEK');
  expect(weeks.length).toBeLessThanOrEqual(1);
  const after=deepFreeze(advanceCampaignTo(deepFreeze(c),definition,target.date));
  const snapshot=JSON.stringify(after);
  const report=summarizeWeek(c,after,definition)!;buildWeekTimeline(report);selectHqDevelopment(after,definition);
  expect(JSON.stringify(after)).toBe(snapshot);
  expect(report.stories.length>0).toBe(weeks.length===1);
  c=after;
 }
});

test('1x, 2x and Skip only change presentation time: identical final state, identical authoritative result',()=>{
 const w=findWeek(x=>floorStory(x)?.swing==='SETBACK');
 const finals=[1,2].map(speed=>{
  const s=speed as 1|2;let t=0,f=playbackFrame(w.timeline,0,s);
  const seen:number[]=[];while(!f.done){seen.push(f.state);t+=50;f=playbackFrame(w.timeline,t,s);}
  expect(seen).toEqual([...seen].sort((a,b)=>a-b));
  return {f,t};
 });
 const skipped=playbackFrame(w.timeline,0,1,true);
 expect(finals[0]!.f).toEqual(skipped);expect(finals[1]!.f).toEqual(skipped);
 expect(finals[0]!.t).toBeGreaterThanOrEqual(5*DAY_MS[1]);expect(finals[0]!.t).toBeLessThanOrEqual(5*DAY_MS[1]+50);
 expect(5*DAY_MS[1]).toBeGreaterThanOrEqual(7000);expect(5*DAY_MS[1]).toBeLessThanOrEqual(9000);
 expect(5*DAY_MS[2]).toBeGreaterThanOrEqual(3500);expect(5*DAY_MS[2]).toBeLessThanOrEqual(4500);
 const end=w.timeline.states[skipped.state]!;
 for(const p of w.report.projects.filter(x=>x.segments.length))expect(end.projects.find(q=>q.projectId===p.id)!.pct).toBe(p.to);
 // The universe is already final before any playback; replaying it again changes nothing.
 expect(buildWeekTimeline(w.report)).toEqual(w.timeline);
});

test('bubbles sum exactly to the authoritative weekly points, per project and per category',()=>{
 for(let seed=1;seed<=6;seed++){
  let u=floorCareer(seed);
  for(let i=0;i<14;i++){
   const after=turn(u),report=summarizeWeek(u,after,definition)!,t=buildWeekTimeline(report);
   for(const {category,points} of report.points)expect(t.pieces.filter(p=>p.category===category).reduce((a,p)=>a+p.points,0)).toBe(points);
   for(const p of report.projects)expect(sumPieces(t,p.id)).toBe(p.segments.reduce((a,s)=>a+s.points,0));
   expect(t.states.at(-1)!.counters).toEqual(Object.fromEntries(report.points.map(p=>[p.category,p.points])));
   for(const s of report.stories)expect(s.actual).toBe(report.projects.find(p=>p.id===s.projectId)!.segments.reduce((a,x)=>a+x.points,0));
   u=after;
  }
 }
 expect(splitPoints(13,[1,1.15,0.9,1.05,0.9]).reduce((a,b)=>a+b,0)).toBe(13);
 expect(splitPoints(7,[0,0,0,0,0])).toEqual([2,2,1,1,1]);
});

test('a stall produces zero progress, no bubbles, a visible warning, and a later authoritative ETA',()=>{
 const w=findWeek(x=>floorStory(x)?.kind==='STALL'&&!x.report.projects[0]!.segments.some(s=>s.points>0)&&floorStory(x)!.expected>0);
 const story=floorStory(w)!,id=story.projectId;
 expect(story.actual).toBe(0);expect(story.expected).toBeGreaterThan(0);
 expect(w.timeline.pieces.filter(p=>p.projectId===id)).toHaveLength(0);
 expect(w.timeline.callouts.find(c=>c.projectId===id&&c.kind==='STALL')!.title).toBe(story.title);
 expect(new Set(w.timeline.states.map(s=>s.projects.find(p=>p.projectId===id)!.pct)).size).toBe(1);
 const before=w.before.development.teams[teamId]!.projects.find(p=>p.id===id)!,after=w.after.development.teams[teamId]!.projects.find(p=>p.id===id)!;
 expect(after.progress).toBe(before.progress);expect(after.stage).toBe(before.stage);
 // ETA in the story is the authoritative read model, and a lost week moves it later (never earlier).
 expect(story.readyAfter).toBe(selectProjectView(w.after,definition,after).readyDate);
 expect(story.readyAfter!>=story.readyBefore!).toBe(true);
 const delayed=findWeek(x=>{const s=floorStory(x);return !!s&&(s.kind==='STALL'||s.kind==='SETBACK')&&!!s.readyBefore&&!!s.readyAfter&&s.readyAfter>s.readyBefore;});
 const s=floorStory(delayed)!;
 expect(s.readyAfter).toBe(selectProjectView(delayed.after,definition,delayed.after.development.teams[teamId]!.projects.find(p=>p.id===s.projectId)!).readyDate);
 // The ETA visibly switches on the setback day, not before.
 const states=delayed.timeline.states.map(x=>x.projects.find(p=>p.projectId===s.projectId)!.ready);
 expect(states[0]).toBe(s.readyBefore);expect(states.at(-1)).toBe(s.readyAfter);
});

test('a speed breakthrough shows accented, larger-than-expected progress that matches the kernel',()=>{
 const w=findWeek(x=>{const s=floorStory(x);return !!s&&s.kind==='BREAKTHROUGH'&&s.quality===0&&s.actual>s.expected;});
 const s=floorStory(w)!;
 const accented=w.timeline.pieces.filter(p=>p.projectId===s.projectId&&p.accent);
 expect(accented.length).toBeGreaterThan(0);
 expect(accented.every(p=>p.day>=s.day)).toBe(true);
 expect(sumPieces(w.timeline,s.projectId)).toBe(s.actual);
 expect(w.timeline.callouts.some(c=>c.kind==='BREAKTHROUGH'&&c.day===s.day)).toBe(true);
});

test('a quality breakthrough raises EXISTING bonus points, which the existing fitting model reads; no second modifier',()=>{
 const w=findWeek(x=>(floorStory(x)?.quality??0)>0);
 const s=floorStory(w)!;
 const before=w.before.development.teams[teamId]!.projects.find(p=>p.id===s.projectId)!;
 const after=w.after.development.teams[teamId]!.projects.find(p=>p.id===s.projectId)!;
 expect((after.bonusPoints??0)-(before.bonusPoints??0)).toBe(s.quality);
 // Fitting uses expectedGain * (1 + effectiveBonus%) through the unchanged outcome path.
 const calendar=calendarById(w.after.calendarId);
 const ready:DevelopmentProject={...after,stage:'READY',progress:0};
 const view=developmentView(w.after.development,w.after.currentDate);
 const world={...view,teams:{...view.teams,[teamId]:{...view.teams[teamId]!,projects:[ready]}}};
 const event=calendar.events.find(e=>e.weekendStartDate>w.after.currentDate)!;
 const fitted=fitAtWeekend(world,definition.development,w.after.calendarId,event).submissions.at(-1)!;
 expect(fitted.teamId).toBe(teamId);
 expect(fitted.expectedGain).toBeCloseTo(ready.expectedGain*(1+effectiveBonus(ready)/100),10);
 const plain=fitAtWeekend({...world,teams:{...world.teams,[teamId]:{...world.teams[teamId]!,projects:[{...ready,bonusPoints:before.bonusPoints}]}}},definition.development,w.after.calendarId,event).submissions.at(-1)!;
 expect(fitted.expectedGain).toBeGreaterThan(plain.expectedGain);
 // Variation alone never pushes quality beyond the existing effective cap.
 expect(variationBonus(24,6)).toBe(BONUS_CAP);expect(variationBonus(30,6)).toBe(30);expect(variationBonus(-24,-4)).toBe(-BONUS_CAP);
});

test('no UI-only performance: the UI never writes development or performance values',()=>{
 const files:string[]=[];
 const walk=(d:string)=>{for(const f of readdirSync(d)){const p=join(d,f);if(statSync(p).isDirectory())walk(p);else if(/\.tsx?$/.test(f))files.push(p);}};
 walk(join(__dirname,'../../ui'));files.push(join(__dirname,'../../../App.tsx'));
 for(const f of files){
  const text=readFileSync(f,'utf8');
  // Reading for display is allowed; writing a performance field or calling a kernel step is not.
  expect([f,/\b(bonusPoints|expectedGain|actualGain|rating|correlation)\s*:(?!:)|\b(bonusPoints|expectedGain|actualGain|rating)\s*=[^=]|Math\.random|advanceProjects|introduceReadyUpgrades|applyChoice|advanceDevelopmentWeek|rules[23]Week/.test(text)]).toEqual([f,false]);
 }
});

test('stage transitions in the replay match the actual project stages; READY work produces no bubbles',()=>{
 const w=findWeek(x=>x.report.projects.some(p=>p.fromStage!==p.toStage&&p.toStage!=='READY'));
 const p=w.report.projects.find(x=>x.fromStage!==x.toStage)!;
 const actual=w.after.development.teams[teamId]!.projects.find(x=>x.id===p.id)!;
 expect(p.toStage).toBe(actual.stage);
 expect(w.timeline.states.at(-1)!.projects.find(x=>x.projectId===p.id)!.stage).toBe(p.stage);
 expect(w.timeline.callouts.filter(c=>c.projectId===p.id&&c.kind==='STAGE_COMPLETE')).toHaveLength(p.segments.length-1);
 const ready=findWeek(x=>x.report.projects.some(q=>q.fromStage==='READY'),40);
 const r=ready.report.projects.find(q=>q.fromStage==='READY')!;
 expect(r.segments).toHaveLength(0);
 expect(ready.timeline.pieces.some(q=>q.projectId===r.id)).toBe(false);
 expect(ready.report.stories.some(s=>s.projectId===r.id)).toBe(false);
});

test('pending decisions shown in the report and HQ card are exactly the domain events',()=>{
 const w=findWeek(x=>x.report.newEvents.length>0);
 const team=w.after.development.teams[teamId]!;
 const pending=team.projects.filter(p=>pendingEvent(p));
 expect(w.report.newEvents.map(e=>e.title)).toEqual(pending.map(p=>eventDefinition(pendingEvent(p)!.type)!.title));
 const hq=selectHqDevelopment(w.after,definition);
 expect(hq.mode).toBe('DECISION');
 expect(hq.focus!.pendingEvent!.title).toBe(eventDefinition(pendingEvent(pending[0]!)!.type)!.title);
 const idle=selectHqDevelopment(createGameUniverse(definition,2),definition);
 expect(idle.mode).toBe('IDLE');expect(idle.focus).toBeNull();
});

test('reload does not duplicate work and same seed + same decisions gives identical careers',()=>{
 let a=floorCareer(9),b=floorCareer(9);
 for(let i=0;i<16;i++){
  a=turn(a);b=reload(turn(b));
  expect(b).toEqual(a);
  const report=summarizeWeek(a,a,definition)!;
  expect(report.stories).toHaveLength(0);expect(report.points).toHaveLength(0);
 }
 let c=floorCareer(10);for(let i=0;i<16;i++)c=turn(c);
 expect(JSON.stringify(c.development.teams[teamId])).not.toBe(JSON.stringify(a.development.teams[teamId]));
});

test('race-week advancement still stops at FP1 and hands off to the weekend without work bubbles',()=>{
 const u=floorCareer(1);
 const target=nextTurnTarget(u)!;
 expect(target).toMatchObject({kind:'FP1',date:'2026-03-06',venue:'Melbourne'});
 const after=turn(u);expect(after.currentDate).toBe('2026-03-06');
 const report=summarizeWeek(u,after,definition)!;
 expect(report.weekend).toMatchObject({venue:'Melbourne'});
 expect(report.weekend!.suitability.length).toBeGreaterThan(0);
 expect(buildWeekTimeline(report).pieces).toHaveLength(0);
 expect(nextTurnTarget(after)).toMatchObject({kind:'MONDAY',date:'2026-03-09'});
});

test('weekly variation odds: normal is most common, majors are rare, better departments stall less and break through more',()=>{
 for(const q of [0,0.5,1]){
  const odds=Object.fromEntries(weekOdds(q));
  const normal=1-Object.values(odds).reduce((a,b)=>a+b,0);
  expect(normal).toBeGreaterThan(0.35);
  for(const p of Object.values(odds))expect(normal).toBeGreaterThan(p);
  expect(odds.STALL).toBeLessThan(odds.SETBACK!);expect(odds.MAJOR_BREAKTHROUGH).toBeLessThan(odds.BREAKTHROUGH!);
 }
 expect(Object.fromEntries(weekOdds(1)).STALL).toBeLessThan(Object.fromEntries(weekOdds(0)).STALL!);
 expect(Object.fromEntries(weekOdds(1)).BREAKTHROUGH).toBeGreaterThan(Object.fromEntries(weekOdds(0)).BREAKTHROUGH!);
 const profiles=definition.development.teams,floor=getPart(definition.development,'FLOOR');
 const strong=profiles.reduce((a,b)=>departmentQuality(b,floor,'DESIGN')>departmentQuality(a,floor,'DESIGN')?b:a);
 const weak=profiles.reduce((a,b)=>departmentQuality(b,floor,'DESIGN')<departmentQuality(a,floor,'DESIGN')?b:a);
 const count=(profile:typeof strong)=>{const tally:Record<string,number>={};
  for(let i=0;i<4000;i++){const p:DevelopmentProject={id:`probe-${i}`,partId:'FLOOR',reason:'PERFORMANCE',stage:'DESIGN',progress:0,ambition:0.6,expectedGain:3,cost:1,startedWeek:0};
   const v=weekVariation(5,profile,p,floor,1,10);tally[v.kind]=(tally[v.kind]??0)+1;
   expect(v).toEqual(weekVariation(5,profile,p,floor,1,10));}
  return tally;};
 const s=count(strong),w=count(weak);
 expect(s.NORMAL!).toBeGreaterThan(1600);
 expect(s.STALL??0).toBeLessThan(w.STALL??0);
 expect((s.BREAKTHROUGH??0)+(s.MAJOR_BREAKTHROUGH??0)).toBeGreaterThan((w.BREAKTHROUGH??0)+(w.MAJOR_BREAKTHROUGH??0));
});

test('rules 2 weekly work is untouched by rules 3 (no variation, same kernel)',()=>{
 const u=createGameUniverse(definition,4);
 const view=developmentView(u.development,addCampaignDays('2026-03-09' as GameUniverse['currentDate'],-1));
 const two=rules2Week(view,definition.development,u.calendarId),three=rules3Week(view,definition.development,u.calendarId);
 expect(JSON.stringify(two)).not.toBe(JSON.stringify(three));
 expect(rules2Week(view,definition.development,u.calendarId)).toEqual(two);
});

test('save v7: frozen v6 fixture migrates keeping rules 2 and its exact released continuation',()=>{
 expect(createHash('sha256').update(readFileSync(join(__dirname,'../../persistence/__tests__/fixtures/driver-world-v6.json'))).digest('hex'))
  .toBe('0eccdb6b944e7413b68a111d75e1d4240efd194114109d3600207f56e289b9f6');
 expect(SAVE_V6.definition.version).toBe('development-loop-2026-v6');expect(SAVE_V7.definition.version).toBe(definition.version);
 const bytes=JSON.stringify(v6);
 const loaded=value(deserializeSave(bytes,definition));
 expect(JSON.stringify(v6)).toBe(bytes);
 expect(loaded.saveVersion).toBe(7);expect(loaded.universe.developmentRules).toBe(2);
 const {definitionVersion,...rest}=loaded.universe,{definitionVersion:_old,...original}=v6.universe;
 expect(definitionVersion).toBe(definition.version);expect(rest).toEqual(original);
 let u=loaded.universe;
 for(let i=0;i<12;i++)u=turn(u);
 // Golden continuation recorded from the released rules-2 build before this milestone.
 expect(u.currentDate).toBe('2026-06-26');
 expect(createHash('sha256').update(JSON.stringify(u.development)).digest('hex')).toBe('fe099222a911b279be2eaa98fe36cfcca79f761fbffec8e516a3c93a6496c307');
 expect(reload(u)).toEqual(u);
});

test('save v7 boundaries: a v6 envelope cannot claim rules 3; rules-3 careers roundtrip; unknown rules are rejected',()=>{
 expect(validateSave({...v6,universe:{...v6.universe,developmentRules:3}},definition).ok).toBe(false);
 let u=floorCareer(3);for(let i=0;i<10;i++)u=turn(u);
 expect(reload(u)).toEqual(u);
 const env=value(createSaveEnvelope(u,meta,definition));
 expect(validateSave({...env,universe:{...env.universe,developmentRules:4}},definition).ok).toBe(false);
 expect(validateSave({...env,universe:{...env.universe,development:{...env.universe.development,teams:{...env.universe.development.teams,
  [teamId]:{...env.universe.development.teams[teamId]!,projects:env.universe.development.teams[teamId]!.projects.map(p=>({...p,weekKind:'STALL'}))}}}}},definition).ok).toBe(false);
});

test('part culmination explains the result honestly and READY parts are never reported as a quiet week',()=>{
 expect(reasonFor({bonusPoints:10},'BELOW EXPECTATION')).toMatch(/did not fully carry over/);
 expect(reasonFor({bonusPoints:10},'ABOVE EXPECTATION')).toMatch(/paid off/);
 expect(reasonFor({bonusPoints:-6},'BELOW EXPECTATION')).toMatch(/compromised/);
 const w=findWeek(x=>x.report.waiting.length>0,40);
 const ready=w.after.development.teams[teamId]!.projects.find(p=>p.stage==='READY')!;
 expect(w.report.waiting[0]).toMatchObject({name:getPart(definition.development,ready.partId).name,readyFor:selectProjectView(w.after,definition,ready).fitsAt?.name??null});
});

test('decisions raised this week become replay stops on the day the stage began (or midweek), after that day arrives',()=>{
 const w=findWeek(x=>x.report.newEvents.length>0);
 expect(w.timeline.decisions.map(d=>d.projectId)).toEqual(expect.arrayContaining(w.report.newEvents.map(e=>e.projectId)));
 for(const d of w.timeline.decisions){
  const entered=w.timeline.callouts.find(c=>c.projectId===d.projectId&&c.kind==='STAGE_COMPLETE');
  expect(d.day).toBe(entered?entered.day:2);
  const t=stopTime(d),f=playbackFrame(w.timeline,t,1);
  expect(f.day).toBe(d.day);expect(f.state).toBe(d.day+1);expect(f.done).toBe(false);
 }
 expect(buildWeekTimeline({...w.report,newEvents:[]}).decisions).toHaveLength(0);
});

test('a great week moves the authoritative ETA earlier, and the replay keeps the old estimate visible beside it',()=>{
 const w=findWeek(x=>{const s=floorStory(x);return !!s&&s.swing==='BREAKTHROUGH'&&!!s.readyBefore&&!!s.readyAfter&&s.readyAfter<s.readyBefore;},30);
 const s=floorStory(w)!;
 const after=w.after.development.teams[teamId]!.projects.find(p=>p.id===s.projectId)!;
 expect(s.readyAfter).toBe(selectProjectView(w.after,definition,after).readyDate);
 const frames=w.timeline.states.map(x=>x.projects.find(p=>p.projectId===s.projectId)!);
 for(const f of frames)expect(f.readyWas).toBe(s.readyBefore);
 expect(frames[0]!.ready).toBe(s.readyBefore);expect(frames.at(-1)!.ready).toBe(s.readyAfter);
 // It flips on the breakthrough day, not before.
 frames.forEach((f,k)=>expect(f.ready).toBe(k>s.day?s.readyAfter:s.readyBefore));
});

test('the quality beat shows only a real quality change, from its day, with the sign of the existing bonus points',()=>{
 const up=findWeek(x=>(floorStory(x)?.quality??0)>0);
 const s=floorStory(up)!;
 const frames=up.timeline.states.map(x=>x.projects.find(p=>p.projectId===s.projectId)!.quality);
 frames.forEach((q,k)=>expect(q).toBe(k>s.day||k===up.timeline.days?'up':null));
 const plain=findWeek(x=>{const f=floorStory(x);return !!f&&f.quality===0&&f.swing==='NORMAL';});
 const id=floorStory(plain)!.projectId;
 expect(plain.timeline.states.every(x=>x.projects.find(p=>p.projectId===id)!.quality===null)).toBe(true);
});
