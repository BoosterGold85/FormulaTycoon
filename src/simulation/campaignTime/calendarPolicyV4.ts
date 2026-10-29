/** Released v4 compatibility policy. Preserve this mapping when later calendars are introduced.
 * Pure date arithmetic is shared; season/week interpretation is version-specific, not ISO.
 */
import {parseCampaignDate,calendarYear,compareCampaignDates,daysBetween,addCampaignDays,type CampaignDate} from './date';
export const NEW_CAREER_DATE=parseCampaignDate('2026-03-02');
/** Temporary pre-event-calendar phase policy, deliberately distinct from calendarYear. */
export function seasonStart(year:number):CampaignDate {return parseCampaignDate(`${String(year).padStart(4,'0')}-03-02`);}
export function activeChampionshipSeason(date:CampaignDate):number {
 const year=calendarYear(date);return compareCampaignDates(date,seasonStart(year))<0?year-1:year;
}
export function campaignContext(date:CampaignDate) {
 const season=activeChampionshipSeason(date);
 if(season<2026)throw new Error('Campaign date precedes supported career');
 return {season,seasonIndex:season-2025,week:Math.min(52,Math.floor(daysBetween(seasonStart(season),date)/7))};
}
/** Explicit historical completed-week mapping, not ISO week numbering. */
export function legacyWeekDate(seasonIndex:number,week:number):CampaignDate {
 if(!Number.isInteger(seasonIndex)||seasonIndex<1||seasonIndex>7974||!Number.isInteger(week)||week<0||week>52)throw new Error('Invalid legacy calendar');
 return addCampaignDays(seasonStart(2025+seasonIndex),week*7);
}
