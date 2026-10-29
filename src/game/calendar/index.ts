import data2026 from './calendar2026v1.json';
import type {CalendarDefinition} from './types';
import {validateCalendarDefinition} from '../../simulation/calendar/validation';
export * from './types';

function freeze<T>(value:T):T {
 if(value&&typeof value==='object'){Object.values(value).forEach(freeze);Object.freeze(value);}
 return value;
}
/** Released content, append-only IDs. Edits require a NEW version, never replacement in place. */
const CALENDAR_2026_V1=JSON.parse(JSON.stringify(data2026)) as CalendarDefinition;
validateCalendarDefinition(CALENDAR_2026_V1);
freeze(CALENDAR_2026_V1);
export const DEFAULT_CALENDAR_ID='calendar.2026.v1';
export function calendarById(id:string):CalendarDefinition {
 if(id!==CALENDAR_2026_V1.id)throw new Error('Unknown calendar content: explicit migration required');
 return CALENDAR_2026_V1;
}
