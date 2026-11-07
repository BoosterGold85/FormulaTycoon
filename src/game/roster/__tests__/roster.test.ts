import {afterEach,describe,expect,test} from '@jest/globals';
import {createHash} from 'crypto';
import {readFileSync} from 'fs';
import {join} from 'path';
import {DEFAULT_GAME_DEFINITION as definition} from '../../defaultGame';
import {advanceCampaignTo,createGameUniverse,type GameUniverse} from '../../../simulation/universe';
import {nextTurnTarget,startPlayerProject} from '../../../simulation/developmentLoop';
import {driverView} from '../../../simulation/drivers';
import {selectQualifyingGrid} from '../../../simulation/qualifying';
import {driverCodes} from '../../../simulation/qualifying/codes';
import {NEW_CAREER_DATE} from '../../../simulation/campaignTime';
import {createSaveEnvelope,deserializeSave,serializeSave,type SaveResult} from '../../../persistence/saveEnvelope';
import {teamBrand,TEAM_BRANDS} from '../../brandRegistry';
import {GRID} from '../../drivers/grid';
import {MARKET} from '../../drivers/market';
import {
 DEFAULT_PACK,DEFAULT_ROSTER,FREE_AGENT_SLOT_IDS,GRID_SLOT_IDS,PACK_KEYS,TEAM_SLOT_IDS,cosmeticOnly,parseRosterPack,
 planRosterApplication,setDisplayRoster,toCosmeticPack,validateRosterPack,type PackResult,type RosterPack
} from '..';
import {readRosterPreference,ROSTER_PREFERENCE_KEY} from '../../../ui/rosterPreference';

const fixture=(name:string)=>readFileSync(join(__dirname,'fixtures',name),'utf8');
const accepted=(r:PackResult)=>{if(!r.ok)throw new Error(r.errors.map(e=>`${e.where}: ${e.message}`).join('\n'));return r;};
const value=<T,>(r:SaveResult<T>)=>{if(!r.ok)throw new Error(r.error.message);return r.value;};
const meta={gameVersion:'0.8.0',saveId:'roster-pack',createdAt:'2026-11-05T12:00:00.000Z',updatedAt:'2026-11-05T12:00:00.000Z'};
const clone=<T,>(x:T):T=>JSON.parse(JSON.stringify(x));
/** Same played career used for the pre-change baseline: Floor project, 20 turns. */
function play(seed:number,start:(seed:number)=>GameUniverse=s=>createGameUniverse(definition,s)){
 const r=startPlayerProject(start(seed),definition,{partId:'FLOOR',objective:'PERFORMANCE',approach:'BALANCED'});
 if(!r.ok)throw new Error(r.reason);let u=r.universe;
 for(let i=0;i<20;i++){const t=nextTurnTarget(u);if(!t)break;u=advanceCampaignTo(u,definition,t.date);}
 return u;
}
const simulationOnly=(u:GameUniverse)=>JSON.stringify(u,(k,v)=>k==='name'||k==='summary'?undefined:v);
afterEach(()=>setDisplayRoster(DEFAULT_ROSTER));

describe('default pack',()=>{
 test('is a complete, valid full pack covering every slot',()=>{
  const r=accepted(validateRosterPack(clone(DEFAULT_PACK)));
  expect(r.roster.type).toBe('full');
  expect(DEFAULT_PACK.teams).toHaveLength(TEAM_SLOT_IDS.length);
  expect(DEFAULT_PACK.drivers).toHaveLength(GRID_SLOT_IDS.length);
  expect(DEFAULT_PACK.freeAgents).toHaveLength(FREE_AGENT_SLOT_IDS.length);
  for(const d of [...DEFAULT_PACK.drivers!,...DEFAULT_PACK.freeAgents!])for(const key of ['name','nationality','archetype','bio','helmetPattern','stats'] as const)expect(d[key]).toBeDefined();
  expect(DEFAULT_ROSTER.isDefault).toBe(true);
  expect(DEFAULT_ROSTER.statOverrides).toEqual({});
 });
 test('keeps the internal IDs, team order and seat pairs that saves and seeds use',()=>{
  expect(TEAM_BRANDS.map(t=>t.id)).toEqual([...TEAM_SLOT_IDS]);
  expect(GRID.map(d=>d.id)).toEqual(GRID_SLOT_IDS);
  expect(MARKET.map(d=>d.id)).toEqual(FREE_AGENT_SLOT_IDS);
  GRID.forEach((d,i)=>expect(d.teamId).toBe(TEAM_SLOT_IDS[Math.floor(i/2)]));
  expect(teamBrand('team.wellington').name).toBe('Ardent Dynamics');
 });
 test('every race driver has a unique number and teammates never share a helmet design',()=>{
  const grid=DEFAULT_ROSTER.drivers.filter(d=>d.group==='grid');
  expect(new Set(grid.map(d=>d.number)).size).toBe(22);
  for(let slot=1;slot<=22;slot+=2)expect(grid[slot-1]!.helmetPattern).not.toBe(grid[slot]!.helmetPattern);
 });
 // Hashes captured from Qualifying V1 (claude/happy-dirac-pw7zmq at 4f0d907, which has no roster packs), ignoring the
// display name and bio fields that moved into the pack. Each 20-turn career includes 4 qualifying sessions.
// (Before qualifying merged in, the same check matched the pre-roster build at a204428.)
 test.each([
  [1,'4a84f4640168ea02476944d4cf5dc805225fe01ac5aada23cd2a3ff658b01bbc'],
  [7,'5d7a4833538e913479829ac649415d482de17fb184795904545367ac09fc2b18'],
  [42,'79070954f62b30c0cbc3de0eb1c78e0e318ea7346e6abdbb3053d377e0f4504f'],
  [123456,'213652ec1b12a38a4c66bd4b7609e51fbd05e955395961d7b6d67ce4b64752d5']
 ])('determinism unchanged for the default pack: seed %d',(seed,hash)=>{
  expect(createHash('sha256').update(simulationOnly(play(seed))).digest('hex')).toBe(hash);
  // Explicitly passing the default pack is identical to passing nothing.
  expect(JSON.stringify(play(seed,s=>createGameUniverse(definition,s,{roster:DEFAULT_ROSTER})))).toBe(JSON.stringify(play(seed)));
 });
});

describe('sample cosmetic pack',()=>{
 const r=accepted(parseRosterPack(fixture('sample-cosmetic.json')));
 test('maps by slot and falls back to the default roster for everything missing',()=>{
  expect(r.roster.type).toBe('cosmetic');
  const t1=r.roster.teams[0]!,t6=r.roster.teams[5]!,t11=r.roster.teams[10]!,t2=r.roster.teams[1]!;
  expect(t1).toMatchObject({id:'team.mclarin',name:'Brightwater Racing',colors:{primary:'#2A7FBA',secondary:'#F5EFE6',accent:'#E4572E'},fromPack:true});
  expect(t6).toMatchObject({id:'team.wellington',name:'Ironpine Motorsport',colors:{primary:'#3B5D3A',secondary:'#E9D8A6',accent:DEFAULT_ROSTER.teams[5]!.colors.accent}});
  expect(t11.colors).toEqual(DEFAULT_ROSTER.teams[10]!.colors);
  expect(t2).toEqual({...DEFAULT_ROSTER.teams[1],fromPack:false});
  const d1=r.roster.drivers[0]!;
  expect(d1).toMatchObject({id:'driver.ronnis',name:'Orla Penhallow',number:71,nationality:'Coastal',helmetPattern:5,
   archetype:DEFAULT_ROSTER.drivers[0]!.archetype,statsChanged:false});
  expect(r.roster.drivers.find(d=>d.id===FREE_AGENT_SLOT_IDS[0])!.name).toBe('Pell Marrow');
  expect(r.roster.statOverrides).toEqual({});
 });
 test('qualifying grid, names and timing codes follow the pack; stored sessions do not change',()=>{
  const u=play(1),eventId=Object.keys(u.qualifying!.sessions)[0]!,stored=JSON.stringify(u.qualifying);
  const before=selectQualifyingGrid(u,eventId)!,codesBefore={...driverCodes(u)};
  setDisplayRoster(r.roster);
  const after=selectQualifyingGrid(u,eventId)!,row=after.rows.find(x=>x.driverId==='driver.sainor')!;
  expect(row.name).toBe('Imke Sandvoort');
  expect(after.rows.map(x=>[x.position,x.driverId])).toEqual(before.rows.map(x=>[x.position,x.driverId]));
  expect(driverCodes(u)['driver.sainor']).not.toBe(codesBefore['driver.sainor']);
  expect(JSON.stringify(u.qualifying)).toBe(stored);
 });
 test('applies to a running career: views change, the simulation does not',()=>{
  const before=play(42);
  const plan=planRosterApplication(r.roster,'CURRENT_CAREER');
  expect(plan.ok).toBe(true);if(!plan.ok)return;
  expect(plan.newCareer).toBeNull();
  setDisplayRoster(plan.display);
  expect(teamBrand('team.wellington').name).toBe('Ironpine Motorsport');
  expect(teamBrand('team.wellington').color).toBe('#3B5D3A');
  const view=driverView(before.drivers!,'team.wellington','driver.sainor',before.currentDate);
  expect(view).toMatchObject({name:'Imke Sandvoort',number:64,archetype:'Harbour hero',summary:'Learned to race on the sea-front circuit.',team:'Ironpine Motorsport'});
  // Same seed and choices with the cosmetic pack showing: byte-identical career, save included.
  const during=play(42);
  expect(JSON.stringify(during)).toBe(JSON.stringify(before));
  expect(value(serializeSave(value(createSaveEnvelope(during,meta,definition)),definition)))
   .toBe(value(serializeSave(value(createSaveEnvelope(before,meta,definition)),definition)));
 });
});

describe('sample full pack',()=>{
 const r=accepted(parseRosterPack(fixture('sample-full.json')));
 test('records stat overrides only for the drivers it changed',()=>{
  expect(Object.keys(r.roster.statOverrides).sort()).toEqual(['driver.alburn','driver.ronnis','driver.sainor']);
  expect(r.roster.statOverrides['driver.alburn']).toMatchObject({talent:97,racecraft:96,potential:99,age:DEFAULT_ROSTER.drivers[11]!.stats.age});
 });
 test('never applies to a running career',()=>{
  const plan=planRosterApplication(r.roster,'CURRENT_CAREER');
  expect(plan.ok).toBe(false);
  if(!plan.ok)expect(plan.reason).toMatch(/only be used when starting a new career/);
 });
 test('builds a new career from its stats, deterministically, and the save round-trips',()=>{
  const plan=planRosterApplication(r.roster,'NEW_CAREER');
  expect(plan.ok&&plan.newCareer).toBe(r.roster);
  const fresh=createGameUniverse(definition,1,{roster:r.roster}),base=createGameUniverse(definition,1);
  const juno=fresh.drivers!.drivers['driver.sainor']!;
  expect(juno).toMatchObject({name:'Juno Ashgrove',ageAt2026:24,nationality:'Northland',traits:['Calm Under Pressure','Late Braker'],
   ability:{talent:99,racecraft:98,adaptability:97,composure:96,feedback:95,marketability:90},hidden:expect.objectContaining({potential:100})});
  expect(juno.sourcePerformance).toBeUndefined();
  expect(fresh.drivers!.drivers['driver.ronnis']!.ability.talent).toBe(60);
  expect(fresh.drivers!.drivers['driver.ronnis']!.stage).toBe('VETERAN');
  // Untouched slots keep the default simulation state exactly.
  for(const id of [...GRID_SLOT_IDS,...FREE_AGENT_SLOT_IDS].filter(id=>!r.roster.statOverrides[id]))
   expect(fresh.drivers!.drivers[id]).toEqual(base.drivers!.drivers[id]);
  expect(fresh.drivers!.contracts).toEqual(base.drivers!.contracts);
  const first=play(1,s=>createGameUniverse(definition,s,{roster:r.roster})),second=play(1,s=>createGameUniverse(definition,s,{roster:r.roster}));
  expect(JSON.stringify(first)).toBe(JSON.stringify(second));
  expect(simulationOnly(first)).not.toBe(simulationOnly(play(1)));
  const restored=value(deserializeSave(value(serializeSave(value(createSaveEnvelope(first,meta,definition)),definition)),definition)).universe;
  expect(restored).toEqual(first);
 });
 test('can be reduced to a cosmetic pack for a running career',()=>{
  const cosmetic=accepted(validateRosterPack(toCosmeticPack(r.pack)));
  expect(cosmetic.roster.type).toBe('cosmetic');
  expect(cosmetic.roster.statOverrides).toEqual({});
  expect(cosmetic.roster.drivers[10]!.name).toBe('Juno Ashgrove');
  expect(cosmeticOnly(r.roster).drivers[10]!.stats).toEqual(DEFAULT_ROSTER.drivers[10]!.stats);
  expect(planRosterApplication(cosmetic.roster,'CURRENT_CAREER').ok).toBe(true);
  expect(JSON.stringify(createGameUniverse(definition,1,{roster:cosmetic.roster}))).toBe(JSON.stringify(createGameUniverse(definition,1)));
 });
});

describe('validation errors',()=>{
 const errors=(input:unknown)=>{const r=validateRosterPack(input);if(r.ok)throw new Error('expected errors');return r.errors;};
 const base=():RosterPack=>({format:'formula-tycoon-roster-pack',schemaVersion:1,id:'t-pack',name:'Test',type:'cosmetic'});
 test('the sample broken pack reports every problem with where and what',()=>{
  const r=parseRosterPack(fixture('sample-invalid.json'));
  expect(r.ok).toBe(false);if(r.ok)return;
  const byPath=Object.fromEntries(r.errors.map(e=>[e.path,e]));
  expect(byPath['teams[0].colors.primary']).toMatchObject({where:'Team slot 3',message:expect.stringMatching(/six-digit hex/)});
  expect(byPath['teams[1].slot']).toMatchObject({message:'Slot must be a whole number from 1 to 11.'});
  expect(byPath['drivers[0].number']).toMatchObject({where:'Driver slot 1',message:expect.stringMatching(/1 to 99/)});
  expect(byPath['drivers[1].helmetPatern']).toMatchObject({message:expect.stringMatching(/Unknown field "helmetPatern"/)});
  expect(byPath['drivers[2].stats']).toMatchObject({message:expect.stringMatching(/only allowed in full packs/)});
 });
 test('merged-roster rules: duplicate numbers, names and teammate helmets',()=>{
  const dupNumber=errors({...base(),drivers:[{slot:3,number:DEFAULT_ROSTER.drivers[0]!.number}]});
  expect(dupNumber[0]!.message).toMatch(/Car number \d+ is also used by/);
  const dupName=errors({...base(),drivers:[{slot:5,name:DEFAULT_ROSTER.drivers[0]!.name}]});
  expect(dupName.some(e=>/also used by/.test(e.message))).toBe(true);
  const helmets=errors({...base(),drivers:[{slot:2,helmetPattern:DEFAULT_ROSTER.drivers[0]!.helmetPattern}]});
  expect(helmets[0]).toMatchObject({where:'Driver slot 2',message:expect.stringMatching(/Teammates must not share a helmet design/)});
  const teams=errors({...base(),teams:[{slot:2,name:DEFAULT_ROSTER.teams[0]!.name}]});
  expect(teams[0]!.message).toMatch(/team name .* is also used/);
 });
 test('field, type and version checks',()=>{
  expect(errors({...base(),format:'something-else'})[0]!.path).toBe('format');
  expect(errors({...base(),schemaVersion:2})[0]!.message).toMatch(/format version 2; this game reads version 1/);
  expect(errors({...base(),type:'stats'})[0]!.path).toBe('type');
  expect(errors({...base(),id:'Bad ID'})[0]!.path).toBe('id');
  expect(errors({...base(),teams:[{slot:1},{slot:1}]})[0]!.message).toBe('Slot 1 appears more than once.');
  const full={...base(),type:'full' as const};
  const stats=errors({...full,drivers:[{slot:1,stats:{talent:101,age:12,traits:['Teleporter','Late Braker','Late Braker'],speed:3}}]}).map(e=>e.path);
  expect(stats).toEqual(expect.arrayContaining(['drivers[0].stats.talent','drivers[0].stats.age','drivers[0].stats.traits[0]','drivers[0].stats.traits[2]','drivers[0].stats.speed']));
  expect(errors({...base(),name:'Line\nbreak'})[0]!.message).toMatch(/control character/);
  expect(errors([1,2])[0]!.message).toMatch(/one JSON object/);
 });
 test('file-level problems',()=>{
  const first=(text:string)=>{const r=parseRosterPack(text);return r.ok?null:r.errors[0]!.message;};
  expect(first('')).toMatch(/empty/);
  expect(first('{"format": ')).toMatch(/not valid JSON/);
  expect(first(' '.repeat(300*1024)+'{}')).toMatch(/larger than 256 KB/);
  expect(parseRosterPack('﻿'+JSON.stringify(base())).ok).toBe(true);
 });
 test('a pack with only a name is valid and is the default roster underneath',()=>{
  const r=accepted(validateRosterPack(base()));
  expect(r.roster.teams).toEqual(DEFAULT_ROSTER.teams.map(t=>({...t,fromPack:false})));
  expect(r.roster.drivers.map(d=>d.name)).toEqual(DEFAULT_ROSTER.drivers.map(d=>d.name));
 });
});

test('the published JSON Schema lists exactly the fields the validator accepts',()=>{
 const schema=JSON.parse(readFileSync(join(__dirname,'../../../../docs/roster-pack.schema.json'),'utf8'));
 const keys=(o:{properties:object})=>Object.keys(o.properties).sort();
 expect(keys(schema)).toEqual([...PACK_KEYS.root].sort());
 expect(keys(schema.$defs.team)).toEqual([...PACK_KEYS.team].sort());
 expect(keys(schema.$defs.colors)).toEqual([...PACK_KEYS.colors].sort());
 expect(keys(schema.$defs.driver)).toEqual([...PACK_KEYS.driver].sort());
 expect(keys(schema.$defs.stats)).toEqual([...PACK_KEYS.stats].sort());
});

describe('stored preference',()=>{
 const storage=(raw:string|null)=>{const data=new Map<string,string>(raw===null?[]:[[ROSTER_PREFERENCE_KEY,raw]]);
  return {getItem:(k:string)=>data.get(k)??null,setItem:(k:string,v:string)=>{data.set(k,v);},removeItem:(k:string)=>{data.delete(k);},data};};
 test('nothing stored means the default roster',()=>{
  const s=storage(null);expect(readRosterPreference(s)).toEqual({display:DEFAULT_ROSTER,career:undefined,stored:null});
 });
 test('a stored full pack seeds the next new career; a cosmetic one only changes the display',()=>{
  const pack=JSON.parse(fixture('sample-full.json'));
  const full=readRosterPreference(storage(JSON.stringify({mode:'full',pack})));
  expect(full.career?.statOverrides['driver.sainor']).toBeDefined();
  const cosmetic=readRosterPreference(storage(JSON.stringify({mode:'cosmetic',pack:JSON.parse(fixture('sample-cosmetic.json'))})));
  expect(cosmetic.career).toBeUndefined();expect(cosmetic.display.teams[0]!.name).toBe('Brightwater Racing');
 });
 test('a stored pack that no longer validates is discarded',()=>{
  const s=storage(JSON.stringify({mode:'cosmetic',pack:{format:'nope'}}));
  expect(readRosterPreference(s).display).toBe(DEFAULT_ROSTER);expect(s.data.has(ROSTER_PREFERENCE_KEY)).toBe(false);
  expect(readRosterPreference(storage('{not json')).display).toBe(DEFAULT_ROSTER);
 });
 test('career creation date is unchanged by any pack',()=>{
  expect(createGameUniverse(definition,1,{roster:accepted(parseRosterPack(fixture('sample-full.json'))).roster}).currentDate).toBe(NEW_CAREER_DATE);
 });
});
