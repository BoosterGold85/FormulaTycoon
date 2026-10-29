import { migrateDriverAlignment } from './alignmentMigration';
import { LEGACY_DRIVER_GAME_DEFINITION } from '../game/legacyDriverGame';
import { migrateTenTeamUniverse } from './teamMigration';
import { LEGACY_GAME_DEFINITION } from '../game/legacyGame';
import type { GameDefinition, GameUniverse } from '../simulation/universe';
import { validateUniverse } from './universeValidation';
import { object, number, saveId, text, timestamp, requireValid } from './validation';

/** Independent from the older trusted checkpoint's SAVE_VERSION. */
export const CURRENT_SAVE_VERSION = 3 as const;
export type GameSaveEnvelope = {
  saveVersion: typeof CURRENT_SAVE_VERSION;
  gameVersion: string;
  saveId: string;
  createdAt: string;
  updatedAt: string;
  universe: GameUniverse;
};
export type SaveErrorCode = 'INVALID_DATA' | 'UNSUPPORTED_VERSION' | 'INVALID_JSON' | 'STORAGE_ERROR';
export type SaveResult<T> = { ok: true; value: T } | { ok: false; error: { code: SaveErrorCode; message: string } };
export const failure = (code: SaveErrorCode, message: string): SaveResult<never> => ({ ok: false, error: { code, message } });

/** Migration dispatch: validate released schemas before upgrading to v3; never guess missing/unknown versions. */
export function migrateSave(input: unknown, definition?: GameDefinition): SaveResult<unknown> {
  try {
    if (!input || typeof input !== 'object' || Array.isArray(input) || !Object.hasOwn(input, 'saveVersion')) {
      return failure('INVALID_DATA', 'Missing save version');
    }
    const version = (input as Record<string, unknown>).saveVersion;
    if (typeof version !== 'number' || !Number.isSafeInteger(version) || version < 1) {
      return failure('INVALID_DATA', 'Invalid save version');
    }
    if (version === 1) {
      const raw=input as Record<string,unknown>;
      // Fully validate v1 fields and legacy state BEFORE renaming any references.
      object({saveVersion:number(1,1,true),gameVersion:text,saveId,createdAt:timestamp,updatedAt:timestamp,
        universe:v=>validateUniverse(v,LEGACY_GAME_DEFINITION)})(input,'legacySave');
      const universe=definition?.driverEra ? migrateTenTeamUniverse(raw.universe) : raw.universe;
      return {ok:true,value:{...raw,saveVersion:CURRENT_SAVE_VERSION,universe}};
    }
    if (version === 2) {
      const raw=input as Record<string,unknown>;
      const oldDefinition=definition?.driverEra?LEGACY_DRIVER_GAME_DEFINITION:LEGACY_GAME_DEFINITION;
      object({saveVersion:number(2,2,true),gameVersion:text,saveId,createdAt:timestamp,updatedAt:timestamp,
        universe:v=>validateUniverse(v,oldDefinition)})(input,'driverSaveV2');
      const universe=definition?.driverEra&&definition.driverDataVersion!==1?migrateDriverAlignment(raw.universe):raw.universe;
      return {ok:true,value:{...raw,saveVersion:CURRENT_SAVE_VERSION,universe}};
    }
    if (version !== CURRENT_SAVE_VERSION) return failure('UNSUPPORTED_VERSION', `Unsupported save version: ${version}`);
    // Current schema is validated by the caller; released older schemas have frozen fixtures.
    return { ok: true, value: input };
  } catch { return failure('INVALID_DATA', 'Invalid save version or legacy content'); }
}

/** An unknown object only becomes an envelope after every nested field/reference passes. */
export function validateSave(input: unknown, definition: GameDefinition): SaveResult<GameSaveEnvelope> {
  const migrated = migrateSave(input, definition);
  if (!migrated.ok) return migrated;
  try {
    object({ saveVersion: number(CURRENT_SAVE_VERSION, CURRENT_SAVE_VERSION, true), gameVersion: text, saveId, createdAt: timestamp,
      updatedAt: timestamp, universe: (v) => validateUniverse(v, definition) })(migrated.value, 'save');
    const envelope = migrated.value as GameSaveEnvelope;
    requireValid(Date.parse(envelope.createdAt) <= Date.parse(envelope.updatedAt), 'save.timestamps');
    return { ok: true, value: JSON.parse(JSON.stringify(envelope)) as GameSaveEnvelope };
  } catch (error) {
    return failure('INVALID_DATA', error instanceof Error ? error.message : 'Invalid save data');
  }
}

/** Metadata is injected by the application, never generated inside simulation. */
export function createSaveEnvelope(
  universe: GameUniverse, metadata: Omit<GameSaveEnvelope, 'saveVersion' | 'universe'>,
  definition: GameDefinition
): SaveResult<GameSaveEnvelope> {
  return validateSave({ ...metadata, saveVersion: CURRENT_SAVE_VERSION, universe }, definition);
}

export function serializeSave(input: unknown, definition: GameDefinition): SaveResult<string> {
  const validated = validateSave(input, definition);
  return validated.ok ? { ok: true, value: JSON.stringify(validated.value) } : validated;
}

export function deserializeSave(json: string, definition: GameDefinition): SaveResult<GameSaveEnvelope> {
  let input: unknown;
  try { input = JSON.parse(json); }
  catch { return failure('INVALID_JSON', 'Save is not valid JSON'); }
  return validateSave(input, definition);
}
