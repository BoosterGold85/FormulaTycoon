import {calendarById} from '../../game/calendar';
import {campaignContext,compareCampaignDates,legacyWeekDate,type CampaignDate} from '../campaignTime';
import type {GameDefinition,GameUniverse} from '../universe/types';
import {advanceCampaignByDays,advanceCampaignTo} from '../universe';
import {qualifyingDate} from '../qualifying/campaign';
import {sessionAwaitingCall} from '../qualifying/commands';

export type TurnTarget = { date: CampaignDate; kind: 'MONDAY' | 'FP1' | 'QUALIFYING'; eventId?: string; venue?: string };
/**
 * Owner-approved weekly turn: the next development Monday or, if sooner, the next race weekend's
 * FP1. Derived from the one root date and the pinned calendar; never a second clock. Null when the
 * development season is complete (the season boundary needs results that do not exist yet).
 */
export function nextTurnTarget(universe: Pick<GameUniverse, 'currentDate' | 'calendarId'> & Partial<Pick<GameUniverse, 'qualifying' | 'drivers'>>): TurnTarget | null {
  const time = campaignContext(universe.currentDate);
  if (time.week >= 52) return null;
  const monday = legacyWeekDate(time.seasonIndex, time.week + 1);
  const calendar = calendarById(universe.calendarId);
  // Save v8 careers: after FP1 the next stop is Saturday qualifying.
  const saturday = universe.qualifying && universe.drivers ? calendar.events.find(e => compareCampaignDates(universe.currentDate, e.weekendStartDate) >= 0 &&
    compareCampaignDates(universe.currentDate, qualifyingDate(e)) < 0) : undefined;
  if (saturday) return { date: qualifyingDate(saturday), kind: 'QUALIFYING', eventId: saturday.id, venue: calendar.tracks[saturday.trackId]!.name };
  const weekend = calendar.events.find(e => compareCampaignDates(e.weekendStartDate, universe.currentDate) > 0 && compareCampaignDates(e.weekendStartDate, monday) < 0);
  if (!weekend) return { date: monday, kind: 'MONDAY' };
  return { date: weekend.weekendStartDate, kind: 'FP1', eventId: weekend.id, venue: calendar.tracks[weekend.trackId]!.name };
}

/**
 * Player decisions that must be answered before the player's turn may advance. Only the player's own
 * PENDING domain events count (rivals decide by policy when an event is raised). The released kernel
 * default (first option at the next development week) is unchanged and still applies to any
 * non-player advancement path, e.g. headless simulation.
 */
export function blockingDecisions(universe: Pick<GameUniverse, 'playerTeamId' | 'development'>): string[] {
  const team = universe.playerTeamId ? universe.development.teams[universe.playerTeamId] : undefined;
  return (team?.projects ?? []).filter(p => p.events?.some(e => e.choice === null)).map(p => p.id);
}
export type PlayerTurnResult =
  | { ok: true; universe: GameUniverse; target: TurnTarget }
  | { ok: false; reason: 'DECISION_REQUIRED'; projectIds: string[] }
  | { ok: false; reason: 'QUALIFYING_PLAN_REQUIRED' | 'QUALIFYING_CALL_REQUIRED'; eventId: string }
  | { ok: false; reason: 'SEASON_COMPLETE' };
/** Qualifying gates the player's turn like an open decision: lock a plan before Saturday, answer each call. */
function qualifyingGate(universe: GameUniverse, target: TurnTarget): PlayerTurnResult | null {
  if (!universe.playerTeamId || !universe.qualifying) return null;
  const waiting = sessionAwaitingCall(universe);
  if (waiting) return { ok: false, reason: 'QUALIFYING_CALL_REQUIRED', eventId: waiting.eventId };
  if (target.kind === 'QUALIFYING' && !universe.qualifying.sessions[target.eventId!]?.planLocked) return { ok: false, reason: 'QUALIFYING_PLAN_REQUIRED', eventId: target.eventId! };
  return null;
}
/** The player's Continue: gated by unanswered decisions, then exactly one pass of the D0 pipeline. */
export function continuePlayerTurn(universe: GameUniverse, definition: GameDefinition): PlayerTurnResult {
  const blocked = blockingDecisions(universe);
  if (blocked.length) return { ok: false, reason: 'DECISION_REQUIRED', projectIds: blocked };
  const target = nextTurnTarget(universe);
  if (!target) return { ok: false, reason: 'SEASON_COMPLETE' };
  const gate = qualifyingGate(universe, target);
  if (gate) return gate;
  return { ok: true, universe: advanceCampaignTo(universe, definition, target.date), target };
}
/** The player's single-day step, under the same gate. */
export function advancePlayerDay(universe: GameUniverse, definition: GameDefinition): PlayerTurnResult {
  const blocked = blockingDecisions(universe);
  if (blocked.length) return { ok: false, reason: 'DECISION_REQUIRED', projectIds: blocked };
  const target = nextTurnTarget(universe);
  if (!target) return { ok: false, reason: 'SEASON_COMPLETE' };
  const gate = qualifyingGate(universe, target);
  if (gate) return gate;
  return { ok: true, universe: advanceCampaignByDays(universe, definition, 1), target };
}
