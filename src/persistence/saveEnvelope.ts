import {migrateCalendarUniverse} from './calendarMigration';
import {migrateDevelopmentRulesUniverse} from './developmentRulesMigration';
import {migrateWeeklyVariationUniverse} from './weeklyVariationMigration';
import { migrateV3Universe } from './dateMigration';
import { migrateDriverAlignment } from './alignmentMigration';
import { assertHistoricalSave } from './historicalSaveValidation';
import {assertHistoricalSaveV6} from './historicalV6Validation';
import {assertHistoricalSaveV7} from './historicalV7Validation';
import {migrateQualifyingUniverse} from './qualifyingMigration';
import { migrateTenTeamUniverse } from './teamMigration';
import type { GameDefinition, GameUniverse } from '../simulation/universe';
import { validateUniverse } from './universeValidation';
import { object, number, saveId, text, timestamp, requireValid } from './validation';

/** Independent from the older trusted checkpoint's SAVE_VERSION. */
export const CURRENT_SAVE_VERSION = 8 as const;
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

/** Every pre-V7 path reaches the validated V7 boundary before V7 -> V8 adds qualifying state. */
function toV8(raw:Record<string,unknown>,universe:GameUniverse):SaveResult<unknown> {
  assertHistoricalSaveV7({...raw,saveVersion:7,universe});
  return {ok:true,value:{...raw,saveVersion:CURRENT_SAVE_VERSION,universe:migrateQualifyingUniverse(universe)}};
}
/** Every pre-V6 path reaches the validated V6 boundary before the V6 -> V7 identity migration. */
function toV7(raw:Record<string,unknown>,universe:GameUniverse):SaveResult<unknown> {
  assertHistoricalSaveV6({...raw,saveVersion:6,universe});
  return toV8(raw,migrateWeeklyVariationUniverse(universe));
}

/** Migration dispatch: validate released schemas before upgrading to v8; never guess missing/unknown versions. */
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
      const v5={...raw,saveVersion:5,universe:migrateCalendarUniverse(v4.universe)};
      assertHistoricalSave(v5,5);
      return toV7(raw,migrateDevelopmentRulesUniverse(v5.universe));
    }
    if(version===4){
      assertHistoricalSave(input,4);
      const raw=input as Record<string,unknown>;
      const v5={...raw,saveVersion:5,universe:migrateCalendarUniverse(raw.universe)};
      assertHistoricalSave(v5,5);
      return toV7(raw,migrateDevelopmentRulesUniverse(v5.universe));
    }
    if(version===5){
      // Released V5 keeps its frozen semantics; V6 adds rules identity only (rules 1, no retiming).
      assertHistoricalSave(input,5);
      const raw=input as Record<string,unknown>;
      return toV7(raw,migrateDevelopmentRulesUniverse(raw.universe));
    }
    if(version===6){
      // Released V6 keeps its frozen semantics and its rules (1/2); V7 changes identity only.
      assertHistoricalSaveV6(input);
      const raw=input as Record<string,unknown>;
      return toV8(raw,migrateWeeklyVariationUniverse(raw.universe));
    }
    if(version===7){
      // Released V7 keeps its frozen semantics and its rules (1/2/3); V8 adds qualifying state only.
      assertHistoricalSaveV7(input);
      const raw=input as Record<string,unknown>;
      return {ok:true,value:{...raw,saveVersion:CURRENT_SAVE_VERSION,universe:migrateQualifyingUniverse(raw.universe)}};
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
