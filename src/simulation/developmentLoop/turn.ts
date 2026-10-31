import {calendarById} from '../../game/calendar';
import {campaignContext,compareCampaignDates,legacyWeekDate,type CampaignDate} from '../campaignTime';
import type {GameUniverse} from '../universe/types';

export type TurnTarget = { date: CampaignDate; kind: 'MONDAY' | 'FP1'; eventId?: string; venue?: string };
/**
 * Owner-approved weekly turn: the next development Monday or, if sooner, the next race weekend's
 * FP1. Derived from the one root date and the pinned calendar; never a second clock. Null when the
 * development season is complete (the season boundary needs results that do not exist yet).
 */
export function nextTurnTarget(universe: Pick<GameUniverse, 'currentDate' | 'calendarId'>): TurnTarget | null {
  const time = campaignContext(universe.currentDate);
  if (time.week >= 52) return null;
  const monday = legacyWeekDate(time.seasonIndex, time.week + 1);
  const calendar = calendarById(universe.calendarId);
  const weekend = calendar.events.find(e => compareCampaignDates(e.weekendStartDate, universe.currentDate) > 0 && compareCampaignDates(e.weekendStartDate, monday) < 0);
  if (!weekend) return { date: monday, kind: 'MONDAY' };
  return { date: weekend.weekendStartDate, kind: 'FP1', eventId: weekend.id, venue: calendar.tracks[weekend.trackId]!.name };
}
