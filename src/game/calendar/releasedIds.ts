/** Append-only released static-content identities. Default selection never changes saved identity. */
export const RELEASED_CALENDAR_IDS=Object.freeze(['calendar.2026.v1','calendar.2026.v2'] as const);
export function isReleasedCalendarId(id:unknown):id is string {
 return typeof id==='string'&&(RELEASED_CALENDAR_IDS as readonly string[]).includes(id);
}
