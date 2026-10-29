import type { PartDefinition } from '../../game/development/types';
import type { DevelopmentProject } from '../../simulation/development/types';
import type { DriverWorld, HistoricalContract as DriverContract } from './preCalendarTypes';
import { INITIAL_V3 } from './index';

/** Released validation/migration semantics, deliberately independent from future live engine changes. */
export const releasedEffectiveEnd = (c: DriverContract) => c.option?.state === 'EXERCISED' ? c.option.season : c.endSeason;
export function releasedStageWork(project: DevelopmentProject, part: PartDefinition): number {
  const base = project.stage === 'RESEARCH' ? part.researchWeeks : project.stage === 'DESIGN' ? part.designWeeks : part.manufactureWeeks;
  if (project.reason === 'RELIABILITY') return Math.max(1, base * 0.35);
  if (project.reason === 'CIRCUIT_SPECIFIC') return base * 0.7;
  return base * (0.6 + 0.6 * project.ambition);
}
/** Detached v3 migration payload advanced with the released 52-week calendar semantics only. */
export function initialReleasedDrivers(season: number, week: number): DriverWorld {
  if (!Number.isInteger(season) || season < 2026 || season > 9999 || !Number.isInteger(week) || week < 0 || week > 52) throw new Error('Invalid released driver calendar');
  const world = JSON.parse(JSON.stringify(INITIAL_V3.drivers)) as DriverWorld;
  world.season = season; world.week = week;
  for (const c of world.contracts) {
    if (c.option?.state === 'PENDING' && (season > c.option.deadlineSeason || (season === c.option.deadlineSeason && week > c.option.deadlineWeek))) c.option.state = 'LAPSED';
    if (c.status === 'SIGNED' && releasedEffectiveEnd(c) < season) c.status = 'EXPIRED';
  }
  return world;
}
