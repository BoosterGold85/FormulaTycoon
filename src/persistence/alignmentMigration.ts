import { DEFAULT_GAME_DEFINITION } from '../game/defaultGame';
import { LEGACY_DRIVER_GAME_DEFINITION } from '../game/legacyDriverGame';
import { PERFORMANCE_2026 } from '../game/drivers/performance2026';
import { createDriverWorld, updateDriverCalendar } from '../simulation/drivers';
import type { GameUniverse } from '../simulation/universe';
import { validateUniverse } from './universeValidation';

/** Upgrade content shape without replacing career abilities, contracts or scouting decisions. */
export function migrateDriverAlignment(input: unknown): GameUniverse {
  validateUniverse(input, LEGACY_DRIVER_GAME_DEFINITION);
  const next = JSON.parse(JSON.stringify(input)) as GameUniverse;
  const world = next.drivers!;
  for (const driver of Object.values(world.drivers)) {
    const source = PERFORMANCE_2026[driver.id];
    if (source) driver.sourcePerformance = JSON.parse(JSON.stringify(source));
  }
  const fresh = updateDriverCalendar(createDriverWorld(), world.season, world.week);
  const id = 'driver.takase';
  world.drivers[id] = fresh.drivers[id]!;
  world.contracts.push(...fresh.contracts.filter(c => c.driverId === id));
  for (const team of Object.keys(world.knowledge)) {
    world.knowledge[team]![id] = {...fresh.knowledge[team]![id]!,lastSeason:world.season,lastWeek:world.week};
  }
  next.definitionVersion = DEFAULT_GAME_DEFINITION.version;
  validateUniverse(next, DEFAULT_GAME_DEFINITION);
  return next;
}
