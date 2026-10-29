import type { PropDefinition } from '../../game/models';
import { box, type BoxPrimitive, type PlanePrimitive } from './primitives';
import { toolCart, type PropArt } from './propArt';

/** Art only: no collision geometry, assignments or routes are added to the game layout. */
export const DRESSING: PropDefinition[] = [
  { id: 'bay-wheels', kind: 'tyreStack', area: { x: 5.15, y: 0.45, width: 0.38, depth: 0.42 } },
  { id: 'spare-wheels', kind: 'tyreStack', area: { x: 5.15, y: 1.05, width: 0.38, depth: 0.42 } },
  { id: 'loading-case', kind: 'toolChest', area: { x: 10.5, y: 5.65, width: 0.5, depth: 0.4 } }
];

export const FLOOR_DETAILS: PlanePrimitive[] = [
  // A central walkway remains clear. Markings describe work zones, not new obstacles.
  ...[0.6, 2.0, 3.4, 6.4, 7.8, 9.2].map(y => ({ x: 4.12, y, width: 0.055, depth: 0.65, color: '#516174' })),
  ...[5.3, 6.7, 8.1].map(x => ({ x, y: 4.72, width: 0.65, depth: 0.055, color: '#516174' })),
  ...[5.8, 8.0].flatMap(x => [
    { x, y: 0.45, width: 1.4, depth: 0.06, color: '#C4CCD5' },
    { x, y: 3.6, width: 1.4, depth: 0.06, color: '#C4CCD5' },
    { x: x + 0.65, y: 0.7, width: 0.08, depth: 0.25, color: '#D92D44' }
  ]),
  { x: 7.7, y: 5.7, width: 0.035, depth: 4.0, color: '#887750' },
  ...[0, 1, 2, 3].map(i => ({ x: 10.05, y: 5.65 + i * 0.18, width: 1.8, depth: 0.055, color: '#B49A57' }))
];

const b = box;
export const EQUIPMENT: { id: string; x: number; y: number; art: PropArt }[] = [
  {
    id: 'wing-rack', x: 7.65, y: 1.25,
    art: { planes: [], boxes: [
      b(7.6, 1.15, 0.07, 0.9, 0, 0.85, '#607184'),
      ...[0.22, 0.55].flatMap(z => [
        b(7.28, 1.27, 0.62, 0.15, z, 0.06, '#CDD9E2'),
        b(7.28, 1.27, 0.04, 0.28, z, 0.11, '#D92D44'),
        b(7.86, 1.27, 0.04, 0.28, z, 0.11, '#D92D44')
      ])
    ] }
  },
  {
    id: 'pit-trolley', x: 5.35, y: 3.15,
    art: { planes: [], boxes: toolCart(5.1, 2.8, 0.42, 0.6) }
  },
  {
    id: 'bay-monitor', x: 9.7, y: 1.4,
    art: { planes: [], boxes: [
      b(9.65, 1.2, 0.16, 0.5, 0, 0.08, '#1C2835'),
      b(9.68, 1.35, 0.06, 0.08, 0.08, 0.72, '#7A8C9E'),
      b(9.62, 1.18, 0.07, 0.5, 0.8, 0.35, '#172531', { sideColor: '#5DAEAE' })
    ] }
  },
  {
    id: 'parts-tray', x: 7.55, y: 3.1,
    art: { planes: [], boxes: [
      b(7.55, 3.05, 0.25, 0.45, 0, 0.12, '#667A8D'),
      b(7.58, 3.1, 0.06, 0.2, 0.12, 0.04, '#BEC9D4')
    ] }
  },
  {
    id: 'aero-blueprints', x: 3.25, y: 2.7,
    art: { planes: [], boxes: [
      b(2.65, 2.35, 0.8, 0.55, 0.48, 0.05, '#467895', { topColor: '#609CBD' }),
      b(2.72, 2.42, 0.62, 0.025, 0.53, 0.012, '#BCDFEB'),
      b(2.98, 2.4, 0.025, 0.38, 0.53, 0.012, '#BCDFEB'),
      b(2.72, 2.75, 0.62, 0.025, 0.53, 0.012, '#BCDFEB'),
      b(2.7, 2.4, 0.07, 0.4, 0, 0.48, '#314253'),
      b(3.32, 2.4, 0.07, 0.4, 0, 0.48, '#314253')
    ] }
  },
  {
    id: 'mfg-bins', x: 5.75, y: 7.9,
    art: { planes: [], boxes: [
      b(5.1, 7.8, 0.7, 0.3, 0, 0.4, '#2C3F50'),
      ...[5.15, 5.47].map(x => b(x, 7.82, 0.25, 0.25, 0.4, 0.16, '#5B8D9E')),
      b(5.2, 7.88, 0.1, 0.12, 0.56, 0.04, '#C0CBD0')
    ] }
  },
  {
    id: 'freight-dolly', x: 9.45, y: 9.2,
    art: { planes: [], boxes: [
      b(9.05, 9.1, 0.5, 0.45, 0.06, 0.08, '#8092A3'),
      b(9.49, 9.1, 0.055, 0.45, 0.12, 0.65, '#A6B5BF'),
      b(9.08, 9.15, 0.35, 0.33, 0.14, 0.4, '#B3976C'),
      b(9.12, 9.08, 0.12, 0.1, 0, 0.1, '#161E27'),
      b(9.12, 9.5, 0.12, 0.1, 0, 0.1, '#161E27')
    ] }
  }
];

/** Raised room dividers leave the existing central and cross-corridors open. */
export const ARCHITECTURE: BoxPrimitive[] = [
  ...[3.3, 6.5].flatMap(y => [
    b(0.2, y, 3.35, 0.055, 0, 0.38, '#2E4052'),
    b(0.2, y, 3.35, 0.035, 0.38, 0.58, '#456573', { frontColor: 'rgba(91,146,165,0.38)', sideColor: 'rgba(91,146,165,0.38)', topColor: '#7FA0AD' }),
    b(0.2, y, 3.35, 0.06, 0.96, 0.035, '#8095A5'),
    b(3.5, y, 0.065, 0.1, 0, 1.05, '#697F91')
  ]),
  ...[0.15, 4.4, 9.7].map(x => b(x, 0.04, 0.12, 0.15, 0, 2.15, '#53677B')),
  b(0.04, 9.65, 0.13, 0.15, 0, 2.15, '#53677B')
];
