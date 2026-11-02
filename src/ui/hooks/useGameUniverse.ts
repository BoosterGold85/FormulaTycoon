import { useCallback, useEffect, useRef, useState } from 'react';
import {
  HEADQUARTERS_STEP_MS,
  isHeadquartersSettled,
  type HeadquartersState
} from '../../simulation/headquarters';

import { observeDriver, decideTeamOption } from '../../simulation/drivers';
import { createGameSave } from '../../persistence/gameSave';
import { createGameUniverse, advanceUniverseHeadquarters, restartUniverseHeadquarters, advanceUniverseWeek, advanceCampaignTo, advanceCampaignByDays, type GameDefinition, type GameUniverse } from '../../simulation/universe';
import { nextTurnTarget, summarizeWeek, type CommandResult, type WeekReport, type TurnTarget } from '../../simulation/developmentLoop';

export type SessionTurnReport = WeekReport & { target: TurnTarget };

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

  // Transient UI report of the last turn; the facts it summarizes live in the universe.
  const [report, setReport] = useState<SessionTurnReport | null>(null);
  /** Weekly turn: advance through the D0 pipeline to the next Monday or race-weekend FP1. */
  const continueTurn = useCallback(() => {
    const current = universeRef.current!;
    const target = nextTurnTarget(current);
    if (!target) return;
    const next = advanceCampaignTo(current, definition, target.date);
    universeRef.current = next; setSnapshot(next);
    // Simulate first (above, once), present second: the report only reads the two universes.
    const summary = summarizeWeek(current, next, definition);
    setReport(summary ? { ...summary, target } : null);
  }, [definition]);
  const nextDay = useCallback(() => {
    const current = universeRef.current!;
    if (!nextTurnTarget(current)) return;
    const next = advanceCampaignByDays(current, definition, 1);
    universeRef.current = next; setSnapshot(next);
  }, [definition]);
  /** Player development commands are pure domain transitions; refusals are returned, never applied. */
  const runDevelopment = useCallback((command: (universe: GameUniverse) => CommandResult) => {
    const result = command(universeRef.current!);
    if (result.ok) { universeRef.current = result.universe; setSnapshot(result.universe); }
    return result;
  }, []);
  const dismissReport = useCallback(() => setReport(null), []);

  // Snapshot is for display; commands always read the latest authoritative ref.
  return { universe: snapshot, restartHeadquarters: restartDay, advanceWeek, checkpoint, scoutDriver, exerciseOption,
    continueTurn, nextDay, runDevelopment, report, dismissReport };
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
