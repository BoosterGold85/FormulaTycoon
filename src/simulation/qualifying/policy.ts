import {CHECKPOINT,FORMAT,SEGMENTS,type Call,type DriverPlan,type Forecast,type Segment,type SegmentPlan,type Tyre} from './types';
import {CROSSOVER} from './weather';

/**
 * Rival AI (and the player's default when no plan or call was made). It reads only what a team
 * could know: its own forecast, its car's standing at this circuit, its risk appetite, the
 * provisional timing screen and the track as it is now. It never sees the actual weather script.
 */
export type PolicyTeam = { carRank: number; aggression: number; forecast: Forecast };

/** First session minute at which the forecast track is wet enough for intermediates (null = never). */
function forecastWetFrom(f: Forecast): { from: number; until: number } | null {
  if (f.kind === 'RAIN' && f.changeMinute !== null) return { from: f.changeMinute + 3, until: Infinity };
  if (f.kind === 'DRYING' && f.changeMinute !== null) return { from: -Infinity, until: f.changeMinute + Math.ceil((0.7 - CROSSOVER) / 0.05) };
  return null;
}

export function policyPlan(team: PolicyTeam): DriverPlan {
  const {carRank, aggression, forecast} = team;
  const late = aggression >= 0.55, push = aggression >= 0.6;
  const dry: Record<Segment, Pick<SegmentPlan, 'tyre' | 'runs'>> = carRank <= 3
    ? { Q1: { tyre: 'NEW_SOFT', runs: 1 }, Q2: { tyre: 'NEW_SOFT', runs: 1 }, Q3: { tyre: 'NEW_SOFT', runs: 2 } }
    : carRank <= 7
      ? { Q1: { tyre: 'NEW_SOFT', runs: 2 }, Q2: { tyre: 'NEW_SOFT', runs: 1 }, Q3: { tyre: 'NEW_SOFT', runs: 1 } }
      : { Q1: { tyre: 'NEW_SOFT', runs: 2 }, Q2: { tyre: 'NEW_SOFT', runs: 2 }, Q3: { tyre: 'USED_SOFT', runs: 1 } };
  const wet = forecastWetFrom(forecast);
  const plan = {} as DriverPlan;
  for (const seg of SEGMENTS) {
    const start = FORMAT[seg].offset, end = start + FORMAT[seg].minutes;
    const timing = dry[seg].runs === 2 ? 'MIDDLE' : late ? 'LATE' : 'MIDDLE';
    // Nobody waits for a gap on a single last-minute run: the flag would fall first.
    const base: SegmentPlan = { ...dry[seg], timing, traffic: push || (timing === 'LATE' && dry[seg].runs === 1) ? 'PUSH' : 'FIND_SPACE' };
    if (!wet) { plan[seg] = base; continue; }
    if (forecast.kind === 'RAIN') {
      if (wet.from <= start) plan[seg] = { tyre: 'INTER', runs: 2, timing: 'MIDDLE', traffic: base.traffic };
      // Rain due during this segment: bank a lap early on slicks.
      else if (wet.from < end) plan[seg] = { tyre: base.tyre === 'USED_SOFT' ? 'USED_SOFT' : 'NEW_SOFT', runs: 1, timing: 'EARLY', traffic: base.traffic };
      else plan[seg] = base;
    } else {
      if (wet.until >= end) plan[seg] = { tyre: 'INTER', runs: 2, timing: 'MIDDLE', traffic: base.traffic };
      // The track crosses over to slicks during this segment: go out at the end, when it is driest.
      else if (wet.until > start) plan[seg] = { tyre: 'NEW_SOFT', runs: 1, timing: 'LATE', traffic: 'PUSH' };
      else plan[seg] = base;
    }
    if (plan[seg].runs === 1 && plan[seg].timing === 'LATE') plan[seg] = { ...plan[seg], traffic: 'PUSH' };
  }
  return plan;
}

export type CallSituation = {
  segment: Segment; position: number | null; hasTime: boolean; remainingRuns: number;
  /** Cars in the segment that have set a time so far: a place is only "safe" once the screen is representative. */
  timedCars: number;
  /** Session minute of the next planned flying lap (null = none left). */
  nextRunMinute: number | null;
  plannedTyre: Tyre; forecast: Forecast;
  /** What everyone can see: the track now and three minutes ago. */
  wetNow: number; wetBefore: number;
  /** The segment-local minute of this call (its event, else the checkpoint) and the event behind it. */
  callMinute?: number; event?: 'RAIN' | 'DRYING' | 'YELLOW' | 'RED'; aggression?: number;
};
/** Yellow flag: a car with a safe time aborts (nothing to gain); otherwise bold teams push through and risk deletion. */
export function policyYellow(s: Pick<CallSituation, 'segment' | 'hasTime' | 'position' | 'aggression'>): 'ABORT' | 'PUSH' {
  const seg = FORMAT[s.segment], cutoff = s.segment === 'Q3' ? 3 : seg.cars - seg.out;
  if (s.hasTime && s.position !== null && s.position <= cutoff - 3) return 'ABORT';
  return (s.aggression ?? 0.5) >= 0.55 ? 'PUSH' : 'ABORT';
}
/** The checkpoint call: protect a safe place, push when in danger, react to the weather you can see. */
export function policyCall(s: CallSituation): Call {
  const call = baseCall(s);
  return s.event === 'YELLOW' ? { ...call, yellow: policyYellow(s) } : call;
}
function baseCall(s: CallSituation): Call {
  const seg = FORMAT[s.segment], now = seg.offset + (s.callMinute ?? CHECKPOINT[s.segment]), end = seg.offset + seg.minutes;
  const wet = forecastWetFrom(s.forecast);
  // Rain due before the end of this part, or visibly starting now (a conditions-change call).
  const rainComing = (s.event === 'RAIN' || (s.forecast.kind === 'RAIN' && wet !== null && wet.from >= now && wet.from < end)) && s.wetNow < CROSSOVER;
  // Tyres for the next lap: project the visible trend to when that lap will start.
  const lapAt = rainComing || s.nextRunMinute === null ? now + 1 : s.nextRunMinute;
  const projected = s.wetNow + (s.wetNow - s.wetBefore) / 3 * (lapAt - now);
  const tyre: Tyre | undefined = projected >= CROSSOVER ? (s.plannedTyre === 'INTER' ? undefined : 'INTER')
    : s.plannedTyre === 'INTER' && projected < CROSSOVER - 0.08 ? 'NEW_SOFT' : undefined;
  const withTyre = (call: Call): Call => tyre ? { ...call, tyre } : call;
  if (rainComing) return withTyre({ action: 'GO_NOW' });
  // Red flag restart: a safe car stays in; otherwise bold teams join the queue and the rest wait for a clean track.
  if (s.event === 'RED') {
    const cut = seg.cars - seg.out;
    if (s.segment !== 'Q3' && s.hasTime && s.position !== null && s.timedCars >= cut && s.position <= cut - 4 && !tyre) return { action: 'STAY_IN' };
    return withTyre({ action: (s.aggression ?? 0.5) >= 0.55 ? 'GO_NOW' : 'WAIT_CLEAN' });
  }
  if (s.segment === 'Q3') return withTyre({ action: s.remainingRuns > 0 ? 'PLAN' : 'GO_LATE' });
  const cutoff = seg.cars - seg.out;
  if (s.hasTime && s.position !== null && s.timedCars >= cutoff && s.position <= cutoff - 6 && !tyre) return { action: 'STAY_IN' };
  if (!s.hasTime || s.position === null || s.position > cutoff - 2) return withTyre({ action: s.remainingRuns > 0 ? 'PLAN' : 'GO_LATE' });
  return withTyre({ action: 'PLAN' });
}
