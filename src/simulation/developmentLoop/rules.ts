import {calendarById,type CalendarEvent} from '../../game/calendar';
import type {DevelopmentContext,GrandPrix} from '../../game/development';
import {campaignContext} from '../campaignTime';
import type {GameUniverse} from '../universe/types';

/**
 * Development rules version, persisted per career (save v6).
 * 1 = released 24-event compatibility cadence, unchanged kernel (all migrated careers).
 * 2 = real race-weekend fitting, real-calendar AI planning, events and quality bonus points (save v6).
 * 3 = rules 2 plus passive seeded weekly variation (normal/setback/breakthrough weeks), save v7.
 */
export type {DevelopmentRules} from '../universe/types';
import type {DevelopmentRules} from '../universe/types';
export const NEW_CAREER_DEVELOPMENT_RULES: DevelopmentRules = 3;

/** The career's pinned race weekends expressed in the shape the existing kernel already reads. */
export function careerGrandPrix(calendarId: string): GrandPrix[] {
  const calendar = calendarById(calendarId);
  return calendar.events.map(event => grandPrixFor(calendarId, event));
}
export function grandPrixFor(calendarId: string, event: CalendarEvent): GrandPrix {
  const track = calendarById(calendarId).tracks[event.trackId]!;
  return { id: event.id, name: track.name, week: campaignContext(event.weekendStartDate).week,
    downforce: track.packageContext.downforce, hot: track.packageContext.hot };
}
/** Rules 2: rival planning (last-race cutoff, package lookahead) reads real weekends. */
export function planningContext(context: DevelopmentContext, calendarId: string): DevelopmentContext {
  return { ...context, calendar: careerGrandPrix(calendarId) };
}
export const rulesOf = (universe: Pick<GameUniverse, 'developmentRules'>): DevelopmentRules => universe.developmentRules;
