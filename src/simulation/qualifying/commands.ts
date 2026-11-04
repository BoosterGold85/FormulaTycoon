import {calendarById} from '../../game/calendar';
import {compareCampaignDates} from '../campaignTime';
import type {GameDefinition,GameUniverse} from '../universe/types';
import {ensureBriefing,progressSession,qualifyingDate,segmentOf,usesQualifying} from './campaign';
import {segmentDrivers} from './session';
import {SEGMENTS,type Call,type DriverPlan,type QualifyingSession} from './types';

export type QualifyingFailure = 'NO_PLAYER_TEAM' | 'NO_QUALIFYING' | 'NOT_PLANNING' | 'NO_CALL' | 'INVALID_PLAN' | 'INVALID_CALL';
export type QualifyingResult = { ok: true; universe: GameUniverse } | { ok: false; reason: QualifyingFailure };

const TYRES = ['NEW_SOFT', 'USED_SOFT', 'MEDIUM', 'INTER'], TIMINGS = ['EARLY', 'MIDDLE', 'LATE'], TRAFFIC = ['FIND_SPACE', 'PUSH'];
const ACTIONS = ['PLAN', 'GO_NOW', 'GO_LATE', 'STAY_IN'];
const own = (o: object, k: string) => Object.prototype.hasOwnProperty.call(o, k);
function validPlan(plan: unknown): plan is DriverPlan {
  if (!plan || typeof plan !== 'object') return false;
  const p = plan as Record<string, unknown>;
  return Object.keys(p).length === 3 && SEGMENTS.every(seg => {
    const s = p[seg] as Record<string, unknown> | undefined;
    return !!s && typeof s === 'object' && Object.keys(s).length === 4 && TYRES.includes(s.tyre as string) && (s.runs === 1 || s.runs === 2) &&
      TIMINGS.includes(s.timing as string) && TRAFFIC.includes(s.traffic as string);
  });
}
function validCall(call: unknown): call is Call {
  if (!call || typeof call !== 'object') return false;
  const c = call as Record<string, unknown>;
  return ACTIONS.includes(c.action as string) && Object.keys(c).every(k => k === 'action' || k === 'tyre') && (!own(c, 'tyre') || TYRES.includes(c.tyre as string));
}

/** The weekend whose qualifying the player can plan right now: after FP1, before Saturday. */
export function plannableEvent(universe: GameUniverse) {
  return calendarById(universe.calendarId).events.find(e => compareCampaignDates(universe.currentDate, e.weekendStartDate) >= 0 &&
    compareCampaignDates(universe.currentDate, qualifyingDate(e)) < 0);
}
/** The session waiting for the player's call today, if any. */
export function sessionAwaitingCall(universe: Pick<GameUniverse, 'qualifying' | 'currentDate'>): QualifyingSession | null {
  return Object.values(universe.qualifying?.sessions ?? {}).find(s => s.date === universe.currentDate && segmentOf(s.status) !== null) ?? null;
}

/** Lock (or re-lock) the plan for the player's two cars. Allowed from FP1 until the session starts. */
export function setQualifyingPlan(universe: GameUniverse, definition: GameDefinition, plans: Record<string, DriverPlan>): QualifyingResult {
  if (!universe.playerTeamId) return { ok: false, reason: 'NO_PLAYER_TEAM' };
  if (!usesQualifying(universe)) return { ok: false, reason: 'NO_QUALIFYING' };
  const event = plannableEvent(universe);
  if (!event) return { ok: false, reason: 'NOT_PLANNING' };
  const briefed = ensureBriefing(universe, definition, event), session = briefed.qualifying!.sessions[event.id]!;
  if (session.status !== 'PLANNING') return { ok: false, reason: 'NOT_PLANNING' };
  const mine = session.entrants.filter(e => e.teamId === universe.playerTeamId).map(e => e.driverId);
  if (Object.keys(plans).length !== mine.length || !mine.every(id => own(plans, id) && validPlan(plans[id]))) return { ok: false, reason: 'INVALID_PLAN' };
  const copy = JSON.parse(JSON.stringify(plans)) as Record<string, DriverPlan>;
  const next: QualifyingSession = { ...session, plans: { ...session.plans, ...copy }, planLocked: true };
  return { ok: true, universe: { ...briefed, qualifying: { ...briefed.qualifying!, sessions: { ...briefed.qualifying!.sessions, [event.id]: next } } } };
}

/** Answer the checkpoint call for the player's cars still in the segment; the session runs on to the next call. */
export function answerQualifyingCall(universe: GameUniverse, definition: GameDefinition, calls: Record<string, Call>): QualifyingResult {
  if (!universe.playerTeamId) return { ok: false, reason: 'NO_PLAYER_TEAM' };
  const session = sessionAwaitingCall(universe);
  if (!session) return { ok: false, reason: 'NO_CALL' };
  const seg = segmentOf(session.status)!;
  const mine = segmentDrivers(session, seg).filter(id => session.entrants.find(e => e.driverId === id)!.teamId === universe.playerTeamId);
  if (Object.keys(calls).length !== mine.length || !mine.every(id => own(calls, id) && validCall(calls[id]))) return { ok: false, reason: 'INVALID_CALL' };
  const copy = JSON.parse(JSON.stringify(calls)) as Record<string, Call>;
  return { ok: true, universe: progressSession(universe, definition, session.eventId, { playerCalls: copy }) };
}
