import type { GameDefinition, GameUniverse } from '../simulation/universe';
import { assertDefinition } from '../simulation/universe';

export const SAVE_VERSION = 1 as const;

/** Trusted in-memory checkpoint contract. Not a validator for arbitrary JSON/files. */
export type GameSave = {
  saveVersion: typeof SAVE_VERSION;
  universe: GameUniverse;
};

/** Both engines currently contain JSON-compatible plain data only. */
function copyUniverse(universe: GameUniverse): GameUniverse {
  return JSON.parse(JSON.stringify(universe)) as GameUniverse;
}

export function createGameSave(universe: GameUniverse): GameSave {
  return { saveVersion: SAVE_VERSION, universe: copyUniverse(universe) };
}

/**
 * Restore only a trusted GameSave. A future storage adapter MUST validate unknown input
 * before calling this; we deliberately do not expose a misleading parseSave(string).
 * Version 1 is the first schema: no prior released save format exists to migrate.
 */
export function restoreGameSave(save: GameSave, definition: GameDefinition): GameUniverse {
  if (save.saveVersion !== SAVE_VERSION) throw new Error('Unsupported save version: migration required');
  assertDefinition(save.universe, definition);
  if (save.universe.seed !== save.universe.development.seed) throw new Error('Inconsistent universe seed');
  return copyUniverse(save.universe);
}

/** Platform storage implementations belong outside domain code; no autosave is enabled yet. */
export interface GameSaveStorage {
  write(slot: string, save: GameSave): Promise<void>;
  read(slot: string): Promise<GameSave | null>;
}
