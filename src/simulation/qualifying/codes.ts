import type {GameUniverse} from '../universe/types';

/**
 * Three-letter timing codes (HAL, MAR), derived from canonical names on every read: never saved, never an ID.
 * The whole roster is coded together, sorted by driver ID, so a code is stable for a given roster and two
 * drivers never share one. Clashes fall back to first initial + surname, then later surname letters.
 */
const letters = (s: string) => s.normalize('NFD').replace(/[^A-Za-z]/g, '').toUpperCase();
function candidates(name: string): string[] {
  const parts = name.trim().split(/\s+/), last = letters(parts[parts.length - 1] ?? ''), first = letters(parts[0] ?? '');
  const out = [last.slice(0, 3), (first[0] ?? '') + last.slice(0, 2)];
  for (let i = 2; i < last.length; i++) for (let j = i + 1; j < last.length; j++) out.push(last[0]! + last[i]! + last[j]!);
  return out.filter(c => c.length === 3);
}
export function codesFor(names: Array<{ id: string; name: string }>): Record<string, string> {
  const used = new Set<string>(), codes: Record<string, string> = {};
  for (const {id, name} of [...names].sort((a, b) => (a.id < b.id ? -1 : a.id > b.id ? 1 : 0))) {
    let code = candidates(name).find(c => !used.has(c));
    // Last resort for a pathological roster: surname stem plus a digit.
    for (let n = 1; !code; n++) { const c = (letters(name) + 'XX').slice(0, 2) + n; if (!used.has(c)) code = c; }
    used.add(code); codes[id] = code;
  }
  return codes;
}
const cache = new WeakMap<object, Record<string, string>>();
/** Codes for every driver in the universe (memoised per immutable driver table). */
export function driverCodes(universe: GameUniverse): Record<string, string> {
  const table = universe.drivers?.drivers ?? {};
  let codes = cache.get(table);
  if (!codes) { codes = codesFor(Object.values(table).map(d => ({ id: d.id, name: d.name }))); cache.set(table, codes); }
  return codes;
}
