import {DEFAULT_ROSTER, cosmeticOnly, validateRosterPack, type ResolvedRoster, type RosterPack} from '../game/roster';

export const ROSTER_PREFERENCE_KEY = 'formula-tycoon.roster-pack';
type PreferenceStorage = {getItem: (key: string) => string | null; setItem: (key: string, value: string) => void; removeItem?: (key: string) => void};
/** `full` means the pack's stats seed each new career; `cosmetic` means display only. */
export type RosterPreference = {mode: 'cosmetic' | 'full'; pack: RosterPack};
export type StartupRoster = {display: ResolvedRoster; career: ResolvedRoster | undefined; stored: RosterPreference | null};

function browserStorage(): PreferenceStorage | undefined {
  try { return (globalThis as typeof globalThis & {localStorage?: PreferenceStorage}).localStorage; } catch { return undefined; }
}
/** Re-validates on every launch: a stored pack is never trusted just because it was accepted once. */
export function readRosterPreference(storage = browserStorage()): StartupRoster {
  const fallback = {display: DEFAULT_ROSTER, career: undefined, stored: null};
  try {
    const raw = storage?.getItem(ROSTER_PREFERENCE_KEY);
    if (!raw) return fallback;
    const stored = JSON.parse(raw) as RosterPreference;
    const result = validateRosterPack(stored?.pack);
    if (!result.ok || (stored.mode !== 'cosmetic' && stored.mode !== 'full')) { clearRosterPreference(storage); return fallback; }
    const full = stored.mode === 'full' && result.roster.type === 'full';
    return {display: full ? result.roster : cosmeticOnly(result.roster), career: full ? result.roster : undefined, stored};
  } catch { return fallback; }
}
export function writeRosterPreference(preference: RosterPreference, storage = browserStorage()): void {
  try { storage?.setItem(ROSTER_PREFERENCE_KEY, JSON.stringify(preference)); } catch { /* Session-only when storage is restricted. */ }
}
export function clearRosterPreference(storage = browserStorage()): void {
  try { storage?.removeItem?.(ROSTER_PREFERENCE_KEY); } catch { /* Nothing stored. */ }
}
