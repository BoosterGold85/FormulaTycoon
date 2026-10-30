import {expect,jest,test} from '@jest/globals';
import {calendarById,TECHNICAL_AXES} from '../../game/calendar';
import {DEFAULT_GAME_DEFINITION as definition} from '../../game/defaultGame';
import {createGameUniverse,type GameUniverse} from '../universe';
import {computeCarProfile,introduceReadyUpgrades,startProject,type TeamDevelopmentState} from '../development';
import {evaluateCarAtTrack,evaluateTeamAtTrack,technicalPerformanceAtTrack} from '../trackPerformance';

const initial=createGameUniverse(definition,17),teamId='team.wellington';
const team=initial.development.teams[teamId]!,profile=definition.development.teams.find(t=>t.id===teamId)!;
const track=calendarById(initial.calendarId).tracks['track.monza']!;
const clone=<T,>(input:T):T=>JSON.parse(JSON.stringify(input));
const withTeam=(next:TeamDevelopmentState):GameUniverse=>({...initial,
 development:{...initial.development,teams:{...initial.development.teams,[teamId]:next}}});
const result=(next:TeamDevelopmentState)=>technicalPerformanceAtTrack(withTeam(next),definition,teamId,track);

test('canonical technical response is one fitted/contextual result; suitability discloses it without stacking a bonus',()=>{
 const canonical=technicalPerformanceAtTrack(initial,definition,teamId,track);
 expect(canonical.trackId).toBe(track.id);
 expect(canonical.suitability).toEqual(evaluateCarAtTrack(canonical.car,track));
 expect(evaluateTeamAtTrack(initial,definition,teamId,track)).toEqual(canonical.suitability);
 for(const field of ['pace','carOverall','lapTime','finishingPosition','fitBonus'])expect(canonical).not.toHaveProperty(field);
 expect(()=>technicalPerformanceAtTrack(initial,definition,'team.unknown',track)).toThrow('Unknown car team');
});

test('canonical boundary is pure/deterministic, with no driver/form, names, dynamic weather or RNG contribution',()=>{
 const bytes=JSON.stringify([initial,track,definition]),changed=clone(initial);
 for(const driver of Object.values(changed.drivers!.drivers)){
  for(const key of Object.keys(driver.ability) as Array<keyof typeof driver.ability>)driver.ability[key]=0;
  driver.dynamic.form=100;driver.comfort={frontResponse:0,rearStability:0,braking:0,downforce:0};
 }
 const random=jest.spyOn(Math,'random').mockImplementation(()=>{throw new Error('Unexpected RNG');});
 try {
  const canonical=technicalPerformanceAtTrack(initial,definition,teamId,track);
  expect(technicalPerformanceAtTrack(initial,definition,teamId,track)).toEqual(canonical);
  expect(technicalPerformanceAtTrack(changed,definition,teamId,track)).toEqual(canonical);
  const renamed={...track,id:'track.renamed',name:'Renamed',metadata:{...track.metadata,altitudeM:4000,rainTendency:'HIGH' as const}};
  const renamedResult=technicalPerformanceAtTrack(initial,definition,teamId,renamed);
  expect(renamedResult.car).toEqual(canonical.car);expect(renamedResult.suitability).toEqual(canonical.suitability);
  expect(JSON.stringify([initial,track,definition])).toBe(bytes);
 }finally{random.mockRestore();}
});

test('pending and READY projects have no fitted effect; successful introduction changes it and failed introduction retains prior truth',()=>{
 const started=startProject(team,profile,definition.development,{partId:'FRONT_WING',reason:'PERFORMANCE',ambition:1,week:0,season:1});
 if(!started.ok)throw new Error(started.reason);
 const baseline=result(team),ready={...started.team,projects:[{...started.project,stage:'READY' as const,progress:0}]};
 expect(result(started.team)).toEqual(baseline);
 expect(result(ready)).toEqual(baseline);
 let fitted=false,reverted=false;
 for(let seed=0;seed<100&&(!fitted||!reverted);seed++){
  const introduced=introduceReadyUpgrades(ready,profile,definition.development,seed,1,definition.development.calendar[0]!);
  expect(introduced.team.projects).toHaveLength(0);
  if(introduced.submissions[0]!.outcome==='REVERTED'){
   reverted=true;expect(result(introduced.team)).toEqual(baseline);
  }else{
   fitted=true;expect(result(introduced.team).car.values.highSpeed).toBeGreaterThan(baseline.car.values.highSpeed);
   expect(result(introduced.team).suitability.score).not.toBe(baseline.suitability.score);
  }
 }
 expect(fitted).toBe(true);expect(reverted).toBe(true);
});

test.each(definition.development.parts.map(p=>p.id))('fitted %s retains a meaningful technical effect',partId=>{
 const fitted=clone(team);fitted.parts[partId].rating+=1;
 const before=result(team).car.values,after=result(fitted).car.values;
 expect(TECHNICAL_AXES.some(axis=>before[axis]!==after[axis])).toBe(true);
});

test('packages and static heat are applied once by the existing car model, including their reliability consequence',()=>{
 const prepared=clone(team);prepared.circuitPackages=['LOW_DRAG','HIGH_COOLING'];
 prepared.parts.BODYWORK_COOLING.rating=45;prepared.parts.BODYWORK_COOLING.reliability=50;
 const hot={...track,packageContext:{downforce:'LOW' as const,hot:true}};
 const cold={...hot,packageContext:{...hot.packageContext,hot:false}};
 const evaluate=(circuit:typeof hot)=>technicalPerformanceAtTrack(withTeam(prepared),definition,teamId,circuit);
 const canonical=evaluate(hot),legacy=computeCarProfile(prepared,profile,{id:hot.id,name:hot.name,week:0,...hot.packageContext});
 expect(canonical.car.values.aeroEfficiency).toBe(legacy.attributes.dragEfficiency);
 expect(canonical.car.values.cooling).toBe(legacy.attributes.cooling);
 expect(canonical.car.values.reliability).toBe(legacy.reliability);
 expect(canonical.suitability).toEqual(evaluateCarAtTrack(canonical.car,hot));
 expect(evaluate(hot)).toEqual(canonical); // Querying again never accumulates modifiers.
 expect(canonical.car.values.reliability).toBeLessThan(evaluate(cold).car.values.reliability);
 const noPackages={...prepared,circuitPackages:[]};
 const base=technicalPerformanceAtTrack(withTeam(noPackages),definition,teamId,hot);
 expect(canonical.car.values.aeroEfficiency).toBeGreaterThan(base.car.values.aeroEfficiency);
 expect(canonical.car.values.cooling).toBeGreaterThan(base.car.values.cooling);
 expect(canonical.car.values.reliability).toBeGreaterThan(base.car.values.reliability);
});

test('a reliability repair changes reliability capability, not power/aero/grip or a newly invented pace/failure stat',()=>{
 const fragile=clone(team);fragile.parts.FRONT_WING.reliability=45;
 const started=startProject(fragile,profile,definition.development,{partId:'FRONT_WING',reason:'RELIABILITY',ambition:.5,week:0,season:1});
 if(!started.ok)throw new Error(started.reason);
 const ready={...started.team,projects:[{...started.project,stage:'READY' as const}]};
 const repaired=introduceReadyUpgrades(ready,profile,definition.development,17,1,definition.development.calendar[0]!).team;
 const before=result(fragile),after=result(repaired);
 expect(after.car.values.reliability).toBeGreaterThan(before.car.values.reliability);
 for(const axis of TECHNICAL_AXES.filter(a=>a!=='reliability'))expect(after.car.values[axis]).toBe(before.car.values[axis]);
 expect(after.suitability).toEqual(evaluateCarAtTrack(after.car,track));
 expect(after).not.toHaveProperty('pace');expect(after).not.toHaveProperty('failureProbability');
});
