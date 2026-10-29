import {NEW_CAREER_DATE,legacyWeekDate,campaignContext} from '../campaignTime';
import {test,expect} from '@jest/globals';
import {readFileSync} from 'node:fs';
import {join} from 'node:path';
import {DEFAULT_GAME_DEFINITION as definition} from '../../game/defaultGame';
import {LEGACY_GAME_DEFINITION as legacy} from '../../game/legacyGame';
import {createGameUniverse,advanceUniverseHeadquarters,restartUniverseHeadquarters,advanceUniverseWeek,startUniverseSeason,type GameUniverse} from '../universe';
import {driverView,selectDriverCarFit,carCompatibility,observeDriver,decideTeamOption} from '../drivers';
import {computeCarProfile} from '../development';
import {createSaveEnvelope,validateSave,type SaveResult} from '../../persistence/saveEnvelope';
const observer='team.wellington';
const meta={gameVersion:'0.2.1-c0',saveId:'clock-regression',createdAt:'2026-10-29T12:00:00.000Z',updatedAt:'2026-10-29T12:00:00.000Z'};
const value=<T,>(r:SaveResult<T>)=>{if(!r.ok)throw new Error(r.error.message);return r.value;};
const synced=(u:GameUniverse)=>{expect(u.drivers).not.toHaveProperty('season');expect(u.drivers).not.toHaveProperty('week');expect(u.development).not.toHaveProperty('season');expect(u.development).not.toHaveProperty('week');expect(campaignContext(u.currentDate).season).toBeGreaterThanOrEqual(2026);};
const initial=createGameUniverse(definition,31);

test.each(Object.keys(initial.drivers!.drivers))('domain car-fit selector preserves the previous screen result for %s',(id)=>{
 const view=driverView(initial.drivers!,observer,id,NEW_CAREER_DATE);
 const expected=view.teamId?carCompatibility(initial.drivers!.drivers[id]!,computeCarProfile(initial.development.teams[view.teamId]!,definition.development.teams.find(t=>t.id===view.teamId)!)):null;
 const before=JSON.stringify(initial);
 expect(selectDriverCarFit(initial,definition,id)).toBe(expected);
 expect(selectDriverCarFit(initial,definition,id)).toBe(expected);
 expect(driverView(initial.drivers!,observer,id,NEW_CAREER_DATE)).not.toHaveProperty('fit');
 expect(JSON.stringify(initial)).toBe(before);
});

test('fit handles unavailable/expired employment and rejects inherited identities',()=>{
 expect(selectDriverCarFit(createGameUniverse(legacy,1),legacy,'driver.sainor')).toBeNull();
 expect(selectDriverCarFit(initial,definition,'driver.stenmark')).toBeNull();
 for(const id of ['missing','__proto__','constructor'])expect(()=>selectDriverCarFit(initial,definition,id)).toThrow('Unknown driver');
 const saved=value(createSaveEnvelope(initial,meta,definition));
 for(let i=0;i<52;i++)saved.universe=advanceUniverseWeek(saved.universe,definition);
 saved.universe=startUniverseSeason(saved.universe,definition,definition.development.teams.map(t=>t.id));
 expect(selectDriverCarFit(saved.universe,definition,'driver.takase')).toBeNull();
});

test('DriversScreen requests the domain selector rather than building a car or evaluating compatibility',()=>{
 const screen=readFileSync(join(__dirname,'../../ui/DriversScreen.tsx'),'utf8');
 expect(screen).toContain('selectDriverCarFit(');
 expect(screen).not.toMatch(/\b(computeCarProfile|carCompatibility)\b/);
});

test('date-derived kernel context advances through every week, no-op, deadlines and two rollovers',()=>{
 let u=initial;synced(u);
 for(let year=0;year<2;year++){
  for(let w=1;w<=52;w++){
   u=advanceUniverseWeek(u,definition);synced(u);
   expect(campaignContext(u.currentDate).week).toBe(w);
   if(year===0&&w===41)expect(u.drivers!.contracts.find(c=>c.driverId==='driver.ortez')!.option!.state).toBe('LAPSED');
  }
  expect(advanceUniverseWeek(u,definition)).toBe(u);
  const before=u;
  u=startUniverseSeason(u,definition,definition.development.teams.map(t=>t.id));synced(u);
  expect(campaignContext(u.currentDate).week).toBe(0);expect(campaignContext(u.currentDate).season).toBe(2027+year);
  expect(campaignContext(before.currentDate).week).toBe(52);
  expect(createSaveEnvelope(u,meta,definition).ok).toBe(true);
 }
});

test('HQ frames/restarts and driver commands do not advance either campaign clock',()=>{
 const hq=advanceUniverseHeadquarters(initial,definition,5500);
 const restart=restartUniverseHeadquarters(hq,definition);
 const scout={...restart,drivers:observeDriver(restart.drivers!,observer,'driver.cordeiro',NEW_CAREER_DATE)};
 const c=scout.drivers.contracts.find(c=>c.driverId==='driver.harlton')!;
 const decision=decideTeamOption(scout.drivers,c.teamId,c.id,true,NEW_CAREER_DATE);if(!decision.ok)throw new Error(decision.reason);
 const changed={...scout,drivers:decision.world};
 for(const u of [hq,restart,scout,changed]){
  synced(u);expect(u.development).toBe(initial.development);
  expect(campaignContext(u.currentDate).season).toBe(2026);expect(campaignContext(u.currentDate).week).toBe(0);
 }
 expect(initial.drivers!.knowledge[observer]!['driver.cordeiro']!.reports).toBe(0);
 expect(()=>startUniverseSeason(changed,definition,[])).toThrow('Finish');
});

test.each(['season','week'] as const)('save boundary rejects a forbidden duplicate driver clock field %s',(field)=>{
 const save=value(createSaveEnvelope(initial,meta,definition));
 (save.universe.drivers! as unknown as Record<string,unknown>)[field]=1;
 expect(validateSave(save,definition)).toMatchObject({ok:false,error:{code:'INVALID_DATA'}});
});
