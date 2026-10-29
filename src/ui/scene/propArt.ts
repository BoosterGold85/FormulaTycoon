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
          box(x, y, w * 0.7, d, 0, 0.44, '#344957', { topColor: '#526977' }),
          box(x - 0.04, y - 0.04, w + 0.08, d + 0.08, 0.44, 0.09, '#9C7A54', { topColor: '#C9A577' }),
          box(x + w * 0.55, y + 0.12, 0.16, 0.32, 0.53, 0.18, '#7D8A99'),
          box(x + w * 0.56, y + 0.18, 0.24, 0.07, 0.69, 0.04, '#C5D0DA'),
          box(x + 0.12, y + d - 0.55, 0.32, 0.35, 0.53, 0.07, '#677F8D'),
          box(x + 0.2, y + d - 0.5, 0.12, 0.23, 0.6, 0.06, '#B8C2CE')
        ]
      };
    case 'cncMachine':
      return {
        planes: [],
        boxes: [
          box(x, y, w, d, 0, 0.23, '#435564'),
          box(x, y, w * 0.72, d, 0.23, 0.72, '#9EADB9', { topColor: '#CAD4DC' }),
          box(x + w * 0.73, y + 0.08, w * 0.27, d - 0.16, 0.23, 0.85, '#C8D0D8'),
          box(x + w * 0.725, y + 0.17, 0.04, d * 0.43, 0.62, 0.28, '#203A48', { sideColor: '#6599A8' }),
          box(x + w, y + 0.21, 0.025, 0.25, 0.72, 0.21, '#4D9A9D'),
          box(x + w, y + 0.62, 0.025, 0.15, 0.56, 0.07, '#D05360'),
          box(x + 0.1, y + 0.1, 0.12, 0.12, 0.95, 0.18, '#526775'),
          box(x + 0.1, y + 0.1, 0.12, 0.12, 1.13, 0.12, '#77D3AF')
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
      return { planes: [], boxes: toolCart(x, y, w, d) };
    case 'windTunnelModel':
      return {
        planes: [],
        boxes: [
          box(x, y, w, d, 0, 0.45, '#AEB8C4', { topColor: '#D5DCE4' }),
          box(x + 0.25, y + 0.22, 0.8, 0.16, 0.45, 0.08, '#4F86C6'),
          box(x + 0.22, y + 0.15, 0.08, 0.3, 0.45, 0.14, WING),
          box(x + 0.98, y + 0.15, 0.08, 0.3, 0.45, 0.14, WING),
          box(x + 0.3, y + 0.1, 0.7, 0.08, 0.55, 0.05, WING)
        ]
      };
    case 'transporter':
      return { planes: [], boxes: transporter(x, y, w, d) };
  }
}

/** A Formula car pointing towards +y, centred on `cx`, rear axle near `y0`. */
function raceCar(cx: number, y0: number, color: string): BoxPrimitive[] {
  const b = (dx: number, dy: number, w: number, d: number, z: number, h: number, c: string) =>
    box(cx + dx, y0 + dy, w, d, z, h, c);
  return [
    // Flat carbon floor, stepped sidepods and a long, tapering nose.
    b(-0.35, 0.35, 0.7, 1.45, 0.10, 0.06, DARK),
    b(-0.14, 0.25, 0.28, 1.05, 0.16, 0.27, color),
    b(-0.34, 0.74, 0.22, 0.78, 0.17, 0.16, color),
    b(0.12, 0.74, 0.22, 0.78, 0.17, 0.16, color),
    b(-0.25, 0.79, 0.1, 0.24, 0.33, 0.03, DARK),
    b(0.15, 0.79, 0.1, 0.24, 0.33, 0.03, DARK),
    b(-0.15, 1.32, 0.3, 0.42, 0.15, 0.16, color),
    b(-0.10, 1.74, 0.2, 0.42, 0.12, 0.13, color),
    b(-0.065, 2.16, 0.13, 0.33, 0.10, 0.09, color),
    // Open cockpit with a three-sided raised halo and central support.
    b(-0.105, 1.07, 0.21, 0.35, 0.34, 0.025, '#090F16'),
    b(-0.15, 1.02, 0.035, 0.4, 0.36, 0.09, WING),
    b(0.115, 1.02, 0.035, 0.4, 0.36, 0.09, WING),
    b(-0.15, 1.02, 0.3, 0.045, 0.4, 0.05, WING),
    b(-0.018, 1.36, 0.036, 0.12, 0.31, 0.13, WING),
    // Exposed tyres, silver hubs and suspension links. No enclosing bodywork.
    ...[0.35, 1.94].flatMap((dy, axle) => [-1, 1].flatMap(side => {
      const dx = side < 0 ? -0.58 : 0.33;
      return [
        b(dx, dy, 0.25, axle ? 0.4 : 0.48, 0.02, 0.33, TYRE),
        b(dx + 0.035, dy + 0.1, 0.18, 0.2, 0.35, 0.025, '#424B59'),
        b(side < 0 ? -0.33 : 0.14, dy + 0.18, 0.19, 0.055, 0.15, 0.04, '#8C9BAA')
      ];
    })),
    // Two-element wings, end plates and a tall rear support.
    b(-0.04, 0.05, 0.08, 0.15, 0.17, 0.30, DARK),
    b(-0.49, 0.02, 0.98, 0.16, 0.45, 0.07, color),
    b(-0.49, 0.19, 0.98, 0.08, 0.40, 0.04, WING),
    b(-0.50, 0.02, 0.04, 0.25, 0.39, 0.16, DARK),
    b(0.46, 0.02, 0.04, 0.25, 0.39, 0.16, DARK),
    b(-0.56, 2.39, 1.12, 0.14, 0.06, 0.055, color),
    b(-0.53, 2.54, 1.06, 0.08, 0.07, 0.04, WING),
    b(-0.56, 2.37, 0.04, 0.27, 0.05, 0.13, DARK),
    b(0.52, 2.37, 0.04, 0.27, 0.05, 0.13, DARK)
  ];
}

export function toolCart(x: number, y: number, w: number, d: number): BoxPrimitive[] {
  return [
    box(x, y, w, d, 0.08, 0.49, '#B92B40', { topColor: '#293440' }),
    ...[0.19, 0.32, 0.45].map(z => box(x + w, y + 0.06, 0.025, d - 0.12, z, 0.025, '#B7C4D1')),
    box(x + 0.05, y + 0.05, w - 0.1, d - 0.1, 0.57, 0.045, '#A2AFBD'),
    box(x + 0.07, y + 0.12, Math.max(0.06, w - 0.16), 0.05, 0.615, 0.02, '#DCE4EB'),
    ...[0.03, d - 0.1].map(dy => box(x + w - 0.09, y + dy, 0.09, 0.09, 0, 0.09, TYRE))
  ];
}

/** Desk with monitors facing the worker: +y if the desk is wide, +x if it is deep. */
function desk(x: number, y: number, w: number, d: number, monitors = 0): BoxPrimitive[] {
  const parts = [
    box(x + 0.06, y + 0.06, 0.09, d - 0.12, 0, 0.47, '#26313F'),
    box(x + w - 0.15, y + 0.06, 0.09, d - 0.12, 0, 0.47, '#26313F'),
    box(x, y, w, d, 0.47, 0.08, '#7B8696', { topColor: monitors ? '#52657A' : '#A9B4C2' }),
    box(x + w * 0.25, y + d * 0.6, w * 0.5, 0.12, 0.55, 0.025, '#263443')
  ];
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
    box(x + 0.3, y + 0.48, 0.06, 0.7, 0.2, 0.12, '#AEBECC'),
    box(x + 0.46, y + 0.48, 0.08, 0.36, 0.44, 0.12, DARK),
    box(x + 0.4, y + 0.5, 0.25, 0.06, 0.51, 0.08, '#CBD5DF'),
    box(x, y, w, d, 0, 0.14, '#2B3240', { topColor: '#3A4352' }),
    box(x - 0.1, y + 0.05, 0.08, d - 0.1, 0.15, 0.8, DARK, { sideColor: SCREEN_BLUE }),
    box(x + 0.05, y - 0.08, w - 0.25, 0.08, 0.15, 0.8, DARK, { frontColor: SCREEN_BLUE }),
    box(x + 0.45, y + 0.5, 0.25, 0.08, 0.14, 0.4, '#3B4350'),
    box(x + 0.75, y + 0.45, 0.45, 0.6, 0.14, 0.22, '#D92D44'),
    box(x + 1.05, y + 0.45, 0.15, 0.6, 0.36, 0.32, '#D92D44')
  ];
}

function crates(x: number, y: number, w: number, d: number): BoxPrimitive[] {
  const half = w / 2 - 0.04;
  return [
    box(x, y, half, d, 0, 0.5, '#C19765', { topColor: '#D3B283' }),
    box(x + half * 0.46, y, 0.07, d, 0.5, 0.015, '#E3D0AD'),
    box(x + half + 0.08, y, half, d, 0, 0.5, '#2E4054', { topColor: '#536A80' }),
    box(x + half + 0.08, y + d, half, 0.02, 0.18, 0.09, '#C83B4B'),
    box(x + 0.15, y + 0.1, half, d - 0.2, 0.5, 0.42, '#344B61', { topColor: '#5B7288' }),
    box(x + 0.17, y + 0.12, 0.035, d - 0.24, 0.92, 0.02, '#B1BFCA'),
    box(x + half + 0.08, y + 0.03, 0.03, d - 0.06, 0, 0.51, '#A3B1BE')
  ];
}

function transporter(x: number, y: number, w: number, d: number): BoxPrimitive[] {
  const cabDepth = 0.9;
  const trailer = d - cabDepth;
  return [
    box(x + 0.15, y + 0.4, 0.3, 0.6, 0, 0.35, TYRE),
    box(x + w - 0.45, y + 0.4, 0.3, 0.6, 0, 0.35, TYRE),
    box(x, y, w, trailer, 0.3, 1.5, '#243347', { topColor: '#4D6075' }),
    box(x, y + 0.04, w, 0.04, 0.36, 1.3, '#6A7C90'),
    box(x + w + 0.02, y + 0.32, 0.02, trailer - 0.6, 1.2, 0.08, '#D9E5F0'),
    box(x + 0.12, y - 0.5, w - 0.24, 0.5, 0, 0.08, '#637386'),
    box(x + w, y + 0.2, 0.02, trailer - 0.4, 0.75, 0.22, '#D92D44'),
    box(x + 0.15, y + trailer + 0.1, 0.3, 0.5, 0, 0.35, TYRE),
    box(x + w - 0.45, y + trailer + 0.1, 0.3, 0.5, 0, 0.35, TYRE),
    box(x + 0.05, y + trailer + 0.05, w - 0.1, cabDepth - 0.1, 0.25, 1.1, '#D92D44', {
      frontColor: '#B42335'
    }),
    box(x + 0.15, y + d - 0.06, w - 0.3, 0.02, 0.85, 0.4, '#20303F')
  ];
}
