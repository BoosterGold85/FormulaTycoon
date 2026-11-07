import {bestTime} from './session';
import {callMinute} from './events';
import {FORMAT,type QualifyingLap,type QualifyingSession,type Segment} from './types';
import {CROSSOVER} from './weather';

/** Car-fit facts for one team at this circuit, from the canonical suitability disclosure. */
export type FitNote = { rank: number; strengths: string[]; concerns: string[] };

const s2 = (n: number) => `${n.toFixed(2)} s`;
const s1 = (n: number) => `${Math.max(0.1, n).toFixed(1)} s`;
const minuteInto = (seg: Segment, globalMinute: number) => Math.max(1, globalMinute - FORMAT[seg].offset);

/**
 * 1-3 short causal reasons per driver, chosen from the stored laps (traffic, tyres, weather call,
 * car fit, cutoff margin). Stored with the grid: the UI never invents a reason.
 */
export function reasonsFor(session: QualifyingSession, driverId: string, decided: Segment, fit: FitNote): string[] {
  const out: string[] = [];
  const result = session.segments[decided]!, laps = result.laps.filter(l => l.driverId === driverId);
  const mine = bestTime(result.laps, driverId);
  const {weather} = session;
  // Cutoff margin: how close the knockout line was, for whoever was decided at or near it.
  const position = result.order.indexOf(driverId) + 1, cutoff = FORMAT[decided].cars - FORMAT[decided].out;
  if (mine === null) out.push(laps.length === 0 ? `No time set in ${decided}.` : laps.some(l => l.mistake) ? `Went off on the only flying lap in ${decided}.` : `Ran out of time finding space in ${decided}.`);
  else if (decided !== 'Q3' && position > cutoff) {
    const line = bestTime(result.laps, result.order[cutoff - 1]!);
    if (line !== null) out.push(`Out in ${decided} by ${s2(mine - line)}.`);
  }
  // Weather call.
  if (weather.kind !== 'DRY' && weather.changeMinute !== null) {
    const start = FORMAT[decided].offset, end = start + FORMAT[decided].minutes;
    const flying = (l: QualifyingLap) => start + l.slot + 1;
    const bestLap = laps.find(l => l.time === mine);
    if (weather.kind === 'RAIN' && weather.changeMinute >= start && weather.changeMinute < end) {
      if (bestLap && flying(bestLap) < weather.changeMinute + 2) out.push(`Rain arrived ${minuteInto(decided, weather.changeMinute)} minutes into ${decided}; the early run banked the time.`);
      else out.push(`Caught by the rain ${minuteInto(decided, weather.changeMinute)} minutes into ${decided}.`);
    } else if (weather.kind === 'DRYING' && laps.length) {
      const last = laps[laps.length - 1]!;
      if (bestLap && bestLap.tyre !== 'INTER' && bestLap.wet > 0 && bestLap.wet < CROSSOVER) out.push(`Switched to slicks at the right moment as the track dried in ${decided}.`);
      else if (last.tyre === 'INTER' && last.wet < CROSSOVER - 0.08) out.push(`Stayed on intermediates while the track dried in ${decided}.`);
    }
  }
  // Traffic and mistakes on the run that mattered.
  const traffic = laps.filter(l => l.traffic >= 0.15).sort((a, b) => b.traffic - a.traffic)[0];
  if (traffic) out.push(`Traffic cost about ${s1(traffic.traffic)} on a ${decided} run.`);
  const err = laps.find(l => l.mistake && l.time !== null);
  if (err && out.length < 3) out.push(`A mistake spoiled a ${decided} lap.`);
  // Tyre management.
  const tyres = laps.map(l => l.tyre);
  if (decided !== 'Q3' && position > cutoff && tyres.length && tyres.every(t => t === 'USED_SOFT' || t === 'USED_MEDIUM' || t === 'MEDIUM'))
    out.push(`Ran ${tyres.every(t => t === 'USED_SOFT') ? 'used softs' : 'mediums'} in ${decided} to save a new set.`);
  const q1 = session.segments.Q1!.laps.filter(l => l.driverId === driverId);
  if (decided !== 'Q1' && q1.length && q1.every(l => l.tyre === 'MEDIUM' || l.tyre === 'USED_MEDIUM')) out.push('Got through Q1 on mediums, saving a new soft.');
  const calls = result.calls[driverId];
  if (calls && !calls.defaulted && calls.action === 'STAY_IN' && decided !== 'Q3' && position > cutoff) out.push(`Stayed in the garage after ${callMinute(session, decided)} minutes and was knocked out.`);
  // Yellow flags.
  const flagged = laps.find(l => l.flag);
  if (flagged) out.unshift(flagged.flag === 'RED' ? `A ${decided} lap was stopped by the red flag.` : flagged.flag === 'ABORTED' ? `Aborted a ${decided} lap for a yellow flag.` : flagged.flag === 'DELETED' ? `A ${decided} lap was deleted for not slowing under yellow.` : `Lifted for a yellow flag in ${decided} and lost time.`);
  // A narrow escape in the previous segment matters less than what decided this one.
  const next = decided === 'Q1' ? null : decided === 'Q2' ? 'Q1' : 'Q2';
  if (next) {
    const prev = session.segments[next]!, cut = FORMAT[next].cars - FORMAT[next].out;
    const through = bestTime(prev.laps, driverId), first = bestTime(prev.laps, prev.order[cut]!);
    if (through !== null && first !== null && first - through < 0.1) out.push(`Through ${next} by just ${s2(first - through)}.`);
  }
  // Car fit is always part of the story.
  const fitLine = fit.rank <= 3 && fit.strengths.length ? `Car fit: strong in ${fit.strengths[0]!.toLowerCase()}.`
    : fit.rank >= 8 && fit.concerns.length ? `Car fit: lacking ${fit.concerns[0]!.toLowerCase()} here.`
      : fit.rank <= 3 ? 'Car fit: one of the strongest cars here.' : fit.rank >= 8 ? 'Car fit: one of the slower cars here.' : 'Car fit: a midfield car at this circuit.';
  return [...[...new Set(out)].slice(0, 2), fitLine];
}
