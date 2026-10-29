import { saveId } from './validation';
import type { GameDefinition } from '../simulation/universe';
import { deserializeSave, failure, validateSave, type GameSaveEnvelope, type SaveResult } from './saveEnvelope';

/** Raw transport interface. Real-device adapters must implement atomic writes/recovery. */
export interface SaveStorage {
  write(id: string, data: string): Promise<void>;
  read(id: string): Promise<string | null>;
  list(): Promise<string[]>;
  delete(id: string): Promise<void>;
}

/** Test/local-session adapter only: contents are lost when this instance/process ends. */
export class MemorySaveStorage implements SaveStorage {
  private readonly entries = new Map<string, string>();
  async write(id: string, data: string) { this.entries.set(id, data); }
  async read(id: string) { return this.entries.get(id) ?? null; }
  async list() { return [...this.entries.keys()].sort(); }
  async delete(id: string) { this.entries.delete(id); }
}

/** Validation precedes every write and every loaded universe; failures never create a new game. */
export class SaveRepository {
  constructor(private readonly storage: SaveStorage, private readonly definition: GameDefinition) {}

  async save(input: unknown): Promise<SaveResult<GameSaveEnvelope>> {
    const decoded = validateSave(input, this.definition);
    if (!decoded.ok) return decoded;
    try { await this.storage.write(decoded.value.saveId, JSON.stringify(decoded.value)); return decoded; }
    catch { return failure('STORAGE_ERROR', 'Could not write save'); }
  }

  async load(id: string): Promise<SaveResult<GameSaveEnvelope | null>> {
    try { saveId(id, 'slot'); } catch { return failure('INVALID_DATA', 'Invalid slot id'); }
    try {
      const json = await this.storage.read(id);
      if (json === null) return { ok: true, value: null };
      const decoded = deserializeSave(json, this.definition);
      if (decoded.ok && decoded.value.saveId !== id) return failure('INVALID_DATA', 'Save slot identity mismatch');
      return decoded;
    } catch { return failure('STORAGE_ERROR', 'Could not read save'); }
  }

  async list(): Promise<SaveResult<string[]>> {
    try { return { ok: true, value: await this.storage.list() }; }
    catch { return failure('STORAGE_ERROR', 'Could not list saves'); }
  }

  async delete(id: string): Promise<SaveResult<null>> {
    try { saveId(id, 'slot'); } catch { return failure('INVALID_DATA', 'Invalid slot id'); }
    try { await this.storage.delete(id); return { ok: true, value: null }; }
    catch { return failure('STORAGE_ERROR', 'Could not delete save'); }
  }
}
