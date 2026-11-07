import type {Driver} from '../../game/drivers/types';
import {randomFor} from '../randomStreams';
import {CAR_SECONDS,DRIVER_SECONDS,wetSkillPenalty} from './pace';
import {CHECKPOINT,FORMAT,MEDIUM_SETS,NEW_SOFT_SETS,SESSION_MINUTES,type Call,type LapTyre,type QualifyingLap,type QualifyingSession,
 type Segment,type SegmentPlan,type Traffic,type Tyre,type Weather} from './types';
import {wetnessAt} from './weather';
import {callMinute,redOf,yellowOf} from './events';

/** Everything a lap reads, derived from the universe on the session day (never saved). */
export type EntrantPace = { driverId: string; teamId: string; car: number; pace: number; driver: Driver; aggression: number };
export type SessionContext = { seed: number; calendarId: string; eventId: string; evolution: number; weather: Weather; entrants: Record<string, EntrantPace> };

const round3 = (n: number) => Math.round(n * 1000) / 1000;
const lastStart = (seg: Segment) => FORMAT[seg].minutes - 2;

/** Planned out-lap slots for a segment plan, with a small per-driver seeded spread so cars do not leave in lockstep. */
export function plannedSlots(ctx: SessionContext, driverId: string, seg: Segment, plan: SegmentPlan): number[] {
  const D = FORMAT[seg].minutes;
  const base = plan.runs === 1
    ? [plan.timing === 'EARLY' ? 1 : plan.timing === 'MIDDLE' ? Math.floor(D / 2) - 1 : D - 3]
    : plan.timing === 'EARLY' ? [1, Math.floor(D / 2)] : plan.timing === 'MIDDLE' ? [Math.floor(D / 3), D - 4] : [Math.floor(D / 2), D - 3];
  const jitter = randomFor(ctx.seed, 'qualifying-slot', ctx.calendarId, ctx.eventId, driverId, seg).int(-1, 1);
  return base.map(s => Math.max(0, Math.min(lastStart(seg), s + jitter)));
}

/** Slots for the part of the segment after the checkpoint, as the call decided. */
export function slotsAfterCall(ctx: SessionContext, driverId: string, seg: Segment, plan: SegmentPlan, call: Call, C: number = CHECKPOINT[seg]): number[] {
  const D = FORMAT[seg].minutes;
  if (call.action === 'STAY_IN') return [];
  if (call.action === 'GO_NOW') return [C];
  if (call.action === 'WAIT_CLEAN') return [Math.min(C + 2, lastStart(seg))];
  if (call.action === 'GO_LATE') return [D - 3];
  return plannedSlots(ctx, driverId, seg, plan).filter(s => s >= C);
}

/** Allowance per driver, read from the laps already run: 4 new softs, 1 medium set, intermediates unrationed. */
export function actualTyre(requested: Tyre, previous: QualifyingLap[]): LapTyre {
  const newUsed = previous.filter(l => l.tyre === 'NEW_SOFT').length;
  const mediums = previous.filter(l => l.tyre === 'MEDIUM' || l.tyre === 'USED_MEDIUM').length;
  const newLeft = newUsed < NEW_SOFT_SETS, usedSoft = newUsed > 0;
  const medium: LapTyre = mediums < MEDIUM_SETS ? 'MEDIUM' : 'USED_MEDIUM';
  if (requested === 'INTER') return 'INTER';
  if (requested === 'MEDIUM') return medium;
  if (requested === 'NEW_SOFT') return newLeft ? 'NEW_SOFT' : usedSoft ? 'USED_SOFT' : medium;
  return usedSoft ? 'USED_SOFT' : newLeft ? 'NEW_SOFT' : medium;
}

const SLICK: Record<Exclude<LapTyre, 'INTER'>, number> = { NEW_SOFT: 0, USED_SOFT: 0.35, MEDIUM: 0.55, USED_MEDIUM: 0.85 };
/** Seconds the tyre costs at this wetness. Slicks fall away quickly in the wet; inters are slow in the dry. */
export function tyrePenalty(tyre: LapTyre, wet: number): number {
  return tyre === 'INTER' ? 1.6 + 2.5 * Math.abs(wet - 0.65) : SLICK[tyre] + 10 * wet * wet + 3 * wet;
}

type Start = { driverId: string; slot: number; tyre: Tyre; traffic: Traffic };
/**
 * Resolves a batch of runs (one phase of one segment). Traffic counts cars LEAVING in the same
 * slot, so a phase never depends on runs that start after it. "Find space" may wait one or two
 * slots; waiting past the flag loses the lap.
 */
export function resolveRuns(ctx: SessionContext, seg: Segment, starts: Start[], phaseEnd: number, history: QualifyingLap[]): QualifyingLap[] {
  const planned = new Map<number, number>();
  for (const s of starts) planned.set(s.slot, (planned.get(s.slot) ?? 0) + 1);
  const moved = starts.map(s => {
    const rng = randomFor(ctx.seed, 'qualifying-lap', ctx.calendarId, ctx.eventId, s.driverId, seg, s.slot);
    let slot = s.slot;
    const crowd = planned.get(s.slot)! - 1;
    if (s.traffic === 'FIND_SPACE' && crowd >= 3) {
      const wait = rng.next() < 0.65 ? 1 : 2;
      if (s.slot + wait < phaseEnd || phaseEnd > lastStart(seg)) slot = s.slot + wait;
    }
    return { ...s, slot, rng };
  });
  const final = new Map<number, number>();
  for (const m of moved) final.set(m.slot, (final.get(m.slot) ?? 0) + 1);
  const laps: QualifyingLap[] = [];
  const ordered = [...moved].sort((a, b) => a.slot - b.slot || (a.driverId < b.driverId ? -1 : a.driverId > b.driverId ? 1 : 0));
  for (const m of ordered) {
    const prior = [...history, ...laps].filter(l => l.driverId === m.driverId);
    const tyre = actualTyre(m.tyre, prior);
    const minute = FORMAT[seg].offset + m.slot + 1, wet = round3(wetnessAt(ctx.weather, Math.min(minute, SESSION_MINUTES - 1)));
    if (m.slot > lastStart(seg)) { laps.push({ driverId: m.driverId, slot: m.slot, tyre, time: null, sectors: [null, null, null], traffic: 0, mistake: false, wet }); continue; }
    const e = ctx.entrants[m.driverId]!, r = m.rng, crowd = final.get(m.slot)! - 1;
    const trafficChance = Math.min(m.traffic === 'PUSH' ? 0.45 : 0.25, (m.traffic === 'PUSH' ? 0.045 : 0.02) * crowd);
    const traffic = r.next() < trafficChance ? 0.15 + 0.45 * r.next() : 0;
    const mistakeChance = 0.02 + Math.max(0, 90 - e.driver.ability.composure) * 0.002 + wet * 0.08 + (m.traffic === 'PUSH' ? 0.01 : 0);
    const mistake = r.next() < mistakeChance;
    const slickInWet = tyre !== 'INTER' && wet > 0.3;
    const lost = mistake && (slickInWet || r.next() < 0.12);
    const n = [r.next(), r.next(), r.next()], noise = (n[0]! + n[1]! + n[2]! - 1.5) * 0.14;
    const core = 90 + (85 - e.car) * CAR_SECONDS + (90 - e.pace) * DRIVER_SECONDS + wetSkillPenalty(e.driver, wet) + tyrePenalty(tyre, wet)
      - ctx.evolution * 0.55 * Math.pow(minute / (SESSION_MINUTES - 1), 0.8);
    const mistakeCost = mistake ? 0.4 + 1.1 * r.next() : 0;
    const time = core + noise + traffic + mistakeCost;
    // Sectors: each noise draw is one sector's; traffic and a mistake land in one sector each (draws appended
    // after every earlier draw, so lap times are unchanged). The three sectors sum exactly to the lap.
    const trafficSector = r.int(0, 2), mistakeSector = r.int(0, 2);
    const raw = n.map((x, i) => core / 3 + (x - 0.5) * 0.14 + (i === trafficSector ? traffic : 0) + (i === mistakeSector ? mistakeCost : 0));
    const s1 = round3(raw[0]!), s2 = round3(raw[1]!), sectors: Array<number | null> = [s1, s2, round3(round3(time) - s1 - s2)];
    // A lap lost to a mistake stops in the sector where it happened.
    if (lost) for (let i = mistakeSector; i < 3; i++) sectors[i] = null;
    laps.push({ driverId: m.driverId, slot: m.slot, tyre, time: lost ? null : round3(time), sectors, traffic: round3(traffic), mistake, wet });
  }
  return laps;
}

/** Fastest first; ties go to whoever set the time first, then a seeded draw. Drivers without a time follow. */
export function classify(ctx: SessionContext, seg: Segment, drivers: string[], laps: QualifyingLap[]): string[] {
  const draw = (id: string) => randomFor(ctx.seed, 'qualifying-order', ctx.calendarId, ctx.eventId, seg, id).next();
  const best = new Map<string, { time: number; slot: number }>();
  for (const l of laps) {
    if (l.time === null || !drivers.includes(l.driverId)) continue;
    const cur = best.get(l.driverId);
    if (!cur || l.time < cur.time || (l.time === cur.time && l.slot < cur.slot)) best.set(l.driverId, { time: l.time, slot: l.slot });
  }
  return [...drivers].sort((a, b) => {
    const x = best.get(a), y = best.get(b);
    if (x && y) return x.time - y.time || x.slot - y.slot || draw(a) - draw(b);
    if (x || y) return x ? -1 : 1;
    return draw(a) - draw(b);
  });
}
export function bestTime(laps: QualifyingLap[], driverId: string): number | null {
  const times = laps.filter(l => l.driverId === driverId && l.time !== null).map(l => l.time!);
  return times.length ? Math.min(...times) : null;
}

/** Drivers taking part in a segment: everyone in Q1, then the survivors of the previous segment. */
export function segmentDrivers(session: QualifyingSession, seg: Segment): string[] {
  if (seg === 'Q1') return session.entrants.map(e => e.driverId);
  const prev = seg === 'Q2' ? 'Q1' : 'Q2', result = session.segments[prev];
  if (!result || result.order.length === 0) throw new Error(`${prev} is not complete`);
  return result.order.slice(0, FORMAT[seg].cars);
}
export const allLaps = (session: QualifyingSession): QualifyingLap[] =>
  (['Q1', 'Q2', 'Q3'] as const).flatMap(s => session.segments[s]?.laps ?? []);

/** Phase A: every planned run leaving before the segment's call (its event, else the checkpoint). */
export function runBeforeCheckpoint(ctx: SessionContext, session: QualifyingSession, seg: Segment): QualifyingLap[] {
  const C = callMinute(session, seg);
  const starts = segmentDrivers(session, seg).flatMap(id => {
    const plan = session.plans[id]![seg];
    return plannedSlots(ctx, id, seg, plan).filter(s => s < C).map(slot => ({ driverId: id, slot, tyre: plan.tyre, traffic: plan.traffic }));
  });
  const laps = resolveRuns(ctx, seg, starts, C, allLaps(session));
  // Red flag at the call minute: every car on a flying lap then has it stopped (no sector completed).
  const red = redOf(session, seg);
  return red ? laps.map(l => l.slot === red.minute - 1 ? { ...l, time: null, sectors: [null, null, null], flag: 'RED' as const } : l) : laps;
}
/** Phase B: the rest of the segment, as each driver's call decided. */
export function runAfterCheckpoint(ctx: SessionContext, session: QualifyingSession, seg: Segment, calls: Record<string, Call>): QualifyingLap[] {
  const C = callMinute(session, seg), D = FORMAT[seg].minutes;
  const starts = segmentDrivers(session, seg).flatMap(id => {
    const plan = session.plans[id]![seg], call = calls[id]!;
    // At a red-flag restart, "go out first" heads the queue: it never waits for a gap.
    const traffic = redOf(session, seg) && call.action === 'GO_NOW' ? 'PUSH' as const : plan.traffic;
    return slotsAfterCall(ctx, id, seg, plan, call, C).map(slot => ({ driverId: id, slot, tyre: call.tyre ?? plan.tyre, traffic }));
  });
  const yellow = yellowOf(session, seg);
  let laps = resolveRuns(ctx, seg, starts, D, allLaps(session));
  if (!yellow) return laps;
  // Laps flying while the yellow is out (left the pits at the call minute) meet it in its sector.
  const meets = (l: QualifyingLap) => l.slot === yellow.minute - 1 && l.slot <= lastStart(seg) && !l.sectors.slice(0, yellow.sector).some(x => x === null);
  // An aborted lap gets one more go two minutes later, if the flag allows it and no other run is that close.
  const aborting = laps.filter(l => meets(l) && calls[l.driverId]!.yellow === 'ABORT').map(l => l.driverId);
  const again = aborting.filter(id => yellow.minute + 1 <= lastStart(seg) && !starts.some(s => s.driverId === id && Math.abs(s.slot - (yellow.minute + 1)) <= 2 && s.slot !== yellow.minute - 1));
  if (again.length) laps = resolveRuns(ctx, seg, [...starts, ...again.map(id => {
    const plan = session.plans[id]![seg], call = calls[id]!;
    return { driverId: id, slot: yellow.minute + 1, tyre: call.tyre ?? plan.tyre, traffic: plan.traffic };
  })], D, allLaps(session));
  return laps.map(l => meets(l) ? applyYellow(ctx, seg, l, calls[l.driverId]!.yellow ?? 'PUSH', yellow.sector) : l);
}

/**
 * A yellow flag on a flying lap (own stream 'qualifying-yellow'). Abort: the lap ends in the flag's sector.
 * Push through: the driver lifts and loses 0.25-0.6 s there, and the lap may be deleted for not slowing enough.
 */
export function applyYellow(ctx: SessionContext, seg: Segment, lap: QualifyingLap, choice: 'ABORT' | 'PUSH', sector: number): QualifyingLap {
  if (choice === 'ABORT') return { ...lap, time: null, sectors: lap.sectors.map((x, i) => i < sector ? x : null), flag: 'ABORTED' };
  if (lap.time === null) return lap;
  const r = randomFor(ctx.seed, 'qualifying-yellow', ctx.calendarId, ctx.eventId, lap.driverId, seg, lap.slot);
  const lift = round3(0.25 + 0.35 * r.next()), deleted = r.next() < 0.15;
  const sectors = lap.sectors.map((x, i) => i === sector ? round3(x! + lift) : x);
  if (deleted) return { ...lap, time: null, sectors, flag: 'DELETED' };
  return { ...lap, time: round3(lap.time + lift), sectors, flag: 'YELLOW_LIFT' };
}
