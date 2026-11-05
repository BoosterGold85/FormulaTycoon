import type {Trait} from '../drivers/types';

export const PACK_FORMAT = 'formula-tycoon-roster-pack';
export const PACK_SCHEMA_VERSION = 1;
/** Largest pack file accepted by the importer. The default pack is about 30 KB. */
export const PACK_MAX_BYTES = 256 * 1024;
export const HELMET_PATTERNS = 8;

export type PackType = 'cosmetic' | 'full';
export type TeamColors = {primary: string; secondary: string; accent: string};
export type PackTeam = {slot: number; name?: string; shortName?: string; base?: string; identity?: string; colors?: Partial<TeamColors>};
/** Everything the simulation reads about a driver. Only full packs may carry it. */
export type DriverStats = {
  age: number; homeMarket: string; traits: Trait[];
  talent: number; racecraft: number; adaptability: number; composure: number; feedback: number; marketability: number;
  potential: number;
};
export type PackDriver = {
  slot: number; name?: string; number?: number | null; nationality?: string; archetype?: string; bio?: string;
  helmetPattern?: number; stats?: Partial<DriverStats>;
};
export type RosterPack = {
  format: typeof PACK_FORMAT; schemaVersion: typeof PACK_SCHEMA_VERSION; id: string; name: string;
  author?: string; description?: string; type: PackType;
  teams?: PackTeam[]; drivers?: PackDriver[]; freeAgents?: PackDriver[];
};

export type DriverGroup = 'grid' | 'freeAgent';
export type ResolvedTeam = {slot: number; id: string; name: string; shortName: string; base: string; identity: string; colors: TeamColors; fromPack: boolean};
export type ResolvedDriver = {
  slot: number; group: DriverGroup; id: string; name: string; number: number | null; nationality: string;
  archetype: string; bio: string; helmetPattern: number; stats: DriverStats; fromPack: boolean; statsChanged: boolean;
};
/** A pack merged over the default pack, keyed by the unchanged internal IDs. */
export type ResolvedRoster = {
  packId: string; packName: string; author: string | null; description: string | null; type: PackType; isDefault: boolean;
  teams: ResolvedTeam[]; drivers: ResolvedDriver[];
  /** Full packs only: drivers whose simulation stats differ from the default pack. */
  statOverrides: Record<string, DriverStats>;
};
