import { describe, expect, it } from '@jest/globals';
import { HEADQUARTERS_LAYOUT, STARTING_STAFF } from '../../game/headquartersData';
import type { HeadquartersLayout, WorkerDefinition } from '../../game/models';
import {
  advanceHeadquarters,
  assignWorkerToStation,
  createHeadquartersState,
  createWorker,
  departmentAtPoint,
  findNodePath,
  getStation,
  getWorker,
  isHeadquartersSettled,
  runHeadquarters,
  summarizeDepartment,
  type HeadquartersState
} from '../headquarters';

const layout = HEADQUARTERS_LAYOUT;

function worker(state: HeadquartersState, id: string) {
  const found = getWorker(state, id);
  if (!found) throw new Error(`missing ${id}`);
  return found;
}

function routeLength(state: HeadquartersState, id: string): number {
  const w = worker(state, id);
  let total = 0;
  let previous = w.position;
  for (const step of w.route) {
    total += Math.hypot(step.point.x - previous.x, step.point.y - previous.y);
    previous = step.point;
  }
  return total;
}

describe('worker creation', () => {
  it('creates an idle, unassigned worker at its spawn point', () => {
    const definition = STARTING_STAFF[0]!;
    const created = createWorker(definition);
    expect(created).toMatchObject({
      id: definition.id,
      name: definition.name,
      role: definition.role,
      state: 'IDLE',
      assignment: null,
      position: definition.spawn,
      route: []
    });
    expect(created.position).not.toBe(definition.spawn);
  });

  it('creates the starting staff idle with persistent assignments', () => {
    const state = createHeadquartersState(layout, STARTING_STAFF);
    expect(state.workers).toHaveLength(8);
    for (const definition of STARTING_STAFF) {
      const w = worker(state, definition.id);
      expect(w.state).toBe('IDLE');
      expect(w.assignment?.stationId).toBe(definition.stationId);
      expect(w.route.length).toBeGreaterThan(0);
    }
  });

  it('rejects duplicate worker ids', () => {
    const duplicate = [STARTING_STAFF[0]!, STARTING_STAFF[0]!];
    expect(() => createHeadquartersState(layout, duplicate)).toThrow('Duplicate worker id');
  });
});

describe('station assignment', () => {
  it('fills station slots in order and records assigned workers', () => {
    const state = createHeadquartersState(layout, STARTING_STAFF);
    expect(state.stations.CAR_BAY_1.slots).toEqual(['james-walker', 'tom-becker']);
    expect(state.stations.CAR_BAY_2.slots).toEqual(['luca-moretti', null]);
    expect(worker(state, 'tom-becker').assignment).toEqual({ stationId: 'CAR_BAY_1', slotIndex: 1 });
  });

  it('refuses to exceed station capacity', () => {
    const state = createHeadquartersState(layout, STARTING_STAFF);
    const result = assignWorkerToStation(state, layout, 'kenji-sato', 'CAR_BAY_1');
    expect(result).toEqual({ ok: false, reason: 'STATION_FULL' });
  });

  it('reports unknown workers and stations', () => {
    const state = createHeadquartersState(layout, STARTING_STAFF);
    expect(assignWorkerToStation(state, layout, 'nobody', 'CAR_BAY_1')).toEqual({
      ok: false,
      reason: 'UNKNOWN_WORKER'
    });
  });

  it('frees the old slot when a worker is reassigned', () => {
    const start = runHeadquarters(createHeadquartersState(layout, STARTING_STAFF), layout, 30000);
    const result = assignWorkerToStation(start, layout, 'tom-becker', 'CAR_BAY_2');
    if (!result.ok) throw new Error(result.reason);
    expect(result.state.stations.CAR_BAY_1.slots).toEqual(['james-walker', null]);
    expect(result.state.stations.CAR_BAY_2.slots).toEqual(['luca-moretti', 'tom-becker']);
    const tom = worker(result.state, 'tom-becker');
    expect(tom.state).toBe('WALKING');
    // Leaves through the workshop's access node instead of cutting across the floor.
    expect(tom.route[0]?.nodeId).toBe('BAY_WEST');

    const settled = runHeadquarters(result.state, layout, 30000);
    expect(worker(settled, 'tom-becker').state).toBe('WORKING');
    expect(worker(settled, 'tom-becker').position).toEqual(
      getStation(layout, 'CAR_BAY_2').slots[1]!.spot
    );
  });
});

describe('worker state transitions', () => {
  it('stays IDLE until the start delay, then WALKING, then WORKING', () => {
    const definition = STARTING_STAFF.find(item => item.id === 'priya-nair')!;
    let state = createHeadquartersState(layout, STARTING_STAFF);

    state = runHeadquarters(state, layout, definition.startDelayMs - 100);
    expect(worker(state, 'priya-nair').state).toBe('IDLE');
    expect(worker(state, 'priya-nair').position).toEqual(definition.spawn);

    state = runHeadquarters(state, layout, 200);
    expect(worker(state, 'priya-nair').state).toBe('WALKING');

    state = runHeadquarters(state, layout, 30000);
    expect(worker(state, 'priya-nair').state).toBe('WORKING');
  });

  it('keeps working workers in place as time passes', () => {
    const settled = runHeadquarters(createHeadquartersState(layout, STARTING_STAFF), layout, 30000);
    expect(isHeadquartersSettled(settled)).toBe(true);
    const later = advanceHeadquarters(settled, layout, 60000);
    expect(later.workers).toBe(settled.workers);
    for (const w of later.workers) expect(w.state).toBe('WORKING');
  });

  it('walks at a constant speed without teleporting', () => {
    let state = createHeadquartersState(layout, STARTING_STAFF);
    state = runHeadquarters(state, layout, 600);
    const maxStep = (layout.walkSpeed * 50) / 1000 + 1e-9;
    for (let i = 0; i < 100; i += 1) {
      const before = worker(state, 'james-walker').position;
      state = advanceHeadquarters(state, layout, 50);
      const after = worker(state, 'james-walker').position;
      expect(Math.hypot(after.x - before.x, after.y - before.y)).toBeLessThanOrEqual(maxStep);
    }
  });
});

describe('deterministic movement', () => {
  it('plans the same destination and route every time', () => {
    const a = createHeadquartersState(layout, STARTING_STAFF);
    const b = createHeadquartersState(layout, STARTING_STAFF);
    expect(a).toEqual(b);
    const james = worker(a, 'james-walker');
    expect(james.route[james.route.length - 1]!.point).toEqual(
      getStation(layout, 'CAR_BAY_1').slots[0]!.spot
    );
    expect(james.route.map(step => step.nodeId).filter(Boolean)).toEqual([
      'ENTRANCE_OUTSIDE',
      'ENTRANCE',
      'HALL_SIM',
      'HALL_JUNCTION',
      'BAY_WEST'
    ]);
  });

  it('produces identical results regardless of tick size', () => {
    const start = createHeadquartersState(layout, STARTING_STAFF);
    const coarse = runHeadquarters(start, layout, 6000, 100);
    const fine = runHeadquarters(start, layout, 6000, 25);
    for (const w of coarse.workers) {
      const other = worker(fine, w.id);
      expect(w.state).toBe(other.state);
      expect(w.position.x).toBeCloseTo(other.position.x, 6);
      expect(w.position.y).toBeCloseTo(other.position.y, 6);
    }
  });

  it('finds shortest graph paths deterministically', () => {
    expect(findNodePath(layout.nav, 'ENTRANCE_OUTSIDE', 'BAY_EAST')).toEqual([
      'ENTRANCE_OUTSIDE',
      'ENTRANCE',
      'HALL_SIM',
      'HALL_JUNCTION',
      'BAY_WEST',
      'BAY_EAST'
    ]);
    expect(findNodePath(layout.nav, 'HALL_AERO', 'nowhere')).toBeNull();
  });
});

describe('arrival', () => {
  it('switches to WORKING exactly at the station spot when the route is complete', () => {
    let state = createHeadquartersState(layout, STARTING_STAFF);
    const definition = STARTING_STAFF.find(item => item.id === 'ana-costa')!;
    state = runHeadquarters(state, layout, definition.startDelayMs);
    const travelMs = (routeLength(state, 'ana-costa') / layout.walkSpeed) * 1000;

    const almost = runHeadquarters(state, layout, travelMs - 100);
    expect(worker(almost, 'ana-costa').state).toBe('WALKING');

    const arrived = runHeadquarters(almost, layout, 200);
    const ana = worker(arrived, 'ana-costa');
    expect(ana.state).toBe('WORKING');
    expect(ana.route).toEqual([]);
    expect(ana.position).toEqual(getStation(layout, 'MANUFACTURING_BENCH').slots[0]!.spot);
    expect(ana.location).toEqual({ kind: 'station', stationId: 'MANUFACTURING_BENCH', slotIndex: 0 });
  });

  it('routes out through the navigation graph even when spawned on a station spot', () => {
    const tiny: HeadquartersLayout = {
      ...layout,
      stations: [getStation(layout, 'STRATEGY_DESK')]
    };
    const definition: WorkerDefinition = {
      ...STARTING_STAFF[0]!,
      stationId: 'STRATEGY_DESK',
      spawn: getStation(layout, 'STRATEGY_DESK').slots[0]!.spot,
      spawnNodeId: 'HALL_JUNCTION',
      startDelayMs: 0
    };
    const state = createHeadquartersState(tiny, [definition]);
    expect(state.workers[0]!.route[0]?.nodeId).toBe('HALL_JUNCTION');
  });
});

describe('departments', () => {
  it('locates departments by floor position', () => {
    expect(departmentAtPoint(layout, { x: 6.5, y: 2 })?.id).toBe('WORKSHOP');
    expect(departmentAtPoint(layout, { x: 1, y: 8 })?.id).toBe('SIMULATOR');
    expect(departmentAtPoint(layout, { x: 4.5, y: 5 })).toBeNull();
  });

  it('summarises staff and status', () => {
    const start = createHeadquartersState(layout, STARTING_STAFF);
    expect(summarizeDepartment(start, layout, 'WORKSHOP')).toMatchObject({
      staffCount: 3,
      workingCount: 0,
      status: 'Staff arriving'
    });
    const settled = runHeadquarters(start, layout, 30000);
    expect(summarizeDepartment(settled, layout, 'AERO')).toMatchObject({
      staffCount: 1,
      workingCount: 1,
      status: 'Active'
    });
  });

  it('keeps every station spot inside its department', () => {
    for (const station of layout.stations) {
      for (const slot of station.slots) {
        expect(departmentAtPoint(layout, slot.spot)?.id).toBe(station.departmentId);
      }
    }
  });
});
