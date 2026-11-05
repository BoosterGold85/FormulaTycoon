import {teamBrand} from '../../game/brandRegistry';
import type {GameUniverse} from '../universe/types';
import {segmentDrivers} from './session';
import {driverCodes} from './codes';
import {FORMAT,SESSION_MINUTES,type LapTyre,type QualifyingLap,type QualifyingSession,type Segment} from './types';
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
  phase: LivePhase; sectors: LiveSector[]; justFinished: boolean;
  /** A car fighting around the knockout line on a flying lap (Q1/Q2). */
  nearCut: boolean;
  /** Player cars on a flying lap: where the lap would put them at its pace so far (null otherwise). */
  predicted: number | null;
  /** Presentation-only fields for the broadcast tower; all derived from stored laps at this beat. */
  code: string;
  /** Tyre of the current (or most recent) run in this segment; null before the first run. */
  tyre: LapTyre | null;
  /** Gap to the car directly ahead (both timed), e.g. "+0.118". */
  interval: string | null;
  /** Latest completed flying lap in this segment versus the driver's own best: PB, +0.214 or OFF (lost). */
  last: { kind: 'PB' | 'SLOWER' | 'OFF'; text: string } | null;
  /** Places gained (+) or lost (-) over the last session minute, for timed cars; 0 otherwise. */
  moved: number };
/** Commentary from stored session data only: the announcer covers the field; radio is the player's engineer. */
export type CommentaryLine = { kind: 'ANNOUNCER' | 'RADIO'; text: string; driverId?: string; at: number };
const tenths = (d: number) => { const n = Math.round(Math.abs(d) * 10); return n >= 10 ? `${Math.abs(d).toFixed(1)} seconds` : n <= 1 ? 'a tenth' : `${['', '', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine'][n]} tenths`; };

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
  const feed: CommentaryLine[] = [];
  const say = (at: number, text: string) => feed.push({ kind: 'ANNOUNCER', at, text });
  const radio = (at: number, driverId: string, text: string) => feed.push({ kind: 'RADIO', at, driverId, text });
  const isMine = (id: string) => session.entrants.find(e => e.driverId === id)!.teamId === universe.playerTeamId;
  for (const c of completions) {
    const pb = personal.get(c.l.driverId) ?? [], time = c.time!;
    const col: SectorColor = overall[c.i] === undefined || time < overall[c.i]! ? 'PURPLE' : pb[c.i] === undefined || time < pb[c.i]! ? 'GREEN' : 'YELLOW';
    // Announce a purple only when it beats an existing best (the first laps are all purple by definition).
    if (col === 'PURPLE') { if (overall[c.i] !== undefined) say(c.at, `${surname(universe, c.l.driverId)} purple in S${c.i + 1}!`); overall[c.i] = time; }
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
    const mine = isMine(l.driverId);
    if (mine && l.slot * 3 <= local) radio(l.slot * 3, l.driverId, 'Out lap. Bring the tyres in.');
    if (off >= 0 && l.time === null && sectorBeat(l, off) <= local) {
      say(sectorBeat(l, off), `${surname(universe, l.driverId)}'s off in S${off + 1}, that lap's gone.`);
      if (mine) radio(sectorBeat(l, off) + 0.1, l.driverId, "We've lost that one. Box this lap.");
    }
    // The engineer's split at each sector: against the driver's own best lap, else the car on the knockout line (Q3: pole).
    if (mine) for (let i = 0; i < 3; i++) {
      const at = sectorBeat(l, i);
      if (at > local || l.sectors.slice(0, i + 1).some(x => x === null) || i === 2) continue;
      const before = bestAt(at), ownBest = laps.find(x => x.driverId === l.driverId && x.time !== null && x.time === before.get(l.driverId) && doneAt(x) <= at);
      const cutId = rank(before)[seg === 'Q3' ? 0 : FORMAT[seg].cars - FORMAT[seg].out - 1], cutLap = cutId && cutId !== l.driverId ? laps.find(x => x.driverId === cutId && x.time !== null && x.time === before.get(cutId) && doneAt(x) <= at) : undefined;
      const ref = ownBest ?? cutLap;
      const col = colour.get(l)?.[i]?.color;
      const opener = col === 'PURPLE' ? `Purple S${i + 1}!` : col === 'GREEN' ? `Good S${i + 1}.` : `S${i + 1} is a bit slow.`;
      if (!ref) { radio(at, l.driverId, opener); continue; }
      const sum = (x: QualifyingLap) => x.sectors.slice(0, i + 1).reduce((a, b) => a! + b!, 0)!, delta = sum(l) - sum(ref);
      const vs = ref === ownBest ? 'on your best' : seg === 'Q3' ? 'on pole' : 'on the cut';
      radio(at, l.driverId, Math.abs(delta) < 0.05 ? `${opener} Level ${vs}.` : delta < 0 ? `${opener} You're up ${tenths(delta)} ${vs}.` : `${opener} Down ${tenths(delta)} ${vs}, keep pushing.`);
    }
    if (l.time === null || doneAt(l) > local) continue;
    const at = doneAt(l), now = bestAt(at), order = rank(now), p = order.indexOf(l.driverId) + 1, improved = now.get(l.driverId) === l.time;
    if (p === 1 && improved) say(at, `${surname(universe, l.driverId)} goes fastest!`);
    if (!mine) continue;
    const cut = FORMAT[seg].cars - FORMAT[seg].out, line = now.get(order[cut - 1]!);
    if (!improved) radio(at + 0.1, l.driverId, `No improvement, still P${p}. Box this lap.`);
    else if (seg === 'Q3' || p <= cut - 3) radio(at + 0.1, l.driverId, p === 1 ? 'That puts you on top! Box this lap.' : `P${p}. Good lap. Box this lap.`);
    else if (p <= cut) radio(at + 0.1, l.driverId, `P${p}, just inside the cut. Box, box.`);
    else radio(at + 0.1, l.driverId, `You're P${p}, need ${line !== undefined ? tenths(l.time - line) : 'more'} to get through.`);
  }
  for (const l of (result?.laps ?? []).filter(x => flagged(x, seg) && D * 3 <= local)) {
    say(D * 3, `${surname(universe, l.driverId)} misses the flag!`);
    if (isMine(l.driverId)) radio(D * 3 + 0.1, l.driverId, "We missed the flag. Sorry, that's our call.");
  }
  const w = session.weather;
  if (w.changeMinute !== null && w.changeMinute >= FORMAT[seg].offset && w.changeMinute < FORMAT[seg].offset + D && (w.changeMinute - FORMAT[seg].offset) * 3 <= local)
    say((w.changeMinute - FORMAT[seg].offset) * 3, w.kind === 'RAIN' ? 'Rain is starting to fall!' : 'The track is starting to dry.');

  const best = bestAt(local), finished = t >= D && !!result && result.order.length > 0;
  const order = finished ? result!.order : rank(best), cut = FORMAT[seg].cars - FORMAT[seg].out;
  if (finished && seg !== 'Q3') say(D * 3 + 0.5, `${seg} over. Out: ${order.slice(cut).map(id => surname(universe, id)).join(', ')}.`);
  if (finished && seg === 'Q3') say(D * 3 + 0.5, `Chequered flag! ${surname(universe, order[0]!)} takes pole.`);
  const pole = best.get(order[0]!) ?? null, codes = driverCodes(universe);
  // Position change: the order one session minute ago in this segment (start of segment for the first minute).
  const before = rank(bestAt(Math.max(0, local - 3))), was = new Map(before.map((id, i) => [id, i + 1]));
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
    // At current pace: completed sectors plus the driver's best (else the fastest + this lap's average deficit) for the rest.
    let predicted: number | null = null;
    if (phase === 'FLYING' && entrant.teamId === universe.playerTeamId) {
      const done = (colour.get(lap!) ?? []).filter((x): x is NonNullable<LiveSector> => !!x);
      if (done.length) {
        const avg = done.reduce((a, x) => a + x.delta, 0) / done.length;
        const own = laps.filter(x => x.driverId === id && x !== lap && x.time !== null && doneAt(x) <= local).sort((a, b) => a.time! - b.time!)[0];
        const rest = [0, 1, 2].slice(done.length).reduce((a, k) => a + (own ? own.sectors[k]! : (fastest[k]! + avg)), 0);
        const projected = done.reduce((a, x) => a + x.time, 0) + rest, mineBest = best.get(id);
        const target = mineBest !== undefined ? Math.min(mineBest, projected) : projected;
        predicted = 1 + [...best].filter(([other, tm]) => other !== id && tm < target).length;
      }
    }
    const finishedLaps = laps.filter(l => l.driverId === id && (l.time === null ? sectorBeat(l, l.sectors.findIndex(x => x === null)) <= local : doneAt(l) <= local))
      .sort((a, b) => a.slot - b.slot), latest = finishedLaps[finishedLaps.length - 1], ahead = i > 0 ? best.get(order[i - 1]!) : undefined;
    const last: TowerRow['last'] = !latest ? null : latest.time === null ? { kind: 'OFF', text: 'OFF' }
      : latest.time === time ? { kind: 'PB', text: 'PB' } : { kind: 'SLOWER', text: `+${(latest.time - time!).toFixed(3)}` };
    return { driverId: id, name: name(universe, id), teamId: entrant.teamId, team: b.name, color: b.colors.primary, predicted,
      code: codes[id] ?? surname(universe, id).slice(0, 3).toUpperCase(), tyre: lap?.tyre ?? null, last,
      interval: time !== null && ahead !== undefined ? `+${(time - ahead).toFixed(3)}` : null,
      moved: time === null || finished ? 0 : (was.get(id) ?? i + 1) - (i + 1),
      nearCut: seg !== 'Q3' && phase === 'FLYING' && i >= cut - 3 && i <= cut + 2,
      mine: entrant.teamId === universe.playerTeamId, position: i + 1, time,
      gap: time === null ? 'No time' : i === 0 ? 'Fastest' : `+${(time - pole!).toFixed(3)}`,
      state: phase === 'OUT_LAP' || phase === 'FLYING' || phase === 'IN_LAP' || phase === 'OFF' ? 'TRACK' : 'GARAGE',
      danger: seg !== 'Q3' && i >= cut, out: finished && seg !== 'Q3' && i >= cut, phase, sectors,
      justFinished: !!lap && lap.time !== null && local >= doneAt(lap) && local < doneAt(lap) + 3 };
  });
  const wet = wetnessAt(session.weather, Math.min(FORMAT[seg].offset + t, SESSION_MINUTES - 1));
  return { segment: seg, minute: t, remaining: Math.max(0, D - t), cutoff: seg === 'Q3' ? null : cut, rows, finished,
    track: { wet }, commentary: feed.sort((a, b) => b.at - a.at).slice(0, 6) };
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
