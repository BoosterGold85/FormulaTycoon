import type {
  DepartmentDefinition,
  HeadquartersLayout,
  NavGraph,
  PropDefinition,
  StationDefinition,
  WorkerDefinition
} from './models';

/**
 * Floor plan (grid units, x runs to the lower-right on screen, y to the lower-left):
 *
 *   x: 0 ........ 4 | 5 .................. 10
 *   y 0  AERO       |  MAIN WORKSHOP (2 bays)
 *     3  STRATEGY   |
 *     5             +--- cross corridor ------
 *     6  SIMULATOR  |  MANUFACTURING | LOGISTICS -> transporter outside
 *    10  entrance at the front of the central corridor (x = 4.5)
 */
export const HQ_WIDTH = 10;
export const HQ_DEPTH = 10;

export const DEPARTMENTS: DepartmentDefinition[] = [
  {
    id: 'AERO',
    name: 'Aero & Design',
    shortName: 'Aero',
    area: { x: 0.15, y: 0.15, width: 3.85, depth: 3.1 },
    labelPoint: { x: 0.05, y: 1.7 },
    labelHeight: 2.05,
    floorColor: '#2C4560'
  },
  {
    id: 'STRATEGY',
    name: 'Strategy',
    shortName: 'Strategy',
    area: { x: 0.15, y: 3.45, width: 3.85, depth: 3.0 },
    labelPoint: { x: 0.05, y: 4.95 },
    labelHeight: 2.05,
    floorColor: '#33405E'
  },
  {
    id: 'SIMULATOR',
    name: 'Driver Simulator',
    shortName: 'Simulator',
    area: { x: 0.15, y: 6.65, width: 3.85, depth: 3.2 },
    labelPoint: { x: 0.05, y: 8.2 },
    labelHeight: 2.05,
    floorColor: '#41365A'
  },
  {
    id: 'WORKSHOP',
    name: 'Main Workshop',
    shortName: 'Workshop',
    area: { x: 5.0, y: 0.15, width: 4.85, depth: 4.25 },
    labelPoint: { x: 7.45, y: 0.05 },
    labelHeight: 2.05,
    floorColor: '#3A4552'
  },
  {
    id: 'MANUFACTURING',
    name: 'Parts & Manufacturing',
    shortName: 'Manufacturing',
    area: { x: 5.0, y: 5.6, width: 2.6, depth: 4.25 },
    labelPoint: { x: 5.4, y: 10.0 },
    labelHeight: 0,
    floorColor: '#3F4A3C'
  },
  {
    id: 'LOGISTICS',
    name: 'Logistics',
    shortName: 'Logistics',
    area: { x: 7.8, y: 5.6, width: 2.05, depth: 4.25 },
    labelPoint: { x: 7.95, y: 10.0 },
    labelHeight: 0,
    floorColor: '#54473A'
  }
];

export const NAV_GRAPH: NavGraph = {
  nodes: {
    ENTRANCE_OUTSIDE: { x: 4.5, y: 10.9 },
    ENTRANCE: { x: 4.5, y: 9.9 },
    HALL_SIM: { x: 4.5, y: 8.0 },
    HALL_JUNCTION: { x: 4.5, y: 5.0 },
    HALL_AERO: { x: 4.5, y: 1.9 },
    BAY_WEST: { x: 6.5, y: 5.0 },
    BAY_EAST: { x: 8.7, y: 5.0 }
  },
  edges: [
    ['ENTRANCE_OUTSIDE', 'ENTRANCE'],
    ['ENTRANCE', 'HALL_SIM'],
    ['HALL_SIM', 'HALL_JUNCTION'],
    ['HALL_JUNCTION', 'HALL_AERO'],
    ['HALL_JUNCTION', 'BAY_WEST'],
    ['BAY_WEST', 'BAY_EAST']
  ]
};

export const STATIONS: StationDefinition[] = [
  {
    id: 'CAR_BAY_1',
    name: 'Car Bay 1',
    departmentId: 'WORKSHOP',
    position: { x: 6.5, y: 2.0 },
    accessNodeId: 'BAY_WEST',
    activity: 'CAR_SERVICE',
    slots: [
      { spot: { x: 7.35, y: 2.3 }, approach: [{ x: 7.35, y: 4.0 }] },
      { spot: { x: 6.5, y: 3.8 }, approach: [] }
    ]
  },
  {
    id: 'CAR_BAY_2',
    name: 'Car Bay 2',
    departmentId: 'WORKSHOP',
    position: { x: 8.7, y: 2.0 },
    accessNodeId: 'BAY_EAST',
    activity: 'CAR_SERVICE',
    slots: [
      { spot: { x: 9.55, y: 2.3 }, approach: [{ x: 9.55, y: 4.0 }] },
      { spot: { x: 8.7, y: 3.8 }, approach: [] }
    ]
  },
  {
    id: 'AERO_DESK',
    name: 'Aero Design Desks',
    departmentId: 'AERO',
    position: { x: 2.0, y: 1.0 },
    accessNodeId: 'HALL_AERO',
    activity: 'TYPING',
    slots: [
      { spot: { x: 2.9, y: 1.85 }, approach: [] },
      { spot: { x: 1.2, y: 1.85 }, approach: [] }
    ]
  },
  {
    id: 'STRATEGY_DESK',
    name: 'Strategy Desk',
    departmentId: 'STRATEGY',
    position: { x: 1.3, y: 4.95 },
    accessNodeId: 'HALL_JUNCTION',
    activity: 'TYPING',
    slots: [
      { spot: { x: 2.25, y: 4.5 }, approach: [] },
      { spot: { x: 2.25, y: 5.5 }, approach: [] }
    ]
  },
  {
    id: 'SIMULATOR',
    name: 'Simulator',
    departmentId: 'SIMULATOR',
    position: { x: 1.3, y: 8.1 },
    accessNodeId: 'HALL_SIM',
    activity: 'SIMULATOR',
    slots: [
      // Simulator engineer at the operator console.
      { spot: { x: 3.5, y: 7.65 }, approach: [] },
      // Future: driver seat inside the rig.
      { spot: { x: 2.2, y: 8.1 }, approach: [{ x: 3.0, y: 9.2 }, { x: 2.2, y: 9.2 }] }
    ]
  },
  {
    id: 'MANUFACTURING_BENCH',
    name: 'Manufacturing Bench',
    departmentId: 'MANUFACTURING',
    position: { x: 5.65, y: 6.8 },
    accessNodeId: 'BAY_WEST',
    activity: 'FABRICATING',
    slots: [
      { spot: { x: 6.55, y: 6.8 }, approach: [] },
      { spot: { x: 6.95, y: 8.9 }, approach: [] }
    ]
  },
  {
    id: 'LOGISTICS_AREA',
    name: 'Logistics Area',
    departmentId: 'LOGISTICS',
    position: { x: 8.6, y: 6.45 },
    accessNodeId: 'BAY_EAST',
    activity: 'HAULING',
    slots: [
      { spot: { x: 8.6, y: 7.55 }, approach: [{ x: 9.65, y: 5.7 }, { x: 9.65, y: 7.55 }] },
      { spot: { x: 9.2, y: 8.6 }, approach: [{ x: 9.65, y: 5.7 }, { x: 9.65, y: 8.6 }] }
    ]
  }
];

export const PROPS: PropDefinition[] = [
  // Main workshop
  { id: 'bay-1', kind: 'carBay', area: { x: 5.8, y: 0.5, width: 1.4, depth: 3.1 } },
  { id: 'bay-2', kind: 'carBay', area: { x: 8.0, y: 0.5, width: 1.4, depth: 3.1 } },
  { id: 'car-1', kind: 'raceCar', area: { x: 6.1, y: 0.75, width: 0.8, depth: 2.6 }, color: '#D92D44' },
  { id: 'car-2', kind: 'raceCar', area: { x: 8.3, y: 0.75, width: 0.8, depth: 2.6 }, color: '#D92D44' },
  { id: 'tools-1', kind: 'toolChest', area: { x: 7.45, y: 0.25, width: 0.4, depth: 0.7 } },
  { id: 'tools-2', kind: 'toolChest', area: { x: 9.5, y: 0.25, width: 0.35, depth: 0.7 } },
  // Aero & design
  { id: 'aero-desk-1', kind: 'desk', area: { x: 0.6, y: 0.65, width: 1.2, depth: 0.65 } },
  { id: 'aero-desk-2', kind: 'desk', area: { x: 2.3, y: 0.65, width: 1.2, depth: 0.65 } },
  { id: 'aero-model', kind: 'windTunnelModel', area: { x: 0.5, y: 2.35, width: 1.3, depth: 0.6 } },
  // Strategy
  { id: 'strategy-desk', kind: 'pitWallDesk', area: { x: 0.9, y: 3.9, width: 0.75, depth: 2.15 } },
  // Simulator
  { id: 'sim-rig', kind: 'simRig', area: { x: 0.55, y: 7.35, width: 1.3, depth: 1.5 } },
  { id: 'sim-console', kind: 'desk', area: { x: 2.55, y: 7.25, width: 0.6, depth: 0.85 } },
  // Manufacturing
  { id: 'mfg-bench', kind: 'workbench', area: { x: 5.3, y: 6.0, width: 0.7, depth: 1.6 } },
  { id: 'mfg-cnc', kind: 'cncMachine', area: { x: 5.3, y: 8.3, width: 1.1, depth: 1.2 } },
  // Logistics
  { id: 'log-crates', kind: 'crates', area: { x: 7.95, y: 5.95, width: 1.35, depth: 0.9 } },
  { id: 'log-tyres', kind: 'tyreStack', area: { x: 8.0, y: 8.8, width: 0.6, depth: 0.6 } },
  { id: 'transporter', kind: 'transporter', area: { x: 10.5, y: 6.3, width: 1.4, depth: 3.4 } }
];

export const HEADQUARTERS_LAYOUT: HeadquartersLayout = {
  width: HQ_WIDTH,
  depth: HQ_DEPTH,
  departments: DEPARTMENTS,
  stations: STATIONS,
  nav: NAV_GRAPH,
  props: PROPS,
  walkSpeed: 1.5
};

export const STARTING_STAFF: WorkerDefinition[] = [
  {
    id: 'james-walker',
    name: 'James Walker',
    role: 'Race Engineer',
    uniform: 'navy',
    stationId: 'CAR_BAY_1',
    spawn: { x: 4.1, y: 11.0 },
    spawnNodeId: 'ENTRANCE_OUTSIDE',
    startDelayMs: 400
  },
  {
    id: 'tom-becker',
    name: 'Tom Becker',
    role: 'Mechanic',
    uniform: 'red',
    stationId: 'CAR_BAY_1',
    spawn: { x: 4.9, y: 11.05 },
    spawnNodeId: 'ENTRANCE_OUTSIDE',
    startDelayMs: 1000
  },
  {
    id: 'luca-moretti',
    name: 'Luca Moretti',
    role: 'Mechanic',
    uniform: 'red',
    stationId: 'CAR_BAY_2',
    spawn: { x: 5.5, y: 11.25 },
    spawnNodeId: 'ENTRANCE_OUTSIDE',
    startDelayMs: 1600
  },
  {
    id: 'kenji-sato',
    name: 'Kenji Sato',
    role: 'Simulator Engineer',
    uniform: 'navy',
    stationId: 'SIMULATOR',
    spawn: { x: 3.5, y: 11.2 },
    spawnNodeId: 'ENTRANCE_OUTSIDE',
    startDelayMs: 2200
  },
  {
    id: 'ana-costa',
    name: 'Ana Costa',
    role: 'Manufacturing Technician',
    uniform: 'orange',
    stationId: 'MANUFACTURING_BENCH',
    spawn: { x: 6.1, y: 11.1 },
    spawnNodeId: 'ENTRANCE_OUTSIDE',
    startDelayMs: 2800
  },
  {
    id: 'marcus-reid',
    name: 'Marcus Reid',
    role: 'Logistics Technician',
    uniform: 'orange',
    stationId: 'LOGISTICS_AREA',
    spawn: { x: 2.9, y: 11.05 },
    spawnNodeId: 'ENTRANCE_OUTSIDE',
    startDelayMs: 3400
  },
  // Two early arrivals chatting in the hallway before heading to their desks.
  {
    id: 'priya-nair',
    name: 'Priya Nair',
    role: 'Aero Engineer',
    uniform: 'white',
    stationId: 'AERO_DESK',
    spawn: { x: 4.3, y: 5.75 },
    spawnNodeId: 'HALL_JUNCTION',
    startDelayMs: 4200
  },
  {
    id: 'hannah-cole',
    name: 'Hannah Cole',
    role: 'Strategist',
    uniform: 'white',
    stationId: 'STRATEGY_DESK',
    spawn: { x: 4.75, y: 6.0 },
    spawnNodeId: 'HALL_JUNCTION',
    startDelayMs: 5000
  }
];
