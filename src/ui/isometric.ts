import type { GridPoint } from '../game/models';

export const ISO_X_STEP = 38;
export const ISO_Y_STEP = 19;

export function gridToScreen(point: GridPoint, originX: number, originY: number) {
  return {
    x: originX + (point.x - point.y) * ISO_X_STEP,
    y: originY + (point.x + point.y) * ISO_Y_STEP
  };
}
