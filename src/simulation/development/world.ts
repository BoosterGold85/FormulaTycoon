import type { DevelopmentContext, PartId, TeamDevelopmentProfile } from '../../game/development';
import { computeCarProfile } from './carModel';
import { introduceReadyUpgrades, matureReliability, maxReliability } from './outcomes';
import { advanceProjects } from './projects';
import { clamp } from './random';
import { planRivalWeek } from './rivalAi';
import type { DevelopmentWorld, PartState, TeamDevelopmentState, UpgradeSubmission } from './types';

export function getProfile(context: DevelopmentContext, teamId: string): TeamDevelopmentProfile {
  const profile = context.teams.find(team => team.id === teamId);
  if (!profile) throw new Error(`Unknown team: ${teamId}`);
  return profile;
}

/** Wind tunnel/CFD share by finishing order: champions get the least. */
function aeroAllowances(context: DevelopmentContext, standings: string[]): Record<string, number> {
  const table = context.regulations.aeroTestingAllowance;
  const result: Record<string, number> = {};
  standings.forEach((teamId, index) => {
    result[teamId] = table[Math.min(index, table.length - 1)]!;
  });
  return result;
}

/** Teams ordered by average-circuit pace, fastest first. */
export function rankTeamsByPace(world: DevelopmentWorld, context: DevelopmentContext): string[] {
  return context.teams
    .map(profile => ({
      id: profile.id,
      pace: computeCarProfile(world.teams[profile.id]!, profile).pace
    }))
    .sort((a, b) => b.pace - a.pace || a.id.localeCompare(b.id))
    .map(entry => entry.id);
}

function initialTeamState(
  profile: TeamDevelopmentProfile,
  context: DevelopmentContext,
  allowance: number
): TeamDevelopmentState {
  const { ratingFloor, ratingCeiling } = context.regulations;
  const parts = {} as Record<PartId, PartState>;
  for (const part of context.parts) {
    parts[part.id] = {
      rating: clamp(profile.carLevel + (profile.partOffsets?.[part.id] ?? 0), ratingFloor, ratingCeiling),
      reliability: maxReliability(profile),
      spec: 1,
      upgradesThisSeason: 0
    };
  }
  return {
    teamId: profile.id,
    parts,
    projects: [],
    spent: 0,
    circuitPackages: [],
    aeroAllowance: allowance,
    nextProjectNumber: 1
  };
}

/**
 * New development world. Without previous standings, the starting car order
 * stands in for last year's championship when allocating aero testing time.
 */
export function createDevelopmentWorld(
  context: DevelopmentContext,
  seed: number,
  previousStandings?: string[]
): DevelopmentWorld {
  const ids = new Set<string>();
  for (const team of context.teams) {
    if (ids.has(team.id)) throw new Error(`Duplicate team id: ${team.id}`);
    ids.add(team.id);
  }
  const standings =
    previousStandings ??
    [...context.teams].sort((a, b) => b.carLevel - a.carLevel || a.id.localeCompare(b.id)).map(t => t.id);
  const allowances = aeroAllowances(context, standings);

  const teams: Record<string, TeamDevelopmentState> = {};
  for (const profile of context.teams) {
    teams[profile.id] = initialTeamState(profile, context, allowances[profile.id] ?? 1);
  }
  return { seed, season: 1, week: 0, teams, submissions: [] };
}

/**
 * One week of factory work for every team. On race weeks finished upgrades
 * are fitted and declared. Pure and deterministic for a given seed.
 */
export function advanceDevelopmentWeek(
  world: DevelopmentWorld,
  context: DevelopmentContext
): DevelopmentWorld {
  const week = world.week + 1;
  if (week > context.regulations.seasonWeeks) return world;
  const event = context.calendar.find(item => item.week === week);
  const teams: Record<string, TeamDevelopmentState> = {};
  const submissions: UpgradeSubmission[] = [];

  for (const profile of context.teams) {
    let team = world.teams[profile.id]!;
    if (profile.controlledBy === 'AI') {
      team = planRivalWeek(team, profile, context, world.seed, world.season, week);
    }
    team = advanceProjects(team, profile, context);
    team = matureReliability(team, profile);
    if (event) {
      const result = introduceReadyUpgrades(team, profile, context, world.seed, world.season, event);
      team = result.team;
      submissions.push(...result.submissions);
    }
    teams[profile.id] = team;
  }

  return {
    ...world,
    week,
    teams,
    submissions: submissions.length ? [...world.submissions, ...submissions] : world.submissions
  };
}

/** Runs the rest of the current season headlessly. */
export function runDevelopmentSeason(
  world: DevelopmentWorld,
  context: DevelopmentContext
): DevelopmentWorld {
  let current = world;
  while (current.week < context.regulations.seasonWeeks) {
    current = advanceDevelopmentWeek(current, context);
  }
  return current;
}

/**
 * Winter break: budgets and homologation counts reset, aero testing time is
 * re-allocated from the final standings, and unfinished projects are dropped.
 * A regulation reset pulls every car back towards the pack.
 */
export function startNextSeason(
  world: DevelopmentWorld,
  context: DevelopmentContext,
  finalStandings: string[],
  options: { regulationReset?: boolean } = {}
): DevelopmentWorld {
  const allowances = aeroAllowances(context, finalStandings);
  const { ratingFloor, ratingCeiling } = context.regulations;
  const teams: Record<string, TeamDevelopmentState> = {};

  for (const profile of context.teams) {
    const team = world.teams[profile.id]!;
    const parts = { ...team.parts };
    for (const [id, part] of Object.entries(parts)) {
      const rating = options.regulationReset
        ? clamp(profile.carLevel - 4 + (part.rating - profile.carLevel) * 0.3, ratingFloor, ratingCeiling)
        : part.rating;
      parts[id as PartId] = {
        rating,
        reliability: options.regulationReset ? maxReliability(profile) - 8 : part.reliability,
        spec: options.regulationReset ? 1 : part.spec,
        upgradesThisSeason: 0
      };
    }
    teams[profile.id] = {
      ...team,
      parts,
      projects: [],
      spent: 0,
      circuitPackages: options.regulationReset ? [] : team.circuitPackages,
      aeroAllowance: allowances[profile.id] ?? 1
    };
  }
  return { ...world, season: world.season + 1, week: 0, teams };
}
