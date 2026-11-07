import type {PartDefinition} from '../../game/development';
import {stageWork,type DevelopmentProject,type ProjectStage} from '../development';

/** Presentation unit: one average-team week of stage work = 10 points. Derived, never stored. */
export const POINTS_PER_WEEK = 10;
export type PointCategory = 'Research' | 'Aero' | 'Technical' | 'Manufacturing';
export const WORK_STAGES: Array<Exclude<ProjectStage, 'READY'>> = ['RESEARCH', 'DESIGN', 'MANUFACTURING'];
export function pointCategory(part: PartDefinition, stage: Exclude<ProjectStage, 'READY'>): PointCategory {
  return stage === 'RESEARCH' ? 'Research' : stage === 'MANUFACTURING' ? 'Manufacturing' : part.area === 'AERO' ? 'Aero' : 'Technical';
}
export type WorkSegment = { stage: Exclude<ProjectStage, 'READY'>; category: PointCategory; points: number };
/**
 * Whole points of stage work a project did between two states (cur undefined = fitted and gone).
 * The week replay's bubbles and qualifying's Research total both read this one rule.
 */
export function workSegments(old: DevelopmentProject, cur: DevelopmentProject | undefined, part: PartDefinition): WorkSegment[] {
  const endStage = cur ? cur.stage : 'READY';
  const from = old.stage === 'READY' ? 3 : WORK_STAGES.indexOf(old.stage), to = endStage === 'READY' ? 3 : WORK_STAGES.indexOf(endStage);
  const segments: WorkSegment[] = [];
  for (let i = from; i <= Math.min(to, 2); i++) {
    const stage = WORK_STAGES[i]!, work = stageWork({ ...old, stage }, part);
    const start = i === from ? Math.max(0, old.progress) : 0, end = i === to ? Math.max(0, cur!.progress) : work;
    segments.push({ stage, category: pointCategory(part, stage), points: Math.round(Math.max(0, end - start) * POINTS_PER_WEEK) });
  }
  return segments;
}
