import {calendarById,type CalendarDefinition,type CalendarEvent} from '../../game/calendar';
import {compareCampaignDates,daysBetween,formatCampaignDate,type CampaignDate} from '../campaignTime/date';
import type {GameUniverse} from '../universe/types';

export function eventStatus(event:CalendarEvent,date:CampaignDate):'UPCOMING'|'THIS WEEKEND'|'COMPLETED' {
 return compareCampaignDates(date,event.weekendStartDate)<0?'UPCOMING':compareCampaignDates(date,event.raceDate)>0?'COMPLETED':'THIS WEEKEND';
}
/** Next means current weekend while inside it; otherwise the next future start. */
export function calendarWindow(calendar:CalendarDefinition,date:CampaignDate) {
 const current=calendar.events.find(e=>eventStatus(e,date)==='THIS WEEKEND')??null;
 const future=calendar.events.filter(e=>compareCampaignDates(e.weekendStartDate,date)>0);
 const previous=[...calendar.events].reverse().find(e=>compareCampaignDates(e.raceDate,date)<0)??null;
 const next=current??future[0]??null;
 return {current,next,previous,future,daysUntil:next?Math.max(0,daysBetween(date,next.weekendStartDate)):null};
}
export function eventDateLabel(event:CalendarEvent):string {
 const start=formatCampaignDate(event.weekendStartDate),end=formatCampaignDate(event.raceDate);
 return start.slice(0,3)===end.slice(0,3)
  ?`${start.split(',')[0]}–${end.split(',')[0]!.slice(4)}, ${end.split(', ')[1]}`
  :`${start.split(',')[0]}–${end}`;
}
export function calendarEventViews(calendar:CalendarDefinition,date:CampaignDate) {
 const {next}=calendarWindow(calendar,date);
 return calendar.events.map(e=>({...e,venue:calendar.tracks[e.trackId]!.name,country:calendar.tracks[e.trackId]!.country,
  dates:eventDateLabel(e),status:eventStatus(e,date),next:e.id===next?.id}));
}
export function selectNextEvent(universe:Pick<GameUniverse,'calendarId'|'currentDate'>) {
 const calendar=calendarById(universe.calendarId),window=calendarWindow(calendar,universe.currentDate);
 if(!window.next)return {venue:'Season complete',detail:'Calendar dates finished'};
 const track=calendar.tracks[window.next.trackId]!;
 return {venue:track.name,detail:`${eventDateLabel(window.next).replace(/, \d{4}$/,'')} · ${window.current?'This weekend':`${window.daysUntil} days`}`};
}
