import type {CircuitDefinition} from '../../game/calendar/types';
import {randomFor} from '../randomStreams';
import {CHECKPOINT,FORMAT,SEGMENTS,type QualifyingSession,type Segment,type SessionEvent,type Weather} from './types';

/** Earliest and latest call minute that still leaves a run before and after it. */
const callable = (seg: Segment, minute: number) => minute >= 2 && minute <= FORMAT[seg].minutes - 3;

/**
 * Events for a session, rolled once from the seed at the briefing (new stream 'qualifying-events', so no
 * earlier draw moves). A weather change inside a segment becomes that segment's call; otherwise a yellow flag
 * may be rolled, more often at circuits with a high safety-car tendency (provisional game weights).
 */
export function rollEvents(seed: number, calendarId: string, eventId: string, track: CircuitDefinition, weather: Weather): SessionEvent[] {
  const events: SessionEvent[] = [];
  for (const seg of SEGMENTS) {
    const start = FORMAT[seg].offset, D = FORMAT[seg].minutes;
    if (weather.kind !== 'DRY' && weather.changeMinute !== null && weather.changeMinute >= start && weather.changeMinute < start + D) {
      const minute = weather.changeMinute - start;
      if (callable(seg, minute)) { events.push({ segment: seg, kind: weather.kind, minute }); continue; }
    }
    const rng = randomFor(seed, 'qualifying-events', calendarId, eventId, seg);
    if (rng.next() < 0.12 + 0.3 * track.metadata.safetyCarTendency) {
      const flagMinute = rng.int(3, D - 3);
      events.push({ segment: seg, kind: 'YELLOW', minute: flagMinute - 1, sector: rng.int(0, 2) });
    }
  }
  return events;
}
export const eventOf = (session: Pick<QualifyingSession, 'events'>, seg: Segment) => session.events.find(e => e.segment === seg);
/** The minute of a segment's one call: its event, else the fallback checkpoint. */
export const callMinute = (session: Pick<QualifyingSession, 'events'>, seg: Segment) => eventOf(session, seg)?.minute ?? CHECKPOINT[seg];
/** A segment's yellow flag: the minute it is out (flying laps then are affected) and its sector. */
export function yellowOf(session: Pick<QualifyingSession, 'events'>, seg: Segment): { minute: number; sector: number; call: number } | null {
  const e = eventOf(session, seg);
  return e?.kind === 'YELLOW' ? { minute: e.minute + 1, sector: e.sector!, call: e.minute } : null;
}
