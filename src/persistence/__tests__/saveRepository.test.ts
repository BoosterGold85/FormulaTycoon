import { test, expect } from '@jest/globals';
import { DEFAULT_GAME_DEFINITION as definition } from '../../game/defaultGame';
import { createGameUniverse, advanceUniverseHeadquarters, advanceUniverseWeek } from '../../simulation/universe';
import {
  createSaveEnvelope, deserializeSave, serializeSave, migrateSave,
  validateSave, CURRENT_SAVE_VERSION, type GameSaveEnvelope, type SaveResult
} from '../saveEnvelope';
import { MemorySaveStorage, SaveRepository, type SaveStorage } from '../saveRepository';

function value<T>(result: SaveResult<T>): T {
  if (!result.ok) throw new Error(result.error.message);
  return result.value;
}
const metadata = {
  gameVersion: '0.1.0', saveId: 'career-1', createdAt: '2026-10-29T12:00:00.000Z', updatedAt: '2026-10-29T12:01:00.000Z'
};
function fixture() {
  let universe = advanceUniverseHeadquarters(createGameUniverse(definition, 7), definition, 5500);
  for (let i = 0; i < 16; i++) universe = advanceUniverseWeek(universe, definition);
  return value(createSaveEnvelope(universe, metadata, definition));
}
const clone = () => JSON.parse(JSON.stringify(fixture())) as GameSaveEnvelope;

test('v1 envelope records caller metadata and serializes/restores nested meaningful state', () => {
  const save = fixture();
  expect(save.saveVersion).toBe(CURRENT_SAVE_VERSION);
  expect(save).toMatchObject(metadata);
  expect(save.universe.headquarters.workers.some(w => w.state === 'WALKING')).toBe(true);
  expect(save.universe.development.submissions.length).toBeGreaterThan(0);
  const encoded = value(serializeSave(save, definition));
  const restored = value(deserializeSave(encoded, definition));
  expect(restored).toEqual(save);
  restored.universe.headquarters.workers[0]!.position.x = 123;
  expect(save.universe.headquarters.workers[0]!.position.x).not.toBe(123);
});

test('deterministic continuation survives multiple repository save/load boundaries', async () => {
  const repository = new SaveRepository(new MemorySaveStorage(), definition);
  let a = fixture().universe;
  await repository.save(value(createSaveEnvelope(a, metadata, definition)));
  let b = value(await repository.load(metadata.saveId))!.universe;
  for (let i = 0; i < 20; i++) {
    a = advanceUniverseWeek(advanceUniverseHeadquarters(a, definition, 1000), definition);
    b = advanceUniverseWeek(advanceUniverseHeadquarters(b, definition, 1000), definition);
    if (i === 8) {
      value(await repository.save(value(createSaveEnvelope(b, metadata, definition))));
      b = value(await repository.load(metadata.saveId))!.universe;
    }
  }
  expect(b).toEqual(a);
});

test('initial migration pipeline passes v1 unchanged and refuses missing/invalid/future versions', () => {
  const original = fixture();
  expect(value(migrateSave(original))).toBe(original);
  for (const version of [undefined, null, '1', 0, -1, 1.5, NaN, Infinity]) {
    expect(migrateSave({ ...original, saveVersion: version })).toMatchObject({ ok: false, error: { code: 'INVALID_DATA' } });
  }
  for (const version of [2, 99]) expect(migrateSave({ saveVersion: version })).toMatchObject({ ok: false, error: { code: 'UNSUPPORTED_VERSION' } });
  expect(migrateSave(null).ok).toBe(false);
  expect(migrateSave([]).ok).toBe(false);
  expect(validateSave({ saveVersion: 1 }, definition).ok).toBe(false);
});

test('malformed JSON returns controlled errors, never a partially initialized universe', () => {
  expect(deserializeSave('{', definition)).toMatchObject({ ok: false, error: { code: 'INVALID_JSON' } });
  for (const json of ['null', '[]', 'true', '{}', '{"saveVersion":1,"universe":{}}']) {
    const result = deserializeSave(json, definition);
    expect(result.ok).toBe(false);
    expect(result).not.toHaveProperty('value');
  }
});

test.each([
  ['unknown top-level data', (s: any) => { s.future = {}; }],
  ['missing HQ', (s: any) => { delete s.universe.headquarters; }],
  ['invalid clock', (s: any) => { s.universe.headquarters.timeMs = -1; }],
  ['nonfinite number on encode', (s: any) => { s.universe.development.teams.aurora.parts.FLOOR.rating = NaN; }],
  ['seed mismatch', (s: any) => { s.universe.development.seed++; }],
  ['unknown content', (s: any) => { s.universe.definitionVersion = 'future'; }],
  ['missing part', (s: any) => { delete s.universe.development.teams.aurora.parts.FLOOR; }],
  ['team key mismatch', (s: any) => { s.universe.development.teams.aurora.teamId = 'kestrel'; }],
  ['over budget', (s: any) => { s.universe.development.teams.aurora.spent = 1e9; }],
  ['unknown team', (s: any) => { s.universe.development.teams.extra = s.universe.development.teams.aurora; }],
  ['duplicate worker', (s: any) => { s.universe.headquarters.workers[1] = s.universe.headquarters.workers[0]; }],
  ['invalid worker state', (s: any) => { s.universe.headquarters.workers[0].state = 'FLYING'; }],
  ['bad slot reference', (s: any) => { s.universe.headquarters.workers[0].assignment.slotIndex = 999; }],
  ['slot ownership mismatch', (s: any) => { s.universe.headquarters.stations.CAR_BAY_1.slots[0] = null; }],
  ['bad route reference', (s: any) => { s.universe.headquarters.workers[0].route[0].nodeId = 'missing'; }],
  ['impossible route counter', (s: any) => { s.universe.headquarters.nextRouteId = 1; }],
  ['player/AI ownership conflict', (s: any) => { s.universe.playerTeamId = 'aurora'; }],
  ['bad timestamp', (s: any) => { s.updatedAt = 'yesterday'; }],
  ['backwards timestamp', (s: any) => { s.updatedAt = '2020-01-01T00:00:00.000Z'; }],
  ['bad slot id', (s: any) => { s.saveId = '../save'; }],
  ['missing metadata', (s: any) => { delete s.gameVersion; }],
  ['future submission', (s: any) => { s.universe.development.submissions[0].season = 999; }]
])('rejects %s without mutating the caller', (_name, mutate) => {
  const bad = clone(); mutate(bad);
  const before = JSON.stringify(bad);
  const result = validateSave(bad, definition);
  expect(result.ok).toBe(false);
  expect(result).not.toHaveProperty('value');
  expect(JSON.stringify(bad)).toBe(before);
});

test('valid snapshots across complete seasons, routes and resets remain loadable', () => {
  let universe = createGameUniverse(definition, 5);
  for (let i = 0; i <= 52; i++) {
    const result = createSaveEnvelope(universe, metadata, definition);
    expect(result.ok).toBe(true);
    universe = advanceUniverseWeek(advanceUniverseHeadquarters(universe, definition, 500), definition);
  }
});

test('repository supports overwrite, list, missing load and delete; invalid writes preserve old slot', async () => {
  const repository = new SaveRepository(new MemorySaveStorage(), definition);
  const original = fixture();
  expect(value(await repository.load('missing'))).toBeNull();
  value(await repository.save(original));
  original.universe.seed = 123; // Saving detached data must not alias the caller.
  expect(value(await repository.load(metadata.saveId))!.universe.seed).toBe(7);
  expect((await repository.save(original)).ok).toBe(false);
  const updated = { ...fixture(), updatedAt: '2026-10-29T13:00:00.000Z' };
  value(await repository.save(updated));
  expect(value(await repository.load(metadata.saveId))).toEqual(updated);
  expect(value(await repository.list())).toEqual([metadata.saveId]);
  value(await repository.delete(metadata.saveId));
  expect(value(await repository.list())).toEqual([]);
  value(await repository.delete('missing'));
});

test('corrupt storage, slot swaps and adapter failures surface controlled errors', async () => {
  const memory = new MemorySaveStorage();
  const repository = new SaveRepository(memory, definition);
  await memory.write('corrupt', '{');
  expect(await repository.load('corrupt')).toMatchObject({ ok: false, error: { code: 'INVALID_JSON' } });
  await memory.write('wrong-slot', value(serializeSave(fixture(), definition)));
  expect(await repository.load('wrong-slot')).toMatchObject({ ok: false, error: { code: 'INVALID_DATA' } });
  const fail = async (): Promise<never> => { throw new Error('disk unavailable'); };
  const broken: SaveStorage = { read: fail, write: fail, list: fail, delete: fail };
  const other = new SaveRepository(broken, definition);
  for (const result of [await other.load('x'), await other.save(fixture()), await other.list(), await other.delete('x')]) {
    expect(result).toMatchObject({ ok: false, error: { code: 'STORAGE_ERROR' } });
  }
});

test('invalid slot IDs never reach a storage adapter', async () => {
  let calls = 0;
  const storage: SaveStorage = {
    async read() { calls++; return null; }, async write() { calls++; },
    async list() { return []; }, async delete() { calls++; }
  };
  const repository = new SaveRepository(storage, definition);
  expect(await repository.load('../other')).toMatchObject({ ok: false, error: { code: 'INVALID_DATA' } });
  expect(await repository.delete('')).toMatchObject({ ok: false, error: { code: 'INVALID_DATA' } });
  expect(calls).toBe(0);
});

test('unreadable object input and polluted-key JSON fail safely', () => {
  const unreadable = { get saveVersion() { throw new Error('bad getter'); } };
  expect(migrateSave(unreadable)).toMatchObject({ ok: false, error: { code: 'INVALID_DATA' } });
  const json = value(serializeSave(fixture(), definition)).replace('{', '{"__proto__":{},');
  expect(deserializeSave(json, definition).ok).toBe(false);
});


test('a working worker cannot restore with a contradictory physical location', () => {
  const save = fixture();
  save.universe = advanceUniverseHeadquarters(save.universe, definition, 30000);
  expect(validateSave(save, definition).ok).toBe(true);
  save.universe.headquarters.workers[0]!.location = { kind: 'node', nodeId: 'ENTRANCE' };
  expect(validateSave(save, definition).ok).toBe(false);
});
