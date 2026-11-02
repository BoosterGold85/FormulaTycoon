import {selectNextEvent} from '../calendar';
import type {GameDefinition,GameUniverse} from '../universe/types';
import {nextTurnTarget} from './turn';
import {selectDevelopmentHub,type ProjectView} from './views';
import {qualityLabel} from './weekStory';

export type HqMode = 'DECISION' | 'ACTIVE' | 'READY' | 'IDLE';
/** HQ = PLAY: the one development thing the player needs at a glance, plus what Continue will do. */
export function selectHqDevelopment(universe: GameUniverse, definition: GameDefinition) {
  const hub = selectDevelopmentHub(universe, definition);
  const decision = hub.projects.find(p => p.pendingEvent);
  const active = hub.projects.filter(p => p.stage !== 'READY');
  // Priority: decision required, then a part ready for fitting, then work in progress, then idle.
  const ready = hub.projects.find(p => p.stage === 'READY');
  const focus: ProjectView | null = decision ?? ready ?? active[0] ?? null;
  const mode: HqMode = decision ? 'DECISION' : ready ? 'READY' : active.length ? 'ACTIVE' : 'IDLE';
  const project = focus ? universe.development.teams[universe.playerTeamId!]!.projects.find(p => p.id === focus.id)! : null;
  return { mode, focus, quality: project && project.reason === 'PERFORMANCE' ? qualityLabel(project) : null,
    others: Math.max(0, hub.projects.length - 1), nextRace: selectNextEvent(universe), turn: nextTurnTarget(universe) };
}
export type HqDevelopment = ReturnType<typeof selectHqDevelopment>;
