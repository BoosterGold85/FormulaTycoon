import type {DevelopmentContext} from '../../game/development';
import {getPart,stageWork,type TeamDevelopmentState} from '../development';
import {POINTS_PER_WEEK,workSegments} from '../developmentLoop/workPoints';
import type {QualifyingState} from './types';

/** Research points a team produced between two development states: the replay's Research bubbles. */
export function researchGained(before: TeamDevelopmentState, after: TeamDevelopmentState, context: DevelopmentContext): number {
  let total = 0;
  for (const old of before.projects) {
    const cur = after.projects.find(p => p.id === old.id);
    for (const s of workSegments(old, cur, getPart(context, old.partId))) if (s.category === 'Research') total += s.points;
  }
  return total;
}
export function addResearch(state: QualifyingState, before: Record<string, TeamDevelopmentState>, after: Record<string, TeamDevelopmentState>, context: DevelopmentContext): QualifyingState {
  const researchPoints = { ...state.researchPoints };
  for (const t of context.teams) researchPoints[t.id] = (researchPoints[t.id] ?? 0) + researchGained(before[t.id]!, after[t.id]!, context);
  return { ...state, researchPoints };
}
export const resetResearch = (state: QualifyingState): QualifyingState =>
  ({ ...state, researchPoints: Object.fromEntries(Object.keys(state.researchPoints).map(id => [id, 0])) });

/**
 * Save v8 migration estimate (owner-approved): Research work already done on the team's current
 * projects. Parts already fitted are not counted, so a migrated team may start a little behind.
 */
export function estimateResearch(team: TeamDevelopmentState, context: DevelopmentContext): number {
  return team.projects.reduce((sum, p) => {
    const research = stageWork({ ...p, stage: 'RESEARCH' }, getPart(context, p.partId));
    return sum + Math.round((p.stage === 'RESEARCH' ? Math.max(0, Math.min(research, p.progress)) : research) * POINTS_PER_WEEK);
  }, 0);
}
