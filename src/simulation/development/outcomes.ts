import type {
  DevelopmentContext,
  GrandPrix,
  TeamDevelopmentProfile
} from '../../game/development';
import { getPart } from './projects';
import { clamp, gaussian, randomFor } from './random';
import type {
  DevelopmentProject,
  TeamDevelopmentState,
  UpgradeOutcome,
  UpgradeSubmission
} from './types';

/** Reliability a fix project restores. */
const RELIABILITY_FIX = 14;

export function maxReliability(profile: TeamDevelopmentProfile): number {
  return 88 + profile.facilities.manufacturing * 2;
}

/**
 * How the track result of an upgrade compares to the factory prediction.
 * Good correlation means small surprises; ambitious upgrades with poor
 * correlation sometimes simply do not work and are reverted.
 */
export function resolvePerformanceGain(
  project: DevelopmentProject,
  profile: TeamDevelopmentProfile,
  random: ReturnType<typeof randomFor>
): { actualGain: number; outcome: UpgradeOutcome } {
  const miss = 1 - profile.correlation / 100;
  const failChance = miss * 0.35 * (0.5 + project.ambition);
  let factor = 1 + gaussian(random) * (0.12 + miss * 0.5);
  if (random.next() < failChance) factor = -(0.2 + random.next() * 0.5);

  const actual = project.expectedGain * factor;
  if (actual <= 0) return { actualGain: 0, outcome: 'REVERTED' };
  return {
    actualGain: actual,
    outcome: actual < project.expectedGain * 0.6 ? 'UNDERPERFORMED' : 'DELIVERED'
  };
}

/**
 * Fits every finished project at a Grand Prix and records the FIA-style
 * submission for each one.
 */
export function introduceReadyUpgrades(
  team: TeamDevelopmentState,
  profile: TeamDevelopmentProfile,
  context: DevelopmentContext,
  seed: number,
  season: number,
  event: GrandPrix
): { team: TeamDevelopmentState; submissions: UpgradeSubmission[] } {
  const ready = team.projects.filter(project => project.stage === 'READY');
  if (ready.length === 0) return { team, submissions: [] };

  const parts = { ...team.parts };
  const circuitPackages = [...team.circuitPackages];
  const submissions: UpgradeSubmission[] = [];
  const { ratingFloor, ratingCeiling } = context.regulations;

  for (const project of ready) {
    const part = getPart(context, project.partId);
    const random = randomFor(seed, 'upgrade', project.id);
    const current = parts[project.partId];
    let actualGain = 0;
    let outcome: UpgradeOutcome = 'DELIVERED';

    if (project.reason === 'PERFORMANCE') {
      ({ actualGain, outcome } = resolvePerformanceGain(project, profile, random));
      if (outcome !== 'REVERTED') {
        parts[project.partId] = {
          rating: clamp(current.rating + actualGain, ratingFloor, ratingCeiling),
          reliability: Math.max(40, current.reliability - part.reliabilityRisk * project.ambition * 3),
          spec: current.spec + 1,
          upgradesThisSeason: current.upgradesThisSeason + 1
        };
      }
    } else if (project.reason === 'RELIABILITY') {
      parts[project.partId] = {
        ...current,
        reliability: Math.min(maxReliability(profile), current.reliability + RELIABILITY_FIX)
      };
    } else if (project.circuitPackage && !circuitPackages.includes(project.circuitPackage)) {
      circuitPackages.push(project.circuitPackage);
    }

    submissions.push({
      season,
      week: event.week,
      eventId: event.id,
      teamId: team.teamId,
      partId: project.partId,
      reason: project.reason,
      description: random.pick(part.descriptions[project.reason]),
      expectedGain: project.expectedGain,
      actualGain,
      outcome,
      cost: project.cost
    });
  }

  return {
    team: {
      ...team,
      parts,
      circuitPackages,
      projects: team.projects.filter(project => project.stage !== 'READY')
    },
    submissions
  };
}

/** Weekly running (dyno, rig and track mileage) slowly matures fragile parts. */
export function matureReliability(
  team: TeamDevelopmentState,
  profile: TeamDevelopmentProfile
): TeamDevelopmentState {
  const ceiling = maxReliability(profile);
  const rate = 0.3 + 0.1 * profile.facilities.rig;
  const parts = { ...team.parts };
  for (const [id, part] of Object.entries(parts)) {
    if (part.reliability < ceiling) {
      parts[id as keyof typeof parts] = { ...part, reliability: Math.min(ceiling, part.reliability + rate) };
    }
  }
  return { ...team, parts };
}
