import { useCallback, useEffect, useRef, useState } from 'react';
import type { HeadquartersLayout, WorkerDefinition } from '../../game/models';
import {
  advanceHeadquarters,
  createHeadquartersState,
  HEADQUARTERS_STEP_MS,
  isHeadquartersSettled,
  type HeadquartersState
} from '../../simulation/headquarters';

/** Longest catch-up per timer callback, e.g. after the app was backgrounded. */
const MAX_CATCH_UP_MS = 2000;

/**
 * Drives the headquarters clock in fixed steps. The UI only re-renders when a
 * worker visibly changes (state, route or assignment); in-between positions are
 * animated natively from the simulation's route.
 */
export function useHeadquartersSimulation(layout: HeadquartersLayout, roster: WorkerDefinition[]) {
  const [snapshot, setSnapshot] = useState(() => createHeadquartersState(layout, roster));
  const stateRef = useRef(snapshot);
  const [dayId, setDayId] = useState(0);

  useEffect(() => {
    let last = Date.now();
    let carry = 0;
    const timer = setInterval(() => {
      const now = Date.now();
      carry = Math.min(carry + now - last, MAX_CATCH_UP_MS);
      last = now;

      let state = stateRef.current;
      while (carry >= HEADQUARTERS_STEP_MS) {
        state = advanceHeadquarters(state, layout, HEADQUARTERS_STEP_MS);
        carry -= HEADQUARTERS_STEP_MS;
      }
      const previous = stateRef.current;
      stateRef.current = state;
      if (hasVisibleChange(previous, state)) setSnapshot(state);
      if (isHeadquartersSettled(state)) clearInterval(timer);
    }, HEADQUARTERS_STEP_MS);
    return () => clearInterval(timer);
  }, [layout, dayId]);

  const restartDay = useCallback(() => {
    const fresh = createHeadquartersState(layout, roster);
    stateRef.current = fresh;
    setSnapshot(fresh);
    setDayId(id => id + 1);
  }, [layout, roster]);

  return { state: snapshot, restartDay };
}

function hasVisibleChange(previous: HeadquartersState, next: HeadquartersState): boolean {
  if (previous.workers === next.workers) return false;
  return next.workers.some((worker, index) => {
    const before = previous.workers[index];
    return (
      !before ||
      before.state !== worker.state ||
      before.routeId !== worker.routeId ||
      before.assignment !== worker.assignment
    );
  });
}
