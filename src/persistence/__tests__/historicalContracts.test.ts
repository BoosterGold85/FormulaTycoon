import {test,expect,jest} from '@jest/globals';
import {createHash} from 'node:crypto';
import {readFileSync} from 'node:fs';
import {join} from 'node:path';
import {SAVE_V1,SAVE_V2,SAVE_V3,INITIAL_V3} from '../contracts';
import {assertHistoricalSave} from '../historicalSaveValidation';
import {validateUniverse} from '../universeValidation';
import {DEFAULT_GAME_DEFINITION as live} from '../../game/defaultGame';
import {DEFAULT_DEVELOPMENT_CONTEXT} from '../../game/development';
import {HEADQUARTERS_LAYOUT,STARTING_STAFF} from '../../game/headquartersData';
import {GRID} from '../../game/drivers/grid';
import {MARKET} from '../../game/drivers/market';
import {BUCKETS,TRAITS} from '../../game/drivers/types';
import {PERFORMANCE_2026} from '../../game/drivers/performance2026';
import {CONTRACTS_2026} from '../../game/drivers/contracts2026';
import {TEAM_BRANDS,LEGACY_TEAM_MAP} from '../../game/brandRegistry';
import {advanceUniverseHeadquarters,advanceUniverseWeek} from '../../simulation/universe';
import {deserializeSave,serializeSave,CURRENT_SAVE_VERSION,type SaveResult} from '../saveEnvelope';
import v1 from './fixtures/foundation-v1.json';
import v2 from './fixtures/driver-world-v2.json';
import v3 from './fixtures/driver-world-v3.json';
const value=<T,>(r:SaveResult<T>)=>{if(!r.ok)throw new Error(r.error.message);return r.value;};
const clone=<T,>(v:T):T=>JSON.parse(JSON.stringify(v));
const fixtures=[v1,v2,v3];

test.each([1,2,3] as const)('v%s validates its released contract and rejects the wrong source schema',(version)=>{
 const fixture=fixtures[version-1]!;
 const before=JSON.stringify(fixture);
 expect(()=>assertHistoricalSave(fixture,version)).not.toThrow();
 expect(()=>assertHistoricalSave({...fixture,saveVersion:99},version)).toThrow();
 expect(JSON.stringify(fixture)).toBe(before);
});

test('released definitions and all nested content are detached and immutable',()=>{
 const deeplyFrozen=(v:unknown):boolean=>!v||typeof v!=='object'||(Object.isFrozen(v)&&Object.values(v).every(deeplyFrozen));
 for(const c of [SAVE_V1,SAVE_V2,SAVE_V3]){
  expect(deeplyFrozen(c)).toBe(true);
  expect(c.definition.headquarters.layout).not.toBe(HEADQUARTERS_LAYOUT);
  expect(c.definition.development.calendar).not.toBe(live.development.calendar);
 }
 expect(deeplyFrozen(INITIAL_V3)).toBe(true);
 expect(Reflect.set(SAVE_V1.definition.development.calendar[0]!, 'week', 999)).toBe(false);
 expect(Reflect.set(SAVE_V2.drivers!.ids, '0', 'changed')).toBe(false);
 expect(Reflect.set(SAVE_V3.definition.headquarters.layout.nav.nodes, 'NEW', {})).toBe(false);
});

test('live registry/content drift cannot change historical acceptance or v1/v2 migration results',()=>{
 const expected=[v1,v2].map(f=>value(deserializeSave(JSON.stringify(f),live)));
 const before=fixtures.map(f=>JSON.stringify(f));
 const undo:Array<()=>void>=[];
 const set=(o:any,k:string,v:unknown)=>{const old=o[k];undo.push(()=>{o[k]=old;});o[k]=v;};
 const changeArray=(a:any[])=>{const old=[...a];undo.push(()=>{a.splice(0,a.length,...old);});a.splice(0,1);};
 try{
  set(live.development.calendar[0]!, 'id','live.future.event');set(live.development.calendar[0]!,'week',51);
  set(live.development.parts[0]!,'id','LIVE_FUTURE_PART');
  set(live.development.parts[1]!,'designWeeks',0.01);
  set(live.development.regulations,'developmentCap',0.01);set(live.development.regulations,'ratingFloor',90);
  set(live.development.regulations,'seasonWeeks',2);set(DEFAULT_DEVELOPMENT_CONTEXT.regulations,'ratingCeiling',91);
  set(HEADQUARTERS_LAYOUT.stations[0]!,'id','FUTURE_STATION');set(HEADQUARTERS_LAYOUT.nav.nodes.ENTRANCE!,'x',999);
  changeArray(STARTING_STAFF);changeArray(GRID);changeArray(MARKET);changeArray(TEAM_BRANDS);changeArray(BUCKETS as any);changeArray(TRAITS as any);
  set(LEGACY_TEAM_MAP,'aurora','team.future');set(PERFORMANCE_2026['driver.verhoeven']!,'pace',1);
  set(CONTRACTS_2026['driver.verhoeven']!,'endSeason',2035);
  for(const [i,f] of fixtures.entries())expect(()=>assertHistoricalSave(f,(i+1) as 1|2|3)).not.toThrow();
  // The public validator also resolves released IDs to snapshots rather than the caller's altered objects.
  expect(()=>validateUniverse(v3.universe,live)).not.toThrow();
  expect(value(deserializeSave(JSON.stringify(v1),live))).toEqual(expected[0]);
  expect(value(deserializeSave(JSON.stringify(v2),live))).toEqual(expected[1]);
  const bad=clone(v3);bad.universe.development.submissions[0]!.eventId='live.future.event';
  expect(()=>assertHistoricalSave(bad,3)).toThrow();
 }finally{undo.reverse().forEach(fn=>fn());}
 expect(fixtures.map(f=>JSON.stringify(f))).toEqual(before);
});

test('v3 fixture contains meaningful audited career state and resumes deterministically',()=>{
 const save=value(deserializeSave(JSON.stringify(v3),live));
 expect(save.universe.playerTeamId).toBe('team.wellington');
 expect(Object.keys(save.universe.drivers!.drivers)).toHaveLength(43);
 expect(save.universe.headquarters.workers.some(w=>w.state==='WALKING')).toBe(true);
 expect(save.universe.development.submissions).toHaveLength(45);
 expect(Object.values(save.universe.development.teams).some(t=>t.projects.length>0)).toBe(true);
 expect(save.universe.drivers!.knowledge['team.wellington']!['driver.cordeiro']).toMatchObject({reports:2,precision:60});
 expect(save.universe.drivers!.contracts.find(c=>c.driverId==='driver.harlton')!.option!.state).toBe('EXERCISED');
 let a=save.universe,b=value(deserializeSave(value(serializeSave(save,live)),live)).universe;
 for(let w=0;w<20;w++){
  a=advanceUniverseWeek(advanceUniverseHeadquarters(a,live,500),live);
  b=advanceUniverseWeek(advanceUniverseHeadquarters(b,live,500),live);
 }
 expect(a).toEqual(b);
 expect(CURRENT_SAVE_VERSION).toBe(3);
 expect(deserializeSave(JSON.stringify({...v3,saveVersion:4}),live)).toMatchObject({ok:false,error:{code:'UNSUPPORTED_VERSION'}});
});


test('historical validation can cold-load with live content modules unavailable',()=>{
 const blocked=['../../game/defaultGame','../../game/legacyGame','../../game/legacyDriverGame','../../game/development','../../game/headquartersData','../../game/brandRegistry','../../game/drivers/grid','../../game/drivers/market','../../game/drivers/types','../../game/drivers/performance2026'];
 try{
  for(const name of blocked)jest.doMock(name,()=>{throw new Error('Historical validation imported live content');});
  jest.isolateModules(()=>{
   const fresh=require('../historicalSaveValidation') as typeof import('../historicalSaveValidation');
   for(const [i,f] of fixtures.entries())expect(()=>fresh.assertHistoricalSave(f,(i+1) as 1|2|3)).not.toThrow();
  });
 }finally{for(const name of blocked)jest.dontMock(name);}
});

test.each([
 ['foundation-v1.json','b17c37e3dc4fcf1b550c86ec514dcb2c2f79d64c27d6026de93d323994eeb9d4'],
 ['driver-world-v2.json','808c18065e03ba6daf55590b1ee6e79cddb5c494b939ff5a46cce123841bc089'],
 ['driver-world-v3.json','929681fd7706ed2c16b7b9083035524fa016a8a5cb7b6f1cfe5b5ed0f613ef18']
])('historical fixture bytes remain unchanged: %s',(file,hash)=>{
 expect(createHash('sha256').update(readFileSync(join(__dirname,'fixtures',file))).digest('hex')).toBe(hash);
});
