import { SAVE_V3, INITIAL_V3, SAVE_V2 } from './contracts';
import { initialReleasedDrivers } from './contracts/preCalendarRules';
import type { GameUniverse } from './contracts/preCalendarTypes';
import { validateReleasedUniverse } from './contracts/preCalendarValidation';

/** Upgrade content shape without replacing career abilities, contracts or scouting decisions. */
export function migrateDriverAlignment(input: unknown): GameUniverse {
  validateReleasedUniverse(input, SAVE_V2);
  const next = JSON.parse(JSON.stringify(input)) as GameUniverse;
  const world = next.drivers!;
  for (const driver of Object.values(world.drivers)) {
    const source = INITIAL_V3.drivers.drivers[driver.id]?.sourcePerformance;
    if (source) driver.sourcePerformance = JSON.parse(JSON.stringify(source));
  }
  const fresh = initialReleasedDrivers(world.season, world.week);
  const id = 'driver.takase';
  world.drivers[id] = fresh.drivers[id]!;
  world.contracts.push(...fresh.contracts.filter(c => c.driverId === id));
  for (const team of Object.keys(world.knowledge)) {
    world.knowledge[team]![id] = {...fresh.knowledge[team]![id]!,lastSeason:world.season,lastWeek:world.week};
  }
  next.definitionVersion = SAVE_V3.definition.version;
  validateReleasedUniverse(next, SAVE_V3);
  return next;
}
