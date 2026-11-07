import {calendarById} from '../game/calendar';
import type {GameDefinition} from '../simulation/universe';
import {compareCampaignDates,parseCampaignDate,type CampaignDate} from '../simulation/campaignTime';
import {qualifyingDate} from '../simulation/qualifying/campaign';
import {FORMAT,SEGMENTS,SESSION_MINUTES,type Segment} from '../simulation/qualifying/types';
import {array,choice,nullable,number,object,requireValid,text,type Check} from './validation';

/** Frozen Qualifying V1 vocabulary (save v8). Changing any of it needs a new save or qualifying rules version. */
const TYRES = ['NEW_SOFT', 'USED_SOFT', 'MEDIUM', 'INTER'];
const LAP_TYRES = [...TYRES, 'USED_MEDIUM'];
const STATUS = ['PLANNING', 'Q1_CALL', 'Q1_BREAK', 'Q2_CALL', 'Q2_BREAK', 'Q3_CALL', 'COMPLETE'];
const bool: Check = (v, p) => requireValid(typeof v === 'boolean', p);
const segmentPlan = object({ tyre: choice(TYRES), runs: choice([1, 2]), timing: choice(['EARLY', 'MIDDLE', 'LATE']), traffic: choice(['FIND_SPACE', 'PUSH']) });
const driverPlan = object({ Q1: segmentPlan, Q2: segmentPlan, Q3: segmentPlan });
const minute = number(0, SESSION_MINUTES - 1, true);
const forecast = object({ kind: choice(['DRY', 'RAIN', 'DRYING']), changeMinute: nullable(minute), confidence: choice(['LOW', 'MEDIUM', 'HIGH']) });
const call = object({ action: choice(['PLAN', 'GO_NOW', 'GO_LATE', 'STAY_IN', 'WAIT_CLEAN']), tyre: choice(TYRES), yellow: choice(['ABORT', 'PUSH']), defaulted: bool }, ['tyre', 'yellow']);
const lap = (seg: Segment, drivers: string[]) => object({ driverId: choice(drivers), slot: number(0, FORMAT[seg].minutes + 1, true), tyre: choice(LAP_TYRES),
  time: nullable(number(0, 1000)), sectors: (v, p) => { array(nullable(number(0, 1000)))(v, p); requireValid((v as unknown[]).length === 3, p); },
  traffic: number(0, 5), mistake: bool, wet: number(0, 1), flag: choice(['YELLOW_LIFT', 'DELETED', 'ABORTED', 'RED']) }, ['flag']);
const keysAre = (v: unknown, keys: string[], p: string) => {
  requireValid(v && typeof v === 'object' && !Array.isArray(v), p);
  const own = Object.keys(v as object);
  requireValid(own.length === keys.length && keys.every(k => own.includes(k)), p);
};
const isPermutation = (a: unknown, b: string[]) => Array.isArray(a) && a.length === b.length && new Set(a).size === a.length && a.every(x => b.includes(x as string));

function validateSession(raw: unknown, path: string, eventId: string, root: { current: CampaignDate; calendarId: string; teams: string[]; drivers: string[] }): void {
  object({ eventId: choice([eventId]), date: text, status: choice(STATUS), weather: object({ kind: choice(['DRY', 'RAIN', 'DRYING']), changeMinute: nullable(minute) }),
    events: array(object({ segment: choice(SEGMENTS), kind: choice(['RAIN', 'DRYING', 'YELLOW', 'RED']), minute: number(2, 15, true), sector: number(0, 2, true) }, ['sector'])),
    forecasts: v => keysAre(v, root.teams, `${path}.forecasts`), entrants: array(object({ driverId: choice(root.drivers), teamId: choice(root.teams) })),
    plans: v => requireValid(v && typeof v === 'object', `${path}.plans`), planLocked: bool, segments: v => requireValid(v && typeof v === 'object' && !Array.isArray(v), `${path}.segments`),
    grid: v => requireValid(v === null || Array.isArray(v), `${path}.grid`) })(raw, path);
  const s = raw as Record<string, any>;
  const event = calendarById(root.calendarId).events.find(e => e.id === eventId)!;
  requireValid(parseCampaignDate(s.date) === qualifyingDate(event), `${path}.date`);
  requireValid((s.weather.kind === 'DRY') === (s.weather.changeMinute === null), `${path}.weather`);
  for (const t of root.teams) forecast(s.forecasts[t], `${path}.forecasts.${t}`);
  // Events: at most one per segment, a callable minute, a weather event matching the weather, sectors only for yellows.
  const evs = s.events as Array<{ segment: Segment; kind: string; minute: number; sector?: number }>;
  requireValid(new Set(evs.map(e => e.segment)).size === evs.length, `${path}.events.duplicate`);
  for (const e of evs) {
    requireValid(e.minute <= FORMAT[e.segment].minutes - 3 && (e.kind === 'YELLOW') === (e.sector !== undefined), `${path}.events.shape`);
    if (e.kind === 'RAIN' || e.kind === 'DRYING') requireValid(s.weather.kind === e.kind && s.weather.changeMinute === FORMAT[e.segment].offset + e.minute, `${path}.events.weather`);
  }
  // Entrants: 22 distinct cars, two per team.
  const entrants = (s.entrants as Array<{ driverId: string; teamId: string }>), ids = entrants.map(e => e.driverId);
  requireValid(entrants.length === FORMAT.Q1.cars && new Set(ids).size === ids.length && root.teams.every(t => entrants.filter(e => e.teamId === t).length === 2), `${path}.entrants`);
  keysAre(s.plans, ids, `${path}.plans`);
  for (const id of ids) driverPlan(s.plans[id], `${path}.plans.${id}`);
  // Status against the one campaign clock.
  const status = s.status as string, cmp = compareCampaignDates(root.current, s.date);
  if (status === 'PLANNING') requireValid(cmp < 0 && compareCampaignDates(root.current, event.weekendStartDate) >= 0, `${path}.status.planning`);
  else if (status === 'COMPLETE') requireValid(cmp >= 0, `${path}.status.complete`);
  else requireValid(cmp === 0, `${path}.status.call`);
  const pause = status.endsWith('_BREAK');
  const reached = status === 'PLANNING' ? 0 : status === 'COMPLETE' ? 3 : SEGMENTS.indexOf(status.slice(0, 2) as Segment) + 1;
  keysAre(s.segments, SEGMENTS.slice(0, reached), `${path}.segments`);
  let drivers = ids;
  SEGMENTS.slice(0, reached).forEach((seg, i) => {
    const r = s.segments[seg], p = `${path}.segments.${seg}`, complete = status === 'COMPLETE' || pause || i < reached - 1;
    object({ calls: v => requireValid(v && typeof v === 'object' && !Array.isArray(v), `${p}.calls`), laps: array(lap(seg, drivers)), order: v => requireValid(Array.isArray(v), `${p}.order`) })(r, p);
    for (const l of r.laps as Array<{ time: number | null; sectors: Array<number | null>; flag?: string }>)
      requireValid(l.time === null ? (l.flag === 'DELETED' ? l.sectors.every(x => x !== null) : l.sectors.some(x => x === null))
        : l.sectors.every(x => x !== null) && Math.abs(l.sectors.reduce((a, b) => a! + b!, 0)! - l.time) < 0.0015, `${p}.sectors`);
    // Yellow outcomes only in a part with a yellow; a red-flag stop only on the laps flying when that part's red came out.
    const red = evs.find(e => e.segment === seg && e.kind === 'RED');
    for (const l of r.laps as Array<{ flag?: string; slot: number; time: number | null; sectors: Array<number | null> }>) {
      if (l.flag === 'RED') requireValid(!!red && l.slot === red.minute - 1 && l.time === null && l.sectors.every(x => x === null), `${p}.flag.red`);
      else requireValid(!l.flag || evs.some(e => e.segment === seg && e.kind === 'YELLOW'), `${p}.flag`);
      if (red && l.slot === red.minute - 1 && l.slot <= FORMAT[seg].minutes - 2) requireValid(l.flag === 'RED', `${p}.flag.redMissing`);
    }
    if (complete) {
      keysAre(r.calls, drivers, `${p}.calls`);
      for (const id of drivers) call(r.calls[id], `${p}.calls.${id}`);
      requireValid(isPermutation(r.order, drivers), `${p}.order`);
    } else requireValid(Object.keys(r.calls).length === 0 && r.order.length === 0, `${p}.partial`);
    if (seg !== 'Q3') drivers = complete ? (r.order as string[]).slice(0, FORMAT[SEGMENTS[i + 1]!].cars) : drivers;
  });
  if (status !== 'COMPLETE') { requireValid(s.grid === null, `${path}.grid`); return; }
  const q1 = s.segments.Q1.order as string[], q2 = s.segments.Q2.order as string[], q3 = s.segments.Q3.order as string[];
  const expected = [...q3, ...q2.slice(FORMAT.Q3.cars), ...q1.slice(FORMAT.Q2.cars)];
  const entry = object({ position: number(1, 22, true), driverId: choice(ids), teamId: choice(root.teams), time: nullable(number(0, 1000)), segment: choice(SEGMENTS), reasons: array(text) });
  requireValid(Array.isArray(s.grid) && s.grid.length === FORMAT.Q1.cars, `${path}.grid`);
  (s.grid as Array<Record<string, any>>).forEach((g, i) => {
    entry(g, `${path}.grid[${i}]`);
    requireValid(g.position === i + 1 && g.driverId === expected[i] && g.teamId === entrants.find(e => e.driverId === g.driverId)!.teamId, `${path}.grid[${i}].order`);
    requireValid(g.segment === (i < 10 ? 'Q3' : i < 16 ? 'Q2' : 'Q1') && g.reasons.length >= 1 && g.reasons.length <= 3, `${path}.grid[${i}].segment`);
  });
}

/** Save v8 qualifying state: present exactly when the career has drivers; sessions keyed by the pinned calendar's event IDs. */
export function validateQualifyingState(raw: Record<string, unknown>, definition: GameDefinition): void {
  const hasDrivers = Object.hasOwn(raw, 'drivers');
  requireValid(Object.hasOwn(raw, 'qualifying') === hasDrivers, 'universe.qualifying');
  if (!hasDrivers) return;
  const teams = definition.development.teams.map(t => t.id), q = raw.qualifying as Record<string, any>;
  object({ rules: choice([1]), researchPoints: v => keysAre(v, teams, 'qualifying.researchPoints'), sessions: v => requireValid(v && typeof v === 'object' && !Array.isArray(v), 'qualifying.sessions') })(q, 'qualifying');
  for (const t of teams) number(0, 1e6, true)(q.researchPoints[t], `qualifying.researchPoints.${t}`);
  const calendarId = raw.calendarId as string, events = calendarById(calendarId).events.map(e => e.id);
  const drivers = Object.keys((raw.drivers as { drivers: Record<string, unknown> }).drivers ?? {});
  const current = parseCampaignDate(raw.currentDate);
  for (const [id, session] of Object.entries(q.sessions as Record<string, unknown>)) {
    requireValid(events.includes(id), `qualifying.sessions.${id}`);
    validateSession(session, `qualifying.sessions.${id}`, id, { current, calendarId, teams, drivers });
  }
}
