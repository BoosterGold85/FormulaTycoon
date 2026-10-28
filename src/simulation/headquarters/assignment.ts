import type { HeadquartersLayout, StationId } from '../../game/models';
import { facingBetween } from './geometry';
import { planRouteToSlot } from './routing';
import type { HeadquartersState, HeadquartersWorker, StationRuntime } from './types';

export type AssignmentFailure = 'UNKNOWN_WORKER' | 'UNKNOWN_STATION' | 'STATION_FULL';

export type AssignmentResult =
  | { ok: true; state: HeadquartersState }
  | { ok: false; reason: AssignmentFailure };

/**
 * Gives a worker a persistent assignment to the first free slot of a station
 * and plans their walk there. Assignments only change through this function.
 */
export function assignWorkerToStation(
  state: HeadquartersState,
  layout: HeadquartersLayout,
  workerId: string,
  stationId: StationId,
  options: { startDelayMs?: number } = {}
): AssignmentResult {
  const worker = state.workers.find(item => item.id === workerId);
  if (!worker) return { ok: false, reason: 'UNKNOWN_WORKER' };
  const station = layout.stations.find(item => item.id === stationId);
  const runtime = state.stations[stationId];
  if (!station || !runtime) return { ok: false, reason: 'UNKNOWN_STATION' };
  if (worker.assignment?.stationId === stationId) return { ok: true, state };

  const slotIndex = runtime.slots.findIndex(occupant => occupant === null);
  if (slotIndex < 0) return { ok: false, reason: 'STATION_FULL' };

  const stations = { ...state.stations };
  if (worker.assignment) {
    stations[worker.assignment.stationId] = releaseSlot(
      stations[worker.assignment.stationId]!,
      worker.id
    );
  }
  stations[stationId] = {
    ...runtime,
    slots: runtime.slots.map((occupant, index) => (index === slotIndex ? worker.id : occupant))
  };

  const assignment = { stationId, slotIndex };
  const route = planRouteToSlot(layout, worker, assignment);
  const delay = Math.max(0, options.startDelayMs ?? 0);

  let updated: HeadquartersWorker;
  if (route.length === 0) {
    updated = {
      ...worker,
      assignment,
      route,
      state: 'WORKING',
      location: { kind: 'station', stationId, slotIndex },
      facing: facingBetween(worker.position, station.position, worker.facing)
    };
  } else {
    updated = {
      ...worker,
      assignment,
      route,
      routeId: state.nextRouteId,
      state: delay > 0 ? 'IDLE' : 'WALKING',
      idleUntilMs: state.timeMs + delay,
      facing: facingBetween(worker.position, route[0]!.point, worker.facing)
    };
  }

  return {
    ok: true,
    state: {
      ...state,
      stations,
      nextRouteId: state.nextRouteId + 1,
      workers: state.workers.map(item => (item.id === workerId ? updated : item))
    }
  };
}

function releaseSlot(runtime: StationRuntime, workerId: string): StationRuntime {
  return { ...runtime, slots: runtime.slots.map(id => (id === workerId ? null : id)) };
}
