import { createDriverWorld, updateDriverCalendar } from '../drivers';
import { advanceDevelopmentWeek, createDevelopmentWorld, startNextSeason } from '../development';
import { advanceHeadquarters, createHeadquartersState } from '../headquarters';
import type { GameDefinition, GameUniverse } from './types';
export * from './types';

export function assertDefinition(universe: GameUniverse, definition: GameDefinition): void {
  if (universe.definitionVersion !== definition.version) {
    throw new Error('Game definition mismatch: explicit content migration required');
  }
}

export function createGameUniverse(definition: GameDefinition, seed: number): GameUniverse {
  if (!Number.isInteger(seed) || seed < 0 || seed > 0xffffffff) {
    throw new Error('Universe seed must be a uint32');
  }
  return {
    definitionVersion: definition.version,
    seed,
    playerTeamId: definition.driverEra ? 'team.wellington' : null,
    ...(definition.driverEra ? { drivers: createDriverWorld(definition.driverDataVersion !== 1) } : {}),
    headquarters: createHeadquartersState(definition.headquarters.layout, definition.headquarters.roster),
    development: createDevelopmentWorld(definition.development, seed)
  };
}

/** Factory animation time is NOT calendar time. No weekly projects advance on a rendered frame. */
export function advanceUniverseHeadquarters(
  universe: GameUniverse, definition: GameDefinition, dtMs: number
): GameUniverse {
  assertDefinition(universe, definition);
  if (!Number.isFinite(dtMs) || dtMs < 0) throw new Error('HQ duration must be finite and nonnegative');
  const headquarters = advanceHeadquarters(universe.headquarters, definition.headquarters.layout, dtMs);
  return headquarters === universe.headquarters ? universe : { ...universe, headquarters };
}

/** Existing NEW DAY remains a replay of the arrival scene, not campaign progression. */
export function restartUniverseHeadquarters(universe: GameUniverse, definition: GameDefinition): GameUniverse {
  assertDefinition(universe, definition);
  return { ...universe, headquarters: createHeadquartersState(definition.headquarters.layout, definition.headquarters.roster) };
}

/** Explicit headless command. The current UI does not yet offer calendar progression. */
export function advanceUniverseWeek(universe: GameUniverse, definition: GameDefinition): GameUniverse {
  assertDefinition(universe, definition);
  const development = advanceDevelopmentWeek(universe.development, definition.development);
  return development === universe.development ? universe : { ...universe, development,
    ...(universe.drivers ? {drivers:updateDriverCalendar(universe.drivers,2025+development.season,development.week)} : {}) };
}

/** Actual standings must be supplied; the integration never invents race results from car pace. */
export function startUniverseSeason(
  universe: GameUniverse, definition: GameDefinition, standings: string[],
  options: { regulationReset?: boolean } = {}
): GameUniverse {
  assertDefinition(universe, definition);
  if (universe.development.week !== definition.development.regulations.seasonWeeks) {
    throw new Error('Finish the current development season before starting the next');
  }
  const ids = definition.development.teams.map(team => team.id);
  if (standings.length !== ids.length || new Set(standings).size !== ids.length || standings.some(id => !ids.includes(id))) {
    throw new Error('Standings must contain every team exactly once');
  }
  const development=startNextSeason(universe.development, definition.development, standings, options);
  return { ...universe, development, ...(universe.drivers ? {drivers:updateDriverCalendar(universe.drivers,2025+development.season,0)} : {}) };
}
