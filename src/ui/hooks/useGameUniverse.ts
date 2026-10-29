import { useCallback, useEffect, useRef, useState } from 'react';
import {
  HEADQUARTERS_STEP_MS,
  isHeadquartersSettled,
  type HeadquartersState
} from '../../simulation/headquarters';

import { observeDriver, decideTeamOption } from '../../simulation/drivers';
import { createGameSave } from '../../persistence/gameSave';
import { createGameUniverse, advanceUniverseHeadquarters, restartUniverseHeadquarters, advanceUniverseWeek, type GameDefinition } from '../../simulation/universe';

/** Longest catch-up per timer callback, e.g. after the app was backgrounded. */
const MAX_CATCH_UP_MS = 2000;

/**
 * App-lifetime universe owner. Drives only the HQ presentation clock in fixed steps. The UI only re-renders when a
 * worker visibly changes (state, route or assignment); in-between positions are
 * animated natively from the simulation's route.
 */
export function useGameUniverse(definition: GameDefinition, seed = 1) {
  // One authoritative session owner. The visible HQ snapshot is just a rendering projection.
  const universeRef = useRef<ReturnType<typeof createGameUniverse> | null>(null);
  if (!universeRef.current) universeRef.current = createGameUniverse(definition, seed);
  const [snapshot, setSnapshot] = useState(() => universeRef.current!);
  const [dayId, setDayId] = useState(0);

  useEffect(() => {
    let last = Date.now();
    let carry = 0;
    const timer = setInterval(() => {
      const now = Date.now();
      carry = Math.min(carry + now - last, MAX_CATCH_UP_MS);
      last = now;

      const previous = universeRef.current!.headquarters;
      let universe = universeRef.current!;
      while (carry >= HEADQUARTERS_STEP_MS) {
        universe = advanceUniverseHeadquarters(universe, definition, HEADQUARTERS_STEP_MS);
        carry -= HEADQUARTERS_STEP_MS;
      }
      universeRef.current = universe;
      const state = universe.headquarters;
      if (hasVisibleChange(previous, state)) setSnapshot(universe);
      if (isHeadquartersSettled(state)) clearInterval(timer);
    }, HEADQUARTERS_STEP_MS);
    return () => clearInterval(timer);
  }, [definition, dayId]);

  const restartDay = useCallback(() => {
    const fresh = restartUniverseHeadquarters(universeRef.current!, definition);
    universeRef.current = fresh;
    setSnapshot(fresh);
    setDayId(id => id + 1);
  }, [definition]);

  const advanceWeek = useCallback(() => {
    const next = advanceUniverseWeek(universeRef.current!, definition);
    universeRef.current = next;
    setSnapshot(next);
  }, [definition]);

  const scoutDriver = useCallback((id:string) => {
    const current=universeRef.current!;
    if(!current.drivers||!current.playerTeamId) return;
    const next={...current,drivers:observeDriver(current.drivers,current.playerTeamId,id,current.currentDate)};
    universeRef.current=next;setSnapshot(next);
  }, []);
  const exerciseOption = useCallback((id:string) => {
    const current=universeRef.current!;
    if(!current.drivers||!current.playerTeamId) return;
    const result=decideTeamOption(current.drivers,current.playerTeamId,id,true,current.currentDate);
    if(result.ok) {const next={...current,drivers:result.world};universeRef.current=next;setSnapshot(next);}
  }, []);
  const checkpoint = useCallback(() => createGameSave(universeRef.current!), []);

  // Snapshot is for display; commands always read the latest authoritative ref.
  return { universe: snapshot, restartHeadquarters: restartDay, advanceWeek, checkpoint, scoutDriver, exerciseOption };
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
