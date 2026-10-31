import type {DevelopmentContext,PartDefinition,TeamDevelopmentProfile} from '../../game/development';
import {getPart,spendingLimit,stageSpeed,stageWork,type DevelopmentProject,type ProjectStage,type TeamDevelopmentState} from '../development';
import {randomFor} from '../randomStreams';

export type EventChoice = {
  id: string; label: string; detail: string;
  /** Weeks of this team's work lost (+) on the project's current stage. */
  delayWeeks?: number;
  /** Weeks of this team's work gained on the project's current stage. */
  gainWeeks?: number;
  /** Extra cost as a share of the project's committed cost. */
  costShare?: number;
  bonusPoints?: number;
  correlation?: number;
};
export type DevelopmentEventDefinition = {
  type: string; stage: Exclude<ProjectStage, 'READY'>; method?: PartDefinition['researchMethod'];
  title: string; text: string; choices: [EventChoice, EventChoice];
  /** Index aggressive rival policies choose; cautious rivals and unanswered player events take 0. */
  risky: 0 | 1;
};

/** V1 catalogue. Every event offers at least one choice with no extra cost. */
export const DEVELOPMENT_EVENTS: DevelopmentEventDefinition[] = [
  { type: 'EXTRA_SIMULATION_TIME', stage: 'RESEARCH', title: 'Extra simulation time available',
    text: 'Spare CFD and simulator capacity has opened up this week.', risky: 1, choices: [
      { id: 'DECLINE_TIME', label: 'Decline', detail: 'No change' },
      { id: 'BUY_TIME', label: 'Book the time', detail: '8% more cost, better concept', costShare: 0.08, bonusPoints: 6 }] },
  { type: 'WIND_TUNNEL_CORRELATION', stage: 'RESEARCH', method: 'WIND_TUNNEL', title: 'Wind tunnel correlation issue',
    text: 'Tunnel and CFD numbers disagree on this concept.', risky: 1, choices: [
      { id: 'INVESTIGATE', label: 'Investigate thoroughly', detail: 'About a week slower, more trustworthy result', delayWeeks: 1, correlation: 15 },
      { id: 'TRUST_CFD', label: 'Trust the CFD', detail: 'No delay, less certain on track', correlation: -10 }] },
  { type: 'RIG_CORRELATION', stage: 'RESEARCH', method: 'RIG', title: 'Rig results in doubt',
    text: 'The test rig does not match what the drivers report.', risky: 1, choices: [
      { id: 'RETEST', label: 'Retest the concept', detail: 'Most of a week slower, more trustworthy result', delayWeeks: 0.8, correlation: 15 },
      { id: 'PROCEED', label: 'Proceed', detail: 'No delay, less certain on track', correlation: -10 }] },
  { type: 'DESIGN_BREAKTHROUGH', stage: 'DESIGN', title: 'Design breakthrough',
    text: 'An engineer has found extra performance in the concept.', risky: 0, choices: [
      { id: 'EXPLOIT', label: 'Exploit it', detail: 'Half a week longer, better part', delayWeeks: 0.5, bonusPoints: 8 },
      { id: 'BANK_TIME', label: 'Bank the time', detail: 'Use it to finish half a week sooner', gainWeeks: 0.5 }] },
  { type: 'SIMPLIFICATION', stage: 'DESIGN', title: 'Simplification opportunity',
    text: 'The design could be simplified to save time.', risky: 0, choices: [
      { id: 'KEEP_CONCEPT', label: 'Keep the full concept', detail: 'No change' },
      { id: 'SIMPLIFY', label: 'Simplify', detail: 'Most of a week sooner, slightly weaker part', gainWeeks: 0.7, bonusPoints: -10 }] },
  { type: 'RIVAL_CONCEPT', stage: 'DESIGN', title: 'Rival concept spotted',
    text: 'Photos from the paddock show a rival solving the same problem differently.', risky: 1, choices: [
      { id: 'STAY_COURSE', label: 'Stay on course', detail: 'No change' },
      { id: 'ADAPT_IDEA', label: 'Adapt the idea', detail: 'About a week longer, better part', delayWeeks: 1, bonusPoints: 12 }] },
  { type: 'PROTOTYPE_DEFECT', stage: 'MANUFACTURING', title: 'Prototype defect',
    text: 'Inspection found a flaw in the first parts made.', risky: 1, choices: [
      { id: 'REMAKE', label: 'Remake the parts', detail: 'Most of a week slower, 10% more cost', delayWeeks: 0.7, costShare: 0.1 },
      { id: 'ACCEPT', label: 'Accept the flaw', detail: 'No delay, weaker part', bonusPoints: -6 }] },
  { type: 'MATERIAL_SHORTAGE', stage: 'MANUFACTURING', title: 'Material shortage',
    text: 'A supplier cannot deliver composite on time.', risky: 0, choices: [
      { id: 'EXPEDITE', label: 'Pay to expedite', detail: '15% more cost, no delay', costShare: 0.15 },
      { id: 'WAIT', label: 'Wait for supply', detail: 'About a week slower', delayWeeks: 1 }] },
  { type: 'LIGHTWEIGHT_MATERIAL', stage: 'MANUFACTURING', title: 'Lighter material offered',
    text: 'A supplier can provide a lighter composite for this part.', risky: 1, choices: [
      { id: 'STANDARD_MATERIAL', label: 'Keep standard material', detail: 'No change' },
      { id: 'USE_LIGHTWEIGHT', label: 'Use the lighter material', detail: '12% more cost, better part', costShare: 0.12, bonusPoints: 6 }] }
];
/** Tuned after the first play-test: roughly one decision every two to three weeks while projects run. */
export const EVENT_CHANCE = 0.5;
export const REFINE_BONUS = 10;
export const BONUS_CAP = 25;
const REFINE: EventChoice = { id: 'REFINE', label: 'Refine design', detail: 'About a week longer, 10% more cost, better part', delayWeeks: 1, costShare: 0.1, bonusPoints: REFINE_BONUS };

export const eventDefinition = (type: string) => DEVELOPMENT_EVENTS.find(e => e.type === type);
/** Seeded, keyed occurrence for one project stage. New namespace; never consumes 'plan' or 'upgrade'. */
export function rollStageEvent(seed: number, project: DevelopmentProject, part: PartDefinition): DevelopmentEventDefinition | null {
  if (project.reason !== 'PERFORMANCE' || project.stage === 'READY') return null;
  const random = randomFor(seed, 'development-event', project.id, project.stage);
  if (random.next() >= EVENT_CHANCE) return null;
  const candidates = DEVELOPMENT_EVENTS.filter(e => e.stage === project.stage && (!e.method || e.method === part.researchMethod));
  return candidates.length ? random.pick(candidates) : null;
}
export const effectiveBonus = (project: DevelopmentProject) => Math.max(-BONUS_CAP, Math.min(BONUS_CAP, project.bonusPoints ?? 0));
export const choiceCost = (project: DevelopmentProject, choice: EventChoice) => project.cost * (choice.costShare ?? 0);
export function affordable(team: TeamDevelopmentState, profile: TeamDevelopmentProfile, context: DevelopmentContext, project: DevelopmentProject, choice: EventChoice): boolean {
  return team.spent + choiceCost(project, choice) <= spendingLimit(profile, context) + 1e-9;
}

/** Applies a bounded decision to existing project fields once. Time shifts act on the CURRENT stage. */
export function applyChoice(team: TeamDevelopmentState, profile: TeamDevelopmentProfile, context: DevelopmentContext,
  projectId: string, choice: EventChoice): TeamDevelopmentState {
  const project = team.projects.find(p => p.id === projectId)!;
  const part = getPart(context, project.partId);
  const cost = choiceCost(project, choice);
  let progress = project.progress;
  let delay = project.delayWeeks ?? 0;
  if (project.stage !== 'READY') {
    if (choice.delayWeeks) delay += choice.delayWeeks;
    if (choice.gainWeeks) progress = Math.min(stageWork(project, part) - 1e-6, progress + choice.gainWeeks * stageSpeed(profile, team, part, project.stage));
  }
  const next: DevelopmentProject = { ...project, progress, cost: project.cost + cost, ...(delay > 0 ? { delayWeeks: delay } : {}),
    ...(choice.bonusPoints ? { bonusPoints: (project.bonusPoints ?? 0) + choice.bonusPoints } : {}),
    ...(choice.correlation ? { correlationAdjustment: (project.correlationAdjustment ?? 0) + choice.correlation } : {}) };
  return { ...team, spent: team.spent + cost, projects: team.projects.map(p => p.id === projectId ? next : p) };
}
export function recordEvent(team: TeamDevelopmentState, projectId: string, record: NonNullable<DevelopmentProject['events']>[number]): TeamDevelopmentState {
  return { ...team, projects: team.projects.map(p => p.id === projectId ? { ...p, events: [...(p.events ?? []), record] } : p) };
}
export const pendingEvent = (project: DevelopmentProject) => project.events?.find(e => e.choice === null);
export const canRefine = (project: DevelopmentProject) => project.reason === 'PERFORMANCE' && project.stage === 'DESIGN' && !project.events?.some(e => e.type === 'REFINE');
export function applyRefine(team: TeamDevelopmentState, profile: TeamDevelopmentProfile, context: DevelopmentContext, projectId: string): TeamDevelopmentState {
  return recordEvent(applyChoice(team, profile, context, projectId, REFINE), projectId, { type: 'REFINE', stage: 'DESIGN', choice: 'REFINE', defaulted: false });
}
export const REFINE_CHOICE = REFINE;
