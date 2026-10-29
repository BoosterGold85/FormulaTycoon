import {migrateCalendarUniverse} from './calendarMigration';
import { migrateV3Universe } from './dateMigration';
import { migrateDriverAlignment } from './alignmentMigration';
import { assertHistoricalSave } from './historicalSaveValidation';
import { migrateTenTeamUniverse } from './teamMigration';
import type { GameDefinition, GameUniverse } from '../simulation/universe';
import { validateUniverse } from './universeValidation';
import { object, number, saveId, text, timestamp, requireValid } from './validation';

/** Independent from the older trusted checkpoint's SAVE_VERSION. */
export const CURRENT_SAVE_VERSION = 5 as const;
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

/** Migration dispatch: validate released schemas before upgrading to v5; never guess missing/unknown versions. */
export function migrateSave(input: unknown, definition?: GameDefinition): SaveResult<unknown> {
  try {
    if (!input || typeof input !== 'object' || Array.isArray(input) || !Object.hasOwn(input, 'saveVersion')) {
      return failure('INVALID_DATA', 'Missing save version');
    }
    const version = (input as Record<string, unknown>).saveVersion;
    if (typeof version !== 'number' || !Number.isSafeInteger(version) || version < 1) {
      return failure('INVALID_DATA', 'Invalid save version');
    }
    if(version===1||version===2||version===3){
      assertHistoricalSave(input,version);
      const raw=input as Record<string,unknown>;
      const historical=version===1?migrateTenTeamUniverse(raw.universe):version===2?migrateDriverAlignment(raw.universe):raw.universe;
      // Every historical path first reaches the validated immutable v3 boundary.
      const v3={...raw,saveVersion:3,universe:historical};
      assertHistoricalSave(v3,3);
      const v4={...raw,saveVersion:4,universe:migrateV3Universe(v3.universe as import('./contracts/preCalendarTypes').GameUniverse)};
      assertHistoricalSave(v4,4);
      return {ok:true,value:{...raw,saveVersion:CURRENT_SAVE_VERSION,universe:migrateCalendarUniverse(v4.universe)}};
    }
    if(version===4){
      assertHistoricalSave(input,4);
      const raw=input as Record<string,unknown>;
      return {ok:true,value:{...raw,saveVersion:CURRENT_SAVE_VERSION,universe:migrateCalendarUniverse(raw.universe)}};
    }
    if(version!==CURRENT_SAVE_VERSION)return failure('UNSUPPORTED_VERSION',`Unsupported save version: ${version}`);
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
