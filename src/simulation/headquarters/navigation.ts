import type { NavGraph } from '../../game/models';
import { distance } from './geometry';

/**
 * Shortest path between two navigation nodes (Dijkstra). Ties are broken by
 * node id so the result is always the same for the same graph.
 * Returns the node ids from `fromId` to `toId` inclusive, or null if unreachable.
 */
export function findNodePath(graph: NavGraph, fromId: string, toId: string): string[] | null {
  if (!graph.nodes[fromId] || !graph.nodes[toId]) return null;
  if (fromId === toId) return [fromId];

  const neighbours = new Map<string, string[]>();
  for (const [a, b] of graph.edges) {
    neighbours.set(a, [...(neighbours.get(a) ?? []), b]);
    neighbours.set(b, [...(neighbours.get(b) ?? []), a]);
  }

  const dist = new Map<string, number>([[fromId, 0]]);
  const previous = new Map<string, string>();
  const visited = new Set<string>();

  while (true) {
    let current: string | null = null;
    let best = Infinity;
    for (const [id, d] of dist) {
      if (visited.has(id)) continue;
      if (d < best || (d === best && current !== null && id < current)) {
        best = d;
        current = id;
      }
    }
    if (current === null) return null;
    if (current === toId) break;
    visited.add(current);

    const here = graph.nodes[current]!;
    for (const next of [...(neighbours.get(current) ?? [])].sort()) {
      const there = graph.nodes[next];
      if (!there || visited.has(next)) continue;
      const candidate = best + distance(here, there);
      if (candidate < (dist.get(next) ?? Infinity)) {
        dist.set(next, candidate);
        previous.set(next, current);
      }
    }
  }

  const path = [toId];
  let cursor = toId;
  while (cursor !== fromId) {
    cursor = previous.get(cursor)!;
    path.unshift(cursor);
  }
  return path;
}
