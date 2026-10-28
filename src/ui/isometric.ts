import type { GridPoint } from '../game/models';

/**
 * Pseudo-isometric projection. Screen x follows (x - y), screen y follows
 * (x + y), and elevation (z, in grid units) lifts things straight up.
 */
export type Projection = {
  /** Horizontal pixels per grid unit. */
  tileX: number;
  /** Vertical pixels per grid unit. */
  tileY: number;
  /** Pixels per unit of elevation. */
  zUnit: number;
  originX: number;
  originY: number;
};

export const ISO_RATIO = 0.7;
export const Z_RATIO = 1.3;

export type ScreenPoint = { x: number; y: number };

export function gridToScreen(point: GridPoint, projection: Projection, z = 0): ScreenPoint {
  return {
    x: projection.originX + (point.x - point.y) * projection.tileX,
    y: projection.originY + (point.x + point.y) * projection.tileY - z * projection.zUnit
  };
}

/** Inverse of gridToScreen at floor level (z = 0). */
export function screenToGrid(point: ScreenPoint, projection: Projection): GridPoint {
  const a = (point.x - projection.originX) / projection.tileX; // x - y
  const b = (point.y - projection.originY) / projection.tileY; // x + y
  return { x: (a + b) / 2, y: (b - a) / 2 };
}

export type Point3 = GridPoint & { z: number };

/**
 * Largest projection that fits all points into the given box, centred
 * horizontally. `verticalAlign` places spare vertical space: 0 = top, 1 = bottom.
 */
export function fitProjection(
  points: Point3[],
  width: number,
  height: number,
  padding = 8,
  verticalAlign = 0.5
): Projection {
  const unit: Projection = { tileX: 1, tileY: ISO_RATIO, zUnit: Z_RATIO, originX: 0, originY: 0 };
  let minX = Infinity;
  let maxX = -Infinity;
  let minY = Infinity;
  let maxY = -Infinity;
  for (const point of points) {
    const s = gridToScreen(point, unit, point.z);
    minX = Math.min(minX, s.x);
    maxX = Math.max(maxX, s.x);
    minY = Math.min(minY, s.y);
    maxY = Math.max(maxY, s.y);
  }
  const scale = Math.max(
    1,
    Math.min((width - padding * 2) / (maxX - minX), (height - padding * 2) / (maxY - minY))
  );
  return {
    tileX: scale,
    tileY: scale * ISO_RATIO,
    zUnit: scale * Z_RATIO,
    originX: width / 2 - ((minX + maxX) / 2) * scale,
    originY:
      padding +
      (height - padding * 2 - (maxY - minY) * scale) * verticalAlign -
      minY * scale
  };
}
