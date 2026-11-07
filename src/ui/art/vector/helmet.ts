import {CHARCOAL, OFF_WHITE, contrast, formShade, patternColor, portraitBackdrop, secondPatternColor, type ArtColors} from './color';
import {poly, type Layer, type Shape, type VectorArt} from './shapes';

/** Eight original stripe layouts. Teammates always get different ones (roster-pack rule). */
export const HELMET_PATTERN_NAMES = ['Sweep', 'Crown', 'Twin', 'Split', 'Chevron', 'Band', 'Steps', 'Spine'] as const;
export type HelmetOptions = {colors: ArtColors; pattern: number; detail: 'full' | 'small'; backdrop?: 'blue' | 'team'};

// Three-quarter view facing right, upper-left light. 200 x 200 artboard.
const SHELL = 'M50 142 C30 108 34 46 90 30 C142 15 182 46 180 92 C179 114 171 130 160 140 C132 152 76 154 50 142 Z';
const VISOR = 'M94 62 C120 50 160 50 178 62 C184 80 182 99 175 112 C146 121 113 121 91 112 C86 96 87 77 94 62 Z';
const VISOR_SEAL = 'M88 57 C118 44 163 44 183 57 C190 78 188 102 180 116 C148 126 111 126 86 117 C80 99 81 75 88 57 Z';
const CHIN = 'M94 115 C124 124 157 122 176 114 C172 130 166 140 158 146 C130 154 100 154 80 147 C87 137 91 126 94 115 Z';
const SHOULDERS = 'M4 200 C8 176 34 163 66 159 L140 157 C172 159 194 176 198 200 Z';
const SHOULDER_SHADE = 'M126 157 C170 159 194 176 198 200 L150 200 C150 184 141 168 126 157 Z';
const COLLAR = 'M56 162 C76 150 130 148 152 156 L154 178 C128 169 84 169 58 180 Z';

function pattern(index: number, a: string, b: string, full: boolean): Shape[] {
  const p = (pts: Array<[number, number]>, fill: string): Shape => ({kind: 'path', d: poly(pts), fill});
  const second = (s: Shape) => full ? [s] : [];
  switch (((index % 8) + 8) % 8) {
    case 0: return [p([[18, 118], [54, 146], [196, 46], [160, 18]], a), ...second(p([[62, 150], [74, 158], [204, 66], [194, 54]], b))];
    case 1: return [...second({kind: 'ellipse', cx: 104, cy: 22, rx: 98, ry: 50, fill: b}), {kind: 'ellipse', cx: 104, cy: 14, rx: 94, ry: 46, fill: a}];
    case 2: return [p([[10, 96], [30, 112], [178, 6], [158, -8]], a), p([[40, 130], [62, 146], [200, 44], [180, 28]], full ? b : a)];
    case 3: return [p([[0, 52], [150, 200], [0, 200]], a), ...second(p([[0, 38], [164, 200], [150, 200], [0, 52]], b))];
    case 4: return [p([[22, 52], [68, 52], [128, 92], [68, 132], [22, 132], [82, 92]], a), ...second(p([[4, 70], [24, 70], [56, 92], [24, 114], [4, 114], [36, 92]], b))];
    case 5: return [{kind: 'path', d: 'M0 70 Q100 32 200 50 L200 72 Q100 54 0 94 Z', fill: a}, ...second({kind: 'path', d: 'M0 98 Q100 58 200 76 L200 84 Q100 66 0 106 Z', fill: b})];
    case 6: return [p([[26, 28], [62, 28], [62, 56], [80, 56], [80, 88], [98, 88], [98, 150], [26, 150]], a), ...second(p([[26, 28], [40, 28], [40, 150], [26, 150]], b))];
    default: return [{kind: 'path', d: 'M62 146 C48 76 90 30 154 26 L164 44 C106 48 76 82 82 146 Z', fill: a}, ...second({kind: 'path', d: 'M88 146 C84 92 112 58 166 50 L170 58 C118 64 94 96 96 146 Z', fill: b})];
  }
}

/** One parametric helmet portrait. Same geometry for everyone; colours and pattern vary. */
export function helmetArt({colors, pattern: index, detail, backdrop = 'blue'}: HelmetOptions): VectorArt {
  const full = detail === 'full';
  const a = patternColor(colors), b = secondPatternColor(colors, a);
  const shade = formShade(colors.primary);
  const [inner, outer] = portraitBackdrop(colors, backdrop);
  const darkShell = contrast(colors.primary, CHARCOAL) < 1.8;
  // Framing: the helmet sits a little smaller so the collar and shoulders read in the circle.
  const head = {x: 17, y: 4, scale: .83}, suit = {x: 0, y: -24};
  const layers: Layer[] = [
    // Suit: shoulders in livery with one diagonal sweep, shaded on the lower-right.
    {transform: suit, shapes: [{kind: 'path', d: SHOULDERS, fill: colors.primary}]},
    {transform: suit, clip: SHOULDERS, shapes: [
      ...(full ? [{kind: 'path', d: poly([[30, 200], [66, 200], [140, 157], [112, 157]]), fill: a} as Shape] : []),
      {kind: 'path', d: SHOULDER_SHADE, fill: shade}]},
    {transform: suit, shapes: [{kind: 'path', d: COLLAR, fill: full ? b : a}]},
    // Helmet shell, stripes clipped inside it, then the form shade along the lower edge.
    {transform: head, shapes: [{kind: 'path', d: SHELL, fill: colors.primary}]},
    {transform: head, clip: SHELL, shapes: [...pattern(index, a, b, full), {kind: 'ellipse', cx: 132, cy: 182, rx: 120, ry: 48, fill: shade}]},
    {transform: head, shapes: [
      {kind: 'path', d: CHIN, fill: shade},
      // A pale visor seal only where a charcoal visor would vanish into a very dark shell.
      ...(darkShell ? [{kind: 'path', d: VISOR_SEAL, fill: OFF_WHITE} as Shape] : []),
      {kind: 'path', d: VISOR, fill: CHARCOAL},
      {kind: 'stroke', d: 'M117 66 L112 106', stroke: '#DCE8F1', width: full ? 6 : 8, opacity: .9},
      ...(full ? [{kind: 'stroke', d: 'M131 63 L127 100', stroke: '#DCE8F1', width: 3.5, opacity: .75} as Shape] : [])
    ]}
  ];
  return {width: 200, height: 200, label: 'Driver helmet portrait',
    background: {id: 'bg', cx: .38, cy: .34, r: .7, stops: [[0, inner], [1, outer]]},
    backgroundShape: {kind: 'circle', cx: 100, cy: 100, r: 100, fill: outer}, layers,
    clip: 'M100 0 A100 100 0 1 1 99.99 0 Z'};
}
