import {calendarById} from '../../game/calendar';
import type {PartDefinition} from '../../game/development';
import {teamBrand} from '../../game/brandRegistry';
import {addCampaignDays,type CampaignDate} from '../campaignTime';
import {developmentView} from '../campaignTime/developmentView';
import {advanceProjects,getPart,stageWork,type DevelopmentProject,type ProjectStage} from '../development';
import {technicalPerformanceAtTrack} from '../trackPerformance';
import {dueCampaignEvents} from '../universe/campaignEvents';
import type {GameDefinition,GameUniverse} from '../universe/types';
import {effectiveBonus} from './events';
import {resolvePendingDefaults} from './step';
import {NORMAL_WEEK,weekVariation,type WeekKind} from './variation';
import {POINTS_PER_WEEK,predictedBand,selectProjectView,summarizeTurn} from './views';

/**
 * Read model of what the processed week MEANT for each player project. Every number comes from the
 * before/after universes; the kind of week is recomputed from the same pure seeded draw the rules-3
 * kernel used (variation.ts), so presentation can never disagree with the simulation.
 */
export type Swing = 'NORMAL' | 'GOOD' | 'SLOW' | 'SETBACK' | 'STALL' | 'BREAKTHROUGH';
export const SWING_OF: Record<WeekKind, Swing> = { NORMAL: 'NORMAL', MINOR_UP: 'GOOD', MINOR_DOWN: 'SLOW', SETBACK: 'SETBACK', STALL: 'STALL',
  BREAKTHROUGH: 'BREAKTHROUGH', MAJOR_BREAKTHROUGH: 'BREAKTHROUGH' };
export const DEPARTMENT_LABEL: Record<string, string> = { AERO: 'Aero group', SIMULATOR: 'Simulator team', WORKSHOP: 'Workshop engineers', MANUFACTURING: 'Manufacturing', LOGISTICS: 'Logistics' };

export type WeekStory = {
  projectId: string; name: string; kind: WeekKind; swing: Swing; day: number;
  title: string | null; text: string | null; department: string; decisionDelay: boolean;
  expected: number; actual: number; quality: number;
  readyBefore: CampaignDate | null; readyAfter: CampaignDate | null; fitBefore: string | null; fitAfter: string | null;
};

function storyText(kind: WeekKind, stage: Exclude<ProjectStage, 'READY'>, part: PartDefinition, quality: number, dept: string): { title: string | null; text: string | null } {
  const who = DEPARTMENT_LABEL[dept] ?? 'The team';
  const tunnel = part.researchMethod === 'WIND_TUNNEL';
  if (kind === 'STALL') {
    if (stage === 'RESEARCH') return tunnel ? { title: 'Correlation problem', text: 'Wind tunnel and CFD disagree. The research week was lost.' }
      : { title: 'Rig failure', text: 'The test rig was down. No research was completed this week.' };
    if (stage === 'DESIGN') return { title: 'Design rework', text: `A flaw in the concept had to be corrected and design stalled.${quality < 0 ? ' The fix gave up some performance.' : ''}` };
    return { title: 'Prototype failure', text: `The first parts failed inspection and the week's production was lost.${quality < 0 ? ' The rushed remake is weaker.' : ''}` };
  }
  if (kind === 'SETBACK') {
    if (stage === 'RESEARCH') return tunnel ? { title: 'Correlation issue', text: 'Tunnel and CFD numbers disagreed and slowed the research.' }
      : { title: 'Rig data in doubt', text: 'Repeated rig runs slowed the research.' };
    if (stage === 'DESIGN') return { title: 'Design delays', text: 'Technical questions slowed the drawing office.' };
    return { title: 'Production problems', text: 'Machining issues slowed manufacturing.' };
  }
  if (kind === 'BREAKTHROUGH' || kind === 'MAJOR_BREAKTHROUGH') {
    const major = kind === 'MAJOR_BREAKTHROUGH';
    if (stage === 'MANUFACTURING') return { title: major ? 'Exceptional production week' : 'Production running ahead', text: 'The workshop is well ahead of schedule.' };
    if (quality > 0) return { title: major ? 'Major breakthrough' : 'Extra performance found', text: major ? `The ${who.toLowerCase()} found an unexpected gain: faster progress and a better part.`
      : `The ${who.toLowerCase()} found additional performance in the concept.` };
    return { title: 'Ahead of schedule', text: `The ${who.toLowerCase()} moved much faster than planned.` };
  }
  return { title: null, text: null };
}

/** The D0 development-week date processed inside (before.currentDate, after.currentDate], if any. */
export function processedWeekDate(before: GameUniverse, after: GameUniverse): CampaignDate | null {
  return dueCampaignEvents(before, after.currentDate).find(e => e.kind === 'DEVELOPMENT_WEEK')?.date ?? null;
}

export function weekStories(before: GameUniverse, after: GameUniverse, definition: GameDefinition): WeekStory[] {
  const teamId = before.playerTeamId, date = processedWeekDate(before, after);
  if (!teamId || !date) return [];
  const context = definition.development, profile = context.teams.find(t => t.id === teamId)!;
  // The exact pre-work state the kernel saw: previous day's view with unanswered decisions defaulted.
  const view = resolvePendingDefaults(developmentView(before.development, addCampaignDays(date, -1)), context);
  const team = view.teams[teamId]!, now = after.development.teams[teamId]!;
  const summary = summarizeTurn(before, after, definition)!;
  return team.projects.filter(p => p.stage !== 'READY').map(project => {
    const part = getPart(context, project.partId), stage = project.stage as Exclude<ProjectStage, 'READY'>;
    const variation = after.developmentRules === 3 ? weekVariation(before.seed, profile, project, part, view.season, view.week + 1) : NORMAL_WEEK;
    const normal = advanceProjects({ ...team, projects: [project] }, profile, context).projects[0]!;
    const row = summary.projects.find(p => p.id === project.id)!;
    const actual = row.segments.reduce((sum, s) => sum + s.points, 0);
    const cur = now.projects.find(p => p.id === project.id);
    const was = selectProjectView(before, definition, before.development.teams[teamId]!.projects.find(p => p.id === project.id)!);
    const is = cur ? selectProjectView(after, definition, cur) : null;
    const quality = Math.round((cur?.bonusPoints ?? 0) - (project.bonusPoints ?? 0));
    const department = row.segments[0]?.department ?? 'AERO';
    return { projectId: project.id, name: part.name, kind: variation.kind, swing: SWING_OF[variation.kind], day: variation.day,
      ...(project.delayWeeks && !['STALL', 'SETBACK', 'BREAKTHROUGH', 'MAJOR_BREAKTHROUGH'].includes(variation.kind)
        ? { title: 'Decision time', text: 'The team spent time on the decision taken for this part.' }
        : storyText(variation.kind, stage, part, quality, department)), department, decisionDelay: (project.delayWeeks ?? 0) > 0,
      expected: Math.round(workPoints(project, normal, part)), actual, quality,
      readyBefore: was.readyDate, readyAfter: is ? is.readyDate : null, fitBefore: was.fitsAt?.name ?? null, fitAfter: is?.fitsAt?.name ?? null };
  });
}

/** Work points between two kernel states of one project (same unit as the report). */
function workPoints(from: DevelopmentProject, to: DevelopmentProject, part: PartDefinition): number {
  const order: ProjectStage[] = ['RESEARCH', 'DESIGN', 'MANUFACTURING', 'READY'];
  const a = order.indexOf(from.stage), b = order.indexOf(to.stage);
  let total = 0;
  for (let i = a; i <= Math.min(b, 2); i++) {
    const stage = order[i]!;
    const work = stageWork({ ...from, stage }, part);
    total += (i === b ? Math.max(0, to.progress) : work) - (i === a ? Math.max(0, from.progress) : 0);
  }
  return total * POINTS_PER_WEEK;
}

/** Quality wording from the EXISTING bonus points; never a number, never a second performance model. */
export function qualityLabel(project: Pick<DevelopmentProject, 'bonusPoints'>): 'Better than expected' | 'Promising' | 'As planned' | 'Compromised' {
  const bonus = effectiveBonus(project as DevelopmentProject);
  return bonus >= 10 ? 'Better than expected' : bonus >= 4 ? 'Promising' : bonus <= -4 ? 'Compromised' : 'As planned';
}
/** Why a part ended where it did, in words: development quality before fitting, and (once fitted)
 * the existing outcome label. A miss on track comes from correlation in the existing outcome model. */
export function reasonFor(project: Pick<DevelopmentProject, 'bonusPoints'>, label?: string): string {
  const q = qualityLabel(project), strong = q === 'Better than expected' || q === 'Promising', weak = q === 'Compromised';
  if (label === 'BELOW EXPECTATION' || label?.startsWith("DIDN'T WORK"))
    return weak ? 'Development problems compromised the design' : strong ? 'Promising factory work, but the numbers did not fully carry over to the car' : 'The factory numbers did not fully carry over to the car';
  if (label === 'ABOVE EXPECTATION') return strong ? 'Strong research and design weeks paid off' : 'The part delivered more than the tools predicted';
  if (label === 'ON TARGET') return strong ? 'Strong development, delivered as predicted' : weak ? 'Delivered as predicted despite development problems' : 'Developed to plan';
  return strong ? 'Strong research and design weeks' : weak ? 'Development problems compromised the design' : 'Developed to plan';
}

/** Full transient turn report: the existing summary plus stories, completions, fitting reasons and the weekend handoff. */
export function summarizeWeek(before: GameUniverse, after: GameUniverse, definition: GameDefinition) {
  const base = summarizeTurn(before, after, definition);
  if (!base) return null;
  const teamId = after.playerTeamId!;
  const was = before.development.teams[teamId]!, now = after.development.teams[teamId]!;
  const completed = now.projects.filter(p => p.stage === 'READY' && was.projects.find(q => q.id === p.id)?.stage !== 'READY').map(p => {
    const view = selectProjectView(after, definition, p);
    return { name: view.name, predicted: p.reason === 'PERFORMANCE' ? predictedBand(p) : null, quality: p.reason === 'PERFORMANCE' ? qualityLabel(p) : null,
      reason: p.reason === 'PERFORMANCE' ? reasonFor(p) : null, readyFor: view.fitsAt?.name ?? null, held: view.hold };
  });
  // Finished parts still waiting for their race weekend: stated, so a READY week is never "quiet".
  const waiting = now.projects.filter(p => p.stage === 'READY' && was.projects.find(q => q.id === p.id)?.stage === 'READY').map(p => {
    const view = selectProjectView(after, definition, p);
    return { name: view.name, readyFor: view.fitsAt?.name ?? null, held: view.hold };
  });
  const fresh = after.development.submissions.slice(before.development.submissions.length).filter(s => s.teamId === teamId);
  const fitted = base.fitted.map((f, i) => {
    const project = was.projects.find(p => p.partId === fresh[i]?.partId && p.stage === 'READY');
    return { ...f, reason: project && fresh[i]?.reason === 'PERFORMANCE' ? reasonFor(project, f.label) : null };
  });
  const calendar = calendarById(after.calendarId);
  const event = calendar.events.find(e => e.weekendStartDate === after.currentDate);
  const weekend = event ? { venue: calendar.tracks[event.trackId]!.name,
    suitability: technicalPerformanceAtTrack(after, definition, teamId, calendar.tracks[event.trackId]!).suitability.label,
    fitted: fitted.map(f => f.part) } : null;
  const date = processedWeekDate(before, after);
  return { ...base, fitted, stories: weekStories(before, after, definition), completed, waiting, weekend, weekOf: date ? addCampaignDays(date, -7) : null,
    rivalNews: base.rivalNews.length ? base.rivalNews : rivalWeekNews(before, after, definition) };
}
export type WeekReport = NonNullable<ReturnType<typeof summarizeWeek>>;

/** Headline parts only: the paddock notices a floor or wing programme, not every bracket. */
const HEADLINE_PARTS = new Set(['FLOOR', 'FRONT_WING', 'REAR_WING']);
/** At most one restrained paddock line about a rival's dramatic development week (rules 3 only), and
 * only on weeks without other paddock news. */
function rivalWeekNews(before: GameUniverse, after: GameUniverse, definition: GameDefinition): string[] {
  const date = processedWeekDate(before, after);
  if (after.developmentRules !== 3 || !date) return [];
  const context = definition.development;
  const view = developmentView(before.development, addCampaignDays(date, -1));
  for (const profile of context.teams) {
    if (profile.id === before.playerTeamId) continue;
    for (const project of view.teams[profile.id]!.projects) {
      if (project.reason !== 'PERFORMANCE' || project.stage === 'READY' || project.stage === 'RESEARCH' || !HEADLINE_PARTS.has(project.partId)) continue;
      const part = getPart(context, project.partId);
      const kind = weekVariation(before.seed, profile, project, part, view.season, view.week + 1).kind;
      const team = teamBrand(profile.id).name, name = part.name.toLowerCase();
      if (kind === 'STALL') return [`${team} is said to have delayed its new ${name}`];
      if (kind === 'MAJOR_BREAKTHROUGH') return [`Paddock talk: ${team} found a step with its ${name}`];
    }
  }
  return [];
}
