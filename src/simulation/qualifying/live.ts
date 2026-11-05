import {teamBrand} from '../../game/brandRegistry';
import type {GameUniverse} from '../universe/types';
import {segmentDrivers} from './session';
import {FORMAT,SESSION_MINUTES,type QualifyingLap,type QualifyingSession,type Segment} from './types';
import {wetnessAt} from './weather';

/**
 * Live timing for the replay, built only from STORED laps. Time moves in sector beats (three per session
 * minute): a flying lap shows S1, S2 and S3 as they complete, coloured like a timing screen. Pure, so speed
 * or Skip can never change what happened.
 */
export const BEATS_PER_MINUTE = 3;
export type SectorColor = 'PURPLE' | 'GREEN' | 'YELLOW';
export type LivePhase = 'GARAGE' | 'OUT_LAP' | 'FLYING' | 'IN_LAP' | 'OFF' | 'MISSED';
/** delta: seconds behind the fastest completed time in that sector (0 for purple). */
export type LiveSector = { color: SectorColor; time: number; delta: number } | null;
export type TowerRow = { driverId: string; name: string; teamId: string; team: string; color: string; mine: boolean; position: number;
  time: number | null; gap: string; state: 'TRACK' | 'GARAGE'; danger: boolean; out: boolean;
  phase: LivePhase; sectors: LiveSector[]; justFinished: boolean };

/** Segment for a beat. Each segment owns its end-of-segment beat, so its final classification is shown. */
export function segmentAtBeat(beat: number): Segment {
  return beat <= FORMAT.Q2.offset * 3 ? 'Q1' : beat <= FORMAT.Q3.offset * 3 ? 'Q2' : 'Q3';
}
const sectorBeat = (lap: QualifyingLap, i: number) => (lap.slot + 1) * 3 + i + 1;
const flagged = (lap: QualifyingLap, seg: Segment) => lap.slot > FORMAT[seg].minutes - 2;
const name = (u: GameUniverse, id: string) => u.drivers!.drivers[id]!.name;
const surname = (u: GameUniverse, id: string) => name(u, id).split(' ').slice(-1)[0]!;

export function liveTiming(universe: GameUniverse, session: QualifyingSession, beat: number) {
  const seg = segmentAtBeat(beat), D = FORMAT[seg].minutes, result = session.segments[seg];
  const local = Math.max(0, Math.min(D * 3, beat - FORMAT[seg].offset * 3)), t = Math.floor(local / 3);
  const drivers = result ? segmentDrivers(session, seg) : [];
  const laps = (result?.laps ?? []).filter(l => !flagged(l, seg));
  // Sector colours in the order the sectors were completed.
  const completions = laps.flatMap(l => l.sectors.map((time, i) => ({ l, i, time, at: sectorBeat(l, i) })))
    .filter(c => c.at <= local && c.time !== null && !c.l.sectors.slice(0, c.i).some(x => x === null))
    .sort((a, b) => a.at - b.at || (a.l.driverId < b.l.driverId ? -1 : 1));
  const overall: number[] = [], personal = new Map<string, number[]>(), colour = new Map<QualifyingLap, Array<LiveSector>>();
  const feed: Array<{ at: number; text: string }> = [];
  for (const c of completions) {
    const pb = personal.get(c.l.driverId) ?? [], time = c.time!;
    const col: SectorColor = overall[c.i] === undefined || time < overall[c.i]! ? 'PURPLE' : pb[c.i] === undefined || time < pb[c.i]! ? 'GREEN' : 'YELLOW';
    // Announce a purple only when it beats an existing best (the first laps are all purple by definition).
    if (col === 'PURPLE') { if (overall[c.i] !== undefined) feed.push({ at: c.at, text: `${surname(universe, c.l.driverId)} goes purple in S${c.i + 1}` }); overall[c.i] = time; }
    if (pb[c.i] === undefined || time < pb[c.i]!) pb[c.i] = time;
    personal.set(c.l.driverId, pb);
    const list = colour.get(c.l) ?? [null, null, null];
    list[c.i] = { color: col, time, delta: 0 };
    colour.set(c.l, list);
  }
  // Shown colours are as of NOW: purple = fastest so far, green = the driver's own best, yellow = slower.
  const fastest = [0, 1, 2].map(i => Math.min(...completions.filter(c => c.i === i).map(c => c.time!)));
  for (const [lap, list] of colour) list.forEach((sec, i) => {
    if (!sec) return;
    const own = Math.min(...completions.filter(c => c.i === i && c.l.driverId === lap.driverId).map(c => c.time!));
    list[i] = { time: sec.time, delta: Math.round((sec.time - fastest[i]!) * 1000) / 1000, color: sec.time <= fastest[i]! ? 'PURPLE' : sec.time <= own ? 'GREEN' : 'YELLOW' };
  });
  const doneAt = (l: QualifyingLap) => (l.slot + 2) * 3;
  const bestAt = (at: number) => {
    const best = new Map<string, number>();
    for (const l of laps) if (l.time !== null && doneAt(l) <= at && (!best.has(l.driverId) || l.time < best.get(l.driverId)!)) best.set(l.driverId, l.time);
    return best;
  };
  const rank = (best: Map<string, number>) => [...drivers].sort((a, b) => (best.get(a) ?? Infinity) - (best.get(b) ?? Infinity) || drivers.indexOf(a) - drivers.indexOf(b));
  // Lap events: the new fastest time, the player's own laps, laps lost and the flag.
  for (const l of laps) {
    const off = l.sectors.findIndex(x => x === null);
    if (off >= 0 && l.time === null && sectorBeat(l, off) <= local) feed.push({ at: sectorBeat(l, off), text: `${surname(universe, l.driverId)} goes off in S${off + 1}; lap lost` });
    if (l.time === null || doneAt(l) > local) continue;
    const order = rank(bestAt(doneAt(l))), p = order.indexOf(l.driverId) + 1, mine = session.entrants.find(e => e.driverId === l.driverId)!.teamId === universe.playerTeamId;
    const improved = bestAt(doneAt(l)).get(l.driverId) === l.time;
    if (p === 1 && improved) feed.push({ at: doneAt(l), text: `${surname(universe, l.driverId)} goes fastest` });
    else if (mine) feed.push({ at: doneAt(l), text: improved ? `${surname(universe, l.driverId)} moves to P${p}` : `${surname(universe, l.driverId)} doesn't improve (P${p})` });
  }
  for (const l of (result?.laps ?? []).filter(x => flagged(x, seg) && D * 3 <= local)) feed.push({ at: D * 3, text: `${surname(universe, l.driverId)} misses the flag` });
  const w = session.weather;
  if (w.changeMinute !== null && w.changeMinute >= FORMAT[seg].offset && w.changeMinute < FORMAT[seg].offset + D && (w.changeMinute - FORMAT[seg].offset) * 3 <= local)
    feed.push({ at: (w.changeMinute - FORMAT[seg].offset) * 3, text: w.kind === 'RAIN' ? 'Rain starts to fall' : 'The track starts to dry' });

  const best = bestAt(local), finished = t >= D && !!result && result.order.length > 0;
  const order = finished ? result!.order : rank(best), cut = FORMAT[seg].cars - FORMAT[seg].out;
  if (finished && seg !== 'Q3') feed.push({ at: D * 3 + 0.5, text: `${seg} over. Knocked out: ${order.slice(cut).map(id => surname(universe, id)).join(', ')}` });
  const pole = best.get(order[0]!) ?? null;
  const rows: TowerRow[] = order.map((id, i) => {
    const entrant = session.entrants.find(e => e.driverId === id)!, time = best.get(id) ?? null, b = teamBrand(entrant.teamId);
    const mineLaps = (result?.laps ?? []).filter(l => l.driverId === id && l.slot * 3 <= local).sort((a, b) => a.slot - b.slot);
    const lap = mineLaps[mineLaps.length - 1];
    let phase: LivePhase = 'GARAGE', sectors: LiveSector[] = [null, null, null];
    if (lap) {
      const off = lap.sectors.findIndex(x => x === null), lost = lap.time === null && off >= 0 && !flagged(lap, seg);
      if (flagged(lap, seg)) phase = local >= D * 3 ? 'MISSED' : 'OUT_LAP';
      else if (local < (lap.slot + 1) * 3) phase = 'OUT_LAP';
      else if (lost && sectorBeat(lap, off) <= local) phase = local < (lap.slot + 3) * 3 ? 'OFF' : 'GARAGE';
      else phase = local < doneAt(lap) ? 'FLYING' : local < (lap.slot + 3) * 3 ? 'IN_LAP' : 'GARAGE';
      const shown = phase === 'OUT_LAP' ? mineLaps[mineLaps.length - 2] : lap;
      sectors = shown ? colour.get(shown) ?? [null, null, null] : sectors;
    }
    return { driverId: id, name: name(universe, id), teamId: entrant.teamId, team: b.name, color: b.colors.primary,
      mine: entrant.teamId === universe.playerTeamId, position: i + 1, time,
      gap: time === null ? 'No time' : i === 0 ? 'Fastest' : `+${(time - pole!).toFixed(3)}`,
      state: phase === 'OUT_LAP' || phase === 'FLYING' || phase === 'IN_LAP' || phase === 'OFF' ? 'TRACK' : 'GARAGE',
      danger: seg !== 'Q3' && i >= cut, out: finished && seg !== 'Q3' && i >= cut, phase, sectors,
      justFinished: !!lap && lap.time !== null && local >= doneAt(lap) && local < doneAt(lap) + 3 };
  });
  const wet = wetnessAt(session.weather, Math.min(FORMAT[seg].offset + t, SESSION_MINUTES - 1));
  return { segment: seg, minute: t, remaining: Math.max(0, D - t), cutoff: seg === 'Q3' ? null : cut, rows, finished,
    track: { wet }, feed: feed.sort((a, b) => b.at - a.at).slice(0, 4).map(f => f.text) };
}

/** Global replay beat of a segment-local beat (Q2 and Q3 start right after the previous segment's final beat). */
export const globalBeat = (seg: Segment, local: number) => FORMAT[seg].offset * BEATS_PER_MINUTE + local;
/** Beats where something visible happens (a sector, a lap, the flag): the replay lingers on these. */
export function activeBeats(session: QualifyingSession): Set<number> {
  const beats = new Set<number>();
  for (const seg of ['Q1', 'Q2', 'Q3'] as const) {
    const r = session.segments[seg];
    if (!r) continue;
    for (const l of r.laps) if (!flagged(l, seg)) for (let i = 0; i < 3; i++) beats.add(globalBeat(seg, sectorBeat(l, i)));
    beats.add(globalBeat(seg, FORMAT[seg].minutes * BEATS_PER_MINUTE));
  }
  return beats;
}
