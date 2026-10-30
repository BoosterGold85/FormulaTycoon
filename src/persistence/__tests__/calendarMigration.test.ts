import {test,expect,jest} from '@jest/globals';
import {createHash} from 'node:crypto';
import {readFileSync} from 'node:fs';
import {join} from 'node:path';
import v1 from './fixtures/foundation-v1.json';
import v2 from './fixtures/driver-world-v2.json';
import v3 from './fixtures/driver-world-v3.json';
import v4 from './fixtures/driver-world-v4.json';
import {assertHistoricalSave} from '../historicalSaveValidation';
import {migrateCalendarUniverse} from '../calendarMigration';
import {SAVE_V4,SAVE_V5} from '../contracts';
import {DEFAULT_GAME_DEFINITION as definition} from '../../game/defaultGame';
import {calendarById} from '../../game/calendar';
import {advanceUniverseWeek} from '../../simulation/universe';
import {createSaveEnvelope,deserializeSave,serializeSave,type SaveResult} from '../saveEnvelope';
const value=<T,>(r:SaveResult<T>)=>{if(!r.ok)throw new Error(r.error.message);return r.value;};
const fixtures=[v1,v2,v3,v4];

test.each([1,2,3,4] as const)('frozen V%i migrates to V5, keeps temporal/earned state, and roundtrips its calendar identity',version=>{
 const source=fixtures[version-1]!,before=JSON.stringify(source);
 assertHistoricalSave(source,version);
 const loaded=value(deserializeSave(before,definition));
 expect(loaded.saveVersion).toBe(5);expect(loaded.universe.calendarId).toBe('calendar.2026.v1');
 expect(loaded.universe.currentDate).toBe(version===2?'2026-03-02':'2026-06-22');
 expect(loaded.universe.seed).toBe(source.universe.seed);expect(loaded.universe.headquarters).toEqual(source.universe.headquarters);
 for(const field of ['saveId','createdAt','updatedAt','gameVersion'] as const)expect(loaded[field]).toBe(source[field]);
 expect(value(deserializeSave(value(serializeSave(loaded,definition)),definition))).toEqual(loaded);
 expect(JSON.stringify(source)).toBe(before);
});

test('V4→V5 attaches only content identity/definition, preserving all meaningful dated fixture bytes',()=>{
 const migrated=migrateCalendarUniverse(v4.universe),{calendarId,definitionVersion,...unchanged}=migrated;
 const {definitionVersion:_old,...original}=v4.universe;
 expect(calendarId).toBe('calendar.2026.v1');expect(definitionVersion).toBe(definition.version);expect(unchanged).toEqual(original);
 expect(migrated.headquarters.workers.some(w=>w.state==='WALKING')).toBe(true);
 expect(Object.values(migrated.development.teams).some(t=>t.projects.length)).toBe(true);
 expect(migrated.drivers!.contracts.find(c=>c.driverId==='driver.harlton')!.option!.state).toBe('EXERCISED');
 expect(migrated.drivers!.knowledge['team.wellington']!['driver.cordeiro']!.reports).toBe(2);
 const loaded=value(deserializeSave(JSON.stringify(v4),definition));
 let a=migrated,b=value(deserializeSave(value(serializeSave(loaded,definition)),definition)).universe;
 for(let w=0;w<20;w++){a=advanceUniverseWeek(a,definition);b=advanceUniverseWeek(b,definition);}
 expect(a).toEqual(b);expect(a.calendarId).toBe(calendarId);
});

test('V4 validation is isolated from live content/calendar and rejects clock/shape drift before transformation',()=>{
 const before=JSON.stringify(v4),old=definition.development.regulations.seasonWeeks;
 try{
  definition.development.regulations.seasonWeeks=2;
  expect(()=>assertHistoricalSave(v4,4)).not.toThrow();expect(migrateCalendarUniverse(v4.universe).currentDate).toBe('2026-06-22');
 }finally{definition.development.regulations.seasonWeeks=old;}
 for(const change of [(u:any)=>{u.calendarId='calendar.2026.v1';},(u:any)=>{u.drivers.week=16;},(u:any)=>{u.currentDate='2026-02-30';}]){
  const bad=JSON.parse(before);change(bad.universe);expect(()=>assertHistoricalSave(bad,4)).toThrow();
  expect(deserializeSave(JSON.stringify(bad),definition).ok).toBe(false);
 }
 expect(JSON.stringify(v4)).toBe(before);
 const deeplyFrozen=(v:unknown):boolean=>!v||typeof v!=='object'||(Object.isFrozen(v)&&Object.values(v).every(deeplyFrozen));
 expect(deeplyFrozen(SAVE_V4)).toBe(true);expect(deeplyFrozen(SAVE_V5)).toBe(true);
});

test('frozen V4 validator cold-loads without live registries or new calendar content',()=>{
 const blocked=['../../game/defaultGame','../../game/calendar','../../game/development','../../game/headquartersData','../../game/brandRegistry'];
 try{
  for(const name of blocked)jest.doMock(name,()=>{throw new Error('Historical V4 read live content');});
  jest.isolateModules(()=>{const historical=require('../historicalSaveValidation') as typeof import('../historicalSaveValidation');expect(()=>historical.assertHistoricalSave(v4,4)).not.toThrow();});
 }finally{blocked.forEach(name=>jest.dontMock(name));}
});

test('unknown/missing calendar identity is rejected, never upgraded silently or defaulted',()=>{
 const save=value(deserializeSave(JSON.stringify(v4),definition));
 for(const id of [undefined,null,'calendar.2026.v3','calendar.2027.v1','wrong']){
  const bad=JSON.parse(JSON.stringify(save));if(id===undefined)delete bad.universe.calendarId;else bad.universe.calendarId=id;
  expect(deserializeSave(JSON.stringify(bad),definition).ok).toBe(false);
 }
 expect(Reflect.set(calendarById(save.universe.calendarId).events[0]!,'trackId','track.madrid')).toBe(false);
 expect(deserializeSave(JSON.stringify({...save,saveVersion:6}),definition)).toMatchObject({ok:false,error:{code:'UNSUPPORTED_VERSION'}});
});

test('meaningful V4 fixture and released V4 contract retain their original C0.1 bytes',()=>{
 expect(createHash('sha256').update(readFileSync(join(__dirname,'fixtures/driver-world-v4.json'))).digest('hex')).toBe('3432ca483951be07c9563d7243887b779a3adc6148395b8611fbb7a80d8d26e6');
 expect(createHash('sha256').update(readFileSync(join(__dirname,'../contracts/v4.json'))).digest('hex')).toBe('fd1445ff4291144189bc2a499f6270f2d7ffceddde60b0be0e1917e610188cda');
});
