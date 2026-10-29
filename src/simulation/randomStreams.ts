import { SeededRandom } from './seededRandom';

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
