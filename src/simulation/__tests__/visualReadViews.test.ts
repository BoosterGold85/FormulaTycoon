import {expect,test} from '@jest/globals';
import {DEFAULT_GAME_DEFINITION as definition} from '../../game/defaultGame';
import {createGameUniverse} from '../universe';
import {selectCalendarMonth} from '../calendar/monthView';
import {selectDriverRoster,selectTeamOverview} from '../managementViews';
import {parseCampaignDate} from '../campaignTime';

const initial=createGameUniverse(definition,17);
test('Monday-first March grid locates current date and exact Melbourne weekend without advancing',()=>{
 const before=JSON.stringify(initial),view=selectCalendarMonth(initial,3);
 expect(view.cells).toHaveLength(42);expect(view.cells[6]!.day).toBe(1);expect(view.cells[7]).toMatchObject({day:2,current:true});
 expect(view.cells.filter(c=>c?.event?.venue==='Melbourne').map(c=>c!.date)).toEqual(['2026-03-06','2026-03-07','2026-03-08']);
 expect(view.events.map(e=>e.venue)).toEqual(['Melbourne','Shanghai','Suzuka']);
 expect(view.events.find(e=>e.venue==='Shanghai')!.sprint).toBe(true);
 expect(JSON.stringify(initial)).toBe(before);
});
test('cross-month weekends stay on every actual date; year-end padding creates no extra event',()=>{
 const oct=selectCalendarMonth(initial,10),nov=selectCalendarMonth(initial,11);
 expect(oct.cells.filter(c=>c?.event?.venue==='Mexico City').map(c=>c!.day)).toEqual([30,31]);
 expect(nov.cells.filter(c=>c?.event?.venue==='Mexico City').map(c=>c!.day)).toEqual([1]);
 expect(selectCalendarMonth(initial,2).cells.filter(Boolean)).toHaveLength(28);
 expect(selectCalendarMonth(initial,12).cells.filter(Boolean)).toHaveLength(31);
 const all=Array.from({length:12},(_,i)=>selectCalendarMonth(initial,i+1));
 expect(new Set(all.flatMap(m=>m.events.map(e=>e.id))).size).toBe(23);
 expect(()=>selectCalendarMonth(initial,0)).toThrow('month');expect(()=>selectCalendarMonth(initial,13)).toThrow('month');
});
test('month status uses root date and pinned content rather than a UI current-round mirror',()=>{
 const view=selectCalendarMonth({...initial,currentDate:parseCampaignDate('2026-03-09'),calendarId:'calendar.2026.v1'},3);
 expect(view.events[0]).toMatchObject({venue:'Melbourne',status:'COMPLETED',next:false});
 expect(view.events[1]).toMatchObject({venue:'Shanghai',next:true});
 expect(view.cells.filter(c=>c?.current).map(c=>c!.day)).toEqual([9]);
});
test('roster groups preserve real employment and uncertainty without raw performance disclosure',()=>{
 const roster=selectDriverRoster(initial);
 expect(roster.yourDrivers.map(d=>d.id)).toEqual(['driver.sainor','driver.alburn']);
 expect(roster.grid).toHaveLength(22);expect(roster.prospects).toHaveLength(10);expect(roster.reserves).toHaveLength(11);
 expect(roster.available.every(d=>d.teamId===null&&d.category!=='PROSPECT')).toBe(true);
 expect(roster.prospects.some(d=>d.grades.talent.includes(' to '))).toBe(true);
 for(const d of [...roster.grid,...roster.prospects,...roster.reserves]){
  expect(d).not.toHaveProperty('ability');expect(d).not.toHaveProperty('overall');expect(d).not.toHaveProperty('sourcePerformance');
 }
});
test('team overview reports actual empty work, contextual car fit and visible staff, with no invented finance/results',()=>{
 const before=JSON.stringify(initial),view=selectTeamOverview(initial,definition);
 expect(view.projects).toEqual([]);expect(view.fittedParts).toHaveLength(8);
 expect(view.briefing?.venue).toBe('Melbourne');expect(view.briefing?.fit?.label).toBeDefined();
 expect(view.briefing?.fit).not.toHaveProperty('score');expect(view.staff.IDLE).toBe(8);
 for(const field of ['cash','morale','wins','pace','rating','results'])expect(view).not.toHaveProperty(field);
 expect(JSON.stringify(initial)).toBe(before);
});
