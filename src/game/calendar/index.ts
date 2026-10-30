import data2026 from './calendar2026v1.json';
import researched2026 from './calendar2026v2.json';
import type {CalendarDefinition} from './types';
import {validateCalendarDefinition} from '../../simulation/calendar/validation';
export * from './types';

function freeze<T>(value:T):T {
 if(value&&typeof value==='object'){Object.values(value).forEach(freeze);Object.freeze(value);}
 return value;
}
/** Released content, append-only IDs. Edits require a NEW version, never replacement in place. */
const CALENDARS=[data2026,researched2026].map(data=>{
 const calendar=JSON.parse(JSON.stringify(data)) as CalendarDefinition;
 validateCalendarDefinition(calendar);return freeze(calendar);
});
export const DEFAULT_CALENDAR_ID='calendar.2026.v2';
export function calendarById(id:string):CalendarDefinition {
 const calendar=CALENDARS.find(c=>c.id===id);
 if(!calendar)throw new Error('Unknown calendar content: explicit migration required');
 return calendar;
}
