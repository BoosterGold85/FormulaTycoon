import type {CalendarEvent} from '../../game/calendar';
import type {DevelopmentContext} from '../../game/development';
import {advanceDevelopmentWeek,getPart,introduceReadyUpgrades,spendingLimit,type DevelopmentWorld,type TeamDevelopmentState,type UpgradeSubmission} from '../development';
import {clamp} from '../development/random';
import {applyChoice,applyRefine,affordable,canRefine,effectiveBonus,eventDefinition,pendingEvent,recordEvent,rollStageEvent,REFINE_CHOICE} from './events';
import {grandPrixFor,planningContext} from './rules';

const AGGRESSIVE = 0.55;

/**
 * Rules-2 weekly work, run INSIDE the existing D0 DEVELOPMENT_WEEK instruction:
 * 1. unanswered player events resolve to their safe default once;
 * 2. the unchanged kernel runs planning -> work -> maturation, with legacy fitting disabled
 *    and rival planning reading the career's real race weekends;
 * 3. projects observed in a stage without a record roll that stage's seeded event once.
 */
export function rules2Week(world: DevelopmentWorld, context: DevelopmentContext, calendarId: string): DevelopmentWorld {
  let current = resolvePendingDefaults(world, context);
  current = advanceDevelopmentWeek(current, context, { fitting: false, planningContext: planningContext(context, calendarId) });
  return raiseEvents(current, context);
}

function mapTeams(world: DevelopmentWorld, context: DevelopmentContext, fn: (team: TeamDevelopmentState, profileIndex: number) => TeamDevelopmentState): DevelopmentWorld {
  const teams = { ...world.teams };
  context.teams.forEach((profile, i) => { teams[profile.id] = fn(teams[profile.id]!, i); });
  return { ...world, teams };
}

export function resolvePendingDefaults(world: DevelopmentWorld, context: DevelopmentContext): DevelopmentWorld {
  return mapTeams(world, context, (team, i) => {
    const profile = context.teams[i]!;
    for (const project of team.projects) {
      const pending = pendingEvent(project);
      const definition = pending && eventDefinition(pending.type);
      if (!pending || !definition) continue;
      const current = team.projects.find(p => p.id === project.id)!;
      const choice = affordable(team, profile, context, current, definition.choices[0]) ? definition.choices[0] : definition.choices[1];
      team = settle(applyChoice(team, profile, context, project.id, choice), project.id, choice.id, true);
    }
    return team;
  });
}
function settle(team: TeamDevelopmentState, projectId: string, choice: string, defaulted: boolean): TeamDevelopmentState {
  return { ...team, projects: team.projects.map(p => p.id !== projectId ? p : {
    ...p, events: p.events!.map(e => e.choice === null ? { ...e, choice, defaulted } : e) }) };
}

export function raiseEvents(world: DevelopmentWorld, context: DevelopmentContext): DevelopmentWorld {
  return mapTeams(world, context, (team, i) => {
    const profile = context.teams[i]!;
    for (const original of team.projects) {
      const project = team.projects.find(p => p.id === original.id)!;
      if (project.stage === 'READY' || project.events?.some(e => e.stage === project.stage && e.type !== 'REFINE')) continue;
      const part = getPart(context, project.partId);
      const event = rollStageEvent(world.seed, project, part);
      if (event) {
        if (profile.controlledBy === 'AI') {
          const preferred = event.choices[profile.aggression > AGGRESSIVE ? event.risky : 0];
          const choice = affordable(team, profile, context, project, preferred) ? preferred : event.choices.find(c => !c.costShare)!;
          team = recordEvent(applyChoice(team, profile, context, project.id, choice), project.id, { type: event.type, stage: event.stage, choice: choice.id, defaulted: false });
        } else {
          team = recordEvent(team, project.id, { type: event.type, stage: event.stage, choice: null, defaulted: false });
        }
      }
      // Rival quality policy: aggressive organizations refine designs when the budget allows.
      const latest = team.projects.find(p => p.id === project.id)!;
      if (profile.controlledBy === 'AI' && profile.aggression > AGGRESSIVE && canRefine(latest) &&
        team.spent + latest.cost * (REFINE_CHOICE.costShare ?? 0) <= spendingLimit(profile, context) + 1e-9) {
        team = applyRefine(team, profile, context, project.id);
      }
    }
    return team;
  });
}

/** Rules-2 DEVELOPMENT_FITTING at a career weekend's FP1: same kernel fitting, held work stays back. */
export function fitAtWeekend(world: DevelopmentWorld, context: DevelopmentContext, calendarId: string, event: CalendarEvent): DevelopmentWorld {
  const grandPrix = grandPrixFor(calendarId, event);
  const submissions: UpgradeSubmission[] = [];
  const next = mapTeams(world, context, (team, i) => {
    const profile = context.teams[i]!;
    const result = introduceReadyUpgrades(team, profile, context, world.seed, world.season, grandPrix, {
      eligible: project => !project.hold,
      adjust: (project, p) => ({ expectedGain: project.expectedGain * (1 + effectiveBonus(project) / 100),
        correlation: clamp(p.correlation + (project.correlationAdjustment ?? 0), 0, 100) })
    });
    submissions.push(...result.submissions);
    return result.team;
  });
  return submissions.length ? { ...next, submissions: [...world.submissions, ...submissions] } : next;
}
