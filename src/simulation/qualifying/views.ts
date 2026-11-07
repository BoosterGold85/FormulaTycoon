import {calendarById} from '../../game/calendar';
import type {GameDefinition,GameUniverse} from '../universe/types';
import {createBriefing,defaultCall,sessionContext,segmentOf} from './campaign';
import {answerQualifyingCall,continueQualifying,plannableEvent,sessionAtBreak,sessionAwaitingCall,setQualifyingPlan} from './commands';
import {classify,segmentDrivers} from './session';
import type {Call,DriverPlan,QualifyingSession} from './types';

/** The weekend's briefing as it stands (saved, or the identical one Saturday would create). Read model only. */
export function upcomingBriefing(universe: GameUniverse, definition: GameDefinition): QualifyingSession | null {
  if (!universe.qualifying || !universe.drivers) return null;
  const event = plannableEvent(universe);
  if (!event) return null;
  return universe.qualifying.sessions[event.id] ?? createBriefing(universe, definition, event);
}
/** What the team's strategists recommend for the player's cars (the policy plan). */
export function recommendedPlans(universe: GameUniverse, definition: GameDefinition): Record<string, DriverPlan> {
  const briefing = upcomingBriefing(universe, definition);
  if (!briefing || !universe.playerTeamId) return {};
  const ctxFree = createBriefing(universe, definition, calendarById(universe.calendarId).events.find(e => e.id === briefing.eventId)!);
  return Object.fromEntries(briefing.entrants.filter(e => e.teamId === universe.playerTeamId).map(e => [e.driverId, ctxFree.plans[e.driverId]!]));
}
/** The pit wall's recommended call for each of the player's cars at the current checkpoint. */
export function recommendedCalls(universe: GameUniverse, definition: GameDefinition): Record<string, Call> {
  const session = sessionAwaitingCall(universe);
  if (!session || !universe.playerTeamId) return {};
  const seg = segmentOf(session.status)!, ctx = sessionContext(universe, definition, session), drivers = segmentDrivers(session, seg);
  const provisional = classify(ctx, seg, drivers, session.segments[seg]!.laps);
  return Object.fromEntries(drivers.filter(id => ctx.entrants[id]!.teamId === universe.playerTeamId).map(id => [id, defaultCall(ctx, session, seg, id, provisional)]));
}
/** Accept every recommendation for the current weekend step (lock the plan, answer the call, or continue from a break). */
export function acceptRecommendation(universe: GameUniverse, definition: GameDefinition): GameUniverse | null {
  if (sessionAtBreak(universe)) {
    const r = continueQualifying(universe, definition);
    return r.ok ? r.universe : null;
  }
  if (sessionAwaitingCall(universe)) {
    const r = answerQualifyingCall(universe, definition, recommendedCalls(universe, definition));
    return r.ok ? r.universe : null;
  }
  if (plannableEvent(universe) && !universe.qualifying?.sessions[plannableEvent(universe)!.id]?.planLocked) {
    const r = setQualifyingPlan(universe, definition, recommendedPlans(universe, definition));
    return r.ok ? r.universe : null;
  }
  return null;
}
