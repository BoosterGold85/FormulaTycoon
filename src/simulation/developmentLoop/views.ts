import {calendarById} from '../../game/calendar';
import {TECHNICAL_AXES} from '../../game/calendar/types';
import type {PartDefinition,PartId} from '../../game/development';
import {teamBrand} from '../../game/brandRegistry';
import {addCampaignDays,campaignContext,compareCampaignDates,legacyWeekDate,type CampaignDate} from '../campaignTime';
import {developmentView} from '../campaignTime/developmentView';
import {advanceProjects,departmentSlots,estimateWeeksToReady,expectedGain,getPart,partImportance,projectCost,spendingLimit,stageSpeed,stageWork,
 type DevelopmentProject,type ProjectStage,type TeamDevelopmentState,type UpgradeSubmission} from '../development';
import {AXIS_LABELS,technicalCar} from '../trackPerformance';
import type {GameDefinition,GameUniverse} from '../universe/types';
import {APPROACH_AMBITION,type Approach} from './commands';
import {canRefine,choiceCost,effectiveBonus,eventDefinition,pendingEvent,REFINE_CHOICE} from './events';
import {nextTurnTarget} from './turn';

/** Presentation unit: one average-team week of stage work = 10 points. Derived, never stored. */
export const POINTS_PER_WEEK = 10;
export type PointCategory = 'Research' | 'Aero' | 'Technical' | 'Manufacturing';
const STAGES: Array<Exclude<ProjectStage, 'READY'>> = ['RESEARCH', 'DESIGN', 'MANUFACTURING'];
export const STAGE_LABEL: Record<ProjectStage, string> = { RESEARCH: 'Research', DESIGN: 'Design', MANUFACTURING: 'Manufacture', READY: 'Ready' };
export function pointCategory(part: PartDefinition, stage: Exclude<ProjectStage, 'READY'>): PointCategory {
  return stage === 'RESEARCH' ? 'Research' : stage === 'MANUFACTURING' ? 'Manufacturing' : part.area === 'AERO' ? 'Aero' : 'Technical';
}
const round1 = (n: number) => Math.round(n * 10) / 10;
export const areaLabel = (part: PartDefinition) => part.area === 'AERO' ? 'Aero' : 'Chassis';

function playerState(universe: GameUniverse, definition: GameDefinition) {
  const teamId = universe.playerTeamId;
  if (!teamId) throw new Error('No player team');
  const profile = definition.development.teams.find(t => t.id === teamId)!;
  const view = developmentView(universe.development, universe.currentDate);
  return { teamId, profile, view, team: view.teams[teamId]! };
}

/** Monday boundaries until READY using the existing kernel work rule (no events assumed). */
function boundariesToReady(project: DevelopmentProject, team: TeamDevelopmentState, profile: GameDefinition['development']['teams'][number], definition: GameDefinition): number | null {
  if (project.stage === 'READY') return 0;
  let probe: TeamDevelopmentState = { ...team, projects: [project] };
  for (let k = 1; k <= 60; k++) {
    probe = advanceProjects(probe, profile, definition.development);
    if (probe.projects[0]!.stage === 'READY') return k;
  }
  return null;
}
type Fitting = { name: string; date: CampaignDate; kind: 'RACE_WEEKEND' | 'INTRODUCTION_WINDOW' };
/** Where READY work is fitted under this career's rules: real FP1 (rules 2) or the retained window (rules 1). */
export function fittingAfter(universe: GameUniverse, definition: GameDefinition, readyDate: CampaignDate): Fitting | null {
  if (universe.developmentRules === 2) {
    const calendar = calendarById(universe.calendarId);
    const event = calendar.events.find(e => compareCampaignDates(e.weekendStartDate, readyDate) >= 0 && compareCampaignDates(e.weekendStartDate, universe.currentDate) > 0);
    return event ? { name: calendar.tracks[event.trackId]!.name, date: event.weekendStartDate, kind: 'RACE_WEEKEND' } : null;
  }
  const time = campaignContext(readyDate);
  const event = definition.development.calendar.find(e => e.week >= time.week && compareCampaignDates(legacyWeekDate(time.seasonIndex, e.week), universe.currentDate) > 0);
  return event ? { name: 'Introduction window', date: legacyWeekDate(time.seasonIndex, event.week), kind: 'INTRODUCTION_WINDOW' } : null;
}
export function predictedBand(project: Pick<DevelopmentProject, 'partId' | 'expectedGain' | 'bonusPoints'>): 'Small' | 'Moderate' | 'Large' {
  const impact = project.expectedGain * (1 + effectiveBonus(project as DevelopmentProject) / 100) * partImportance(project.partId) * 10;
  return impact >= 4.5 ? 'Large' : impact >= 2.2 ? 'Moderate' : 'Small';
}
const OBJECTIVE_LABEL = { PERFORMANCE: 'Performance', RELIABILITY: 'Reliability fix', CIRCUIT_SPECIFIC: 'Track package' } as const;
export function approachLabel(project: DevelopmentProject): string {
  if (project.reason !== 'PERFORMANCE') return 'Standard';
  const match = (Object.entries(APPROACH_AMBITION) as Array<[Approach, number]>).find(([, value]) => Math.abs(value - project.ambition) < 1e-9);
  return match ? match[0][0] + match[0].slice(1).toLowerCase() : 'Custom';
}

export function selectProjectView(universe: GameUniverse, definition: GameDefinition, project: DevelopmentProject) {
  const { team, profile, view } = playerState(universe, definition);
  const part = getPart(definition.development, project.partId);
  const stageIndex = project.stage === 'READY' ? 3 : STAGES.indexOf(project.stage);
  const points = STAGES.map((stage, i) => {
    const required = stageWork({ ...project, stage }, part) * POINTS_PER_WEEK;
    const done = i < stageIndex ? required : i === stageIndex ? Math.max(0, project.progress) * POINTS_PER_WEEK : 0;
    return { stage, category: pointCategory(part, stage), required: Math.round(required), done: Math.round(done) };
  });
  const total = points.reduce((s, p) => s + p.required, 0), done = points.reduce((s, p) => s + p.done, 0);
  const k = boundariesToReady(project, team, profile, definition);
  const readyDate = k === null ? null : k === 0 ? universe.currentDate : view.week + k <= 52 ? legacyWeekDate(view.season, view.week + k) : null;
  const fitsAt = readyDate && !project.hold ? fittingAfter(universe, definition, readyDate) : null;
  const pending = pendingEvent(project), pendingDef = pending && eventDefinition(pending.type);
  const budgetLeft = spendingLimit(profile, definition.development) - team.spent;
  return {
    id: project.id, partId: project.partId, name: part.name, area: areaLabel(part), objective: OBJECTIVE_LABEL[project.reason],
    approach: approachLabel(project), stage: project.stage, stageLabel: STAGE_LABEL[project.stage],
    stageProgress: project.stage === 'READY' ? 100 : Math.max(0, Math.min(100, Math.round(project.progress / stageWork(project, part) * 100))),
    wholeProgress: total ? Math.min(100, Math.round(done / total * 100)) : 100,
    points, rate: project.stage === 'READY' ? null : { category: pointCategory(part, project.stage), points: round1(stageSpeed(profile, team, part, project.stage) * POINTS_PER_WEEK) },
    readyDate, fitsAt, delayWeeks: round1(project.delayWeeks ?? 0), bonusPoints: Math.round(project.bonusPoints ?? 0),
    missesFinalRace: universe.developmentRules === 2 && !project.hold && fitsAt === null,
    hold: !!project.hold, canHold: universe.developmentRules === 2,
    refine: universe.developmentRules === 2 && canRefine(project) ? { costM: round1(choiceCost(project, REFINE_CHOICE)), affordable: choiceCost(project, REFINE_CHOICE) <= budgetLeft + 1e-9 } : null,
    predicted: project.reason === 'PERFORMANCE' ? predictedBand(project) : null,
    costM: round1(project.cost),
    pendingEvent: pending && pendingDef ? { title: pendingDef.title, text: pendingDef.text, options: pendingDef.choices.map(c => ({
      id: c.id, label: c.label, detail: c.detail, costM: round1(choiceCost(project, c)), available: choiceCost(project, c) <= budgetLeft + 1e-9 })) } : null,
    eventHistory: (project.events ?? []).filter(e => e.choice !== null).map(e => {
      const def = e.type === 'REFINE' ? { title: 'Design refined', choices: [REFINE_CHOICE] } : eventDefinition(e.type)!;
      return { title: def.title, choice: def.choices.find(c => c.id === e.choice)?.label ?? e.choice!, defaulted: e.defaulted };
    })
  };
}
export type ProjectView = ReturnType<typeof selectProjectView>;

/** Player-facing label from the EXISTING submission record; no second outcome calculation. */
export function outcomeLabel(submission: UpgradeSubmission): string {
  if (submission.reason === 'RELIABILITY') return 'RELIABILITY FIXED';
  if (submission.reason === 'CIRCUIT_SPECIFIC') return 'PACKAGE READY';
  if (submission.outcome === 'REVERTED') return "DIDN'T WORK — REVERTED";
  if (submission.outcome === 'UNDERPERFORMED') return 'BELOW EXPECTATION';
  return submission.actualGain >= submission.expectedGain * 1.15 ? 'ABOVE EXPECTATION' : 'ON TARGET';
}
export function submissionVenue(universe: GameUniverse, definition: GameDefinition, submission: UpgradeSubmission): string {
  const calendar = calendarById(universe.calendarId);
  const event = calendar.events.find(e => e.id === submission.eventId);
  if (event) return calendar.tracks[event.trackId]!.name;
  return definition.development.calendar.find(e => e.id === submission.eventId)?.name ?? submission.eventId;
}

export function selectDevelopmentHub(universe: GameUniverse, definition: GameDefinition) {
  const { teamId, team, profile } = playerState(universe, definition);
  const limit = spendingLimit(profile, definition.development);
  const projects = team.projects.map(p => selectProjectView(universe, definition, p));
  const outcomes = universe.development.submissions.filter(s => s.teamId === teamId).slice(-8).reverse().map(s => ({
    key: `${s.season}:${s.eventId}:${s.partId}`, part: getPart(definition.development, s.partId).name, venue: submissionVenue(universe, definition, s),
    label: outcomeLabel(s), reliabilityConcern: s.reason === 'PERFORMANCE' && s.outcome !== 'REVERTED' && team.parts[s.partId].reliability < 82 }));
  const used = (area: 'AERO' | 'VEHICLE_DYNAMICS') => team.projects.filter(p => getPart(definition.development, p.partId).area === area).length;
  return {
    teamName: teamBrand(teamId).name, rules: universe.developmentRules,
    budget: { limitM: round1(limit), spentM: round1(team.spent), remainingM: round1(limit - team.spent) },
    slots: { aero: { used: used('AERO'), total: departmentSlots(profile, 'AERO') }, chassis: { used: used('VEHICLE_DYNAMICS'), total: departmentSlots(profile, 'VEHICLE_DYNAMICS') } },
    projects, focus: projects.find(p => p.pendingEvent) ?? projects[0] ?? null,
    pendingDecisions: projects.filter(p => p.pendingEvent).length, outcomes, nextTurn: nextTurnTarget(universe)
  };
}

/** Which technical axes a part feeds: measured on the CURRENT car through the existing translation. */
export function partHelps(universe: GameUniverse, definition: GameDefinition, partId: PartId): string[] {
  const { team, profile } = playerState(universe, definition);
  const base = technicalCar(team, profile).values;
  const bumped = technicalCar({ ...team, parts: { ...team.parts, [partId]: { ...team.parts[partId], rating: Math.min(100, team.parts[partId].rating + 10) } } }, profile).values;
  return TECHNICAL_AXES.filter(a => a !== 'reliability').map(axis => ({ axis, delta: bumped[axis] - base[axis] }))
    .filter(x => x.delta > 0.4).sort((a, b) => b.delta - a.delta).slice(0, 3).map(x => AXIS_LABELS[x.axis]);
}
const PART_ROLE: Record<PartId, string> = {
  FRONT_WING: 'Front load and airflow to the rest of the car', NOSE: 'Feeds clean air under the car',
  FRONT_SUSPENSION: 'Front grip, response and tyre care', FLOOR: 'The biggest source of downforce',
  BODYWORK_COOLING: 'Drag and cooling', REAR_WING: 'Rear load versus straight-line drag',
  REAR_SUSPENSION: 'Traction and tyre preservation', DIFFUSER_REAR_EDGE: 'Rear downforce from the floor'
};
export function selectPartOptions(universe: GameUniverse, definition: GameDefinition) {
  const { team, profile } = playerState(universe, definition);
  const context = definition.development, limit = spendingLimit(profile, context), remaining = limit - team.spent;
  const calendar = calendarById(universe.calendarId);
  const slotsFree = (part: PartDefinition) => team.projects.filter(p => getPart(context, p.partId).area === part.area).length < departmentSlots(profile, part.area);
  return context.parts.map(part => {
    const helps = partHelps(universe, definition, part.id);
    // Only weekends a Balanced project could still reach, with strong demand on what this part helps.
    const earliest = addCampaignDays(universe.currentDate, 7 * Math.ceil(estimateWeeksToReady(profile, team, part, 'PERFORMANCE', APPROACH_AMBITION.BALANCED)));
    const pressure = calendar.events.filter(e => compareCampaignDates(e.weekendStartDate, earliest) >= 0).slice(0, 5).filter(e => {
      const track = calendar.tracks[e.trackId]!;
      return TECHNICAL_AXES.some(axis => track.demands[axis] >= 0.8 && helps.includes(AXIS_LABELS[axis]));
    }).slice(0, 3).map(e => calendar.tracks[e.trackId]!.name);
    const state = team.parts[part.id];
    const homologationLeft = part.maxUpgradesPerSeason === undefined ? null : Math.max(0, part.maxUpgradesPerSeason - state.upgradesThisSeason);
    const busy = team.projects.some(p => p.partId === part.id);
    const approaches = (Object.keys(APPROACH_AMBITION) as Approach[]).map(approach => {
      const ambition = APPROACH_AMBITION[approach];
      const cost = projectCost(part, 'PERFORMANCE', ambition);
      return { approach, weeks: Math.ceil(estimateWeeksToReady(profile, team, part, 'PERFORMANCE', ambition)), costM: round1(cost),
        predicted: predictedBand({ partId: part.id, expectedGain: expectedGain(profile, team, context, part.id, ambition) }), affordable: cost <= remaining + 1e-9 };
    });
    const unavailable = busy ? 'Already in development' : !slotsFree(part) ? `${areaLabel(part)} department is at capacity` :
      homologationLeft === 0 ? 'No changes left this season' : null;
    return { id: part.id, name: part.name, area: areaLabel(part), role: PART_ROLE[part.id], helps, pressure, homologationLeft,
      approaches, unavailable, reliability: Math.round(state.reliability), spec: state.spec,
      reliabilityFix: { costM: round1(projectCost(part, 'RELIABILITY', 0.3)), weeks: Math.ceil(estimateWeeksToReady(profile, team, part, 'RELIABILITY', 0.3)) },
      trackPackage: part.circuitPackage && !team.circuitPackages.includes(part.circuitPackage) ? {
        name: part.circuitPackage === 'LOW_DRAG' ? 'Low-drag package' : 'High-cooling package',
        costM: round1(projectCost(part, 'CIRCUIT_SPECIFIC', 0.5)), weeks: Math.ceil(estimateWeeksToReady(profile, team, part, 'CIRCUIT_SPECIFIC', 0.5)) } : null };
  });
}

/** Transient turn report (UI session state only; recomputed facts remain in the universe). */
export function summarizeTurn(before: GameUniverse, after: GameUniverse, definition: GameDefinition) {
  const teamId = after.playerTeamId;
  if (!teamId) return null;
  const was = before.development.teams[teamId]!, now = after.development.teams[teamId]!;
  const gained: Record<PointCategory, number> = { Research: 0, Aero: 0, Technical: 0, Manufacturing: 0 };
  const byDepartment: Record<string, Partial<Record<PointCategory, number>>> = {};
  const changes: string[] = [];
  for (const old of was.projects) {
    const part = getPart(definition.development, old.partId);
    const cur = now.projects.find(p => p.id === old.id);
    const endStage = cur ? cur.stage : 'READY';
    const from = old.stage === 'READY' ? 3 : STAGES.indexOf(old.stage), to = endStage === 'READY' ? 3 : STAGES.indexOf(endStage);
    for (let i = from; i <= Math.min(to, 2); i++) {
      const stage = STAGES[i]!, work = stageWork({ ...old, stage }, part);
      const start = i === from ? Math.max(0, old.progress) : 0, end = i === to ? Math.max(0, cur!.progress) : work;
      const amount = Math.max(0, end - start) * POINTS_PER_WEEK, category = pointCategory(part, stage);
      gained[category] += amount;
      const dept = departmentFor(part, stage);
      byDepartment[dept] = { ...byDepartment[dept], [category]: (byDepartment[dept]?.[category] ?? 0) + amount };
    }
    if (to > from) changes.push(`${part.name}: ${STAGE_LABEL[endStage]}${endStage === 'READY' ? ' — built' : ' started'}`);
  }
  const fitted = after.development.submissions.slice(before.development.submissions.length);
  const mine = fitted.filter(s => s.teamId === teamId).map(s => ({ part: getPart(definition.development, s.partId).name, venue: submissionVenue(after, definition, s), label: outcomeLabel(s) }));
  const newEvents = now.projects.filter(p => pendingEvent(p) && !was.projects.find(q => q.id === p.id && pendingEvent(q))).map(p => ({
    part: getPart(definition.development, p.partId).name, title: eventDefinition(pendingEvent(p)!.type)!.title }));
  const points = (Object.entries(gained) as Array<[PointCategory, number]>).filter(([, v]) => v >= 0.5).map(([category, v]) => ({ category, points: Math.round(v) }));
  const departments = Object.fromEntries(Object.entries(byDepartment).map(([dept, cats]) => [dept,
    (Object.entries(cats) as Array<[PointCategory, number]>).filter(([, v]) => v >= 0.5).map(([c, v]) => `+${Math.round(v)} ${c}`).join(' · ')]).filter(([, text]) => text));
  return { from: before.currentDate, to: after.currentDate, points, departments, changes, fitted: mine, rivalUpgrades: fitted.filter(s => s.teamId !== teamId).length, newEvents };
}
export type TurnReport = NonNullable<ReturnType<typeof summarizeTurn>>;

/** HQ department that does a stage of work on a part (display mapping). */
export function departmentFor(part: PartDefinition, stage: ProjectStage): string {
  return stage === 'READY' ? 'LOGISTICS' : stage === 'MANUFACTURING' ? 'MANUFACTURING' :
    stage === 'RESEARCH' ? (part.researchMethod === 'WIND_TUNNEL' ? 'AERO' : 'SIMULATOR') : (part.area === 'AERO' ? 'AERO' : 'WORKSHOP');
}

/** HQ departments that are visibly busy because of ACTUAL player project stages (display only). */
export function selectDepartmentActivity(universe: GameUniverse, definition: GameDefinition): Record<string, { project: string; stage: string } | undefined> {
  if (!universe.playerTeamId) return {};
  const team = universe.development.teams[universe.playerTeamId]!;
  const activity: Record<string, { project: string; stage: string }> = {};
  for (const project of team.projects) {
    const part = getPart(definition.development, project.partId);
    const dept = departmentFor(part, project.stage);
    activity[dept] ??= { project: part.name, stage: STAGE_LABEL[project.stage] };
  }
  return activity;
}

/** HQ bubble text per department for a turn report (display only). */
export function reportBubbles(report: Pick<TurnReport, 'departments'>): Record<string, string> {
  return report.departments;
}
