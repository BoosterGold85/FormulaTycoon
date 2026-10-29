import {test,expect} from '@jest/globals';
import v1 from './fixtures/foundation-v1.json';
import v2 from './fixtures/driver-world-v2.json';
import v3 from './fixtures/driver-world-v3.json';
import v4 from './fixtures/driver-world-v4.json';
import {DEFAULT_GAME_DEFINITION as definition} from '../../game/defaultGame';
import {SAVE_V3} from '../contracts';
import {assertHistoricalSave} from '../historicalSaveValidation';
import {migrateTenTeamUniverse} from '../teamMigration';
import {migrateDriverAlignment} from '../alignmentMigration';
import {deserializeSave,serializeSave,createSaveEnvelope,type SaveResult} from '../saveEnvelope';
import type {GameUniverse as HistoricalUniverse} from '../contracts/preCalendarTypes';
import {legacyWeekDate,campaignContext} from '../../simulation/campaignTime';
import {advanceUniverseWeek,startUniverseSeason} from '../../simulation/universe';
import {advancePreCalendarWeek,startPreCalendarSeason} from '../../testSupport/preCalendar';
const value=<T,>(r:SaveResult<T>)=>{if(!r.ok)throw new Error(r.error.message);return r.value;};
const fixtures=[v1,v2,v3];

test.each([1,2,3])('v%i -> v4 preserves earned state, metadata, observations, identities and option decisions',(version)=>{
 const source=fixtures[version-1]!;const bytes=JSON.stringify(source);
 assertHistoricalSave(source,version as 1|2|3);
 const old=version===1?migrateTenTeamUniverse(source.universe):version===2?migrateDriverAlignment(source.universe):source.universe as HistoricalUniverse;
 const loaded=value(deserializeSave(bytes,definition)),u=loaded.universe;
 expect(loaded.saveVersion).toBe(4);expect(u.definitionVersion).toBe(definition.version);
 expect(u.currentDate).toBe(version===2?'2026-03-02':'2026-06-22');
 expect(campaignContext(u.currentDate)).toEqual({season:2025+old.development.season,seasonIndex:old.development.season,week:old.development.week});
 for(const key of ['gameVersion','saveId','createdAt','updatedAt'] as const)expect(loaded[key]).toBe(source[key]);
 const {season,week,...development}=old.development;
 expect(u.development).toEqual(development);expect(u.headquarters).toEqual(old.headquarters);expect(u.seed).toBe(old.seed);expect(u.playerTeamId).toBe(old.playerTeamId);
 const {season:_s,week:_w,contracts,...drivers}=old.drivers!;
 const {contracts:newContracts,...newDrivers}=u.drivers!;expect(newDrivers).toEqual(drivers);
 for(const c of contracts){
  const actual=newContracts.find(x=>x.id===c.id)!;
  const {option,...terms}=c;const {option:actualOption,...actualTerms}=actual;
  expect(actualTerms).toEqual(terms);
  if(!option){expect(actualOption).toBeNull();continue;}
  const {deadlineSeason,deadlineWeek,...optionTerms}=option;
  expect(actualOption).toEqual({...optionTerms,decisionDate:legacyWeekDate(deadlineSeason-2025,deadlineWeek)});
 }
 expect(JSON.stringify(u)).not.toContain('deadlineWeek');expect(JSON.stringify(u)).not.toContain('deadlineSeason');
 expect(JSON.stringify(source)).toBe(bytes);
 expect(value(deserializeSave(value(serializeSave(loaded,definition)),definition))).toEqual(loaded);
});

test('historical weekly continuation retains balanced outcomes/RNG across all remaining work and a rollover',()=>{
 let old=JSON.parse(JSON.stringify(v3.universe)) as HistoricalUniverse;
 const saved=value(deserializeSave(JSON.stringify(v3),definition));let current=saved.universe;
 while(old.development.week<52){
  old=advancePreCalendarWeek(old,SAVE_V3.definition);current=advanceUniverseWeek(current,definition);
  const {season,week,...data}=old.development;
  expect(current.development).toEqual(data);
  expect(current.currentDate).toBe(legacyWeekDate(season,week));
  expect(current.drivers!.contracts.map(c=>[c.id,c.status,c.option?.state])).toEqual(old.drivers!.contracts.map(c=>[c.id,c.status,c.option?.state]));
 }
 old=startPreCalendarSeason(old,SAVE_V3.definition);current=startUniverseSeason(current,definition,definition.development.teams.map(t=>t.id));
 const {season,week,...data}=old.development;expect(current.development).toEqual(data);expect(current.currentDate).toBe('2027-03-02');
 for(let w=0;w<12;w++){old=advancePreCalendarWeek(old,SAVE_V3.definition);current=advanceUniverseWeek(current,definition);}
 const {season:_s,week:_w,...continued}=old.development;expect(current.development).toEqual(continued);
});

test('v3 stage refuses conflicting stored clocks instead of choosing one or resetting the date',()=>{
 for(const key of ['season','week']){
  const bad=JSON.parse(JSON.stringify(v3));bad.universe.drivers[key]++;
  expect(deserializeSave(JSON.stringify(bad),definition).ok).toBe(false);
 }
 const bad=JSON.parse(JSON.stringify(v3));bad.universe.development.week=53;
 expect(deserializeSave(JSON.stringify(bad),definition).ok).toBe(false);
});

test('frozen-source v4 fixture reloads identically, keeping a migrated exercised option and scouting',()=>{
 const loaded=value(deserializeSave(JSON.stringify(v4),definition));expect(loaded).toEqual(v4);
 expect(loaded.universe.currentDate).toBe('2026-06-22');
 expect(loaded.universe.drivers!.contracts.find(c=>c.driverId==='driver.harlton')!.option).toMatchObject({state:'EXERCISED',decisionDate:'2027-12-07'});
 expect(loaded.universe.drivers!.knowledge['team.wellington']!['driver.cordeiro']).toMatchObject({reports:2,precision:60});
 const next=advanceUniverseWeek(loaded.universe,definition);
 const save=value(createSaveEnvelope(next,{gameVersion:loaded.gameVersion,saveId:loaded.saveId,createdAt:loaded.createdAt,updatedAt:loaded.updatedAt},definition));
 expect(value(deserializeSave(value(serializeSave(save,definition)),definition))).toEqual(save);
});
