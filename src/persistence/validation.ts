/** Small private runtime checks for the v1 save format; no schema dependency. */
export type Check = (value: unknown, path: string) => void;
export function requireValid(ok: unknown, path: string): asserts ok {
  if (!ok) throw new Error(`Invalid save data at ${path}`);
}
export const text: Check = (v, p) => requireValid(typeof v === 'string' && v.length > 0, p);
export const number = (min = 0, max = Number.MAX_SAFE_INTEGER, integer = false): Check => (v, p) => {
  requireValid(typeof v === 'number' && Number.isFinite(v) && v >= min && v <= max && (!integer || Number.isSafeInteger(v)), p);
};
export const choice = (values: readonly unknown[]): Check => (v, p) => requireValid(values.includes(v), p);
export const nullable = (check: Check): Check => (v, p) => { if (v !== null) check(v, p); };
export const array = (check: Check): Check => (v, p) => {
  requireValid(Array.isArray(v), p);
  v.forEach((item, index) => check(item, `${p}[${index}]`));
};
export const object = (fields: Record<string, Check>, optional: string[] = []): Check => (v, p) => {
  requireValid(v !== null && typeof v === 'object' && !Array.isArray(v), p);
  const record = v as Record<string, unknown>;
  requireValid(Object.keys(record).every(key => Object.hasOwn(fields, key)), p);
  for (const [key, check] of Object.entries(fields)) {
    if (optional.includes(key) && !Object.hasOwn(record, key)) continue;
    requireValid(Object.hasOwn(record, key), `${p}.${key}`);
    check(record[key], `${p}.${key}`);
  }
};
export const timestamp: Check = (v, p) => {
  text(v, p);
  const time = Date.parse(v as string);
  requireValid(Number.isFinite(time) && new Date(time).toISOString() === v, p);
};
export const saveId: Check = (v, p) => requireValid(typeof v === 'string' && /^[A-Za-z0-9_-]{1,80}$/.test(v), p);
