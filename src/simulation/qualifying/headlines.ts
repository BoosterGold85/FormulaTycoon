import type {GameUniverse} from '../universe/types';
import {bestTime} from './session';
import {FORMAT,type QualifyingSession,type Segment} from './types';

/** Tone of a result: a good day, a bad one, or neither. Presentation only. */
export type HeadlineTone = 'GOOD' | 'BAD' | 'NEUTRAL';
export type Headline = { headline: string; detail: string; tone: HeadlineTone };

const NEXT: Record<Segment, string> = { Q1: 'Q2', Q2: 'Q3', Q3: 'pole' };
const secs = (n: number) => `${n < 0.01 ? n.toFixed(3) : n.toFixed(2)}s`;
const surname = (u: GameUniverse, id: string) => u.drivers!.drivers[id]!.name.split(' ').slice(-1)[0]!;

/**
 * The story of one driver's qualifying in one line, chosen only from the stored session (order, laps,
 * margins, teammate): never a new result, never a guessed pronoun. Read model, not saved.
 */
export function qualifyingHeadline(universe: GameUniverse, session: QualifyingSession, driverId: string): Headline | null {
  const entry = session.grid?.find(g => g.driverId === driverId);
  if (!entry) return null;
  const seg = entry.segment, result = session.segments[seg]!, laps = result.laps.filter(l => l.driverId === driverId);
  const p = result.order.indexOf(driverId) + 1, cutoff = FORMAT[seg].cars - FORMAT[seg].out;
  const mine = bestTime(result.laps, driverId), timeOf = (id: string | undefined) => id ? bestTime(result.laps, id) : null;
  const teamId = session.entrants.find(e => e.driverId === driverId)!.teamId;
  const mate = session.entrants.find(e => e.teamId === teamId && e.driverId !== driverId)?.driverId;
  const lost = laps.some(l => l.mistake && l.time === null);

  if (mine === null) return { headline: lost ? `Lap lost in ${seg}` : `No time in ${seg}`,
    detail: lost ? `Went off on the only flying lap · P${entry.position} on the grid` : `P${entry.position} on the grid`, tone: 'BAD' };

  if (seg === 'Q3') {
    const pole = timeOf(result.order[0]), second = timeOf(result.order[1]);
    if (p === 1) return { headline: 'Pole position!', detail: second !== null ? `${secs(second - mine)} clear of P2` : 'Fastest in Q3', tone: 'GOOD' };
    const off = `${secs(mine - pole!)} off pole`;
    if (p === 2) return { headline: 'Front row', detail: off, tone: 'GOOD' };
    const mateSeg = mate ? session.grid!.find(g => g.driverId === mate) : undefined;
    if (mate && mateSeg && mateSeg.position > entry.position) return { headline: `Ahead of teammate ${surname(universe, mate)}`, detail: `P${entry.position} · ${off}`, tone: 'GOOD' };
    return { headline: p <= 4 ? 'Second row' : 'Top-10 shoot-out', detail: `P${entry.position} · ${off}`, tone: p <= 4 ? 'GOOD' : 'NEUTRAL' };
  }

  // Knocked out in Q1 or Q2: measured against the last car through.
  const lastThrough = result.order[cutoff - 1], line = timeOf(lastThrough), margin = line === null ? null : mine - line;
  const short = margin === null ? `Out in ${seg}` : `${secs(margin)} short of ${NEXT[seg]}`;
  if (lastThrough && lastThrough === mate) return { headline: `Knocked out by teammate ${surname(universe, mate)}`, detail: `P${entry.position} · ${short}`, tone: 'BAD' };
  if (margin !== null && margin < 0.1) return { headline: `${secs(margin)} from ${NEXT[seg]}`, detail: `P${entry.position} · knocked out in ${seg}`, tone: 'BAD' };
  if (laps.some(l => l.traffic >= 0.15 && l.time === mine)) return { headline: `Traffic cost ${seg}`, detail: `P${entry.position} · ${short}`, tone: 'BAD' };
  if (p === cutoff + 1) return { headline: `First car out in ${seg}`, detail: `P${entry.position} · ${short}`, tone: 'BAD' };
  return { headline: `Out in ${seg}`, detail: `P${entry.position} · ${short}`, tone: 'BAD' };
}
