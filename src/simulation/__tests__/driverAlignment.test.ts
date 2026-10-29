import {migrateV3Universe} from '../../persistence/dateMigration';
import type {GameUniverse as HistoricalUniverse} from '../../persistence/contracts/preCalendarTypes';
import {advancePreCalendarWeek,startPreCalendarSeason} from '../../testSupport/preCalendar';
import {releasedEffectiveEnd} from '../../persistence/contracts/preCalendarRules';
import {NEW_CAREER_DATE,legacyWeekDate,campaignContext} from '../campaignTime';
import {test,expect} from '@jest/globals';
import {DEFAULT_GAME_DEFINITION as definition} from '../../game/defaultGame';
import {LEGACY_DRIVER_GAME_DEFINITION as legacy} from '../../game/legacyDriverGame';
import {BUCKETS} from '../../game/drivers/types';
import {PERFORMANCE_2026} from '../../game/drivers/performance2026';
import {CONTRACTS_2026} from '../../game/drivers/contracts2026';
import {createGameUniverse,advanceUniverseWeek,startUniverseSeason} from '../universe';
import {TEAM_BRANDS} from '../../game/brandRegistry';
import {createDriverWorld,activeContracts,driverView,gradeFor,decideTeamOption,refreshDriverStatuses,observeDriver,signDriverContract} from '../drivers';
import {formLabel} from '../drivers/performance';
import {createSaveEnvelope,deserializeSave,serializeSave,validateSave,type SaveResult} from '../../persistence/saveEnvelope';
// Independent fixture transcribed directly from the owner's supplied text, not generated from runtime content.
import expected from '../../persistence/__tests__/fixtures/canonical-2026.json';
import frozenV2 from '../../persistence/__tests__/fixtures/driver-world-v2.json';
const observer='team.wellington';
const meta={gameVersion:'0.2.1',saveId:'aligned-career',createdAt:'2026-10-29T12:00:00.000Z',updatedAt:'2026-10-29T12:00:00.000Z'};
const value=<T,>(r:SaveResult<T>)=>{if(!r.ok)throw new Error(r.error.message);return r.value;};
const world=createDriverWorld(),authored=createDriverWorld(false);

test.each(Object.entries(expected.performance))('exact supplied source subskills and separate authored buckets: %s',(id,source)=>{
 const d=world.drivers[id]!;
 expect(PERFORMANCE_2026[id]).toEqual(source);
 expect(d.sourcePerformance).toEqual(source);
 expect(d.ability.talent).toBe((source.pace+source.qualifying)/2);
 expect(d.ability.racecraft).toBe((source.racecraft+source.tyreManagement)/2);
 expect(d.ability.composure).toBe((source.consistency+source.discipline)/2);
 if(authored.drivers[id]) for(const key of ['adaptability','feedback','marketability'] as const) expect(d.ability[key]).toBe(authored.drivers[id]!.ability[key]);
 const view=driverView(world,observer,id,NEW_CAREER_DATE);
 for(const key of ['sourcePerformance','pace','overall','overallReference','ability','hidden']) expect(view).not.toHaveProperty(key);
 for(const bucket of BUCKETS) expect(view.grades[bucket]).toMatch(/^[ABCDF][+-]?( to [ABCDF][+-]?)?$/);
 expect(d.dynamic.form).toBe(50);expect(view.form).toBe('NORMAL');
});

test.each(Object.entries(expected.contracts))('exact supplied starting contract and source provenance: %s',(id,row)=>{
 const c=world.contracts.find(c=>c.driverId===id)!;
 expect(c).toMatchObject({teamId:row.teamId,annualSalaryM:row.annualSalaryM,startSeason:2026,endSeason:row.endSeason,provenance:row.provenance,status:'SIGNED'});
 expect(CONTRACTS_2026[id]).toEqual({...row,...(row.optionSeason===null?{optionSeason:undefined}:{})});
 expect(c.option?.season??null).toBe(row.optionSeason);
 const view=driverView(world,observer,id,NEW_CAREER_DATE);
 expect(view.contract).toContain(`$${row.annualSalaryM}M / year`);
 expect(view.contractEnd).toBe(row.endSeason);
 expect(view.futureGuaranteedYears).toBe(row.endSeason-2026);
 expect(view.option!==null).toBe(row.optionSeason!==null);
 expect(view.sourceStatus).toBe(row.provenance.status);
 if(c.option) expect(c.option).toMatchObject({state:'PENDING',decisionDate:legacyWeekDate(row.endSeason-2025,40),salaryM:row.annualSalaryM});
});

test('frozen B initializer retains the original 42 profiles and contracts exactly',()=>{
 expect(createDriverWorld(false)).toEqual(migrateV3Universe(frozenV2.universe as unknown as HistoricalUniverse).drivers);
 for(const [id,d] of Object.entries(authored.drivers)) {
   if(PERFORMANCE_2026[id])continue;
   expect(world.drivers[id]).toEqual(d);
 }
});

test('canonical row set is complete; reserve is associated with Vortex/Veloce without an occupied seat',()=>{
 expect(Object.keys(PERFORMANCE_2026).sort()).toEqual(Object.keys(expected.performance).sort());
 expect(Object.keys(CONTRACTS_2026).sort()).toEqual(Object.keys(expected.contracts).sort());
 expect(activeContracts(world,NEW_CAREER_DATE)).toHaveLength(22);expect(Object.keys(world.drivers)).toHaveLength(43);
 for(const team of TEAM_BRANDS) expect(activeContracts(world,NEW_CAREER_DATE,team.id).map(c=>c.seat).sort()).toEqual([1,2]);
 const reserve=world.drivers['driver.takase']!;
 expect(reserve.category).toBe('RESERVE');expect(reserve.affiliatedTeamIds).toEqual(['team.vortex','team.veloce']);
 expect(activeContracts(world,NEW_CAREER_DATE).some(c=>c.driverId===reserve.id)).toBe(false);
 expect(world.contracts.find(c=>c.driverId===reserve.id)).toMatchObject({role:'RESERVE',seat:null,annualSalaryM:5,endSeason:2026});
 expect(driverView(world,observer,reserve.id,NEW_CAREER_DATE)).toMatchObject({raceSeat:false,teamId:'team.vortex',sourceStatus:'REPORTED'});
});

test('preferred letter thresholds include decimal boundaries and qualitative form stays separate',()=>{
 const boundaries:[number,string][]=[[0,'F'],[39.999,'F'],[40,'D'],[49.999,'D'],[50,'C-'],[54.999,'C-'],[55,'C'],[59.999,'C'],[60,'C+'],[64.999,'C+'],[65,'B-'],[69.999,'B-'],[70,'B'],[74.999,'B'],[75,'B+'],[79.999,'B+'],[80,'A-'],[84.999,'A-'],[85,'A'],[89.999,'A'],[90,'A+'],[100,'A+']];
 for(const [raw,grade] of boundaries) expect(gradeFor(raw)).toBe(grade);
 expect([0,20,40,65,85,100].map(formLabel)).toEqual(['STRUGGLING','POOR','NORMAL','GOOD','EXCELLENT','EXCELLENT']);
 for(const n of [-1,101,NaN,Infinity]) expect(()=>formLabel(n)).toThrow();
});

test('years left derives from current timeline; actual option owners and deadlines differ',()=>{
 for(const [id,years] of [['verhoeven',4],['piastra',2],['sainor',1],['larsen',0]] as const) expect(driverView(world,observer,`driver.${id}`,NEW_CAREER_DATE).futureGuaranteedYears).toBe(years);
 expect(world.contracts.filter(c=>c.option).map(c=>c.driverId).sort()).toEqual(['driver.harlton','driver.ortez','driver.bearford','driver.botten'].sort());
 const c=world.contracts.find(c=>c.driverId==='driver.ortez')!;
 const exercised=decideTeamOption(world,c.teamId,c.id,true,NEW_CAREER_DATE);if(!exercised.ok)throw new Error('option');
 expect(driverView(exercised.world,observer,c.driverId,NEW_CAREER_DATE)).toMatchObject({futureGuaranteedYears:0,futureEffectiveYears:1});
 expect(driverView(refreshDriverStatuses(exercised.world,legacyWeekDate((2027)-2025,0)),observer,c.driverId,legacyWeekDate(2,0))).toMatchObject({futureGuaranteedYears:0,futureEffectiveYears:0});
 expect(refreshDriverStatuses(world,legacyWeekDate((2026)-2025,41)).contracts.find(x=>x.id===c.id)!.option!.state).toBe('LAPSED');
 expect(world.contracts.find(x=>x.id===c.id)!.option!.state).toBe('PENDING');
 expect(JSON.stringify(world)).not.toContain('futureGuaranteedYears');
});

test('aligned raw sources, stable IDs and exact deals survive v4 round trip and scouting',()=>{
 const universe=createGameUniverse(definition,19);
 universe.drivers=observeDriver(universe.drivers!,observer,'driver.takase',NEW_CAREER_DATE);
 const save=value(createSaveEnvelope(universe,meta,definition));
 const loaded=value(deserializeSave(value(serializeSave(save,definition)),definition));
 expect(loaded).toEqual(save);expect(loaded.saveVersion).toBe(4);
 for(const [id,source] of Object.entries(expected.performance)) expect(loaded.universe.drivers!.drivers[id]!.sourcePerformance).toEqual(source);
 expect(loaded.universe.drivers!.contracts).toEqual(world.contracts);
});

test('frozen v2 career migrates without rewriting abilities, signed terms, options, knowledge or earned state',()=>{
 const raw=JSON.parse(JSON.stringify(frozenV2));
 raw.universe.drivers.drivers['driver.sainor'].ability.talent=93.25;
 raw.universe.drivers.contracts[0].annualSalaryM=48.5;
 raw.universe.drivers.contracts[0].option.state='EXERCISED';
 raw.universe.drivers.knowledge[observer]['driver.stenmark'].precision=73;
 const before=JSON.stringify(raw);
 const loaded=value(deserializeSave(before,definition));
 expect(JSON.stringify(raw)).toBe(before);
 expect(loaded.universe.definitionVersion).toBe(definition.version);
 const migrated=loaded.universe.drivers!,old=raw.universe.drivers;
 for(const [id,d] of Object.entries(old.drivers)) {
   const {sourcePerformance,...rest}=migrated.drivers[id]!;
   expect(rest).toEqual(d);
   if(PERFORMANCE_2026[id]) expect(sourcePerformance).toEqual(PERFORMANCE_2026[id]);
 }
 expect(migrated.contracts.filter(c=>c.driverId!=='driver.takase')).toEqual(migrateV3Universe(raw.universe).drivers!.contracts);
 for(const team of Object.keys(old.knowledge)) {const {'driver.takase':_,...rest}=migrated.knowledge[team]!;expect(rest).toEqual(old.knowledge[team]);}
 expect(loaded.universe.headquarters).toEqual(raw.universe.headquarters);
 const {season:_s,week:_w,...oldDevelopment}=raw.universe.development;
 expect(loaded.universe.development).toEqual(oldDevelopment);
 expect(loaded.universe.playerTeamId).toBe(raw.universe.playerTeamId);
 expect(value(deserializeSave(value(serializeSave(loaded,definition)),definition))).toEqual(loaded);
});

test('progressed v2 import expires the added reserve safely and continues deterministically after reload',()=>{
 let old=JSON.parse(JSON.stringify(frozenV2.universe)) as HistoricalUniverse;
 for(let year=0;year<2;year++) {for(let w=0;w<52;w++)old=advancePreCalendarWeek(old,legacy);old=startPreCalendarSeason(old,legacy);}
 const imported=value(deserializeSave(JSON.stringify({...meta,saveVersion:2,universe:old}),definition));
 expect(imported.universe.drivers!.contracts.find(c=>c.driverId==='driver.takase')!.status).toBe('EXPIRED');
 expect(activeContracts(imported.universe.drivers!,imported.universe.currentDate).map(c=>c.id)).toEqual(old.drivers!.contracts.filter(c=>c.status==='SIGNED'&&c.startSeason<=old.drivers!.season&&releasedEffectiveEnd(c)>=old.drivers!.season).map(c=>c.id));
 const resumed=value(deserializeSave(value(serializeSave(imported,definition)),definition));
 expect(advanceUniverseWeek(imported.universe,definition)).toEqual(advanceUniverseWeek(resumed.universe,definition));
 const broken=JSON.parse(JSON.stringify(frozenV2));broken.universe.drivers.contracts[0].teamId='unknown';
 expect(deserializeSave(JSON.stringify(broken),definition).ok).toBe(false);
});

test.each([
 ['source bounds',(s:any)=>{s.universe.drivers.drivers['driver.verhoeven'].sourcePerformance.pace=101;}],
 ['source missing skill',(s:any)=>{delete s.universe.drivers.drivers['driver.verhoeven'].sourcePerformance.qualifying;}],
 ['source rank context',(s:any)=>{s.universe.drivers.drivers['driver.alvarro'].sourcePerformance.rankingContext.gradedRounds=19;}],
 ['reserve seat',(s:any)=>{s.universe.drivers.contracts.find((c:any)=>c.role==='RESERVE').seat=1;}],
 ['race null seat',(s:any)=>{s.universe.drivers.contracts[0].seat=null;}],
 ['unknown affiliation',(s:any)=>{s.universe.drivers.drivers['driver.takase'].affiliatedTeamIds=['unknown'];}],
 ['invalid provenance',(s:any)=>{s.universe.drivers.contracts[0].provenance.status='MAYBE';}],
])('v4 boundary rejects malformed alignment content: %s',(_label,mutate)=>{
 const save=value(createSaveEnvelope(createGameUniverse(definition,1),meta,definition));mutate(save);expect(validateSave(save,definition).ok).toBe(false);
});


test('reserve employment blocks overlapping race employment but allows a later numbered-seat deal',()=>{
 const vacant={...world,contracts:world.contracts.map(c=>c.teamId==='team.veloce'&&c.seat===1?{...c,status:'RELEASED' as const}:c)};
 const request={teamId:'team.veloce',driverId:'driver.takase',seat:1 as const,startSeason:2026,endSeason:2026,annualSalaryM:5,performanceBonusM:0,option:null};
 expect(signDriverContract(vacant,request,NEW_CAREER_DATE)).toMatchObject({ok:false,reason:'CONFLICT'});
 const signed=signDriverContract(vacant,{...request,startSeason:2027,endSeason:2027},NEW_CAREER_DATE);
 if(!signed.ok)throw new Error(signed.reason);
 const next=refreshDriverStatuses(signed.world,legacyWeekDate((2027)-2025,0));
 expect(activeContracts(next,legacyWeekDate(2,0),'team.veloce').map(c=>c.driverId)).toEqual(['driver.takase']);
 expect(driverView(next,observer,'driver.takase',legacyWeekDate(2,0))).toMatchObject({raceSeat:true,teamId:'team.veloce',sourceStatus:null});
 const universe={...createGameUniverse(definition,1),drivers:signed.world};
 expect(createSaveEnvelope(universe,meta,definition).ok).toBe(true);
});
