/** Released v1/v2/v3 validation semantics. Future schemas get a new validator. */
import type { ReleasedContent } from './index';
import { validateReleasedDrivers } from './preCalendarDriverValidation';
import type { GameUniverse } from './preCalendarTypes';
import { releasedStageWork as stageWork } from './preCalendarRules';
import { array, choice, nullable, number, object, requireValid, text, type Check } from '../validation';

/** Base structural validation plus optional canonical driver schema validation, followed by reference and state-consistency checks. */
export function validateReleasedUniverse(input: unknown, contract: ReleasedContent): asserts input is GameUniverse {
  const definition = contract.definition;
  const LEGACY_TEAM_MAP = contract.legacyTeamMap;
  const { layout, roster } = definition.headquarters;
  const context = definition.development;
  const int = number(0, Number.MAX_SAFE_INTEGER, true);
  const point = object({ x: number(-1e7, 1e7), y: number(-1e7, 1e7) });
  const stationId = choice(layout.stations.map(s => s.id));
  const teamId = choice(context.teams.map(t => t.id));
  const partId = choice(context.parts.map(p => p.id));
  const packages = choice(['LOW_DRAG', 'HIGH_COOLING']);
  const reason = choice(['PERFORMANCE', 'CIRCUIT_SPECIFIC', 'RELIABILITY']);
  const slot = { stationId, slotIndex: int };
  const location: Check = (v, p) => {
    requireValid(v && typeof v === 'object' && 'kind' in v, p);
    if (v.kind === 'node') object({ kind: choice(['node']), nodeId: choice(Object.keys(layout.nav.nodes)) })(v, p);
    else object({ kind: choice(['station']), ...slot })(v, p);
  };
  const worker = object({
    id: choice(roster.map(w => w.id)), name: text, role: text,
    uniform: choice(['navy', 'red', 'white', 'orange']), state: choice(['IDLE', 'WALKING', 'WORKING']),
    position: point, facing: choice(['left', 'right']), assignment: nullable(object(slot)),
    route: array(object({ point, nodeId: choice(Object.keys(layout.nav.nodes)) }, ['nodeId'])),
    routeId: int, location, idleUntilMs: number()
  });
  const part = object({
    rating: number(context.regulations.ratingFloor, context.regulations.ratingCeiling),
    reliability: number(0, 100), spec: number(1, Number.MAX_SAFE_INTEGER, true), upgradesThisSeason: int
  });
  const project = object({
    id: text, partId, reason, stage: choice(['RESEARCH', 'DESIGN', 'MANUFACTURING', 'READY']),
    progress: number(), ambition: number(0, 1), expectedGain: number(), cost: number(),
    startedWeek: number(0, context.regulations.seasonWeeks, true), circuitPackage: packages
  }, ['circuitPackage']);
  const team = object({
    teamId, parts: object(Object.fromEntries(context.parts.map(p => [p.id, part]))),
    projects: array(project), spent: number(), circuitPackages: array(packages),
    aeroAllowance: number(Number.MIN_VALUE), nextProjectNumber: number(1, Number.MAX_SAFE_INTEGER, true)
  });
  const submission = object({
    season: number(1, Number.MAX_SAFE_INTEGER, true), week: number(1, context.regulations.seasonWeeks, true),
    eventId: choice(context.calendar.map(e => e.id)), teamId, partId, reason, description: text,
    expectedGain: number(), actualGain: number(), outcome: choice(['DELIVERED', 'UNDERPERFORMED', 'REVERTED']), cost: number()
  });
  object({
    definitionVersion: choice([definition.version]), seed: number(0, 0xffffffff, true), playerTeamId: nullable(teamId),
    ...(definition.driverEra ? { drivers: (v:unknown) => { /* cross-clock check follows the structural pass */
      requireValid(v && typeof v==='object', 'drivers'); } } : {}),
    headquarters: object({ timeMs: number(), workers: array(worker), nextRouteId: number(1, Number.MAX_SAFE_INTEGER, true),
      stations: object(Object.fromEntries(layout.stations.map(s => [s.id, object({ id: choice([s.id]), slots: array(nullable(choice(roster.map(w => w.id)))) })]))) }),
    development: object({ seed: number(0, 0xffffffff, true), season: number(1, Number.MAX_SAFE_INTEGER, true),
      week: number(0, context.regulations.seasonWeeks, true), teams: object(Object.fromEntries(context.teams.map(t => [t.id, team]))), submissions: array(submission) })
  })(input, 'universe');
  const universe = input as GameUniverse; // Base fields checked; canonical driver validation follows immediately.
  requireValid(universe.seed === universe.development.seed, 'universe.seed');
  if(definition.driverEra) validateReleasedDrivers(universe.drivers,2025+universe.development.season,universe.development.week,contract.drivers!);
  if (universe.playerTeamId !== null) {
    requireValid(context.teams.find(t => t.id === universe.playerTeamId)?.controlledBy === 'PLAYER', 'universe.playerTeamId');
  }
  const hq = universe.headquarters;
  const workers = new Map(hq.workers.map(w => [w.id, w]));
  requireValid(workers.size === roster.length && hq.workers.length === roster.length, 'workers.ids');
  for (const station of layout.stations) {
    const slots = hq.stations[station.id].slots;
    requireValid(slots.length === station.slots.length, 'station.capacity');
    slots.forEach((id, i) => {
      if (id === null) return;
      const assignment = workers.get(id)?.assignment;
      requireValid(assignment?.stationId === station.id && assignment.slotIndex === i, 'station.occupancy');
    });
  }
  for (const w of hq.workers) {
    requireValid(w.routeId < hq.nextRouteId, 'worker.routeId');
    if (w.location.kind === 'station') {
      const location = w.location;
      const station = layout.stations.find(s => s.id === location.stationId)!;
      requireValid(w.location.slotIndex < station.slots.length, 'worker.location.slot');
    }
    if (w.assignment) {
      const assigned = hq.stations[w.assignment.stationId].slots[w.assignment.slotIndex];
      requireValid(assigned === w.id, 'worker.assignment');
    }
    requireValid(w.state !== 'WALKING' || w.route.length > 0, 'worker.walking.route');
    if (w.state === 'WORKING') {
      requireValid(w.assignment && w.route.length === 0, 'worker.working');
      requireValid(w.location.kind === 'station' && w.location.stationId === w.assignment.stationId &&
        w.location.slotIndex === w.assignment.slotIndex, 'worker.working.location');
      const station = layout.stations.find(s => s.id === w.assignment!.stationId)!;
      const spot = station.slots[w.assignment.slotIndex]!.spot;
      requireValid(Math.hypot(w.position.x - spot.x, w.position.y - spot.y) < 1e-6, 'worker.working.position');
    }
    for (const step of w.route) {
      if (step.nodeId) {
        const node = layout.nav.nodes[step.nodeId]!;
        requireValid(step.point.x === node.x && step.point.y === node.y, 'route.node.point');
      }
    }
  }
  for (const profile of context.teams) {
    const state = universe.development.teams[profile.id]!;
    requireValid(state.teamId === profile.id && state.spent <= Math.min(profile.developmentBudget, context.regulations.developmentCap) + 1e-9, 'team.identity/budget');
    requireValid(new Set(state.circuitPackages).size === state.circuitPackages.length, 'team.packages');
    const ids = new Set<string>();
    const parts = new Set<string>();
    for (const project of state.projects) {
      requireValid(!ids.has(project.id) && !parts.has(project.partId), 'project.duplicate');
      ids.add(project.id); parts.add(project.partId);
      requireValid(project.startedWeek <= universe.development.week, 'project.startedWeek');
      const legacy=Object.keys(LEGACY_TEAM_MAP).find(id=>LEGACY_TEAM_MAP[id]===profile.id);
      const prefix = [profile.id, ...(legacy?[legacy]:[])].map(id=>`${id}-S${universe.development.season}-`).find(p=>project.id.startsWith(p));
      const sequence = prefix ? Number(project.id.slice(prefix.length)) : NaN;
      requireValid(Number.isSafeInteger(sequence) && sequence >= 1 && sequence < state.nextProjectNumber, 'project.sequence');
      const part = context.parts.find(p => p.id === project.partId)!;
      requireValid(project.stage === 'READY' ? project.progress === 0 : project.progress < stageWork(project, part), 'project.progress');
      if (project.circuitPackage) requireValid(project.circuitPackage === part.circuitPackage, 'project.package');
    }
  }
  for (const submission of universe.development.submissions) {
    const event = context.calendar.find(e => e.id === submission.eventId)!;
    requireValid(submission.week === event.week && submission.season <= universe.development.season, 'submission.event');
    requireValid(submission.season < universe.development.season || submission.week <= universe.development.week, 'submission.future');
  }
}
