import {calendarById} from '../../game/calendar';
import {teamBrand} from '../../game/brandRegistry';
import {formatCampaignDate} from '../campaignTime';
import type {GameDefinition,GameUniverse} from '../universe/types';
import {fieldAtTrack,segmentOf,sessionContext} from './campaign';
import {sessionAwaitingCall} from './commands';
import {bestTime,plannedSlots,segmentDrivers} from './session';
import {CHECKPOINT,FORMAT,NEW_SOFT_SETS,SEGMENTS,SESSION_MINUTES,type Call,type CallAction,type Forecast,type QualifyingSession,type Segment,
 type Timing,type Traffic,type Tyre} from './types';
import {recommendedCalls,recommendedPlans,upcomingBriefing} from './views';
import {CROSSOVER,wetnessAt} from './weather';

/** Display vocabulary. Read models only: nothing here is saved or changes a result. */
export const TYRE_LABEL: Record<Tyre | 'USED_MEDIUM', string> = { NEW_SOFT: 'New soft', USED_SOFT: 'Used soft', MEDIUM: 'Medium', USED_MEDIUM: 'Used medium', INTER: 'Inters' };
export const TIMING_LABEL: Record<Timing, string> = { EARLY: 'Early', MIDDLE: 'Middle', LATE: 'Late' };
export const TRAFFIC_LABEL: Record<Traffic, string> = { FIND_SPACE: 'Find space', PUSH: 'Push through' };
export const CALL_LABEL: Record<CallAction, string> = { PLAN: 'Stick to plan', GO_NOW: 'Go now', GO_LATE: 'Wait for the end', STAY_IN: 'Stay in' };

/** "Q2, about 6 minutes in" for a session minute. */
export function sessionMoment(minute: number): string {
  const seg = SEGMENTS.find(s => minute < FORMAT[s].offset + FORMAT[s].minutes) ?? 'Q3';
  return `${seg}, about ${Math.max(1, minute - FORMAT[seg].offset)} min in`;
}
export function forecastText(f: Forecast): { headline: string; detail: string; confidence: string } {
  const confidence = `${f.confidence.charAt(0)}${f.confidence.slice(1).toLowerCase()} confidence`;
  if (f.kind === 'DRY') return { headline: 'Dry session expected', detail: 'No rain in the forecast.', confidence };
  if (f.kind === 'RAIN') return { headline: 'Rain expected', detail: `Rain is due around ${sessionMoment(f.changeMinute!)}.`, confidence };
  return { headline: 'Wet start, drying', detail: `The track should start drying around ${sessionMoment(f.changeMinute!)}.`, confidence };
}
export const wetLabel = (wet: number) => wet <= 0 ? 'Dry' : wet < 0.2 ? 'Damp' : wet < CROSSOVER ? 'Drying, slicks marginal' : 'Wet, inters needed';
const driverName = (u: GameUniverse, id: string) => u.drivers!.drivers[id]!.name;
const team = (teamId: string) => { const b = teamBrand(teamId); return { teamId, team: b.name, color: b.colors.primary }; };

/** The pre-session plan screen: forecast, car fit, allowance and each of the player's cars with the recommendation. */
export function selectQualifyingPlan(universe: GameUniverse, definition: GameDefinition) {
  const briefing = upcomingBriefing(universe, definition);
  if (!briefing || !universe.playerTeamId) return null;
  const calendar = calendarById(universe.calendarId), event = calendar.events.find(e => e.id === briefing.eventId)!, track = calendar.tracks[event.trackId]!;
  const fit = fieldAtTrack(universe, definition, track)[universe.playerTeamId]!;
  const recommended = recommendedPlans(universe, definition);
  return { eventId: event.id, venue: track.name, round: event.round, sprint: event.sprint, date: formatCampaignDate(briefing.date), locked: briefing.planLocked,
    forecast: forecastText(briefing.forecasts[universe.playerTeamId]!),
    carFit: { standing: fit.rank <= 3 ? 'One of the quickest cars here' : fit.rank >= 8 ? 'One of the slower cars here' : 'A midfield car here', strengths: fit.strengths, concerns: fit.concerns },
    allowance: `${NEW_SOFT_SETS} new soft sets and 1 medium set per car; intermediates as needed.`,
    drivers: briefing.entrants.filter(e => e.teamId === universe.playerTeamId).map(e => ({ driverId: e.driverId, name: driverName(universe, e.driverId),
      plan: briefing.plans[e.driverId]!, recommended: recommended[e.driverId]! })) };
}

/** Global replay minute (0..45) at which the UI must stop: the open checkpoint, or the end. */
export function replayTarget(session: QualifyingSession): number {
  const seg = segmentOf(session.status);
  return seg ? FORMAT[seg].offset + CHECKPOINT[seg] : session.status === 'COMPLETE' ? SESSION_MINUTES : 0;
}
export const segmentAt = (minute: number): Segment => minute <= FORMAT.Q1.minutes ? 'Q1' : minute <= FORMAT.Q2.offset + FORMAT.Q2.minutes ? 'Q2' : 'Q3';

export type TowerRow = { driverId: string; name: string; teamId: string; team: string; color: string; mine: boolean; position: number;
  time: number | null; gap: string; state: 'TRACK' | 'GARAGE'; danger: boolean; out: boolean };
/**
 * The timing screen at a replay minute, built only from STORED laps: a lap's time is shown once its
 * flying lap has ended (out-lap slot + 2). Pure, so 1x/2x/Skip can never change what happened.
 */
export function towerAt(universe: GameUniverse, session: QualifyingSession, minute: number) {
  const seg = segmentAt(minute), result = session.segments[seg];
  const t = Math.max(0, Math.min(FORMAT[seg].minutes, minute - FORMAT[seg].offset));
  const drivers = result ? segmentDrivers(session, seg) : [];
  const shown = (result?.laps ?? []).filter(l => l.slot + 2 <= t && l.slot <= FORMAT[seg].minutes - 2);
  const best = new Map<string, number>();
  for (const l of shown) if (l.time !== null && (!best.has(l.driverId) || l.time < best.get(l.driverId)!)) best.set(l.driverId, l.time);
  const finished = t >= FORMAT[seg].minutes && result && result.order.length > 0;
  const order = finished ? result!.order : [...drivers].sort((a, b) => (best.get(a) ?? Infinity) - (best.get(b) ?? Infinity) || drivers.indexOf(a) - drivers.indexOf(b));
  const pole = best.get(order[0]!) ?? null, cut = FORMAT[seg].cars - FORMAT[seg].out;
  const onTrack = new Set((result?.laps ?? []).filter(l => l.slot <= t && t < l.slot + 3).map(l => l.driverId));
  const rows: TowerRow[] = order.map((id, i) => {
    const entrant = session.entrants.find(e => e.driverId === id)!, time = best.get(id) ?? null;
    return { driverId: id, name: driverName(universe, id), ...team(entrant.teamId), mine: entrant.teamId === universe.playerTeamId, position: i + 1, time,
      gap: time === null ? 'No time' : i === 0 ? 'Fastest' : `+${(time - pole!).toFixed(3)}`, state: onTrack.has(id) ? 'TRACK' : 'GARAGE',
      danger: seg !== 'Q3' && i >= cut, out: !!finished && seg !== 'Q3' && i >= cut };
  });
  const wet = wetnessAt(session.weather, Math.min(minute, SESSION_MINUTES - 1));
  return { segment: seg, minute: t, remaining: FORMAT[seg].minutes - t, cutoff: seg === 'Q3' ? null : cut, rows, finished: !!finished,
    track: { wet, label: wetLabel(wet) } };
}
/** Lap times are stored against a nominal reference lap, so only gaps are shown: never an invented circuit lap time. */

/** The checkpoint call card: where each of the player's cars stands, what tyres remain, and the recommendation. */
export function selectQualifyingCall(universe: GameUniverse, definition: GameDefinition) {
  const session = sessionAwaitingCall(universe);
  if (!session || !universe.playerTeamId) return null;
  const seg = segmentOf(session.status)!, now = FORMAT[seg].offset + CHECKPOINT[seg], tower = towerAt(universe, session, now);
  const ctx = sessionContext(universe, definition, session), recommended = recommendedCalls(universe, definition);
  const wet = wetnessAt(session.weather, now), before = wetnessAt(session.weather, Math.max(0, now - 3));
  const used = (id: string) => [...SEGMENTS.flatMap(s => session.segments[s]?.laps ?? [])].filter(l => l.driverId === id && l.tyre === 'NEW_SOFT').length;
  return { eventId: session.eventId, segment: seg, minute: CHECKPOINT[seg], remaining: FORMAT[seg].minutes - CHECKPOINT[seg], cutoff: tower.cutoff,
    track: { label: wetLabel(wet), trend: wet > before + 0.01 ? 'getting wetter' : wet < before - 0.01 ? 'drying' : 'steady', tyreChoice: wet > 0 || before > 0 },
    forecast: forecastText(session.forecasts[universe.playerTeamId]!),
    drivers: Object.keys(recommended).map(id => {
      const row = tower.rows.find(r => r.driverId === id)!, plan = session.plans[id]![seg];
      return { driverId: id, name: row.name, position: row.time === null ? null : row.position, gap: row.gap, danger: row.danger,
        newSoftsLeft: Math.max(0, NEW_SOFT_SETS - used(id)), plannedTyre: plan.tyre,
        plannedRunsLeft: plannedSlots(ctx, id, seg, plan).filter(s => s >= CHECKPOINT[seg]).length, recommended: recommended[id]! as Call };
    }) };
}

export type GridRow = { position: number; driverId: string; name: string; teamId: string; team: string; color: string; mine: boolean; gap: string; segment: Segment; reasons: string[] };
/** The final grid for a completed session, with each driver's stored reasons. */
export function selectQualifyingGrid(universe: GameUniverse, eventId: string): { venue: string; date: string; weather: string; rows: GridRow[] } | null {
  const session = universe.qualifying?.sessions[eventId];
  if (!session?.grid) return null;
  const calendar = calendarById(universe.calendarId), event = calendar.events.find(e => e.id === eventId)!;
  const fastest = (seg: Segment) => { const r = session.segments[seg]!; return bestTime(r.laps, r.order[0]!); };
  return { venue: calendar.tracks[event.trackId]!.name, date: formatCampaignDate(session.date),
    weather: session.weather.kind === 'DRY' ? 'Dry session' : session.weather.kind === 'RAIN' ? `Rain from ${sessionMoment(session.weather.changeMinute!)}` : `Wet start, drying from ${sessionMoment(session.weather.changeMinute!)}`,
    rows: session.grid.map(g => ({ position: g.position, driverId: g.driverId, name: driverName(universe, g.driverId), ...team(g.teamId), mine: g.teamId === universe.playerTeamId,
      gap: g.time === null ? 'No time' : g.position === 1 ? 'Pole' : `+${(g.time - (fastest(g.segment) ?? g.time)).toFixed(3)} in ${g.segment}`,
      segment: g.segment, reasons: g.reasons })) };
}
