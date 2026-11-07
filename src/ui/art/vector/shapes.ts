/**
 * Platform-agnostic vector art: templates return plain shape lists, renderers turn them into
 * SVG markup (review sheet, web) or native drawing later. No team IDs or game state in here.
 */
export type Shape =
  | {kind: 'path'; d: string; fill: string; opacity?: number}
  | {kind: 'circle'; cx: number; cy: number; r: number; fill: string; opacity?: number}
  | {kind: 'ellipse'; cx: number; cy: number; rx: number; ry: number; fill: string; opacity?: number; rotate?: number}
  | {kind: 'stroke'; d: string; stroke: string; width: number; opacity?: number};
export type Gradient = {id: string; stops: Array<[number, string]>; cx?: number; cy?: number; r?: number};
/** `clip` groups are drawn inside the clip path (e.g. helmet stripes inside the shell). */
export type Layer = {shapes: Shape[]; clip?: string; transform?: {x: number; y: number; scale?: number}};
export type VectorArt = {width: number; height: number; label: string; background?: Gradient; backgroundShape?: Shape; layers: Layer[];
  /** Optional outer crop for the whole picture (e.g. a round portrait). */
  clip?: string};

const n = (v: number) => Math.round(v * 100) / 100;
export const pt = (x: number, y: number) => `${n(x)} ${n(y)}`;
export const poly = (points: Array<[number, number]>) => `M${points.map(([x, y]) => pt(x, y)).join(' L')} Z`;

function shapeSvg(s: Shape): string {
  const o = s.opacity !== undefined && s.opacity < 1 ? ` opacity="${s.opacity}"` : '';
  switch (s.kind) {
    case 'path': return `<path d="${s.d}" fill="${s.fill}"${o}/>`;
    case 'circle': return `<circle cx="${n(s.cx)}" cy="${n(s.cy)}" r="${n(s.r)}" fill="${s.fill}"${o}/>`;
    case 'ellipse': return `<ellipse cx="${n(s.cx)}" cy="${n(s.cy)}" rx="${n(s.rx)}" ry="${n(s.ry)}" fill="${s.fill}"${o}${s.rotate ? ` transform="rotate(${n(s.rotate)} ${n(s.cx)} ${n(s.cy)})"` : ''}/>`;
    case 'stroke': return `<path d="${s.d}" fill="none" stroke="${s.stroke}" stroke-width="${n(s.width)}" stroke-linecap="round" stroke-linejoin="round"${o}/>`;
  }
}
/** SVG markup. `uid` keeps gradient/clip ids unique when many copies share a page. */
export function toSvg(art: VectorArt, size: number, uid: string): string {
  const h = Math.round(size * art.height / art.width);
  const defs: string[] = [];
  if (art.background) {
    const g = art.background;
    defs.push(`<radialGradient id="${uid}-${g.id}" cx="${g.cx ?? 0.5}" cy="${g.cy ?? 0.5}" r="${g.r ?? 0.6}">${g.stops.map(([at, c]) => `<stop offset="${at}" stop-color="${c}"/>`).join('')}</radialGradient>`);
  }
  const body = art.layers.map((layer, i) => {
    let inner = layer.shapes.map(shapeSvg).join('');
    if (layer.clip) {
      defs.push(`<clipPath id="${uid}-c${i}"><path d="${layer.clip}"/></clipPath>`);
      inner = `<g clip-path="url(#${uid}-c${i})">${inner}</g>`;
    }
    const t = layer.transform;
    return t ? `<g transform="translate(${n(t.x)} ${n(t.y)}) scale(${n(t.scale ?? 1)})">${inner}</g>` : inner;
  }).join('');
  if (art.clip) defs.push(`<clipPath id="${uid}-all"><path d="${art.clip}"/></clipPath>`);
  const bg = art.backgroundShape ? shapeSvg(art.background ? {...art.backgroundShape, fill: `url(#${uid}-${art.background.id})`} as Shape : art.backgroundShape) : '';
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${art.width} ${art.height}" width="${size}" height="${h}" role="img" aria-label="${art.label}">${defs.length ? `<defs>${defs.join('')}</defs>` : ''}${art.clip ? `<g clip-path="url(#${uid}-all)">${bg}${body}</g>` : bg + body}</svg>`;
}
