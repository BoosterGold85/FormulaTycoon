/** Drawing primitives for the headquarters diorama, in grid units. */
export type BoxPrimitive = {
  x: number;
  y: number;
  width: number;
  depth: number;
  /** Elevation of the bottom face. */
  z: number;
  height: number;
  color: string;
  topColor?: string;
  /** Face pointing towards +y (lower-left on screen). */
  frontColor?: string;
  /** Face pointing towards +x (lower-right on screen). */
  sideColor?: string;
};

export type PlanePrimitive = {
  x: number;
  y: number;
  width: number;
  depth: number;
  color: string;
  borderColor?: string;
};

export function box(
  x: number,
  y: number,
  width: number,
  depth: number,
  z: number,
  height: number,
  color: string,
  faces: Pick<BoxPrimitive, 'topColor' | 'frontColor' | 'sideColor'> = {}
): BoxPrimitive {
  return { x, y, width, depth, z, height, color, ...faces };
}

/** Painter's order: things further back (smaller x + y) are drawn first. */
export function sortBoxes(boxes: BoxPrimitive[]): BoxPrimitive[] {
  return [...boxes].sort(
    (a, b) =>
      a.x + a.width / 2 + a.y + a.depth / 2 - (b.x + b.width / 2 + b.y + b.depth / 2) ||
      a.z - b.z
  );
}

/** Multiplies each RGB channel; factor < 1 darkens, > 1 lightens. */
export function shade(hex: string, factor: number): string {
  const value = parseInt(hex.slice(1), 16);
  const channel = (shift: number) =>
    Math.max(0, Math.min(255, Math.round(((value >> shift) & 255) * factor)));
  const out = (channel(16) << 16) | (channel(8) << 8) | channel(0);
  return `#${out.toString(16).padStart(6, '0')}`;
}
