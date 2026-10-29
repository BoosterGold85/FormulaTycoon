import {test,expect} from '@jest/globals';
import {spawnSync} from 'node:child_process';
import {readFileSync} from 'node:fs';
import {join} from 'node:path';
import {transpileModule,ModuleKind,ScriptTarget} from 'typescript';
import {parseCampaignDate as date,addCampaignDays,daysBetween,weekday,formatCampaignDate,compareCampaignDates,deadlinePassed,calendarYear,activeChampionshipSeason,campaignContext,legacyWeekDate,NEW_CAREER_DATE} from '../campaignTime';
import {developmentView,developmentState} from '../campaignTime/developmentView';
import {DEFAULT_GAME_DEFINITION as definition} from '../../game/defaultGame';
import {createGameUniverse,advanceUniverseWeek,startUniverseSeason,advanceCampaignTo,advanceCampaignByDays,advanceUniverseHeadquarters,restartUniverseHeadquarters} from '../universe';
import {createDriverWorld,refreshDriverStatuses,decideTeamOption,signDriverContract,activeContracts} from '../drivers';
import {advanceDevelopmentWeek,createDevelopmentWorld} from '../development';
import {createSaveEnvelope,serializeSave,deserializeSave,validateSave,type SaveResult} from '../../persistence/saveEnvelope';
const meta={gameVersion:'0.3.0',saveId:'dated-career',createdAt:'2026-10-29T12:00:00.000Z',updatedAt:'2026-10-29T12:00:00.000Z'};
const value=<T,>(r:SaveResult<T>)=>{if(!r.ok)throw new Error(r.error.message);return r.value;};

test.each(['2026-3-02','2026-03-2','2026-02-29','1900-02-29','2026-04-31','0000-01-01','2026-13-01','2026-00-01','2026-01-00','2026-03-02T00:00:00Z',' 2026-03-02',null,42])('rejects noncanonical/invalid date %s',(input)=>{expect(()=>date(input)).toThrow('Invalid campaign date');});

test.each([
 ['2026-03-02',0,'2026-03-02'],['2026-03-02',7,'2026-03-09'],['2026-12-31',1,'2027-01-01'],
 ['2028-02-28',1,'2028-02-29'],['2028-02-29',1,'2028-03-01'],['1900-02-28',1,'1900-03-01'],
 ['2000-02-28',1,'2000-02-29'],['2026-03-01',-1,'2026-02-28']
])('pure Gregorian addition %s + %i days',(start,days,end)=>{expect(addCampaignDays(date(start),days)).toBe(end);expect(daysBetween(date(start),date(end))).toBe(days);});

test('date comparison, formatting, weekdays and deadline inclusion are centralized',()=>{
 expect(weekday(NEW_CAREER_DATE)).toBe('Monday');expect(formatCampaignDate(NEW_CAREER_DATE)).toBe('Mar 2, 2026');
 expect(weekday(date('0001-01-01'))).toBe('Monday');
 expect(compareCampaignDates(date('2026-03-03'),NEW_CAREER_DATE)).toBe(1);
 expect(deadlinePassed(date('2026-12-06'),date('2026-12-07'))).toBe(false);
 expect(deadlinePassed(date('2026-12-07'),date('2026-12-07'))).toBe(false);
 expect(deadlinePassed(date('2026-12-08'),date('2026-12-07'))).toBe(true);
 expect(()=>addCampaignDays(date('9999-12-31'),1)).toThrow('range');
 expect(()=>addCampaignDays(NEW_CAREER_DATE,0.5)).toThrow('integer');
});

test.each(['America/Chicago','Europe/London','Asia/Tokyo','Australia/Sydney'])('date math/formatting does not shift with device zone %s',(zone)=>{
 const source=readFileSync(join(__dirname,'../campaignTime/date.ts'),'utf8');
 const code=transpileModule(source,{compilerOptions:{module:ModuleKind.CommonJS,target:ScriptTarget.ES2022}}).outputText;
 const probe=code+`;exports.NEW_CAREER_DATE=exports.parseCampaignDate('2026-03-02');process.stdout.write(JSON.stringify({start:exports.NEW_CAREER_DATE,afterDST:exports.addCampaignDays(exports.parseCampaignDate('2026-03-07'),2),day:exports.weekday(exports.NEW_CAREER_DATE),label:exports.formatCampaignDate(exports.NEW_CAREER_DATE)}));`;
 const result=spawnSync(process.execPath,['-e',probe],{encoding:'utf8',env:{...process.env,TZ:zone,LANG:'tr_TR.UTF-8'}});
 expect(result.status).toBe(0);
 expect(JSON.parse(result.stdout)).toEqual({start:'2026-03-02',afterDST:'2026-03-09',day:'Monday',label:'Mar 2, 2026'});
});

test('derived championship phase and completed-week mapping are not calendar year or ISO week',()=>{
 expect(campaignContext(NEW_CAREER_DATE)).toEqual({season:2026,seasonIndex:1,week:0});
 expect(legacyWeekDate(1,16)).toBe('2026-06-22');expect(legacyWeekDate(1,40)).toBe('2026-12-07');
 expect(legacyWeekDate(2,40)).toBe('2027-12-07');
 expect(calendarYear(date('2027-01-04'))).toBe(2027);expect(activeChampionshipSeason(date('2027-01-04'))).toBe(2026);
 expect(campaignContext(date('2027-01-04')).week).toBe(44);
 expect(legacyWeekDate(1,52)).toBe('2027-03-01');expect(legacyWeekDate(2,0)).toBe('2027-03-02');
 expect(campaignContext(date('2027-03-01')).week).toBe(52);
 expect(campaignContext(date('2027-03-02'))).toEqual({season:2027,seasonIndex:2,week:0});
 expect(campaignContext(date('2028-03-01')).week).toBe(52);
});

test('current saves have exactly one current clock and retain the actual new-career date',()=>{
 const universe=createGameUniverse(definition,7);
 expect(universe.currentDate).toBe('2026-03-02');
 for(const state of [universe.development,universe.drivers!])for(const key of ['season','week','currentDate','currentYear','currentWeekday'])expect(state).not.toHaveProperty(key);
 const save=value(createSaveEnvelope(universe,meta,definition));expect(save.saveVersion).toBe(4);
 expect(value(deserializeSave(value(serializeSave(save,definition)),definition))).toEqual(save);
 for(const field of ['season','week','currentDate']){
  const bad=JSON.parse(JSON.stringify(save));bad.universe.drivers[field]=field==='currentDate'?'2026-03-02':1;
  expect(validateSave(bad,definition).ok).toBe(false);
 }
 const bad=JSON.parse(JSON.stringify(save));bad.universe.currentDate='2026-02-30';expect(validateSave(bad,definition).ok).toBe(false);
});

test('date jumps process all intermediate weekly work and daily deadlines exactly once',()=>{
 const initial=createGameUniverse(definition,17),target=date('2026-12-08');
 const jumped=advanceCampaignTo(initial,definition,target);
 let daily=initial;
 while(daily.currentDate!==target)daily=advanceCampaignByDays(daily,definition,1);
 expect(jumped).toEqual(daily);
 let oldKernel=createDevelopmentWorld(definition.development,17);
 for(let w=0;w<40;w++)oldKernel=advanceDevelopmentWeek(oldKernel,definition.development);
 expect(jumped.development).toEqual(developmentState(oldKernel));
 expect(jumped.drivers!.contracts.find(c=>c.driverId==='driver.ortez')!.option!.state).toBe('LAPSED');
 expect(advanceCampaignTo(jumped,definition,target)).toBe(jumped);
 expect(advanceCampaignByDays(jumped,definition,0)).toBe(jumped);
 expect(initial.currentDate).toBe('2026-03-02');expect(initial.drivers!.contracts.find(c=>c.driverId==='driver.ortez')!.option!.state).toBe('PENDING');
 expect(()=>advanceCampaignByDays(jumped,definition,-1)).toThrow('nonnegative');
 expect(()=>advanceCampaignTo(jumped,definition,NEW_CAREER_DATE)).toThrow('Backward');
});

test('week52 and next season week0 are distinct dates; rollover requires actual supplied standings',()=>{
 let u=createGameUniverse(definition,7);for(let w=0;w<52;w++)u=advanceUniverseWeek(u,definition);
 expect(u.currentDate).toBe('2027-03-01');expect(advanceUniverseWeek(u,definition)).toBe(u);
 expect(()=>advanceCampaignTo(u,definition,date('2027-03-02'))).toThrow('standings');
 const next=startUniverseSeason(u,definition,definition.development.teams.map(t=>t.id));
 expect(next.currentDate).toBe('2027-03-02');expect(campaignContext(next.currentDate).week).toBe(0);
 expect(next.headquarters).toBe(u.headquarters);expect(next.development.submissions).toBe(u.development.submissions);
 expect(next.drivers!.contracts.find(c=>c.driverId==='driver.larsen')!.status).toBe('EXPIRED');
});

test('HQ animation and the existing morning replay never change career date or development state',()=>{
 const u=createGameUniverse(definition,1),moved=advanceUniverseHeadquarters(u,definition,5500),reset=restartUniverseHeadquarters(moved,definition);
 expect(moved.currentDate).toBe(u.currentDate);expect(reset.currentDate).toBe(u.currentDate);
 expect(moved.development).toBe(u.development);expect(reset.development).toBe(u.development);
 expect(reset.headquarters.timeMs).toBe(0);expect(moved.headquarters.timeMs).toBeGreaterThan(0);
});

const options:[string,string][]=[['harlton','2027-12-07'],['ortez','2026-12-07'],['botten','2027-12-07'],['bearford','2026-12-07']];
test.each(options)('explicit %s option deadline %s preserves ownership, boundary, exercise and conflict',(id,deadline)=>{
 const initial=createDriverWorld(),c=initial.contracts.find(c=>c.driverId===`driver.${id}`)!;
 expect(c.option!.decisionDate).toBe(deadline);expect(c.option).not.toHaveProperty('deadlineWeek');expect(c.option).not.toHaveProperty('deadlineSeason');
 const before=addCampaignDays(date(deadline),-1),on=date(deadline),after=addCampaignDays(on,1);
 for(const when of [before,on]){
  const world=refreshDriverStatuses(initial,when);
  expect(decideTeamOption(world,c.teamId,c.id,true,when).ok).toBe(true);
  expect(decideTeamOption(world,'team.wellington',c.id,true,when).ok).toBe(false);
 }
 const closed=refreshDriverStatuses(initial,after);expect(closed.contracts.find(x=>x.id===c.id)!.option!.state).toBe('LAPSED');
 expect(decideTeamOption(closed,c.teamId,c.id,true,after).ok).toBe(false);
 expect(decideTeamOption(initial,c.teamId,c.id,true,after).ok).toBe(false); // Same deadline helper, even before status refresh.
 const exercised=decideTeamOption(refreshDriverStatuses(initial,on),c.teamId,c.id,true,on);if(!exercised.ok)throw new Error(exercised.reason);
 const retained=refreshDriverStatuses(exercised.world,after);
 expect(retained.contracts.find(x=>x.id===c.id)!.option!.state).toBe('EXERCISED');
 expect(decideTeamOption(retained,c.teamId,c.id,true,after)).toEqual({ok:true,world:retained});
 const booked=signDriverContract(refreshDriverStatuses(initial,before),{teamId:c.teamId,driverId:'driver.vale',seat:c.seat,startSeason:c.option!.season,endSeason:c.option!.season,annualSalaryM:3,performanceBonusM:0,option:null},before);
 if(!booked.ok)throw new Error(booked.reason);
 expect(decideTeamOption(booked.world,c.teamId,c.id,true,on)).toMatchObject({ok:false,reason:'CONFLICT'});
});
