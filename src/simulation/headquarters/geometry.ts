import type { GridPoint } from '../../game/models';
import type { Facing } from './types';

export function distance(a: GridPoint, b: GridPoint): number {
  return Math.hypot(b.x - a.x, b.y - a.y);
}

export function samePoint(a: GridPoint, b: GridPoint, epsilon = 1e-6): boolean {
  return Math.abs(a.x - b.x) <= epsilon && Math.abs(a.y - b.y) <= epsilon;
}

/** Facing on screen: isometric screen x grows with (x - y). */
export function facingBetween(from: GridPoint, to: GridPoint, fallback: Facing): Facing {
  const screenDx = to.x - to.y - (from.x - from.y);
  if (Math.abs(screenDx) < 1e-6) return fallback;
  return screenDx > 0 ? 'right' : 'left';
}

export function pointInRect(
  point: GridPoint,
  rect: { x: number; y: number; width: number; depth: number }
): boolean {
  return (
    point.x >= rect.x &&
    point.x <= rect.x + rect.width &&
    point.y >= rect.y &&
    point.y <= rect.y + rect.depth
  );
}
