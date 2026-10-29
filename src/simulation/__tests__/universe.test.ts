import {developmentState,developmentView} from '../campaignTime/developmentView';
import {campaignContext} from '../campaignTime';
import { test, expect } from '@jest/globals';
import { LEGACY_GAME_DEFINITION as definition } from '../../game/legacyGame';
import { createGameSave, restoreGameSave, type GameSave } from '../../persistence/gameSave';
import { advanceDevelopmentWeek, createDevelopmentWorld } from '../development';
import { advanceHeadquarters, createHeadquartersState } from '../headquarters';
import { randomFor } from '../randomStreams';
import { randomFor as legacyRandomFor } from '../development/random';
import {
  createGameUniverse, advanceUniverseHeadquarters, advanceUniverseWeek,
  restartUniverseHeadquarters, startUniverseSeason
} from '../universe';

const make = () => createGameUniverse(definition, 7);

test('composes the existing engines without changing their initial state or AI ownership', () => {
  const universe = make();
  expect(universe.headquarters).toEqual(createHeadquartersState(definition.headquarters.layout, definition.headquarters.roster));
  expect(universe.development).toEqual(developmentState(createDevelopmentWorld(definition.development, 7)));
  expect(universe.playerTeamId).toBeNull();
});

test('HQ steps preserve development identity and exactly match the standalone engine', () => {
  const initial = make();
  let integrated = initial;
  let standalone = initial.headquarters;
  for (let step = 0; step < 600; step++) {
    integrated = advanceUniverseHeadquarters(integrated, definition, 50);
    standalone = advanceHeadquarters(standalone, definition.headquarters.layout, 50);
  }
  expect(integrated.headquarters).toEqual(standalone);
  expect(integrated.headquarters.workers.every(w => w.state === 'WORKING')).toBe(true);
  expect(integrated.development).toBe(initial.development);
  expect(initial.headquarters.timeMs).toBe(0);
});

test('weeks match standalone development, independent of factory animation and restarting NEW DAY', () => {
  const initial = make();
  let a = initial;
  let standalone = developmentView(initial.development,initial.currentDate);
  for (let week = 0; week < 52; week++) {
    a = advanceUniverseWeek(a, definition);
    standalone = advanceDevelopmentWeek(standalone, definition.development);
  }
  expect(a.development).toEqual(developmentState(standalone));
  expect(a.headquarters).toBe(initial.headquarters);
  const restarted = restartUniverseHeadquarters(a, definition);
  expect(restarted.development).toBe(a.development);
  expect(restarted.seed).toBe(a.seed);
  expect(restarted.headquarters.workers.map(w => w.assignment)).toEqual(initial.headquarters.workers.map(w => w.assignment));
  expect(advanceUniverseWeek(a, definition)).toBe(a);
});

test('checkpoint round trip resumes both engines mid-route and mid-project deterministically', () => {
  let a = advanceUniverseHeadquarters(make(), definition, 5500);
  for (let i = 0; i < 8; i++) a = advanceUniverseWeek(a, definition);
  expect(Object.values(a.development.teams).some(t => t.projects.length > 0)).toBe(true);
  const save = createGameSave(a);
  // JSON transport here is of a known, trusted test fixture, not an unvalidated user file.
  let b = restoreGameSave(JSON.parse(JSON.stringify(save)) as GameSave, definition);
  expect(b).toEqual(a);
  expect(b.headquarters.workers).not.toBe(a.headquarters.workers);
  for (let i = 0; i < 20; i++) {
    a = advanceUniverseWeek(advanceUniverseHeadquarters(a, definition, 1000), definition);
    b = advanceUniverseWeek(advanceUniverseHeadquarters(b, definition, 1000), definition);
  }
  expect(b).toEqual(a);
});

test('checkpoints and restored state do not alias mutable nested state', () => {
  const a = make();
  const save = createGameSave(a);
  save.universe.development.teams.aurora!.parts.FLOOR.rating = 42;
  expect(a.development.teams.aurora!.parts.FLOOR.rating).not.toBe(42);
  const restored = restoreGameSave(save, definition);
  restored.headquarters.workers[0]!.position.x = -999;
  expect(save.universe.headquarters.workers[0]!.position.x).not.toBe(-999);
});

test('refuses unsupported versions, inconsistent seeds and incompatible content explicitly', () => {
  const save = createGameSave(make());
  expect(() => restoreGameSave({ ...save, saveVersion: 99 } as unknown as GameSave, definition)).toThrow('migration');
  expect(() => restoreGameSave(save, { ...definition, version: 'future-content' })).toThrow('migration');
  expect(() => restoreGameSave({ ...save, universe: { ...save.universe, seed: 8 } }, definition)).toThrow('seed');
  expect(() => advanceUniverseWeek(make(), { ...definition, version: 'other' })).toThrow('migration');
  for (const invalid of [NaN, Infinity, -1, 1.2, 2 ** 32]) expect(() => createGameUniverse(definition, invalid)).toThrow('seed');
  expect(() => advanceUniverseHeadquarters(make(), definition, Infinity)).toThrow('duration');
});

test('season boundary requires complete standings and preserves submissions and HQ state', () => {
  expect(() => startUniverseSeason(make(), definition, [])).toThrow('Finish');
  let a = make();
  for (let i = 0; i < 52; i++) a = advanceUniverseWeek(a, definition);
  const standings = definition.development.teams.map(t => t.id);
  expect(() => startUniverseSeason(a, definition, standings.map(() => standings[0]!))).toThrow('exactly once');
  const b = startUniverseSeason(a, definition, standings);
  expect(campaignContext(b.currentDate).seasonIndex).toBe(2);
  expect(campaignContext(b.currentDate).week).toBe(0);
  expect(b.development.submissions).toBe(a.development.submissions);
  expect(b.headquarters).toBe(a.headquarters);
});

test('keyed streams replay and stay isolated from unrelated system draws; legacy path is preserved', () => {
  const expected = randomFor(7, 'weather', 1, 'BHR').next();
  const other = randomFor(7, 'scouting', 1);
  for (let i = 0; i < 100; i++) other.next();
  expect(randomFor(7, 'weather', 1, 'BHR').next()).toBe(expected);
  expect(randomFor(7, 'failures', 1, 'BHR').next()).not.toBe(expected);
  expect(legacyRandomFor).toBe(randomFor);
});
