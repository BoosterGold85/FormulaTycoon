/** Shared floor-depth bands for props and animated sprites (no simulation changes). */
export function sceneDepth(x: number, y: number): number {
  return 100 + Math.round((x + y) * 4);
}
