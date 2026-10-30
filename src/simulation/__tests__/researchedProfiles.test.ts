import {test,expect} from '@jest/globals';
import {createHash} from 'node:crypto';
import {readFileSync} from 'node:fs';
import {join} from 'node:path';
import {calendarById,DEFAULT_CALENDAR_ID} from '../../game/calendar';
import {RELEASED_CALENDAR_IDS} from '../../game/calendar/releasedIds';
import {DEFAULT_GAME_DEFINITION as definition} from '../../game/defaultGame';
import {createGameUniverse,advanceUniverseWeek} from '../universe';
import {selectEventDetail} from '../calendar/eventDetail';
import {validateCalendarDefinition} from '../calendar/validation';
import {deserializeSave,serializeSave,createSaveEnvelope,type SaveResult} from '../../persistence/saveEnvelope';
import v4 from '../../persistence/__tests__/fixtures/driver-world-v4.json';
const v1=calendarById('calendar.2026.v1'),v2=calendarById('calendar.2026.v2');
const value=<T,>(r:SaveResult<T>)=>{if(!r.ok)throw new Error(r.error.message);return r.value;};

test('research revision preserves all event identities/dates/Sprints and records supplied confidence honestly',()=>{
 expect(DEFAULT_CALENDAR_ID).toBe('calendar.2026.v2');expect(createGameUniverse(definition,1).calendarId).toBe(DEFAULT_CALENDAR_ID);
 expect(v2.events).toEqual(v1.events);expect(v2.profileVersion).toBe('track-profiles.2026.v2');
 expect(Object.values(v2.tracks).every(t=>t.profileStatus==='CONFIRMED')).toBe(true);
 expect(Object.values(v2.tracks).filter(t=>t.profileConfidence==='HIGH')).toHaveLength(19);
 expect(Object.values(v2.tracks).filter(t=>t.profileConfidence==='MEDIUM').map(t=>t.id)).toEqual(['track.sao_paulo','track.las_vegas','track.lusail','track.yas_marina']);
 expect(Reflect.set(RELEASED_CALENDAR_IDS,'0','changed')).toBe(false);
 for(const c of [v1,v2])expect(Reflect.set(c.tracks['track.monaco']!.demands,'lowSpeed',0)).toBe(false);
});

test('Madrid replaces the uninformative placeholder with supported mixed sectors and demanding banked-corner tyre energy',()=>{
 const t=v2.tracks['track.madrid']!;
 expect(t.type).toBe('HYBRID');expect(t.profileStatus).toBe('CONFIRMED');expect(t.profileConfidence).toBe('HIGH');
 expect(t.demands.straightLine).toBeGreaterThan(v1.tracks[t.id]!.demands.straightLine);
 expect(t.demands.highSpeed).toBeGreaterThanOrEqual(.85);expect(t.demands.braking).toBeGreaterThanOrEqual(.85);
 expect(t.demands.tyrePreservation).toBeGreaterThanOrEqual(.9);expect(t.metadata.tyreSeverity).toBeGreaterThanOrEqual(.9);
 expect(t.demands.lowSpeed).toBeGreaterThan(.65);
 expect(selectEventDetail(createGameUniverse(definition,1),definition,'event.2026.madrid').provisional).toBe(false);
 expect(v1.tracks[t.id]!.profileStatus).toBe('PROVISIONAL'); // A saved v1 career retains its original meaning.
});

test('Singapore separates hot conditions and grip demand from non-extreme mechanical/tyre stress',()=>{
 const t=v2.tracks['track.singapore']!,old=v1.tracks[t.id]!;
 expect(t.demands.cooling).toBe(1);expect(t.demands.mechanicalGrip).toBe(old.demands.mechanicalGrip);
 expect(t.demands.reliability).toBeLessThan(old.demands.reliability);expect(t.demands.reliability).toBeLessThan(.65);
 expect(t.demands.tyrePreservation).toBeLessThan(old.demands.tyrePreservation);expect(t.metadata.tyreSeverity).toBeLessThan(old.metadata.tyreSeverity);
 expect(t.metadata.night).toBe(true);expect(t.metadata.rainTendency).toBe('HIGH');
});

test('low wear/warm-up distinctions, verified altitude/cooling and Sepang/Lusail character survive review',()=>{
 expect(v2.tracks['track.melbourne']!.metadata.tyreSeverity).toBeLessThan(.4);
 expect(v2.tracks['track.miami']!.metadata.tyreSeverity).toBeLessThan(.4);
 expect(v2.tracks['track.monaco']!.demands).toEqual(v1.tracks['track.monaco']!.demands);
 expect(v2.tracks['track.las_vegas']!.demands).toEqual(v1.tracks['track.las_vegas']!.demands);
 expect(v2.tracks['track.las_vegas']!.rationale).toMatch(/warm-up/);
 expect(v2.tracks['track.mexico_city']!.metadata.altitudeM).toBe(2250);expect(v2.tracks['track.mexico_city']!.demands.cooling).toBe(1);
 expect(v2.tracks['track.spielberg']!.metadata.altitudeM).toBe(660);
 expect(v2.tracks['track.lusail']!.demands.tyrePreservation).toBe(1);
 expect(v2.tracks['track.sepang']!.demands).toEqual(v1.tracks['track.sepang']!.demands);
 expect(v2.tracks['track.sepang']!.metadata.rainTendency).toBe('HIGH');
 const bad=JSON.parse(JSON.stringify(v2));bad.tracks['track.madrid'].profileConfidence='UNVERIFIED';
 expect(()=>validateCalendarDefinition(bad)).toThrow('confidence');
});

test('old v5 careers and V4 migration stay on their pinned content; new v5 careers roundtrip v2 without schema change',()=>{
 const old=value(deserializeSave(JSON.stringify(v4),definition));expect(old.saveVersion).toBe(5);expect(old.universe.calendarId).toBe('calendar.2026.v1');
 expect(value(deserializeSave(value(serializeSave(old,definition)),definition))).toEqual(old);
 let a=old.universe,b=value(deserializeSave(value(serializeSave(old,definition)),definition)).universe;
 for(let w=0;w<12;w++){a=advanceUniverseWeek(a,definition);b=advanceUniverseWeek(b,definition);}
 expect(a).toEqual(b);expect(a.calendarId).toBe('calendar.2026.v1');
 const {gameVersion,saveId,createdAt,updatedAt}=old;
 const current=value(createSaveEnvelope(createGameUniverse(definition,17),{gameVersion,saveId,createdAt,updatedAt},definition));
 expect(current.saveVersion).toBe(5);expect(current.universe.calendarId).toBe('calendar.2026.v2');
 expect(value(deserializeSave(value(serializeSave(current,definition)),definition))).toEqual(current);
 const wrong=JSON.parse(JSON.stringify(current));wrong.universe.calendarId='calendar.2026.v3';expect(deserializeSave(JSON.stringify(wrong),definition).ok).toBe(false);
});

test('researched v2 is pinned separately from the untouched v1 contract',()=>{
 expect(createHash('sha256').update(readFileSync(join(__dirname,'../../game/calendar/calendar2026v2.json'))).digest('hex')).toBe('26709b17d508161135e0f19cd1d84ce4251893b9a4075fe17ee0cd283be9d368');
});
