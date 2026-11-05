/** Pure geometry for the live track map: a smoothed closed outline and positions along it by lap fraction. */
export type Pt = { x: number; y: number };

/** Chaikin corner-cutting on a closed polygon: turns the stylized corner points into a flowing circuit line. */
export function smoothLoop(points: number[][], passes = 3): Pt[] {
  let pts: Pt[] = points.map(p => ({ x: p[0]!, y: p[1]! }));
  for (let n = 0; n < passes; n++) {
    const next: Pt[] = [];
    pts.forEach((a, i) => {
      const b = pts[(i + 1) % pts.length]!;
      next.push({ x: a.x * 0.75 + b.x * 0.25, y: a.y * 0.75 + b.y * 0.25 }, { x: a.x * 0.25 + b.x * 0.75, y: a.y * 0.25 + b.y * 0.75 });
    });
    pts = next;
  }
  return pts;
}

/** Height/width of an outline's bounding box, clamped so very long or tall circuits stay readable. */
export function outlineAspect(points: number[][]): number {
  const xs = points.map(p => p[0]!), ys = points.map(p => p[1]!);
  return Math.max(0.5, Math.min(0.9, (Math.max(...ys) - Math.min(...ys)) / Math.max(1, Math.max(...xs) - Math.min(...xs))));
}
/** Scaled loop (closed: last point repeats the first) with the arc-length fraction (0..1) of every point. */
export function loopPath(points: number[][], width: number, height: number) {
  // Fit the smoothed outline's bounding box into the box, keeping its proportions and centring it.
  const raw = smoothLoop(points), xs = raw.map(p => p.x), ys = raw.map(p => p.y);
  const minX = Math.min(...xs), minY = Math.min(...ys), bw = Math.max(...xs) - minX || 1, bh = Math.max(...ys) - minY || 1;
  const k = Math.min(width / bw, height / bh), ox = (width - bw * k) / 2, oy = (height - bh * k) / 2;
  const pts = raw.map(p => ({ x: ox + (p.x - minX) * k, y: oy + (p.y - minY) * k }));
  const closed = [...pts, pts[0]!], lengths = [0];
  for (let i = 1; i < closed.length; i++) lengths.push(lengths[i - 1]! + Math.hypot(closed[i]!.x - closed[i - 1]!.x, closed[i]!.y - closed[i - 1]!.y));
  const total = lengths[lengths.length - 1]!;
  return { pts: closed, fractions: lengths.map(l => l / total) };
}
export type LoopPath = ReturnType<typeof loopPath>;

/** Point and heading (degrees) at a lap fraction, wrapping past 1. */
export function pointAt(path: LoopPath, fraction: number): Pt & { angle: number } {
  const f = ((fraction % 1) + 1) % 1, i = Math.max(1, path.fractions.findIndex(x => x >= f));
  const a = path.pts[i - 1]!, b = path.pts[i]!, span = path.fractions[i]! - path.fractions[i - 1]!, t = span ? (f - path.fractions[i - 1]!) / span : 0;
  return { x: a.x + (b.x - a.x) * t, y: a.y + (b.y - a.y) * t, angle: Math.atan2(b.y - a.y, b.x - a.x) * 180 / Math.PI };
}

/**
 * Interpolation table over TWO laps (fractions 0..2) so a car gliding across the start/finish line never has
 * to jump back; Animated needs strictly increasing input ranges.
 */
export function doubleLoopRanges(path: LoopPath) {
  const input: number[] = [], xs: number[] = [], ys: number[] = [];
  for (const lap of [0, 1]) path.fractions.forEach((f, i) => {
    if (lap === 1 && i === 0) return;
    input.push(f + lap); xs.push(path.pts[i]!.x); ys.push(path.pts[i]!.y);
  });
  return { input, xs, ys };
}
