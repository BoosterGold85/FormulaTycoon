import type { GridPoint, StationId, Uniform } from '../../game/models';

/**
 * Readable worker states. More states (e.g. TRAVELING, PACKING) can be added
 * later without changing how existing ones behave.
 */
export type WorkerState = 'IDLE' | 'WALKING' | 'WORKING';

export type Facing = 'left' | 'right';

export type WorkerAssignment = {
  stationId: StationId;
  slotIndex: number;
};

/** Where a worker last settled; used as the starting point for new routes. */
export type WorkerLocation =
  | { kind: 'node'; nodeId: string }
  | { kind: 'station'; stationId: StationId; slotIndex: number };

export type RouteStep = {
  point: GridPoint;
  /** Set when the step is a navigation-graph node. */
  nodeId?: string;
};

export type HeadquartersWorker = {
  id: string;
  name: string;
  role: string;
  uniform: Uniform;
  state: WorkerState;
  position: GridPoint;
  /** Screen-space facing, derived from movement direction. */
  facing: Facing;
  assignment: WorkerAssignment | null;
  /** Remaining waypoints; empty when not travelling. */
  route: RouteStep[];
  /** Changes whenever a new route is planned, so observers can restart animations. */
  routeId: number;
  location: WorkerLocation;
  /** An IDLE worker with a route starts walking once the clock reaches this time. */
  idleUntilMs: number;
};

export type StationRuntime = {
  id: StationId;
  /** Worker id per slot, or null when the slot is free. */
  slots: Array<string | null>;
};

export type HeadquartersState = {
  timeMs: number;
  workers: HeadquartersWorker[];
  stations: Record<StationId, StationRuntime>;
  nextRouteId: number;
};
