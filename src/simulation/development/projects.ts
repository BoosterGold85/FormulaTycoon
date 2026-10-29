import {
  PACE_WEIGHTS,
  PART_CONTRIBUTIONS,
  type CircuitPackage,
  type DevelopmentArea,
  type DevelopmentContext,
  type PartDefinition,
  type PartId,
  type TeamDevelopmentProfile,
  type UpgradeReason
} from '../../game/development';
import { clamp } from './random';
import type { DevelopmentProject, ProjectStage, TeamDevelopmentState } from './types';

export function getPart(context: DevelopmentContext, id: PartId): PartDefinition {
  const part = context.parts.find(item => item.id === id);
  if (!part) throw new Error(`Unknown part: ${id}`);
  return part;
}

/** Share of average-circuit lap time that a part influences. */
export function partImportance(id: PartId): number {
  let total = 0;
  for (const [attribute, weights] of Object.entries(PART_CONTRIBUTIONS)) {
    total += (weights[id] ?? 0) * PACE_WEIGHTS[attribute as keyof typeof PACE_WEIGHTS];
  }
  return total;
}

/** Diminishing returns: the closer to the regulation ceiling, the harder each gain. */
export function headroom(rating: number, context: DevelopmentContext): number {
  const { ratingFloor, ratingCeiling } = context.regulations;
  return Math.pow(clamp((ratingCeiling - rating) / (ratingCeiling - ratingFloor), 0, 1), 1);
}

function staffQuality(profile: TeamDevelopmentProfile, area: DevelopmentArea): number {
  return area === 'AERO' ? profile.staff.aero : profile.staff.vehicleDynamics;
}

export function expectedGain(
  profile: TeamDevelopmentProfile,
  team: TeamDevelopmentState,
  context: DevelopmentContext,
  partId: PartId,
  ambition: number
): number {
  const part = getPart(context, partId);
  const staffFactor = 0.4 + staffQuality(profile, part.area) / 100;
  return part.maxGain * ambition * headroom(team.parts[partId].rating, context) * staffFactor;
}

export function projectCost(part: PartDefinition, reason: UpgradeReason, ambition: number): number {
  if (reason === 'RELIABILITY') return part.cost * 0.3;
  if (reason === 'CIRCUIT_SPECIFIC') return part.cost * 0.6;
  return part.cost * (0.5 + 0.7 * ambition);
}

/** Work per stage in average-team weeks. Bigger upgrades take longer. */
export function stageWork(project: DevelopmentProject, part: PartDefinition): number {
  const base =
    project.stage === 'RESEARCH'
      ? part.researchWeeks
      : project.stage === 'DESIGN'
        ? part.designWeeks
        : part.manufactureWeeks;
  if (project.reason === 'RELIABILITY') return Math.max(1, base * 0.35);
  if (project.reason === 'CIRCUIT_SPECIFIC') return base * 0.7;
  return base * (0.6 + 0.6 * project.ambition);
}

const facilitySpeed = (level: number) => 0.4 + 0.2 * level;

/** Average-team weeks of work done per real week on a stage. */
export function stageSpeed(
  profile: TeamDevelopmentProfile,
  team: TeamDevelopmentState,
  part: PartDefinition,
  stage: ProjectStage
): number {
  const { facilities } = profile;
  if (stage === 'RESEARCH') {
    if (part.researchMethod === 'WIND_TUNNEL') {
      return facilitySpeed((facilities.windTunnel + facilities.cfd) / 2) * team.aeroAllowance;
    }
    return facilitySpeed(facilities.rig);
  }
  if (stage === 'DESIGN') return 0.3 + (staffQuality(profile, part.area) / 100) * 0.9;
  if (stage === 'MANUFACTURING') return facilitySpeed(facilities.manufacturing);
  return 0;
}

/** Projects a department can run in parallel. */
export function departmentSlots(profile: TeamDevelopmentProfile, area: DevelopmentArea): number {
  const { facilities } = profile;
  if (area === 'AERO') return 1 + Math.floor((facilities.windTunnel + facilities.cfd) / 4);
  return 1 + Math.floor(facilities.rig / 3);
}

export function spendingLimit(profile: TeamDevelopmentProfile, context: DevelopmentContext): number {
  return Math.min(profile.developmentBudget, context.regulations.developmentCap);
}

export type StartProjectRequest = {
  partId: PartId;
  reason: UpgradeReason;
  ambition: number;
  week: number;
  season: number;
  circuitPackage?: CircuitPackage;
};

export type StartProjectFailure = 'BUSY' | 'NO_SLOT' | 'OVER_BUDGET' | 'HOMOLOGATION_LIMIT';

export type StartProjectResult =
  | { ok: true; team: TeamDevelopmentState; project: DevelopmentProject }
  | { ok: false; reason: StartProjectFailure };

/**
 * Commits budget and a department slot to a new project. The same entry point
 * is used by the rival AI and, later, by the player.
 */
export function startProject(
  team: TeamDevelopmentState,
  profile: TeamDevelopmentProfile,
  context: DevelopmentContext,
  request: StartProjectRequest
): StartProjectResult {
  const part = getPart(context, request.partId);
  if (team.projects.some(project => project.partId === request.partId)) {
    return { ok: false, reason: 'BUSY' };
  }
  const busySlots = team.projects.filter(
    project => getPart(context, project.partId).area === part.area
  ).length;
  if (busySlots >= departmentSlots(profile, part.area)) return { ok: false, reason: 'NO_SLOT' };
  if (
    request.reason === 'PERFORMANCE' &&
    part.maxUpgradesPerSeason !== undefined &&
    team.parts[part.id].upgradesThisSeason >= part.maxUpgradesPerSeason
  ) {
    return { ok: false, reason: 'HOMOLOGATION_LIMIT' };
  }

  const ambition = clamp(request.ambition, 0.1, 1);
  const cost = projectCost(part, request.reason, ambition);
  if (team.spent + cost > spendingLimit(profile, context) + 1e-9) {
    return { ok: false, reason: 'OVER_BUDGET' };
  }

  const project: DevelopmentProject = {
    id: `${team.teamId}-S${request.season}-${team.nextProjectNumber}`,
    partId: part.id,
    reason: request.reason,
    stage: 'RESEARCH',
    progress: 0,
    ambition,
    expectedGain:
      request.reason === 'PERFORMANCE' ? expectedGain(profile, team, context, part.id, ambition) : 0,
    cost,
    startedWeek: request.week,
    ...(request.circuitPackage ? { circuitPackage: request.circuitPackage } : {})
  };
  return {
    ok: true,
    project,
    team: {
      ...team,
      spent: team.spent + cost,
      nextProjectNumber: team.nextProjectNumber + 1,
      projects: [...team.projects, project]
    }
  };
}

const NEXT_STAGE: Record<ProjectStage, ProjectStage> = {
  RESEARCH: 'DESIGN',
  DESIGN: 'MANUFACTURING',
  MANUFACTURING: 'READY',
  READY: 'READY'
};

/** One week of research, design and manufacturing work on every project. */
export function advanceProjects(
  team: TeamDevelopmentState,
  profile: TeamDevelopmentProfile,
  context: DevelopmentContext
): TeamDevelopmentState {
  const projects = team.projects.map(project => {
    const part = getPart(context, project.partId);
    let current = project;
    let budget = 1; // one real week
    while (current.stage !== 'READY' && budget > 1e-9) {
      const speed = stageSpeed(profile, team, part, current.stage);
      const remaining = stageWork(current, part) - current.progress;
      const done = speed * budget;
      if (done < remaining) {
        current = { ...current, progress: current.progress + done };
        budget = 0;
      } else {
        budget -= remaining / speed;
        current = { ...current, stage: NEXT_STAGE[current.stage], progress: 0 };
      }
    }
    return current;
  });
  return { ...team, projects };
}

/** Estimated weeks from now until a project would be ready, for planning. */
export function estimateWeeksToReady(
  profile: TeamDevelopmentProfile,
  team: TeamDevelopmentState,
  part: PartDefinition,
  reason: UpgradeReason,
  ambition: number
): number {
  const probe: DevelopmentProject = {
    id: 'probe',
    partId: part.id,
    reason,
    stage: 'RESEARCH',
    progress: 0,
    ambition,
    expectedGain: 0,
    cost: 0,
    startedWeek: 0
  };
  let total = 0;
  for (const stage of ['RESEARCH', 'DESIGN', 'MANUFACTURING'] as const) {
    total += stageWork({ ...probe, stage }, part) / stageSpeed(profile, team, part, stage);
  }
  return total;
}
