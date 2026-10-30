import {test,expect,jest} from '@jest/globals';
import {calendarById,TECHNICAL_AXES,type TechnicalAxis} from '../../game/calendar';
import {DEFAULT_GAME_DEFINITION as definition} from '../../game/defaultGame';
import {createGameUniverse} from '../universe';
import {computeCarProfile,introduceReadyUpgrades,type DevelopmentProject} from '../development';
import {technicalCar,evaluateCarAtTrack,evaluateTeamAtTrack,compareFieldAtTrack} from '../trackPerformance';
const u=createGameUniverse(definition,1),tracks=calendarById(u.calendarId).tracks;
const track=(key:string)=>tracks['track.'+key]!;
const team=u.development.teams['team.wellington']!,profile=definition.development.teams.find(t=>t.id===team.teamId)!;
const clone=<T,>(v:T):T=>JSON.parse(JSON.stringify(v));

test('fitted truth translates deterministically without mutation, persisted copies or universal pace field',()=>{
 const before=JSON.stringify(team),a=technicalCar(team,profile),b=technicalCar(clone(team),clone(profile));
 expect(a).toEqual(b);expect(JSON.stringify(team)).toBe(before);expect(Object.keys(a.values)).toEqual([...TECHNICAL_AXES]);
 expect(a).not.toHaveProperty('pace');expect(a).not.toHaveProperty('overall');expect(u.development).not.toHaveProperty('carVector');
 for(const n of Object.values(a.values)){expect(n).toBeGreaterThanOrEqual(0);expect(n).toBeLessThanOrEqual(100);}
 expect(a.values.reliability).toBe(computeCarProfile(team,profile).reliability);
});

test('parts/packages/reliability use existing car-model semantics, never invented altitude/weather bonuses',()=>{
 const prepared={...team,circuitPackages:['LOW_DRAG','HIGH_COOLING'] as const};
 const packaged={...prepared,circuitPackages:[...prepared.circuitPackages]};
 const monza=technicalCar(packaged,profile,track('monza')),monaco=technicalCar(packaged,profile,track('monaco'));
 expect(monza.values.aeroEfficiency).toBeGreaterThan(monaco.values.aeroEfficiency);
 const weak=clone(packaged);weak.parts.BODYWORK_COOLING.rating=45;weak.parts.BODYWORK_COOLING.reliability=50;
 const atSepang=technicalCar(weak,profile,track('sepang'));
 const old=computeCarProfile(weak,profile,{id:'test',name:'test',week:1,downforce:'HIGH',hot:true});
 expect(atSepang.values.cooling).toBe(old.attributes.cooling);expect(atSepang.values.reliability).toBe(old.reliability);
 const changed={...track('mexico_city'),metadata:{...track('mexico_city').metadata,altitudeM:4000,rainTendency:'HIGH' as const}};
 expect(technicalCar(team,profile,changed)).toEqual(technicalCar(team,profile,track('mexico_city')));
});

function ready(reason:DevelopmentProject['reason']):DevelopmentProject {
 return {id:'test-ready',partId:'FLOOR',reason,stage:'READY',progress:0,ambition:1,expectedGain:8,cost:1,startedWeek:0};
}
test('delivered fitted upgrades reach the vector; reverted projects leave fitted technical truth unchanged',()=>{
 const context=definition.development,event=context.calendar[0]!;
 let delivered=false,reverted=false;
 for(let seed=0;seed<100&&(!delivered||!reverted);seed++){
  const pending={...team,projects:[ready('PERFORMANCE')]};
  const result=introduceReadyUpgrades(pending,profile,context,seed,1,event),outcome=result.submissions[0]!;
  expect(result.team.projects).toHaveLength(0);
  if(outcome.outcome==='REVERTED'){
   reverted=true;expect(technicalCar(result.team,profile)).toEqual(technicalCar(team,profile));
  }else{
   delivered=true;expect(result.team.parts.FLOOR.rating).toBeGreaterThan(team.parts.FLOOR.rating);
   expect(technicalCar(result.team,profile).values.highSpeed).toBeGreaterThan(technicalCar(team,profile).values.highSpeed);
  }
 }
 expect(delivered).toBe(true);expect(reverted).toBe(true);
 const fragile=clone(team);fragile.parts.FLOOR.reliability=45;
 const repaired=introduceReadyUpgrades({...fragile,projects:[ready('RELIABILITY')]},profile,context,1,1,event).team;
 const before=technicalCar(fragile,profile),after=technicalCar(repaired,profile);
 expect(after.values.reliability).toBeGreaterThan(before.values.reliability);
 const {reliability:_a,...a}=before.values,{reliability:_b,...b}=after.values;expect(b).toEqual(a);
});

test('actual rear-wing, diffuser and suspension gains have distinct generic circuit benefits',()=>{
 const base=technicalCar(team,profile);
 const benefit=(part:'REAR_WING'|'DIFFUSER_REAR_EDGE'|'REAR_SUSPENSION',circuit:string)=>{
  const next={...team,parts:{...team.parts,[part]:{...team.parts[part],rating:team.parts[part].rating+10}}};
  return evaluateCarAtTrack(technicalCar(next,profile),track(circuit)).score-evaluateCarAtTrack(base,track(circuit)).score;
 };
 expect(benefit('REAR_WING','monza')).toBeGreaterThan(benefit('REAR_WING','monaco'));
 for(const highSpeedTrack of ['silverstone','suzuka'])expect(benefit('DIFFUSER_REAR_EDGE',highSpeedTrack)).toBeGreaterThan(benefit('DIFFUSER_REAR_EDGE','monaco'));
 expect(benefit('REAR_SUSPENSION','monaco')).toBeGreaterThan(benefit('REAR_SUSPENSION','monza'));
});

test('matching is deterministic and bounded, independent of names, driver/form/weather and RNG',()=>{
 const car=technicalCar(team,profile),c=track('monza'),bytes=JSON.stringify([car,c]);
 const random=jest.spyOn(Math,'random').mockImplementation(()=>{throw new Error('Unexpected RNG');});
 try{
  const result=evaluateCarAtTrack(car,c);
  expect(result).toEqual(evaluateCarAtTrack(clone(car),{...c,id:'track.renamed',name:'Renamed'}));
  expect(result.score).toBeGreaterThanOrEqual(0);expect(result.score).toBeLessThanOrEqual(100);
  expect(JSON.stringify([car,c])).toBe(bytes);
  expect(evaluateCarAtTrack(car,track('monaco')).score).not.toBe(result.score);
  expect(evaluateTeamAtTrack(u,definition,'team.vortex',c).score).not.toBe(result.score);
 }finally{random.mockRestore();}
});

test('explanations reflect relevant technical characteristics, not team-specific text',()=>{
 const low=technicalCar(team,profile),strong=clone(low);for(const axis of TECHNICAL_AXES)strong.values[axis]=90;
 const a=evaluateCarAtTrack(low,track('monaco')),b=evaluateCarAtTrack(strong,track('monaco'));
 expect(a.concerns.length).toBeGreaterThan(0);expect(b.concerns).toEqual([]);expect(b.strengths.length).toBeGreaterThan(0);
 expect(b.label).toBe('EXCELLENT');
 for(const extreme of [0,100]){
  const car=clone(low);for(const axis of TECHNICAL_AXES)car.values[axis]=extreme;
  expect(evaluateCarAtTrack(car,track('monaco')).score).toBeCloseTo(extreme,10);
 }
 const bad=clone(low);bad.values.cooling=NaN;expect(()=>evaluateCarAtTrack(bad,track('monaco'))).toThrow();
});

test('eleven actual starting cars change technical order across five contrasting circuits without retuning',()=>{
 const circuits=['monaco','monza','suzuka','las_vegas','sepang'];
 const fields=circuits.map(key=>compareFieldAtTrack(u,definition,track(key)));
 for(const f of fields){expect(f).toHaveLength(11);expect(new Set(f.map(e=>e.teamId)).size).toBe(11);}
 const order=(index:number)=>fields[index]!.map(e=>e.teamId);
 expect(new Set(fields.map(f=>f.map(e=>e.teamId).join(','))).size).toBeGreaterThan(1);
 expect(order(0).indexOf('team.alpinor')).toBeLessThan(order(0).indexOf('team.wellington'));
 expect(order(1).indexOf('team.wellington')).toBeLessThan(order(1).indexOf('team.alpinor'));
});

test.each(['straightLine','highSpeed','mechanicalGrip'] as TechnicalAxis[])('contrasting designs can reverse ordering through %s alone',axis=>{
 const base=technicalCar(team,profile);for(const key of TECHNICAL_AXES)base.values[key]=70;
 const specialist=clone(base);specialist.values[axis]=95;
 // A costed contrast, not a hidden team bonus: other characteristics are slightly weaker.
 for(const key of TECHNICAL_AXES)if(key!==axis)specialist.values[key]=68;
 const target=axis==='straightLine'?'monza':axis==='highSpeed'?'suzuka':'monaco';
 const other=axis==='mechanicalGrip'?'monza':'monaco';
 expect(evaluateCarAtTrack(specialist,track(target)).score).toBeGreaterThan(evaluateCarAtTrack(base,track(target)).score);
 expect(evaluateCarAtTrack(specialist,track(other)).score).toBeLessThan(evaluateCarAtTrack(base,track(other)).score);
 expect(evaluateCarAtTrack(specialist,track(target)).score-evaluateCarAtTrack(base,track(target)).score)
  .toBeGreaterThan(evaluateCarAtTrack(specialist,track(other)).score-evaluateCarAtTrack(base,track(other)).score);
});
