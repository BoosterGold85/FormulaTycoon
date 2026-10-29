import {test,expect} from '@jest/globals';
import {DEFAULT_GAME_DEFINITION as definition} from '../../game/defaultGame';
import {LEGACY_GAME_DEFINITION as legacy} from '../../game/legacyGame';
import {TEAM_BRANDS,LEGACY_TEAM_MAP} from '../../game/brandRegistry';
import {BUCKETS,TRAITS} from '../../game/drivers/types';
import {createGameUniverse,advanceUniverseWeek,advanceUniverseHeadquarters,startUniverseSeason} from '../universe';
import {createDriverWorld,driverView,observeDriver,gradeFor,GRADES,activeContracts,decideTeamOption,
 updateDriverCalendar,signDriverContract,annualSalary,carCompatibility,marketValue} from '../drivers';
import {computeCarProfile} from '../development';
import {createSaveEnvelope,serializeSave,deserializeSave,validateSave,CURRENT_SAVE_VERSION,type SaveResult} from '../../persistence/saveEnvelope';
import {createGameSave,restoreGameSave} from '../../persistence/gameSave';
const observer='team.wellington';
const meta={gameVersion:'0.2.0',saveId:'driver-career',createdAt:'2026-10-29T12:00:00.000Z',updatedAt:'2026-10-29T12:00:00.000Z'};
const value=<T,>(r:SaveResult<T>)=>{if(!r.ok)throw new Error(r.error.message);return r.value;};
const envelope=()=>value(createSaveEnvelope(createGameUniverse(definition,7),meta,definition));

test('canonical 2026 world has eleven organizations, twenty-two distinct seats and forty-two people',()=>{
 const universe=createGameUniverse(definition,7),world=universe.drivers!;
 expect(TEAM_BRANDS).toHaveLength(11);
 expect(Object.keys(universe.development.teams)).toHaveLength(11);
 expect(Object.values(world.drivers)).toHaveLength(42);
 expect(Object.values(world.drivers).filter(d=>d.category==='GRID')).toHaveLength(22);
 expect(Object.values(world.drivers).filter(d=>d.category==='PROSPECT')).toHaveLength(10);
 expect(Object.values(world.drivers).filter(d=>d.category==='RESERVE')).toHaveLength(10);
 expect(new Set(Object.values(world.drivers).map(d=>d.id)).size).toBe(42);
 for(const team of TEAM_BRANDS) {
   const seats=activeContracts(world,team.id);
   expect(seats).toHaveLength(2);expect(new Set(seats.map(c=>c.seat)).size).toBe(2);
   expect(seats.every(c=>world.drivers[c.driverId]?.familiarity.teamId===team.id)).toBe(true);
 }
 expect(activeContracts(world,observer).map(c=>world.drivers[c.driverId]!.name)).toEqual(['Carlos Sainor','Alex Alburn']);
 expect(value(createSaveEnvelope(universe,meta,definition)).universe).toEqual(universe);
});

test('starting cast and hidden profiles are fixed across world seeds and obey bounds',()=>{
 const a=createGameUniverse(definition,1).drivers!,b=createGameUniverse(definition,2).drivers!;
 expect(a).toEqual(b);
 for(const d of Object.values(a.drivers)) {
   expect(d.ageAt2026).toBeGreaterThanOrEqual(18);expect(d.ageAt2026).toBeLessThanOrEqual(44);
   expect(Object.keys(d.ability)).toEqual(BUCKETS);
   for(const n of Object.values(d.ability)) {expect(n).toBeGreaterThanOrEqual(0);expect(n).toBeLessThanOrEqual(100);}
   expect(d.hidden.potential).toBeLessThanOrEqual(100);
   expect(d.traits.length).toBeLessThanOrEqual(3);
   expect(d.traits.every(t=>TRAITS.includes(t))).toBe(true);
   expect(d.history.seasons).toEqual([]);
 }
 const potentials=Object.values(a.drivers).filter(d=>d.category==='PROSPECT').map(d=>d.hidden.potential);
 expect(potentials[0]).toBeLessThan(potentials[6]!); // Feeder order is not a potential ranking.
});

test('central grades cover all bounded ability values without an overall score',()=>{
 for(let n=0;n<=100;n++) expect(GRADES).toContain(gradeFor(n));
 expect([0,39,40,54,55,94,95,100].map(gradeFor)).toEqual(['F','F','D','D','C-','A','A+','A+']);
 for(const n of [-1,101,NaN,Infinity]) expect(()=>gradeFor(n)).toThrow();
 const view=driverView(createDriverWorld(),observer,'driver.verhoeven');
 expect(view.grades.talent).toBe('A+');expect(view.confidence).toBe('High');
 for(const key of ['ability','hidden','personality','overall','potentialRaw']) expect(view).not.toHaveProperty(key);
});

test('scouting belongs to observer, narrows conservatively, and never changes ability',()=>{
 const initial=createDriverWorld(),id='driver.stenmark';
 const truth=initial.drivers[id]!.ability;
 let world=initial;
 expect(driverView(world,observer,id).grades.adaptability).toBe('Unknown');
 for(let reports=0;reports<4;reports++) {
   const view=driverView(world,observer,id);
   for(const key of BUCKETS) {
     const observed=view.grades[key],actual=gradeFor(truth[key]);
     if(observed==='Unknown')continue;
     const [low,high=low]=observed.split(' to ');
     expect(GRADES.indexOf(low as typeof GRADES[number])).toBeLessThanOrEqual(GRADES.indexOf(actual));
     expect(GRADES.indexOf(high as typeof GRADES[number])).toBeGreaterThanOrEqual(GRADES.indexOf(actual));
   }
   const next=observeDriver(world,observer,id);
   const width=(grade:string)=>{if(grade==='Unknown')return 11;const [low,high=low]=grade.split(' to ');return GRADES.indexOf(high as typeof GRADES[number])-GRADES.indexOf(low as typeof GRADES[number]);};
   for(const key of BUCKETS) expect(width(driverView(next,observer,id).grades[key])).toBeLessThanOrEqual(width(view.grades[key]));
   expect(next.drivers).toBe(initial.drivers);
   expect(next.knowledge['team.ferano']).toBe(initial.knowledge['team.ferano']);
   expect(next.knowledge[observer]![id]!.precision).toBeGreaterThan(world.knowledge[observer]![id]!.precision);
   world=next;
 }
 expect(driverView(world,observer,id).grades.talent).toBe(gradeFor(truth.talent));
 expect(initial.knowledge[observer]![id]!.precision).toBe(20);
 expect(driverView(initial,observer,id).commercial).toContain('under review');
});

test('contract conflicts cover driver ownership, seat occupancy and invalid terms',()=>{
 const world=createDriverWorld();
 const request={teamId:observer,driverId:'driver.vale',seat:1 as const,startSeason:2026,endSeason:2027,annualSalaryM:3,performanceBonusM:0.2,option:null};
 expect(signDriverContract(world,request)).toMatchObject({ok:false,reason:'CONFLICT'});
 expect(signDriverContract(world,{...request,driverId:'driver.sainor',teamId:'team.ferano'})).toMatchObject({ok:false,reason:'CONFLICT'});
 expect(signDriverContract(world,{...request,startSeason:2029,endSeason:2028})).toMatchObject({ok:false});
 expect(signDriverContract(world,{...request,annualSalaryM:NaN})).toMatchObject({ok:false});
 expect(signDriverContract(world,{...request,teamId:'unknown'})).toMatchObject({ok:false});
 const signed=signDriverContract(world,{...request,startSeason:2028,endSeason:2029});
 expect(signed.ok).toBe(true);
 if(signed.ok) {
   expect(signDriverContract(signed.world,{...request,startSeason:2028,endSeason:2029}).ok).toBe(false);
   expect(createSaveEnvelope({...createGameUniverse(definition,7),drivers:signed.world},meta,definition).ok).toBe(true);
   expect(signed.world.nextContractNumber).toBe(world.nextContractNumber+1);
 }
});

test('team options enforce ownership, deadline, conflicts, idempotence and option-year salary',()=>{
 const initial=createDriverWorld(),contract=activeContracts(initial,observer)[0]!;
 expect(decideTeamOption(initial,'team.ferano',contract.id,true).ok).toBe(false);
 const exercised=decideTeamOption(initial,observer,contract.id,true);
 expect(exercised.ok).toBe(true);
 if(!exercised.ok)throw new Error('option failed');
 expect(decideTeamOption(exercised.world,observer,contract.id,true)).toEqual({ok:true,world:exercised.world});
 expect(decideTeamOption(exercised.world,observer,contract.id,false).ok).toBe(false);
 const future=updateDriverCalendar(exercised.world,2028,0);
 const current=activeContracts(future,observer)[0]!;
 expect(annualSalary(current,2028)).toBe(current.option!.salaryM);
 expect(activeContracts(updateDriverCalendar(future,2029,0),observer)).toHaveLength(0);
 const boundary=updateDriverCalendar(initial,2027,40);
 expect(decideTeamOption(boundary,observer,contract.id,true).ok).toBe(true);
 const late=updateDriverCalendar(initial,2027,41);
 expect(decideTeamOption(late,observer,contract.id,true).ok).toBe(false);
 expect(late.contracts.find(c=>c.id===contract.id)!.option!.state).toBe('LAPSED');
 expect(updateDriverCalendar(late,2027,41)).toBe(late);
 const booked=signDriverContract(initial,{teamId:observer,driverId:'driver.vale',seat:1,startSeason:2028,endSeason:2028,annualSalaryM:3,performanceBonusM:0,option:null});
 if(!booked.ok)throw new Error('fixture failed');
 expect(decideTeamOption(booked.world,observer,contract.id,true)).toMatchObject({ok:false,reason:'CONFLICT'});
});

test('car fit and market value are distinct from true driving talent',()=>{
 const world=createDriverWorld();
 const d=world.drivers['driver.sainor']!;
 const car=computeCarProfile(createGameUniverse(definition,1).development.teams[observer]!,definition.development.teams.find(t=>t.id===observer)!);
 const before=JSON.stringify(d.ability);
 expect(['Comfortable','Adapting','Challenging']).toContain(carCompatibility(d,car));
 expect(marketValue({...d,ability:{...d.ability,marketability:100}})).toBeGreaterThan(marketValue({...d,ability:{...d.ability,marketability:30}}));
 expect(JSON.stringify(d.ability)).toBe(before);
});

test('driver knowledge/contracts and stable IDs survive v2 save/load with deterministic continuation',()=>{
 let a=createGameUniverse(definition,7);
 a={...a,drivers:observeDriver(a.drivers!,observer,'driver.cordeiro')};
 let b=value(deserializeSave(value(serializeSave(value(createSaveEnvelope(a,meta,definition)),definition)),definition)).universe;
 expect(b).toEqual(a);expect(CURRENT_SAVE_VERSION).toBe(2);
 expect(restoreGameSave(createGameSave(a),definition)).toEqual(a);
 for(let i=0;i<52;i++){a=advanceUniverseWeek(advanceUniverseHeadquarters(a,definition,500),definition);b=advanceUniverseWeek(advanceUniverseHeadquarters(b,definition,500),definition);}
 expect(b).toEqual(a);
 const standings=TEAM_BRANDS.map(t=>t.id);
 a=startUniverseSeason(a,definition,standings);b=startUniverseSeason(b,definition,standings);
 expect(a).toEqual(b);expect(a.drivers!.season).toBe(2027);
 expect(value(createSaveEnvelope(a,meta,definition)).universe).toEqual(a);
});

test('v1 ten-team migration preserves earned state/history and rejects unknown legacy references',()=>{
 let old=createGameUniverse(legacy,17);
 for(let i=0;i<16;i++)old=advanceUniverseWeek(old,legacy);
 const source={...meta,saveVersion:1,universe:old};
 const json=JSON.stringify(source);
 const migrated=value(deserializeSave(json,definition));
 expect(JSON.stringify(source)).toBe(json);
 expect(migrated.saveVersion).toBe(2);expect(Object.keys(migrated.universe.development.teams)).toHaveLength(11);
 for(const [id,mapped] of Object.entries(LEGACY_TEAM_MAP)) {
   expect(migrated.universe.development.teams[mapped]).toEqual({...old.development.teams[id]!,teamId:mapped});
 }
 expect(migrated.universe.headquarters).toEqual(old.headquarters);
 expect(migrated.universe.development.submissions).toEqual(old.development.submissions.map(s=>({...s,teamId:LEGACY_TEAM_MAP[s.teamId]})));
 expect(value(deserializeSave(value(serializeSave(migrated,definition)),definition))).toEqual(migrated);
 const bad=JSON.parse(json);bad.universe.development.teams.aurora.teamId='unmapped';
 expect(deserializeSave(JSON.stringify(bad),definition).ok).toBe(false);
});

test.each([
 ['duplicate seat',(s:any)=>{s.universe.drivers.contracts[1].seat=1;}],
 ['unknown driver',(s:any)=>{s.universe.drivers.contracts[0].driverId='missing';}],
 ['wrong team',(s:any)=>{s.universe.drivers.contracts[0].teamId='bad';}],
 ['invalid ability',(s:any)=>{s.universe.drivers.drivers['driver.ronnis'].ability.talent=101;}],
 ['invalid potential',(s:any)=>{s.universe.drivers.drivers['driver.ronnis'].hidden.potential=Infinity;}],
 ['invalid age',(s:any)=>{s.universe.drivers.drivers['driver.ronnis'].ageAt2026=4;}],
 ['invalid grade source',(s:any)=>{s.universe.drivers.drivers['driver.ronnis'].ability.feedback='A';}],
 ['bad observation',(s:any)=>{s.universe.drivers.knowledge[observer]['driver.ronnis'].precision=101;}],
 ['missing prospect',(s:any)=>{delete s.universe.drivers.drivers['driver.cordeiro'];}],
 ['expired active contract',(s:any)=>{s.universe.drivers.contracts[0].startSeason=2025;s.universe.drivers.contracts[0].endSeason=2025;}],
 ['duplicate identity',(s:any)=>{s.universe.drivers.drivers['driver.piastra'].id='driver.ronnis';}],
 ['future clock',(s:any)=>{s.universe.drivers.season=2029;}]
])('save boundary rejects %s',(_name,mutate)=>{const bad=envelope();mutate(bad);expect(validateSave(bad,definition).ok).toBe(false);});

test('frozen foundation v1 fixture migrates without erasing pending projects or history',()=>{
  const fixture=require('../../persistence/__tests__/fixtures/foundation-v1.json') as {universe:ReturnType<typeof createGameUniverse>};
  const result=value(deserializeSave(JSON.stringify(fixture),definition));
  expect(result.universe.development.week).toBe(16);
  expect(result.universe.development.teams['team.vortex']!.projects).toEqual(fixture.universe.development.teams.aurora!.projects);
  expect(result.universe.development.submissions.length).toBe(fixture.universe.development.submissions.length);
  const continued=advanceUniverseWeek(result.universe,definition);
  expect(value(createSaveEnvelope(continued,meta,definition)).universe).toEqual(continued);
});

test('option decisions and automatic expiry remain save-valid',()=>{
 let universe=createGameUniverse(definition,2);
 const c=activeContracts(universe.drivers!,observer)[0]!;
 const option=decideTeamOption(universe.drivers!,observer,c.id,true);
 if(!option.ok)throw new Error('option');
 universe={...universe,drivers:option.world};
 for(let year=0;year<3;year++) {
   for(let week=0;week<52;week++) {
     universe=advanceUniverseWeek(universe,definition);
     expect(createSaveEnvelope(universe,meta,definition).ok).toBe(true);
   }
   universe=startUniverseSeason(universe,definition,TEAM_BRANDS.map(t=>t.id));
 }
 expect(universe.drivers!.season).toBe(2029);
 expect(activeContracts(universe.drivers!,observer)).toHaveLength(0); // No invented offseason AI.
 expect(createSaveEnvelope(universe,meta,definition).ok).toBe(true);
});

test('public driver commands reject inherited IDs and unsupported calendar/contract bounds',()=>{
 const world=createDriverWorld();
 for(const id of ['missing','__proto__','constructor']) {
   expect(()=>driverView(world,observer,id)).toThrow('Unknown');
   expect(()=>observeDriver(world,observer,id)).toThrow('Unknown');
   expect(signDriverContract(world,{teamId:observer,driverId:id,seat:1,startSeason:2028,endSeason:2029,annualSalaryM:1,performanceBonusM:0,option:null}).ok).toBe(false);
 }
 expect(()=>updateDriverCalendar(world,10000,0)).toThrow('Invalid');
 expect(signDriverContract(world,{teamId:observer,driverId:'driver.vale',seat:1,startSeason:10000,endSeason:10001,annualSalaryM:1,performanceBonusM:0,option:null}).ok).toBe(false);
});
