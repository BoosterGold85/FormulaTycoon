import { SeededRandom } from '../seededRandom';

/**
 * Derives an independent random stream from the world seed and a set of keys,
 * so one team's decisions never shift another team's luck.
 */
export function randomFor(seed: number, ...keys: Array<string | number>): SeededRandom {
  let hash = 0x811c9dc5 ^ seed;
  for (const key of keys) {
    const text = `${key}|`;
    for (let i = 0; i < text.length; i += 1) {
      hash ^= text.charCodeAt(i);
      hash = Math.imul(hash, 0x01000193);
    }
  }
  return new SeededRandom(hash >>> 0);
}

/** Standard normal sample (Box-Muller) from a seeded stream. */
export function gaussian(random: SeededRandom): number {
  const u = Math.max(random.next(), 1e-9);
  const v = random.next();
  return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v);
}

export function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}
