import type { HeadquartersLayout } from '../../game/models';
import { distance, facingBetween } from './geometry';
import { getStation } from './layout';
import type { HeadquartersState, HeadquartersWorker } from './types';

/** Recommended fixed step for driving the headquarters clock. */
export const HEADQUARTERS_STEP_MS = 50;

/**
 * Advances the headquarters clock. Pure: returns a new state and keeps the
 * object identity of workers that did not change.
 */
export function advanceHeadquarters(
  state: HeadquartersState,
  layout: HeadquartersLayout,
  dtMs: number
): HeadquartersState {
  if (dtMs <= 0) return state;
  const timeMs = state.timeMs + dtMs;
  let changed = false;
  const workers = state.workers.map(worker => {
    const next = advanceWorker(worker, layout, state.timeMs, timeMs);
    if (next !== worker) changed = true;
    return next;
  });
  return { ...state, timeMs, workers: changed ? workers : state.workers };
}

/** Runs the clock forward headlessly in fixed steps (useful for tests and tools). */
export function runHeadquarters(
  state: HeadquartersState,
  layout: HeadquartersLayout,
  durationMs: number,
  stepMs = HEADQUARTERS_STEP_MS
): HeadquartersState {
  let current = state;
  for (let elapsed = 0; elapsed < durationMs; elapsed += stepMs) {
    current = advanceHeadquarters(current, layout, Math.min(stepMs, durationMs - elapsed));
  }
  return current;
}

function advanceWorker(
  worker: HeadquartersWorker,
  layout: HeadquartersLayout,
  fromMs: number,
  toMs: number
): HeadquartersWorker {
  if (worker.state === 'WORKING' || worker.route.length === 0) return worker;

  let walkMs = toMs - fromMs;
  let current = worker;
  if (worker.state === 'IDLE') {
    if (toMs < worker.idleUntilMs) return worker;
    walkMs = toMs - Math.max(fromMs, worker.idleUntilMs);
    current = { ...worker, state: 'WALKING' };
  }
  return walk(current, layout, (walkMs / 1000) * layout.walkSpeed);
}

function walk(
  worker: HeadquartersWorker,
  layout: HeadquartersLayout,
  budget: number
): HeadquartersWorker {
  let position = worker.position;
  let facing = worker.facing;
  let location = worker.location;
  let index = 0;
  let remaining = budget;

  while (index < worker.route.length) {
    const step = worker.route[index]!;
    const length = distance(position, step.point);
    facing = facingBetween(position, step.point, facing);
    if (length > remaining) {
      const t = remaining / length;
      position = {
        x: position.x + (step.point.x - position.x) * t,
        y: position.y + (step.point.y - position.y) * t
      };
      remaining = 0;
      break;
    }
    remaining -= length;
    position = step.point;
    if (step.nodeId) location = { kind: 'node', nodeId: step.nodeId };
    index += 1;
  }

  const route = worker.route.slice(index);
  if (route.length > 0) {
    return { ...worker, position, facing, location, route, state: 'WALKING' };
  }

  if (!worker.assignment) {
    return { ...worker, position, facing, location, route, state: 'IDLE' };
  }
  const station = getStation(layout, worker.assignment.stationId);
  return {
    ...worker,
    position: { ...position },
    route,
    state: 'WORKING',
    location: { kind: 'station', ...worker.assignment },
    facing: facingBetween(position, station.position, facing)
  };
}
