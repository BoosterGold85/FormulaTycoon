/**
 * Shared data shapes for the headquarters. These are plain data so they can be
 * consumed by the headless simulation and by the UI alike.
 */

/** A point on the headquarters floor, in grid (tile) units. */
export type GridPoint = {
  x: number;
  y: number;
};

/** Axis-aligned rectangle on the floor, in grid units. */
export type GridRect = {
  x: number;
  y: number;
  width: number;
  depth: number;
};

export type DepartmentId =
  | 'WORKSHOP'
  | 'AERO'
  | 'STRATEGY'
  | 'SIMULATOR'
  | 'MANUFACTURING'
  | 'LOGISTICS';

export type StationId =
  | 'CAR_BAY_1'
  | 'CAR_BAY_2'
  | 'AERO_DESK'
  | 'STRATEGY_DESK'
  | 'SIMULATOR'
  | 'MANUFACTURING_BENCH'
  | 'LOGISTICS_AREA';

/** How a worker visibly behaves while working at a station. */
export type WorkActivity = 'CAR_SERVICE' | 'TYPING' | 'SIMULATOR' | 'FABRICATING' | 'HAULING';

export type DepartmentDefinition = {
  id: DepartmentId;
  name: string;
  /** Compact name for the in-world sign. */
  shortName: string;
  area: GridRect;
  /** Where the department's sign sits, and how high above the floor (grid units). */
  labelPoint: GridPoint;
  labelHeight: number;
  floorColor: string;
};

/** One standing position at a station. Capacity = number of slots. */
export type StationSlot = {
  /** Where the worker stands while working. */
  spot: GridPoint;
  /** Waypoints walked after leaving the access node, used to route around furniture. */
  approach: GridPoint[];
};

export type StationDefinition = {
  id: StationId;
  name: string;
  departmentId: DepartmentId;
  /** Visual centre of the station on the floor. */
  position: GridPoint;
  /** Navigation node workers use to enter and leave the station. */
  accessNodeId: string;
  activity: WorkActivity;
  slots: StationSlot[];
};

export type NavGraph = {
  nodes: Record<string, GridPoint>;
  edges: ReadonlyArray<readonly [string, string]>;
};

export type Uniform = 'navy' | 'red' | 'white' | 'orange';

export type WorkerDefinition = {
  id: string;
  name: string;
  role: string;
  uniform: Uniform;
  /** Station the worker is assigned to when the day starts. */
  stationId: StationId;
  spawn: GridPoint;
  /** Navigation node the worker joins from the spawn point. */
  spawnNodeId: string;
  /** How long the worker stays idle before heading to work. */
  startDelayMs: number;
};

/** Static furniture and decoration. Kind is interpreted by the renderer. */
export type PropKind =
  | 'raceCar'
  | 'carBay'
  | 'desk'
  | 'pitWallDesk'
  | 'simRig'
  | 'workbench'
  | 'cncMachine'
  | 'crates'
  | 'tyreStack'
  | 'toolChest'
  | 'windTunnelModel'
  | 'transporter';

export type PropDefinition = {
  id: string;
  kind: PropKind;
  area: GridRect;
  color?: string;
};

export type HeadquartersLayout = {
  width: number;
  depth: number;
  departments: DepartmentDefinition[];
  stations: StationDefinition[];
  nav: NavGraph;
  props: PropDefinition[];
  /** Walking speed in tiles per second. */
  walkSpeed: number;
};
