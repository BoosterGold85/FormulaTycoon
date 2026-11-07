import {CAR_BACKGROUND, CHARCOAL, contrast, formShade, patternColor, secondPatternColor, type ArtColors} from './color';
import {poly, type Shape, type VectorArt} from './shapes';

/**
 * One parametric open-wheel car in isometric three-quarter top view, recoloured per team.
 * Built from simple 3D blocks with one projection, so the angle is identical at every size.
 * World units: x = car length (rear 0 to nose 50), y = across (+y faces the viewer), z = up.
 */
export type CarOptions = {colors: ArtColors; detail: 'full' | 'small'; background?: boolean};
type P3 = [number, number, number];

// Fitted so the whole car (rear wing to front wing) sits inside the 320 x 200 card with padding.
const K = 3.55, COS = 0.866, SIN = 0.5, OX = 82, OY = 72;
const iso = ([x, y, z]: P3): [number, number] => [OX + (x - y) * COS * K, OY + (x + y) * SIN * K - z * K];
const face = (pts: P3[], fill: string, opacity?: number): Shape => ({kind: 'path', d: poly(pts.map(iso)), fill, ...(opacity ? {opacity} : {})});

/** Visible faces of a block whose half-width tapers between two stations (top, +y side, +x end). */
function block(x0: number, x1: number, s0: {w: number; z0: number; z1: number}, s1: {w: number; z0: number; z1: number}, top: string, side: string, y = 0): Shape[] {
  const a = (x: number, s: typeof s0, sign: 1 | -1, z: 'z0' | 'z1'): P3 => [x, y + sign * s.w, s[z]];
  return [
    face([a(x0, s0, -1, 'z1'), a(x1, s1, -1, 'z1'), a(x1, s1, 1, 'z1'), a(x0, s0, 1, 'z1')], top),
    face([a(x0, s0, 1, 'z0'), a(x1, s1, 1, 'z0'), a(x1, s1, 1, 'z1'), a(x0, s0, 1, 'z1')], side),
    face([a(x1, s1, -1, 'z0'), a(x1, s1, 1, 'z0'), a(x1, s1, 1, 'z1'), a(x1, s1, -1, 'z1')], side)
  ];
}
const box = (x0: number, x1: number, y0: number, y1: number, z0: number, z1: number, top: string, side: string) =>
  block(x0, x1, {w: (y1 - y0) / 2, z0, z1}, {w: (y1 - y0) / 2, z0, z1}, top, side, (y0 + y1) / 2);

function hull(points: Array<[number, number]>) {
  const p = [...points].sort((a, b) => a[0] - b[0] || a[1] - b[1]);
  const cross = (o: number[], a: number[], b: number[]) => (a[0]! - o[0]!) * (b[1]! - o[1]!) - (a[1]! - o[1]!) * (b[0]! - o[0]!);
  const half = (list: typeof p) => { const out: typeof p = []; for (const q of list) { while (out.length >= 2 && cross(out[out.length - 2]!, out[out.length - 1]!, q) <= 0) out.pop(); out.push(q); } out.pop(); return out; };
  return [...half(p), ...half([...p].reverse())];
}
/** A chunky tyre: a disc in the x-z plane extruded across y, with an optional rim on the near face. */
function wheel(cx: number, r: number, yFar: number, yNear: number, rim: string | null, full: boolean): Shape[] {
  const ring = (y: number, radius: number) => Array.from({length: 28}, (_, i) => { const t = i / 28 * Math.PI * 2; return iso([cx + radius * Math.cos(t), y, r + radius * Math.sin(t)]); });
  const shapes: Shape[] = [
    {kind: 'path', d: poly(hull([...ring(yFar, r), ...ring(yNear, r)])), fill: '#17161C'},
    {kind: 'path', d: poly(ring(yNear, r)), fill: CHARCOAL}
  ];
  if (rim) {
    shapes.push({kind: 'path', d: poly(ring(yNear, r * .58)), fill: rim});
    if (full) shapes.push({kind: 'path', d: poly(ring(yNear, r * .2)), fill: CHARCOAL});
  }
  return shapes;
}

export function carArt({colors, detail, background = true}: CarOptions): VectorArt {
  const full = detail === 'full';
  const base = colors.primary, shade = formShade(base);
  const a = patternColor(colors), b = secondPatternColor(colors, a), aShade = formShade(a);
  // Rims are team primary; on near-black teams they would vanish into the tyre, so use the stripe colour.
  const rim = contrast(base, CHARCOAL) < 1.6 ? a : base;
  const shapes: Shape[] = [];
  const add = (...s: Shape[]) => shapes.push(...s);
  // Soft flat ground shadow.
  add({kind: 'path', d: poly(Array.from({length: 36}, (_, i) => { const t = i / 36 * Math.PI * 2; return iso([27 + 29 * Math.cos(t), 2 + 15 * Math.sin(t), 0]); })), fill: CHARCOAL, opacity: .13});
  // Far side: wheels and the rear wing.
  add(...wheel(8, 5, -12, -7.4, rim, full), ...wheel(41, 4.2, -11.6, -7.8, rim, full));
  add(...box(0.6, 6.4, -9, -8.2, 3, 11, shade, shade));
  add(...box(1, 6.2, -8.2, 8.2, 9.2, 10.4, CHARCOAL, '#17161C'), ...box(1.4, 4.2, -8.2, 8.2, 10.4, 11.4, a, aShade));
  // Floor, gearbox, sidepods (with the diagonal livery sweep), engine cover and cockpit.
  add(...box(5, 40, -7.6, 7.6, 1.2, 2.2, CHARCOAL, '#17161C'));
  add(...box(2.5, 9, -2, 2, 2.2, 5.2, CHARCOAL, '#17161C'));
  add(...block(8, 18, {w: 3, z0: 2.2, z1: 4.4}, {w: 7.2, z0: 2.2, z1: 6.6}, base, shade));
  add(...block(18, 30, {w: 7.2, z0: 2.2, z1: 6.6}, {w: 7.2, z0: 2.2, z1: 6.6}, base, shade));
  add(face([[19, 7.2, 6.6], [25, 7.2, 6.6], [29.5, -7.2, 6.6], [23.5, -7.2, 6.6]], a));
  if (full) {
    add(face([[19, 7.2, 6.6], [25, 7.2, 6.6], [21.6, 7.2, 2.2], [15.6, 7.2, 2.2]], aShade));
    add(face([[30, -5.6, 3], [30, 5.6, 3], [30, 5.6, 5.8], [30, -5.6, 5.8]], CHARCOAL));
  }
  add(...block(8, 27, {w: 2, z0: 2.2, z1: 5.6}, {w: 2.8, z0: 2.2, z1: 9.6}, base, shade));
  // The same diagonal sweep continues across the sloping engine cover.
  const coverZ = (x: number) => 5.6 + (x - 8) * 4 / 19 + .02, coverW = (x: number) => 2 + (x - 8) * .8 / 19;
  const sweepX = (y: number) => 19 + (7.2 - y) * .3125;
  const yN = coverW(22), yF = -coverW(22);
  add(face([[sweepX(yN), yN, coverZ(sweepX(yN))], [sweepX(yN) + 6, yN, coverZ(sweepX(yN) + 6)],
    [sweepX(yF) + 6, yF, coverZ(sweepX(yF) + 6)], [sweepX(yF), yF, coverZ(sweepX(yF))]], a));
  add(...block(27, 36.5, {w: 3.2, z0: 2.2, z1: 7.4}, {w: 2.8, z0: 2.2, z1: 6.8}, base, shade));
  add(face([[27.6, -2.1, 7.4], [33.4, -1.8, 7], [33.4, 1.8, 7], [27.6, 2.1, 7.4]], CHARCOAL));
  // Driver helmet in the cockpit, then the halo in front of it.
  const [hx, hy] = iso([29, 0, 8.4]);
  add({kind: 'circle', cx: hx, cy: hy, r: 2.3 * K, fill: a});
  add({kind: 'ellipse', cx: hx + 1.15 * K, cy: hy + .4 * K, rx: 1.3 * K, ry: .82 * K, fill: CHARCOAL, rotate: 28});
  // Halo: a front hoop around the helmet plus its centre pillar, drawn in front of the driver.
  const hoop: P3[] = Array.from({length: 11}, (_, i) => { const t = (-75 + i * 15) * Math.PI / 180; return [29.2 + 3.4 * Math.cos(t), 3 * Math.sin(t), 9.8]; });
  add({kind: 'stroke', d: 'M' + hoop.map(p => iso(p).join(' ')).join(' L'), stroke: CHARCOAL, width: (full ? 1.1 : 1.5) * K});
  add({kind: 'stroke', d: `M${iso([32.6, 0, 9.8]).join(' ')} L${iso([35.8, 0, 7])}`.replace(',', ' '), stroke: CHARCOAL, width: (full ? 1.1 : 1.5) * K});
  // Nose with a stripe, near rear wing endplate.
  add(...block(36.5, 47.5, {w: 2.6, z0: 2.4, z1: 6.6}, {w: 1.1, z0: 2.1, z1: 3.6}, base, shade));
  if (full) add(face([[36.5, -0.9, 6.62], [47.4, -0.4, 3.62], [47.4, 0.4, 3.62], [36.5, 0.9, 6.62]], b));
  add(...box(0.6, 6.4, 8.2, 9, 3, 11, base, shade));
  // Near side wheels with team-colour rims, then the front wing on top.
  add(...wheel(8, 5, 7.4, 12, rim, full), ...wheel(41, 4.2, 7.8, 11.6, rim, full));
  add(...box(45.6, 50.6, -12, -11.2, 0.8, 3.4, base, shade));
  add(...box(46, 50.4, -11.2, 11.2, 0.8, 1.7, CHARCOAL, '#17161C'), ...box(46, 48.2, -11.2, 11.2, 1.7, 2.5, a, aShade));
  add(...box(45.6, 50.6, 11.2, 12, 0.8, 3.4, base, shade));
  return {width: 320, height: 200, label: 'Team car, isometric view',
    ...(background ? {backgroundShape: {kind: 'path', d: 'M0 0 H320 V200 H0 Z', fill: CAR_BACKGROUND} as Shape} : {}),
    layers: [{shapes}]};
}
