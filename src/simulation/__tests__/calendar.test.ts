import {test,expect} from '@jest/globals';
import {createHash} from 'node:crypto';
import {readFileSync} from 'node:fs';
import {join} from 'node:path';
import {calendarById,DEFAULT_CALENDAR_ID,type CalendarDefinition} from '../../game/calendar';
import {parseCampaignDate as date,daysBetween} from '../campaignTime';
import {calendarWindow,calendarEventViews,eventDateLabel,eventStatus,selectNextEvent} from '../calendar';
import {validateCalendarDefinition} from '../calendar/validation';
import {selectEventDetail} from '../calendar/eventDetail';
import {createGameUniverse} from '../universe';
import {DEFAULT_GAME_DEFINITION as definition} from '../../game/defaultGame';
const calendar=calendarById(DEFAULT_CALENDAR_ID);
const copy=()=>JSON.parse(JSON.stringify(calendar)) as CalendarDefinition;

test('owner-approved revised schedule has all23 exact dated rounds and six specified Sprints',()=>{
 const expected=[
  ['melbourne','03-06','03-08'],['shanghai','03-13','03-15'],['suzuka','03-27','03-29'],['miami','05-01','05-03'],
  ['montreal','05-22','05-24'],['monaco','06-05','06-07'],['barcelona','06-12','06-14'],['spielberg','06-26','06-28'],
  ['silverstone','07-03','07-05'],['spa','07-17','07-19'],['budapest','07-24','07-26'],['zandvoort','08-21','08-23'],
  ['monza','09-04','09-06'],['madrid','09-11','09-13'],['baku','09-24','09-26'],['sepang','10-02','10-04'],
  ['singapore','10-09','10-11'],['austin','10-23','10-25'],['mexico_city','10-30','11-01'],['sao_paulo','11-06','11-08'],
  ['las_vegas','11-19','11-21'],['lusail','11-27','11-29'],['yas_marina','12-04','12-06']
 ];
 expect(calendar.events.map(e=>[e.trackId.slice(6),e.weekendStartDate.slice(5),e.raceDate.slice(5)])).toEqual(expected);
 expect(calendar.events.map(e=>e.round)).toEqual(Array.from({length:23},(_,i)=>i+1));
 expect(new Set(calendar.events.map(e=>e.id)).size).toBe(23);
 expect(calendar.events.filter(e=>e.sprint).map(e=>e.trackId.slice(6))).toEqual(['shanghai','miami','montreal','silverstone','zandvoort','singapore']);
 expect(calendar.events[15]!.trackId).toBe('track.sepang');
 expect(JSON.stringify(calendar)).not.toMatch(/sakhir|jeddah|bahrain|saudi/i);
 expect(()=>validateCalendarDefinition(calendar)).not.toThrow();
 expect(Object.keys(calendar.tracks)).toHaveLength(23);
});

test.each([
 ['2026-03-02',null,'melbourne',null,4],['2026-03-06','melbourne','melbourne',null,0],
 ['2026-03-07','melbourne','melbourne',null,0],['2026-03-08','melbourne','melbourne',null,0],
 ['2026-03-09',null,'shanghai','melbourne',4],['2026-04-15',null,'miami','suzuka',16],
 ['2026-09-26','baku','baku','madrid',0],['2026-10-31','mexico_city','mexico_city','austin',0],
 ['2026-12-06','yas_marina','yas_marina','lusail',0],['2026-12-07',null,null,'yas_marina',null],
 ['2027-01-01',null,null,'yas_marina',null]
])('calendar window at %s does not fabricate sessions/results/offseason',(when,current,next,previous,days)=>{
 const w=calendarWindow(calendar,date(when));
 expect(w.current?.trackId.slice(6)??null).toBe(current);expect(w.next?.trackId.slice(6)??null).toBe(next);
 expect(w.previous?.trackId.slice(6)??null).toBe(previous);expect(w.daysUntil).toBe(days);
 expect(w.future.every(e=>daysBetween(date(when),e.weekendStartDate)>0)).toBe(true);
});

test('status is date-derived, inclusive across weekend, and completed implies no result record',()=>{
 const e=calendar.events[0]!;
 expect(eventStatus(e,date('2026-03-05'))).toBe('UPCOMING');expect(eventStatus(e,date('2026-03-06'))).toBe('THIS WEEKEND');
 expect(eventStatus(e,date('2026-03-08'))).toBe('THIS WEEKEND');expect(eventStatus(e,date('2026-03-09'))).toBe('COMPLETED');
 const views=calendarEventViews(calendar,date('2026-03-09'));
 expect(views.filter(e=>e.next).map(e=>e.venue)).toEqual(['Shanghai']);expect(views[0]!.status).toBe('COMPLETED');
 expect(calendar.events[0]).not.toHaveProperty('status');expect(calendar.events[0]).not.toHaveProperty('result');
 expect(eventDateLabel(calendar.events[18]!)).toBe('Oct 30–Nov 1, 2026');
 const u=createGameUniverse(definition,1);
 expect(selectNextEvent(u)).toEqual({venue:'Melbourne',detail:'Mar 6–8 · 4 days'});
 expect(selectNextEvent({...u,currentDate:date('2026-12-07')})).toEqual({venue:'Season complete',detail:'Calendar dates finished'});
});

test.each([
 ['duplicate event',(c:any)=>{c.events[1].id=c.events[0].id;}],
 ['duplicate round',(c:any)=>{c.events[1].round=1;}],
 ['unknown track',(c:any)=>{c.events[0].trackId='track.unknown';}],
 ['bad date',(c:any)=>{c.events[0].raceDate='2026-02-30';}],
 ['backward weekend',(c:any)=>{c.events[0].raceDate='2026-03-05';}],
 ['overlap',(c:any)=>{c.events[1].weekendStartDate='2026-03-08';c.events[1].raceDate='2026-03-10';}],
 ['nonfinite demand',(c:any)=>{c.tracks['track.monza'].demands.braking=NaN;}],
 ['oversize demand',(c:any)=>{c.tracks['track.monza'].demands.braking=1.1;}],
 ['negative demand',(c:any)=>{c.tracks['track.monza'].demands.braking=-.1;}],
 ['missing axis',(c:any)=>{delete c.tracks['track.monza'].demands.braking;}],
 ['extra axis',(c:any)=>{c.tracks['track.monza'].demands.magic=1;}],
 ['empty demands',(c:any)=>{for(const key of Object.keys(c.tracks['track.monza'].demands))c.tracks['track.monza'].demands[key]=0;}],
 ['bad metadata',(c:any)=>{c.tracks['track.monza'].metadata.safetyCarTendency=-1;}],
 ['bad altitude',(c:any)=>{c.tracks['track.mexico_city'].metadata.altitudeM=Infinity;}]
])('authoring validation rejects %s',(_label,mutate)=>{const c=copy();mutate(c);expect(()=>validateCalendarDefinition(c)).toThrow();});

test('released calendar and profiles are recursively frozen, unknown versions never silently fall back',()=>{
 const frozen=(v:unknown):boolean=>!v||typeof v!=='object'||(Object.isFrozen(v)&&Object.values(v).every(frozen));
 expect(frozen(calendar)).toBe(true);expect(Reflect.set(calendar.events[0]!,'raceDate','2026-03-09')).toBe(false);
 expect(Reflect.set(calendar.tracks['track.monza']!.demands,'straightLine',0)).toBe(false);
 expect(()=>calendarById('calendar.2026.v3')).toThrow('Unknown calendar');
});

test('track identities express distinct technical demands and owner-verified metadata',()=>{
 const t=calendar.tracks,m=t['track.monaco']!.demands,z=t['track.monza']!.demands;
 expect(t['track.las_vegas']!.demands.straightLine).toBeGreaterThan(m.straightLine);
 expect(m.lowSpeed).toBeGreaterThan(z.lowSpeed);expect(z.straightLine).toBe(Math.max(...Object.values(t).map(t=>t.demands.straightLine)));
 expect(t['track.suzuka']!.demands.highSpeed).toBeGreaterThan(m.highSpeed);expect(t['track.silverstone']!.demands.highSpeed).toBeGreaterThanOrEqual(.85);
 expect(t['track.singapore']!.demands.cooling).toBeGreaterThanOrEqual(.85);
 for(const axis of ['straightLine','braking','lowSpeed'] as const)expect(t['track.baku']!.demands[axis]).toBeGreaterThanOrEqual(.85);
 expect(t['track.mexico_city']!.metadata.altitudeM).toBeGreaterThan(2000);
 expect(t['track.sepang']!.demands.cooling).toBeGreaterThanOrEqual(.85);expect(t['track.sepang']!.demands.tyrePreservation).toBeGreaterThanOrEqual(.85);
 expect(t['track.sepang']!.metadata.rainTendency).toBe('HIGH');expect(t['track.madrid']!.profileStatus).toBe('CONFIRMED');
});

test('event detail is domain disclosure with no numeric car score, field ranking, driver or result',()=>{
 const u=createGameUniverse(definition,1),view=selectEventDetail(u,definition,'event.2026.monza');
 expect(view.playerTeam).toBe('Wellington Racing');expect(view.fit?.label).toBeDefined();expect(view.demands).toHaveLength(11);
 expect(view.fit).not.toHaveProperty('score');expect(view).not.toHaveProperty('rank');expect(view).not.toHaveProperty('driver');expect(view).not.toHaveProperty('result');
 expect(()=>selectEventDetail(u,definition,'event.2026.unknown')).toThrow();
});

test('calendar.2026.v1 content stays pinned; revised schedules/profiles require a new released ID',()=>{
 expect(createHash('sha256').update(readFileSync(join(__dirname,'../../game/calendar/calendar2026v1.json'))).digest('hex')).toBe('13369570aa28e0dd573acdc2d0bac7dc6abdeeb7743de9ac268b7f07a51595fe');
});
