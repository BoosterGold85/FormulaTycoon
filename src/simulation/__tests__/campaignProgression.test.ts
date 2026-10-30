import {expect,jest,test} from '@jest/globals';
import {DEFAULT_GAME_DEFINITION as definition} from '../../game/defaultGame';
import {addCampaignDays,legacyWeekDate,parseCampaignDate as date,type CampaignDate} from '../campaignTime';
import {developmentState,developmentView} from '../campaignTime/developmentView';
import * as development from '../development';
import * as developmentWorld from '../development/world';
import * as driverContracts from '../drivers/contracts';
import {advanceCampaignTo,createGameUniverse,startUniverseSeason,type GameUniverse} from '../universe';
import {compareCampaignEvents,dueCampaignEvents} from '../universe/campaignEvents';
import {createSaveEnvelope,deserializeSave,serializeSave,type SaveResult} from '../../persistence/saveEnvelope';

const teamId='team.wellington';
const value=<T,>(result:SaveResult<T>):T=>{
 if(!result.ok)throw new Error(result.error.message);
 return result.value;
};
function withProject(calendarId='calendar.2026.v2'):GameUniverse {
 const universe=createGameUniverse({...definition,calendarId},17);
 const profile=definition.development.teams.find(t=>t.id===teamId)!;
 const started=development.startProject(universe.development.teams[teamId]!,profile,definition.development,
  {partId:'FRONT_WING',reason:'PERFORMANCE',ambition:.5,week:0,season:1});
 if(!started.ok)throw new Error(started.reason);
 return {...universe,development:{...universe.development,teams:{...universe.development.teams,[teamId]:started.team}}};
}
function daily(universe:GameUniverse,target:CampaignDate):GameUniverse {
 let current=universe;
 while(current.currentDate!==target)current=advanceCampaignTo(current,definition,addCampaignDays(current.currentDate,1));
 return current;
}
function reload(universe:GameUniverse):GameUniverse {
 const envelope=value(createSaveEnvelope(universe,{saveId:'d0-progression',gameVersion:'0.1.0',
  createdAt:'2026-10-30T12:00:00.000Z',updatedAt:'2026-10-30T12:00:00.000Z'},definition));
 expect(envelope.saveVersion).toBe(5);
 return value(deserializeSave(value(serializeSave(envelope,definition)),definition)).universe;
}

test.each(['calendar.2026.v1','calendar.2026.v2'])('daily == jump == released kernel with real project, seeded fitting and deadlines (%s)',calendarId=>{
 const initial=withProject(calendarId),bytes=JSON.stringify(initial),target=date('2026-12-08');
 const random=jest.spyOn(Math,'random').mockImplementation(()=>{throw new Error('Unseeded RNG');});
 try {
  const jumped=advanceCampaignTo(initial,definition,target);
  expect(jumped).toEqual(daily(initial,target));
  let kernel=developmentView(initial.development,initial.currentDate);
  for(let week=0;week<40;week++)kernel=development.advanceDevelopmentWeek(kernel,definition.development);
  expect(jumped.development).toEqual(developmentState(kernel));
  expect(jumped.development.submissions.some(s=>s.teamId===teamId&&s.partId==='FRONT_WING')).toBe(true);
  expect(jumped.development.teams[teamId]!.parts.FRONT_WING.spec).toBeGreaterThan(1);
  expect(jumped.drivers!.contracts.find(c=>c.driverId==='driver.ortez')!.option!.state).toBe('LAPSED');
  expect(jumped.calendarId).toBe(calendarId);
  expect(JSON.stringify(initial)).toBe(bytes);
 }finally{random.mockRestore();}
});

test('work processes on entering the due date, never the day before or again the day after',()=>{
 const initial=withProject(),due=legacyWeekDate(1,10);
 expect(due).toBe('2026-05-11'); // Compatibility fitting, deliberately not Melbourne March 6.
 const before=advanceCampaignTo(initial,definition,addCampaignDays(due,-1));
 expect(before.development.teams[teamId]!.projects[0]!.stage).toBe('READY');
 expect(before.development.submissions.filter(s=>s.teamId===teamId)).toHaveLength(0);
 const on=advanceCampaignTo(before,definition,due);
 expect(on.development.submissions.filter(s=>s.teamId===teamId)).toHaveLength(1);
 expect(on.development.teams[teamId]!.projects).toHaveLength(0);
 const after=advanceCampaignTo(on,definition,addCampaignDays(due,1));
 expect(after.development).toEqual(on.development);
 expect(advanceCampaignTo(on,definition,due)).toBe(on);
 expect(dueCampaignEvents(on,due)).toEqual([]);
});

test.each(['calendar.2026.v1','calendar.2026.v2'])('save immediately before fitting, restore, jump over several due dates (%s)',calendarId=>{
 const initial=withProject(calendarId),partial=advanceCampaignTo(initial,definition,date('2026-05-10'));
 const loaded=reload(partial),target=date('2026-05-26');
 const resumed=advanceCampaignTo(loaded,definition,target);
 expect(resumed).toEqual(advanceCampaignTo(initial,definition,target));
 expect(resumed).toEqual(daily(partial,target));
 const again=reload(resumed);
 expect(advanceCampaignTo(again,definition,target)).toBe(again);
 expect(advanceCampaignTo(again,definition,date('2026-06-23')))
  .toEqual(advanceCampaignTo(resumed,definition,date('2026-06-23')));
 const keys=resumed.development.submissions.map(s=>`${s.season}:${s.eventId}:${s.teamId}:${s.partId}`);
 expect(new Set(keys).size).toBe(keys.length);
 const work=dueCampaignEvents(partial,target).filter(e=>e.kind==='DEVELOPMENT_WEEK');
 expect(work.map(e=>e.date)).toEqual(['2026-05-11','2026-05-18','2026-05-25']);
});

test('chronology and explicit same-date priority drive actual execution, independent of list order',()=>{
 let initial=advanceCampaignTo(withProject(),definition,date('2026-05-10'));
 const id=initial.drivers!.contracts.find(c=>c.driverId==='driver.ortez')!.id;
 initial={...initial,drivers:{...initial.drivers!,contracts:initial.drivers!.contracts.map(c=>c.id===id?
  {...c,option:{...c.option!,decisionDate:date('2026-05-10')}}:c)}};
 const due=date('2026-05-11'),events=dueCampaignEvents(initial,due);
 expect(events.map(e=>e.kind)).toEqual(['DEVELOPMENT_WEEK','CONTRACT_STATUS_CHECK']);
 expect([...events].reverse().sort(compareCampaignEvents)).toEqual(events);
 const future=dueCampaignEvents(initial,date('2026-05-26'));
 expect([...future].reverse().sort(compareCampaignEvents)).toEqual(future);
 const tied=events[1]!;
 expect([{...tied,id:'z'},{...tied,id:'a'}].sort(compareCampaignEvents).map(e=>e.id)).toEqual(['a','z']);
 const trace:string[]=[],work=developmentWorld.advanceDevelopmentWeek,contracts=driverContracts.refreshDriverStatuses;
 const workSpy=jest.spyOn(developmentWorld,'advanceDevelopmentWeek').mockImplementation((...args)=>{trace.push('work');return work(...args);});
 const contractSpy=jest.spyOn(driverContracts,'refreshDriverStatuses').mockImplementation((...args)=>{trace.push('contracts');return contracts(...args);});
 try {
  const advanced=advanceCampaignTo(initial,definition,due);
  expect(trace).toEqual(['work','contracts']);
  expect(advanced.drivers!.contracts.find(c=>c.id===id)!.option!.state).toBe('LAPSED');
  expect(advanced.development.submissions.some(s=>s.teamId===teamId)).toBe(true);
 }finally{workSpy.mockRestore();contractSpy.mockRestore();}
});

test('normal commands reject time travel/implicit rollover; explicit reset follows the same pipeline',()=>{
 const initial=advanceCampaignTo(withProject(),definition,date('2026-03-03')),bytes=JSON.stringify(initial);
 expect(()=>advanceCampaignTo(initial,definition,date('2026-03-02'))).toThrow('Backward');
 expect(()=>dueCampaignEvents(initial,date('2026-03-02'))).toThrow('Backward');
 expect(()=>advanceCampaignTo(initial,definition,date('2027-03-02'))).toThrow('standings');
 expect(JSON.stringify(initial)).toBe(bytes);
 const finished=advanceCampaignTo(initial,definition,legacyWeekDate(1,52));
 const nextDate=date('2027-03-02');
 expect(dueCampaignEvents(finished,nextDate).map(e=>e.kind)).toEqual(['SEASON_TRANSITION','CONTRACT_STATUS_CHECK']);
 const next=startUniverseSeason(finished,definition,definition.development.teams.map(t=>t.id));
 expect(next.currentDate).toBe(nextDate);
 expect(next.development.submissions).toEqual(finished.development.submissions);
 expect(advanceCampaignTo(reload(next),definition,nextDate).development).toEqual(next.development);
 for(const state of [next.development,next.drivers!]){
  for(const field of ['currentDate','season','week','processedEvents'])expect(state).not.toHaveProperty(field);
 }
});

test('clock-only dates and week advancement without DriverWorld use the same bridge',()=>{
 const initial=createGameUniverse({...definition,driverEra:undefined},17);
 const oneDay=advanceCampaignTo(initial,definition,date('2026-03-03'));
 expect(oneDay.development).toBe(initial.development);
 expect(oneDay.currentDate).toBe('2026-03-03');
 const target=legacyWeekDate(1,12);
 expect(advanceCampaignTo(initial,definition,target)).toEqual(daily(initial,target));
 expect(dueCampaignEvents(initial,target).every(e=>e.kind==='DEVELOPMENT_WEEK')).toBe(true);
});
