import { SeededRandom } from '../seededRandom';

export { randomFor } from '../randomStreams';

/** Standard normal sample (Box-Muller) from a seeded stream. */
export function gaussian(random: SeededRandom): number {
  const u = Math.max(random.next(), 1e-9);
  const v = random.next();
  return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v);
}

export function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}
