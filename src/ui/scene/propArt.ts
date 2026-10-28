import type { PropDefinition } from '../../game/models';
import { box, type BoxPrimitive, type PlanePrimitive } from './primitives';

/**
 * Visual recipes for static furniture. These only decide how a prop looks;
 * where it stands comes from the headquarters layout data.
 */

const SCREEN = '#7EF0D2';
const SCREEN_BLUE = '#6CC4F0';
const DARK = '#1A2029';
const TYRE = '#1B1F25';
const WING = '#E8EDF4';

export type PropArt = { planes: PlanePrimitive[]; boxes: BoxPrimitive[] };

export function propArt(prop: PropDefinition): PropArt {
  const { x, y, width: w, depth: d } = prop.area;
  switch (prop.kind) {
    case 'carBay':
      return {
        planes: [{ x, y, width: w, depth: d, color: '#323C49', borderColor: '#E1B341' }],
        boxes: []
      };
    case 'raceCar':
      return { planes: [], boxes: raceCar(x + w / 2, y, prop.color ?? '#D92D44') };
    case 'desk':
      return { planes: [], boxes: desk(x, y, w, d) };
    case 'pitWallDesk':
      return { planes: [], boxes: desk(x, y, w, d, 3) };
    case 'simRig':
      return { planes: [], boxes: simRig(x, y, w, d) };
    case 'workbench':
      return {
        planes: [],
        boxes: [
          box(x, y, w, d, 0, 0.5, '#9C7A54', { topColor: '#C9A577' }),
          box(x + 0.15, y + 0.2, 0.25, 0.3, 0.5, 0.18, '#7D8A99'),
          box(x + 0.2, y + d - 0.6, 0.3, 0.35, 0.5, 0.1, '#B8C2CE')
        ]
      };
    case 'cncMachine':
      return {
        planes: [],
        boxes: [
          box(x, y, w, d, 0, 0.95, '#C8D0D8', { sideColor: '#6FA8C7', topColor: '#DDE3EA' }),
          box(x + 0.1, y + 0.1, 0.12, 0.12, 0.95, 0.3, '#F0A33A')
        ]
      };
    case 'crates':
      return { planes: [], boxes: crates(x, y, w, d) };
    case 'tyreStack':
      return {
        planes: [],
        boxes: [0, 1, 2, 3].map(level =>
          box(x, y, w, d, level * 0.2, 0.17, TYRE, { topColor: '#3A414B' })
        )
      };
    case 'toolChest':
      return {
        planes: [],
        boxes: [box(x, y, w, d, 0, 0.7, '#C0392B', { topColor: '#9AA5B1' })]
      };
    case 'windTunnelModel':
      return {
        planes: [],
        boxes: [
          box(x, y, w, d, 0, 0.45, '#AEB8C4', { topColor: '#D5DCE4' }),
          box(x + 0.25, y + 0.22, 0.8, 0.16, 0.45, 0.08, '#4F86C6'),
          box(x + 0.22, y + 0.15, 0.08, 0.3, 0.45, 0.14, WING),
          box(x + 0.98, y + 0.15, 0.08, 0.3, 0.45, 0.04, WING)
        ]
      };
    case 'transporter':
      return { planes: [], boxes: transporter(x, y, w, d) };
  }
}

/** A Formula car pointing towards +y, centred on `cx`, rear axle near `y0`. */
function raceCar(cx: number, y0: number, color: string): BoxPrimitive[] {
  return [
    box(cx - 0.42, y0, 0.84, 0.16, 0.36, 0.1, WING),
    box(cx - 0.05, y0 + 0.05, 0.1, 0.12, 0.08, 0.28, DARK),
    box(cx - 0.56, y0 + 0.28, 0.26, 0.5, 0, 0.36, TYRE),
    box(cx + 0.3, y0 + 0.28, 0.26, 0.5, 0, 0.36, TYRE),
    box(cx - 0.17, y0 + 0.2, 0.34, 1.25, 0.06, 0.3, color),
    box(cx - 0.4, y0 + 0.75, 0.8, 0.75, 0.06, 0.2, color),
    box(cx - 0.18, y0 + 1.45, 0.36, 0.42, 0.06, 0.2, color),
    box(cx - 0.11, y0 + 1.5, 0.22, 0.28, 0.26, 0.04, DARK),
    box(cx - 0.11, y0 + 1.87, 0.22, 0.6, 0.06, 0.13, color),
    box(cx - 0.52, y0 + 1.82, 0.24, 0.42, 0, 0.32, TYRE),
    box(cx + 0.28, y0 + 1.82, 0.24, 0.42, 0, 0.32, TYRE),
    box(cx - 0.5, y0 + 2.42, 1.0, 0.18, 0.02, 0.07, WING)
  ];
}

/** Desk with monitors facing the worker: +y if the desk is wide, +x if it is deep. */
function desk(x: number, y: number, w: number, d: number, monitors = 0): BoxPrimitive[] {
  const parts = [box(x, y, w, d, 0, 0.5, '#7B8696', { topColor: '#A9B4C2' })];
  const facesX = d > w;
  const count = monitors || (facesX ? 1 : 2);
  const span = facesX ? d : w;
  const size = Math.min(0.5, (span - 0.2) / count - 0.08);
  for (let i = 0; i < count; i += 1) {
    const offset = ((i + 0.5) / count) * span - size / 2;
    parts.push(
      facesX
        ? box(x + 0.1, y + offset, 0.06, size, 0.5, 0.36, DARK, { sideColor: SCREEN })
        : box(x + offset, y + 0.1, size, 0.06, 0.5, 0.36, DARK, { frontColor: SCREEN })
    );
  }
  return parts;
}

function simRig(x: number, y: number, w: number, d: number): BoxPrimitive[] {
  return [
    box(x, y, w, d, 0, 0.14, '#2B3240', { topColor: '#3A4352' }),
    box(x - 0.1, y + 0.05, 0.08, d - 0.1, 0.15, 0.8, DARK, { sideColor: SCREEN_BLUE }),
    box(x + 0.05, y - 0.08, w - 0.25, 0.08, 0.15, 0.8, DARK, { frontColor: SCREEN_BLUE }),
    box(x + 0.45, y + 0.5, 0.25, 0.08, 0.14, 0.4, '#3B4350'),
    box(x + 0.75, y + 0.45, 0.45, 0.6, 0.14, 0.22, '#D92D44'),
    box(x + 1.05, y + 0.45, 0.15, 0.6, 0.36, 0.32, '#D92D44')
  ];
}

function crates(x: number, y: number, w: number, d: number): BoxPrimitive[] {
  const crate = '#C98A48';
  const half = w / 2 - 0.04;
  return [
    box(x, y, half, d, 0, 0.5, crate, { topColor: '#DDA466' }),
    box(x + half + 0.08, y, half, d, 0, 0.5, crate, { topColor: '#DDA466' }),
    box(x + 0.15, y + 0.1, half, d - 0.2, 0.5, 0.42, '#B97B3E', { topColor: '#D19A5C' })
  ];
}

function transporter(x: number, y: number, w: number, d: number): BoxPrimitive[] {
  const cabDepth = 0.9;
  const trailer = d - cabDepth;
  return [
    box(x + 0.15, y + 0.4, 0.3, 0.6, 0, 0.35, TYRE),
    box(x + w - 0.45, y + 0.4, 0.3, 0.6, 0, 0.35, TYRE),
    box(x, y, w, trailer, 0.3, 1.5, '#E8EDF4', { topColor: '#F5F7FA' }),
    box(x + w, y + 0.2, 0.02, trailer - 0.4, 0.75, 0.22, '#D92D44'),
    box(x + 0.15, y + trailer + 0.1, 0.3, 0.5, 0, 0.35, TYRE),
    box(x + w - 0.45, y + trailer + 0.1, 0.3, 0.5, 0, 0.35, TYRE),
    box(x + 0.05, y + trailer + 0.05, w - 0.1, cabDepth - 0.1, 0.25, 1.1, '#D92D44', {
      frontColor: '#B42335'
    }),
    box(x + 0.15, y + d - 0.06, w - 0.3, 0.02, 0.85, 0.4, '#20303F')
  ];
}
