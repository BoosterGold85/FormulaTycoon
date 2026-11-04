import {calendarById,type CalendarEvent,type CircuitDefinition} from '../../game/calendar';
import {addCampaignDays,type CampaignDate} from '../campaignTime';
import {activeContracts} from '../drivers/contracts';
import {AXIS_LABELS,evaluateTeamAtTrack} from '../trackPerformance';
import type {GameDefinition,GameUniverse} from '../universe/types';
import {carPace,driverPace} from './pace';
import {policyCall,policyPlan} from './policy';
import {reasonsFor,type FitNote} from './reasons';
import {bestTime,classify,plannedSlots,runAfterCheckpoint,runBeforeCheckpoint,segmentDrivers,type SessionContext} from './session';
import {CHECKPOINT,FORMAT,SEGMENTS,type Call,type DriverPlan,type GridEntry,type QualifyingLap,type QualifyingSession,type QualifyingState,type Segment,type SessionStatus} from './types';
import {sessionWeather,teamForecast,wetnessAt} from './weather';

/** Saturday qualifying: the day after the weekend's FP1, for normal and Sprint weekends alike (V1). */
export const qualifyingDate = (event: CalendarEvent): CampaignDate => addCampaignDays(event.weekendStartDate, 1);
export const qualifyingEventOn = (calendarId: string, date: CampaignDate) => calendarById(calendarId).events.find(e => qualifyingDate(e) === date);
export const usesQualifying = (universe: Pick<GameUniverse, 'qualifying' | 'drivers'>): boolean => !!universe.qualifying && !!universe.drivers;

const callStatus: Record<Segment, SessionStatus> = { Q1: 'Q1_CALL', Q2: 'Q2_CALL', Q3: 'Q3_CALL' };
export const segmentOf = (status: SessionStatus): Segment | null => status === 'Q1_CALL' ? 'Q1' : status === 'Q2_CALL' ? 'Q2' : status === 'Q3_CALL' ? 'Q3' : null;
const trackOf = (universe: GameUniverse, eventId: string): CircuitDefinition => {
  const calendar = calendarById(universe.calendarId), event = calendar.events.find(e => e.id === eventId);
  if (!event) throw new Error('Unknown qualifying event');
  return calendar.tracks[event.trackId]!;
};

/** Car standing per team at this circuit (0 = quickest), from the fitted car. Derived, never saved. */
export function fieldAtTrack(universe: GameUniverse, definition: GameDefinition, track: CircuitDefinition): Record<string, FitNote & { pace: number }> {
  const paces = definition.development.teams.map(t => ({ teamId: t.id, pace: carPace(universe, definition, t.id, track) }))
    .sort((a, b) => b.pace - a.pace || (a.teamId < b.teamId ? -1 : 1));
  return Object.fromEntries(paces.map((p, rank) => {
    const fit = evaluateTeamAtTrack(universe, definition, p.teamId, track);
    // One-lap story: reliability and cooling are hazards, not pace, so they are not cited as fit.
    const pace = (label: string) => label !== AXIS_LABELS.reliability && label !== AXIS_LABELS.cooling;
    return [p.teamId, { rank, pace: p.pace, strengths: fit.strengths.filter(pace), concerns: fit.concerns.filter(pace) }];
  }));
}

export function sessionContext(universe: GameUniverse, definition: GameDefinition, session: QualifyingSession): SessionContext {
  const track = trackOf(universe, session.eventId), field = fieldAtTrack(universe, definition, track);
  const entrants: SessionContext['entrants'] = {};
  for (const e of session.entrants) {
    const driver = universe.drivers!.drivers[e.driverId]!;
    entrants[e.driverId] = { ...e, car: field[e.teamId]!.pace, pace: driverPace(driver, universe, definition, e.teamId), driver };
  }
  return { seed: universe.seed, calendarId: universe.calendarId, eventId: session.eventId, evolution: track.metadata.trackEvolution, weather: session.weather, entrants };
}

/** The race-seat lineup: two cars per team, in team then seat order. A valid career always has 22. */
function lineup(universe: GameUniverse, definition: GameDefinition, date: CampaignDate) {
  const contracts = activeContracts(universe.drivers!, date);
  const entrants = definition.development.teams.flatMap(t => contracts.filter(c => c.teamId === t.id && c.seat !== null)
    .sort((a, b) => a.seat! - b.seat!).map(c => ({ driverId: c.driverId, teamId: t.id })));
  const counts = definition.development.teams.map(t => entrants.filter(e => e.teamId === t.id).length);
  if (entrants.length !== FORMAT.Q1.cars || counts.some(n => n !== 2) || new Set(entrants.map(e => e.driverId)).size !== entrants.length)
    throw new Error('Qualifying needs exactly two race drivers per team');
  return entrants;
}

/** The FP1 briefing: actual weather (hidden from teams), each team's own forecast and every car's default plan. */
export function createBriefing(universe: GameUniverse, definition: GameDefinition, event: CalendarEvent): QualifyingSession {
  const state = universe.qualifying!, track = calendarById(universe.calendarId).tracks[event.trackId]!;
  const weather = sessionWeather(universe.seed, universe.calendarId, event.id, track);
  const date = qualifyingDate(event), entrants = lineup(universe, definition, date), field = fieldAtTrack(universe, definition, track);
  const forecasts = Object.fromEntries(definition.development.teams.map(t =>
    [t.id, teamForecast(universe.seed, universe.calendarId, event.id, t.id, weather, state.researchPoints[t.id] ?? 0)]));
  const plans: Record<string, DriverPlan> = {};
  for (const e of entrants) {
    const profile = definition.development.teams.find(t => t.id === e.teamId)!;
    plans[e.driverId] = policyPlan({ carRank: field[e.teamId]!.rank, aggression: profile.aggression, forecast: forecasts[e.teamId]! });
  }
  return { eventId: event.id, date, status: 'PLANNING', weather, forecasts, entrants, plans, planLocked: false, segments: {}, grid: null };
}

const withSession = (universe: GameUniverse, session: QualifyingSession): GameUniverse =>
  ({ ...universe, qualifying: { ...universe.qualifying!, sessions: { ...universe.qualifying!.sessions, [session.eventId]: session } } });
export function ensureBriefing(universe: GameUniverse, definition: GameDefinition, event: CalendarEvent): GameUniverse {
  if (universe.qualifying!.sessions[event.id]) return universe;
  return withSession(universe, createBriefing(universe, definition, event));
}

/** Policy call for one driver at the checkpoint, from the shared timing screen and the team's own forecast. */
export function defaultCall(ctx: SessionContext, session: QualifyingSession, seg: Segment, driverId: string, provisional: string[]): Call {
  // Only what the timing screen shows at the call: laps already finished (cars still on a flying lap are unknown).
  const segLaps = session.segments[seg]!.laps.filter(l => l.slot + 2 <= CHECKPOINT[seg]), plan = session.plans[driverId]![seg];
  const hasTime = bestTime(segLaps, driverId) !== null;
  const timed = classify(ctx, seg, provisional, segLaps).filter(id => bestTime(segLaps, id) !== null);
  const now = FORMAT[seg].offset + CHECKPOINT[seg], remaining = plannedSlots(ctx, driverId, seg, plan).filter(s => s >= CHECKPOINT[seg]);
  return policyCall({ segment: seg, position: hasTime ? timed.indexOf(driverId) + 1 : null, hasTime, timedCars: timed.length,
    remainingRuns: remaining.length, nextRunMinute: remaining.length ? FORMAT[seg].offset + remaining[0]! + 1 : null, plannedTyre: plan.tyre,
    wetNow: wetnessAt(session.weather, now), wetBefore: wetnessAt(session.weather, Math.max(0, now - 3)), forecast: session.forecasts[ctx.entrants[driverId]!.teamId]! });
}

function buildGrid(universe: GameUniverse, definition: GameDefinition, session: QualifyingSession): GridEntry[] {
  const field = fieldAtTrack(universe, definition, trackOf(universe, session.eventId));
  const q1 = session.segments.Q1!.order, q2 = session.segments.Q2!.order, q3 = session.segments.Q3!.order;
  const rows: Array<{ driverId: string; segment: Segment }> = [...q3.map(d => ({ driverId: d, segment: 'Q3' as const })),
    ...q2.slice(FORMAT.Q3.cars).map(d => ({ driverId: d, segment: 'Q2' as const })), ...q1.slice(FORMAT.Q2.cars).map(d => ({ driverId: d, segment: 'Q1' as const }))];
  return rows.map((r, i) => {
    const teamId = session.entrants.find(e => e.driverId === r.driverId)!.teamId;
    return { position: i + 1, driverId: r.driverId, teamId, time: bestTime(session.segments[r.segment]!.laps, r.driverId), segment: r.segment,
      reasons: reasonsFor(session, r.driverId, r.segment, field[teamId]!) };
  });
}

/**
 * Runs the session forward until the player's next call is needed or it is complete. finish=true
 * (headless, or leaving Saturday) fills any missing player call with the policy answer, marked defaulted.
 * A completed segment is never recomputed.
 */
export function progressSession(universe: GameUniverse, definition: GameDefinition, eventId: string,
  opts: { playerCalls?: Record<string, Call>; finish?: boolean } = {}): GameUniverse {
  let session: QualifyingSession | undefined = universe.qualifying!.sessions[eventId];
  if (!session || session.status === 'COMPLETE') return universe;
  const ctx = sessionContext(universe, definition, session);
  let pending = opts.playerCalls;
  for (;;) {
    if (session.status === 'PLANNING') {
      session = { ...session, status: 'Q1_CALL', segments: { Q1: { calls: {}, laps: runBeforeCheckpoint(ctx, session, 'Q1'), order: [] } } };
      continue;
    }
    const seg: Segment = segmentOf(session.status)!;
    const drivers = segmentDrivers(session, seg);
    const mine = drivers.filter(id => ctx.entrants[id]!.teamId === universe.playerTeamId);
    if (mine.length && !pending && !opts.finish) break;
    const provisional = classify(ctx, seg, drivers, session.segments[seg]!.laps);
    const calls: Record<string, Call & { defaulted: boolean }> = {};
    for (const id of drivers) {
      const player = mine.includes(id), given = player ? pending?.[id] : undefined;
      calls[id] = { ...(given ?? defaultCall(ctx, session, seg, id, provisional)), defaulted: player && !given };
    }
    pending = undefined;
    const laps: QualifyingLap[] = [...session.segments[seg]!.laps, ...runAfterCheckpoint(ctx, session, seg, calls)];
    session = { ...session, segments: { ...session.segments, [seg]: { calls, laps, order: classify(ctx, seg, drivers, laps) } } };
    if (seg === 'Q3') {
      session = { ...session, status: 'COMPLETE' };
      session = { ...session, grid: buildGrid(universe, definition, session) };
      break;
    }
    const next = SEGMENTS[SEGMENTS.indexOf(seg) + 1]!;
    session = { ...session, status: callStatus[next], segments: { ...session.segments, [next]: { calls: {}, laps: runBeforeCheckpoint(ctx, session, next), order: [] } } };
  }
  return withSession(universe, session);
}

/** Campaign instruction on entering Saturday: brief if needed, then run to the player's first call. */
export function runQualifyingDay(universe: GameUniverse, definition: GameDefinition, eventId: string): GameUniverse {
  const event = calendarById(universe.calendarId).events.find(e => e.id === eventId)!;
  const briefed = ensureBriefing(universe, definition, event);
  if (briefed.qualifying!.sessions[eventId]!.status !== 'PLANNING') return briefed;
  return progressSession(briefed, definition, eventId, { finish: !universe.playerTeamId });
}
/** Campaign instruction on leaving Saturday: an open session finishes on policy calls. Never invents a missing session. */
export function closeQualifying(universe: GameUniverse, definition: GameDefinition, eventId: string): GameUniverse {
  return universe.qualifying!.sessions[eventId] ? progressSession(universe, definition, eventId, { finish: true }) : universe;
}

export const emptyQualifyingState = (definition: GameDefinition): QualifyingState =>
  ({ rules: 1, researchPoints: Object.fromEntries(definition.development.teams.map(t => [t.id, 0])), sessions: {} });
