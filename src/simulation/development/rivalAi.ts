import type {
  CircuitPackage,
  DevelopmentArea,
  DevelopmentContext,
  PartId,
  TeamDevelopmentProfile
} from '../../game/development';
import {
  departmentSlots,
  estimateWeeksToReady,
  getPart,
  headroom,
  partImportance,
  spendingLimit,
  startProject
} from './projects';
import { clamp, gaussian, randomFor } from './random';
import type { TeamDevelopmentState } from './types';

/** Parts below this reliability get a fix project before anything else. */
const RELIABILITY_ALARM = 82;
/** How far ahead teams look for circuits that need a special package. */
const PACKAGE_LOOKAHEAD_WEEKS = 10;

const PACKAGE_PART: Record<CircuitPackage, PartId> = {
  LOW_DRAG: 'REAR_WING',
  HIGH_COOLING: 'BODYWORK_COOLING'
};

/**
 * A rival team's weekly development decisions: fix reliability problems,
 * prepare circuit-specific packages, then chase performance where the
 * department has capacity, the budget allows and a race is still ahead.
 */
export function planRivalWeek(
  team: TeamDevelopmentState,
  profile: TeamDevelopmentProfile,
  context: DevelopmentContext,
  seed: number,
  season: number,
  week: number
): TeamDevelopmentState {
  const random = randomFor(seed, 'plan', profile.id, season, week);
  const lastRaceWeek = Math.max(...context.calendar.map(event => event.week));
  let current = team;

  const tryStart = (request: Parameters<typeof startProject>[3]) => {
    const result = startProject(current, profile, context, request);
    if (result.ok) current = result.team;
    return result.ok;
  };

  // 1. Reliability fixes.
  for (const part of context.parts) {
    if (current.parts[part.id].reliability < RELIABILITY_ALARM) {
      tryStart({ partId: part.id, reason: 'RELIABILITY', ambition: 0.3, week, season });
    }
  }

  // 2. Circuit-specific packages for upcoming races.
  const upcoming = context.calendar.filter(
    event => event.week > week && event.week <= week + PACKAGE_LOOKAHEAD_WEEKS
  );
  const needs: CircuitPackage[] = [];
  if (upcoming.some(event => event.downforce === 'LOW')) needs.push('LOW_DRAG');
  if (upcoming.some(event => event.hot)) needs.push('HIGH_COOLING');
  for (const circuitPackage of needs) {
    const building = current.projects.some(project => project.circuitPackage === circuitPackage);
    if (!current.circuitPackages.includes(circuitPackage) && !building) {
      tryStart({
        partId: PACKAGE_PART[circuitPackage],
        reason: 'CIRCUIT_SPECIFIC',
        ambition: 0.5,
        week,
        season,
        circuitPackage
      });
    }
  }

  // 3. Performance upgrades, paced so the budget lasts the season.
  const seasonShare = clamp((week + 6) / lastRaceWeek, 0, 1);
  const paceBudget = spendingLimit(profile, context) * seasonShare;
  for (const area of ['AERO', 'VEHICLE_DYNAMICS'] as DevelopmentArea[]) {
    const busy = current.projects.filter(
      project => getPart(context, project.partId).area === area
    ).length;
    for (let slot = busy; slot < departmentSlots(profile, area); slot += 1) {
      if (current.spent >= paceBudget) break;
      if (random.next() > 0.35 + profile.aggression * 0.4) continue;

      const ambition = clamp(0.35 + profile.aggression * 0.5 + gaussian(random) * 0.12, 0.2, 1);
      const choice = pickPart(current, profile, context, area, ambition, week, lastRaceWeek, random);
      if (!choice) break;
      if (!tryStart({ partId: choice, reason: 'PERFORMANCE', ambition, week, season })) {
        tryStart({ partId: choice, reason: 'PERFORMANCE', ambition: ambition * 0.5, week, season });
      }
    }
  }

  return current;
}

function pickPart(
  team: TeamDevelopmentState,
  profile: TeamDevelopmentProfile,
  context: DevelopmentContext,
  area: DevelopmentArea,
  ambition: number,
  week: number,
  lastRaceWeek: number,
  random: ReturnType<typeof randomFor>
): PartId | null {
  let best: PartId | null = null;
  let bestScore = 0;
  for (const part of context.parts) {
    if (part.area !== area) continue;
    if (team.projects.some(project => project.partId === part.id)) continue;
    const state = team.parts[part.id];
    if (part.maxUpgradesPerSeason !== undefined && state.upgradesThisSeason >= part.maxUpgradesPerSeason) {
      continue;
    }
    // Late in the year there is no point starting something that misses the last race.
    if (week + estimateWeeksToReady(profile, team, part, 'PERFORMANCE', ambition) > lastRaceWeek) {
      continue;
    }
    const value = (partImportance(part.id) * headroom(state.rating, context)) / part.cost;
    const score = value * profile.focus[area] * (0.7 + random.next() * 0.6);
    if (score > bestScore) {
      bestScore = score;
      best = part.id;
    }
  }
  return best;
}
