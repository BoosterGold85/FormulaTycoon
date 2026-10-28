import type { HeadquartersLayout, StationId, WorkerDefinition } from '../../game/models';
import { assignWorkerToStation } from './assignment';
import type { HeadquartersState, HeadquartersWorker, StationRuntime } from './types';

export function createWorker(definition: WorkerDefinition): HeadquartersWorker {
  return {
    id: definition.id,
    name: definition.name,
    role: definition.role,
    uniform: definition.uniform,
    state: 'IDLE',
    position: { ...definition.spawn },
    facing: 'left',
    assignment: null,
    route: [],
    routeId: 0,
    location: { kind: 'node', nodeId: definition.spawnNodeId },
    idleUntilMs: 0
  };
}

function createStationRuntime(layout: HeadquartersLayout): Record<StationId, StationRuntime> {
  const stations = {} as Record<StationId, StationRuntime>;
  for (const station of layout.stations) {
    stations[station.id] = { id: station.id, slots: station.slots.map(() => null) };
  }
  return stations;
}

/**
 * Start of a workday: everyone is idle at their spawn point, already holding a
 * persistent assignment, and sets off after their individual start delay.
 */
export function createHeadquartersState(
  layout: HeadquartersLayout,
  roster: WorkerDefinition[]
): HeadquartersState {
  const ids = new Set<string>();
  for (const definition of roster) {
    if (ids.has(definition.id)) throw new Error(`Duplicate worker id: ${definition.id}`);
    ids.add(definition.id);
  }

  let state: HeadquartersState = {
    timeMs: 0,
    workers: roster.map(createWorker),
    stations: createStationRuntime(layout),
    nextRouteId: 1
  };

  for (const definition of roster) {
    const result = assignWorkerToStation(state, layout, definition.id, definition.stationId, {
      startDelayMs: definition.startDelayMs
    });
    if (!result.ok) {
      throw new Error(`Cannot assign ${definition.id} to ${definition.stationId}: ${result.reason}`);
    }
    state = result.state;
  }
  return state;
}
