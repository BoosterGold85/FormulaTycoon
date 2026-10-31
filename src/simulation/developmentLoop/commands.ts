import type {PartId} from '../../game/development';
import {getPart,startProject,type StartProjectFailure,type TeamDevelopmentState} from '../development';
import {developmentState,developmentView} from '../campaignTime/developmentView';
import type {GameDefinition,GameUniverse} from '../universe/types';
import {applyChoice,applyRefine,affordable,canRefine,eventDefinition,pendingEvent} from './events';

export type Objective = 'PERFORMANCE' | 'RELIABILITY' | 'CIRCUIT_SPECIFIC';
export type Approach = 'CONSERVATIVE' | 'BALANCED' | 'AGGRESSIVE';
/** Owner-approved presets; reliability and track-package work uses the rival AI's fixed values. */
export const APPROACH_AMBITION: Record<Approach, number> = { CONSERVATIVE: 0.35, BALANCED: 0.6, AGGRESSIVE: 0.9 };
export type CommandFailure = StartProjectFailure | 'NO_PLAYER_TEAM' | 'UNKNOWN_PROJECT' | 'NOT_AVAILABLE' | 'RULES' | 'OVER_BUDGET' | 'PACKAGE_EXISTS';
export type CommandResult = { ok: true; universe: GameUniverse } | { ok: false; reason: CommandFailure };

function playerContext(universe: GameUniverse, definition: GameDefinition) {
  if (universe.definitionVersion !== definition.version) throw new Error('Game definition mismatch: explicit content migration required');
  const teamId = universe.playerTeamId;
  const profile = teamId ? definition.development.teams.find(t => t.id === teamId) : undefined;
  if (!teamId || !profile) return null;
  const view = developmentView(universe.development, universe.currentDate);
  return { teamId, profile, view, team: view.teams[teamId]! };
}
function commit(universe: GameUniverse, ctx: NonNullable<ReturnType<typeof playerContext>>, team: TeamDevelopmentState): CommandResult {
  return { ok: true, universe: { ...universe, development: developmentState({ ...ctx.view, teams: { ...ctx.view.teams, [ctx.teamId]: team } }) } };
}

/** The player's team uses the SAME startProject rules as rivals: slots, budget, homologation. */
export function startPlayerProject(universe: GameUniverse, definition: GameDefinition,
  request: { partId: PartId; objective: Objective; approach: Approach }): CommandResult {
  const ctx = playerContext(universe, definition);
  if (!ctx) return { ok: false, reason: 'NO_PLAYER_TEAM' };
  const part = getPart(definition.development, request.partId);
  if (request.objective === 'CIRCUIT_SPECIFIC') {
    if (!part.circuitPackage) return { ok: false, reason: 'NOT_AVAILABLE' };
    if (ctx.team.circuitPackages.includes(part.circuitPackage)) return { ok: false, reason: 'PACKAGE_EXISTS' };
  }
  const ambition = request.objective === 'PERFORMANCE' ? APPROACH_AMBITION[request.approach] : request.objective === 'RELIABILITY' ? 0.3 : 0.5;
  const result = startProject(ctx.team, ctx.profile, definition.development, { partId: part.id, reason: request.objective, ambition,
    week: ctx.view.week, season: ctx.view.season, ...(request.objective === 'CIRCUIT_SPECIFIC' ? { circuitPackage: part.circuitPackage! } : {}) });
  return result.ok ? commit(universe, ctx, result.team) : { ok: false, reason: result.reason };
}
function ownProject(universe: GameUniverse, definition: GameDefinition, projectId: string) {
  const ctx = playerContext(universe, definition);
  const project = ctx?.team.projects.find(p => p.id === projectId);
  return ctx && project ? { ctx, project } : null;
}
/** Rules 2: keep a READY (or future READY) project back from the next race weekend. */
export function setProjectHold(universe: GameUniverse, definition: GameDefinition, projectId: string, hold: boolean): CommandResult {
  if (universe.developmentRules !== 2) return { ok: false, reason: 'RULES' };
  const found = ownProject(universe, definition, projectId);
  if (!found) return { ok: false, reason: 'UNKNOWN_PROJECT' };
  if (!!found.project.hold === hold) return { ok: true, universe };
  const team = { ...found.ctx.team, projects: found.ctx.team.projects.map(p => {
    if (p.id !== projectId) return p;
    const { hold: _old, ...rest } = p; return hold ? { ...rest, hold: true } : rest; }) };
  return commit(universe, found.ctx, team);
}
export function refinePlayerProject(universe: GameUniverse, definition: GameDefinition, projectId: string): CommandResult {
  if (universe.developmentRules !== 2) return { ok: false, reason: 'RULES' };
  const found = ownProject(universe, definition, projectId);
  if (!found) return { ok: false, reason: 'UNKNOWN_PROJECT' };
  if (!canRefine(found.project)) return { ok: false, reason: 'NOT_AVAILABLE' };
  const { ctx, project } = found;
  if (!affordable(ctx.team, ctx.profile, definition.development, project, { id: 'REFINE', label: '', detail: '', costShare: 0.1 })) return { ok: false, reason: 'OVER_BUDGET' };
  return commit(universe, ctx, applyRefine(ctx.team, ctx.profile, definition.development, projectId));
}
/** Answer the project's pending hiccup/breakthrough exactly once. */
export function decideProjectEvent(universe: GameUniverse, definition: GameDefinition, projectId: string, choiceId: string): CommandResult {
  if (universe.developmentRules !== 2) return { ok: false, reason: 'RULES' };
  const found = ownProject(universe, definition, projectId);
  if (!found) return { ok: false, reason: 'UNKNOWN_PROJECT' };
  const pending = pendingEvent(found.project), event = pending && eventDefinition(pending.type);
  const choice = event?.choices.find(c => c.id === choiceId);
  if (!pending || !choice) return { ok: false, reason: 'NOT_AVAILABLE' };
  const { ctx } = found;
  if (!affordable(ctx.team, ctx.profile, definition.development, found.project, choice)) return { ok: false, reason: 'OVER_BUDGET' };
  const applied = applyChoice(ctx.team, ctx.profile, definition.development, projectId, choice);
  return commit(universe, ctx, { ...applied, projects: applied.projects.map(p => p.id !== projectId ? p :
    { ...p, events: p.events!.map(e => e.choice === null ? { ...e, choice: choice.id } : e) }) });
}
