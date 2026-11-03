import type {WeekReport} from './weekStory';
import type {PointCategory} from './views';

/**
 * Presentation timeline for replaying an ALREADY processed week. Pure and deterministic: it only
 * splits the report's authoritative whole points across the workdays and marks when the week's swing,
 * stage changes and ETA change become visible. Playback speed only scales time; it never changes this.
 */
export const WORKDAYS = ['MON', 'TUE', 'WED', 'THU', 'FRI'] as const;
export type PlaybackSpeed = 1 | 2;
/** 1x ~1.6 s per workday (8 s week); 2x ~0.85 s (4.25 s week). */
export const DAY_MS: Record<PlaybackSpeed, number> = { 1: 1600, 2: 850 };
/** Share of a day after which that day's bubbles have "arrived" at the project card. */
export const ARRIVAL = 0.6;
/** Honest causality: a decision taken during a replay acts on the project from the next processed work. */
export const DECISION_EFFECT_NOTE = "This week's results are already in. Your choice applies to this project from now on.";

export type Piece = { day: number; projectId: string; department: string; category: PointCategory; points: number; accent: boolean };
export type CalloutKind = 'STALL' | 'SETBACK' | 'BREAKTHROUGH' | 'DECISION' | 'STAGE_COMPLETE' | 'PART_READY';
export type Callout = { day: number; projectId: string; department: string; kind: CalloutKind; title: string; text: string | null };
/** readyWas/fitWas: the estimate at the start of the week, so a moved ETA reads "May 25 (was May 18)".
 * quality: a quality swing from this week's EXISTING bonus points, shown from its day on. */
export type ProjectFrame = { projectId: string; name: string; pct: number; stage: string; ready: string | null; fit: string | null;
  readyWas: string | null; fitWas: string | null; quality: 'up' | 'down' | null };
export type DayState = { projects: ProjectFrame[]; counters: Partial<Record<PointCategory, number>> };
/** A decision raised this week: the replay pauses after that day's work until the player answers or defers it. */
export type DecisionStop = { day: number; projectId: string; title: string };
export type WeekTimeline = { days: number; pieces: Piece[]; callouts: Callout[]; states: DayState[]; decisions: DecisionStop[] };

const STAGE_NAME: Record<string, string> = { RESEARCH: 'Research', DESIGN: 'Design', MANUFACTURING: 'Manufacture', READY: 'Ready' };
const PATTERNS = [[1, 1.15, 0.9, 1.05, 0.9], [0.9, 1, 1.15, 0.95, 1], [1.1, 0.9, 1, 1.1, 0.9], [0.95, 1.05, 1, 0.9, 1.1], [1, 0.95, 1.1, 1, 0.95]];
const hash = (text: string) => [...text].reduce((h, c) => (h * 31 + c.charCodeAt(0)) >>> 0, 7);

/** Integer split of total by weights (largest remainder); always sums exactly to total. */
export function splitPoints(total: number, weights: number[]): number[] {
  const sum = weights.reduce((a, b) => a + b, 0);
  const w = sum > 0 ? weights : weights.map(() => 1), s = sum > 0 ? sum : weights.length;
  const raw = w.map(x => total * x / s), out = raw.map(Math.floor);
  let left = total - out.reduce((a, b) => a + b, 0);
  const order = raw.map((x, i) => ({ i, r: x - Math.floor(x) })).sort((a, b) => b.r - a.r || a.i - b.i);
  for (let k = 0; left > 0; k = (k + 1) % order.length, left--) out[order[k]!.i]!++;
  return out;
}

export function buildWeekTimeline(report: Pick<WeekReport, 'projects' | 'stories'> & Partial<Pick<WeekReport, 'newEvents'>>): WeekTimeline {
  const days = WORKDAYS.length, pieces: Piece[] = [], callouts: Callout[] = [];
  const perProject = report.projects.filter(p => p.segments.length).map(project => {
    const story = report.stories.find(s => s.projectId === project.id);
    const total = project.segments.reduce((a, s) => a + s.points, 0);
    const e = story?.day ?? 2, swing = story?.swing ?? 'NORMAL';
    const base = PATTERNS[hash(project.id) % PATTERNS.length]!;
    // A speed breakthrough visibly accelerates from its day; a quality breakthrough keeps the normal
    // rhythm and is marked by an accented piece on its day.
    const speedSwing = swing === 'BREAKTHROUGH' && !((story?.quality ?? 0) > 0 && story?.kind === 'BREAKTHROUGH');
    const weights = base.map((w, d) => swing === 'STALL' ? 0 : swing === 'SETBACK' ? (d < e ? w : 0.2 * w) : speedSwing ? (d < e ? w : 2.6 * w) : w);
    const daily = splitPoints(total, weights);
    // Stage boundaries in cumulative points: after each segment except the last (or READY after the last).
    const bounds: Array<{ at: number; kind: 'STAGE_COMPLETE' | 'PART_READY'; done: string; next: string | null }> = [];
    let acc = 0;
    project.segments.forEach((seg, i) => {
      acc += seg.points;
      const next = project.segments[i + 1];
      if (next) bounds.push({ at: acc, kind: 'STAGE_COMPLETE', done: STAGE_NAME[seg.stage]!, next: STAGE_NAME[next.stage]! });
      else if (project.toStage === 'READY') bounds.push({ at: acc, kind: 'PART_READY', done: STAGE_NAME[seg.stage]!, next: null });
    });
    const swingDay = story && (swing === 'STALL' || swing === 'SETBACK' || swing === 'BREAKTHROUGH') ? e : null;
    if (story?.title && (swingDay !== null || story.decisionDelay))
      callouts.push({ day: swingDay ?? 0, projectId: project.id, department: story.department,
        kind: swingDay !== null ? swing as CalloutKind : 'DECISION', title: story.title, text: story.text });
    let cum = 0, segIndex = 0, segUsed = 0;
    const cumAfter: number[] = [];
    daily.forEach((amount, day) => {
      let left = amount;
      while (left > 0 && segIndex < project.segments.length) {
        const seg = project.segments[segIndex]!, room = seg.points - segUsed;
        if (room <= 0) { segIndex++; segUsed = 0; continue; }
        const take = Math.min(room, left);
        pieces.push({ day, projectId: project.id, department: seg.department, category: seg.category, points: take,
          accent: swing === 'BREAKTHROUGH' && swingDay !== null && (speedSwing ? day >= swingDay : day === swingDay) });
        left -= take; segUsed += take;
      }
      const before = cum; cum += amount; cumAfter.push(cum);
      for (const b of bounds) if (b.at === 0 ? day === 0 : b.at > before && b.at <= cum) {
        const seg = project.segments.find(s => STAGE_NAME[s.stage] === b.done)!;
        callouts.push({ day, projectId: project.id, department: seg.department, kind: b.kind,
          title: b.kind === 'PART_READY' ? `${project.name} ready` : `${b.done} complete`, text: b.next ? `${b.next} started` : 'Part built' });
      }
    });
    return { project, story, total, cumAfter, swingDay, bounds };
  });

  const states: DayState[] = [];
  for (let k = 0; k <= days; k++) {
    const counters: Partial<Record<PointCategory, number>> = {};
    for (const p of pieces) if (p.day < k) counters[p.category] = (counters[p.category] ?? 0) + p.points;
    states.push({ counters, projects: perProject.map(({ project, story, total, cumAfter, swingDay, bounds }) => {
      const cum = k === 0 ? 0 : cumAfter[k - 1]!;
      const pct = total ? Math.round(project.from + (project.to - project.from) * cum / total) : k === days ? project.to : project.from;
      const passed = bounds.filter(b => b.at <= cum && (b.at > 0 || k > 0)).length;
      const stage = k === days ? project.stage : passed === 0 ? STAGE_NAME[project.fromStage]! : bounds[passed - 1]!.next ?? 'Ready';
      const switched = k === days || (swingDay !== null && k > swingDay);
      const q = story?.quality ?? 0;
      return { projectId: project.id, name: project.name, pct, stage,
        ready: (switched ? story?.readyAfter : story?.readyBefore) ?? null, fit: (switched ? story?.fitAfter : story?.fitBefore) ?? null,
        readyWas: story?.readyBefore ?? null, fitWas: story?.fitBefore ?? null,
        quality: q && (k === days || (swingDay !== null && k > swingDay)) ? (q > 0 ? 'up' : 'down') : null };
    }) });
  }
  // A stage event is raised when the project enters its new stage: stop on that day, else midweek.
  const decisions = (report.newEvents ?? []).map(e => {
    const entered = callouts.find(c => c.projectId === e.projectId && c.kind === 'STAGE_COMPLETE');
    return { day: entered ? entered.day : 2, projectId: e.projectId, title: e.title };
  }).sort((a, b) => a.day - b.day);
  return { days, pieces, callouts, states, decisions };
}

/** Presentation time (1x ms) at which a decision stop holds the replay: just after that day's work arrives. */
export const stopTime = (stop: Pick<DecisionStop, 'day'>) => (stop.day + ARRIVAL + 0.05) * DAY_MS[1];

export type PlaybackFrame = { day: number; state: number; done: boolean };
/** Which day is playing and which state is shown, from elapsed presentation time only. */
export function playbackFrame(timeline: Pick<WeekTimeline, 'days'>, elapsedMs: number, speed: PlaybackSpeed, skipped = false): PlaybackFrame {
  const dayMs = DAY_MS[speed], d = Math.floor(Math.max(0, elapsedMs) / dayMs);
  if (skipped || d >= timeline.days) return { day: timeline.days - 1, state: timeline.days, done: true };
  return { day: d, state: (elapsedMs - d * dayMs) / dayMs >= ARRIVAL ? d + 1 : d, done: false };
}

/**
 * One tick of the presentation clock, in 1x milliseconds. Speed scales elapsed time; Skip jumps to the
 * end, but an unanswered decision (holdAt) can never be passed by either: the clock waits there.
 */
export function stepPlayback(units: number, elapsedMs: number, speed: PlaybackSpeed, holdAt: number | null, skip: boolean, days: number) {
  const end = days * DAY_MS[1];
  let next = skip ? end : units + elapsedMs * DAY_MS[1] / DAY_MS[speed];
  const held = holdAt !== null && next >= holdAt;
  if (held) next = holdAt!;
  return { units: next, held, skipped: skip && !held };
}
