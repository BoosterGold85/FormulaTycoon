import type { HeadquartersLayout } from '../../game/models';
import { samePoint } from './geometry';
import { getStation } from './layout';
import { findNodePath } from './navigation';
import type { HeadquartersWorker, RouteStep, WorkerAssignment } from './types';

/**
 * Plans the waypoints a worker walks to reach a station slot:
 * leave the current spot -> navigation graph -> slot approach -> slot spot.
 * Workers never cut across rooms; they only move along these segments.
 */
export function planRouteToSlot(
  layout: HeadquartersLayout,
  worker: HeadquartersWorker,
  target: WorkerAssignment
): RouteStep[] {
  const station = getStation(layout, target.stationId);
  const slot = station.slots[target.slotIndex];
  if (!slot) throw new Error(`Station ${station.id} has no slot ${target.slotIndex}`);

  const exit = planExit(layout, worker);
  const nodePath = findNodePath(layout.nav, exit.nodeId, station.accessNodeId);
  if (!nodePath) {
    throw new Error(`No path from ${exit.nodeId} to ${station.accessNodeId}`);
  }

  const steps: RouteStep[] = [
    ...exit.steps,
    ...nodePath.slice(1).map(nodeId => ({ point: layout.nav.nodes[nodeId]!, nodeId })),
    ...slot.approach.map(point => ({ point })),
    { point: slot.spot }
  ];
  return dropRedundantSteps(worker.position, steps);
}

/** Steps that take a worker from where they are now onto the navigation graph. */
function planExit(
  layout: HeadquartersLayout,
  worker: HeadquartersWorker
): { steps: RouteStep[]; nodeId: string } {
  if (worker.state === 'WALKING' && worker.route.length > 0) {
    // Keep walking to the next graph node, then branch off from there.
    const nodeIndex = worker.route.findIndex(step => step.nodeId !== undefined);
    if (nodeIndex >= 0) {
      return {
        steps: worker.route.slice(0, nodeIndex + 1),
        nodeId: worker.route[nodeIndex]!.nodeId!
      };
    }
    // Already inside a station approach: retrace the approach back out.
    if (worker.assignment) {
      const station = getStation(layout, worker.assignment.stationId);
      const slot = station.slots[worker.assignment.slotIndex]!;
      const passed = slot.approach.slice(0, slot.approach.length + 1 - worker.route.length);
      return {
        steps: [
          ...[...passed].reverse().map(point => ({ point })),
          { point: layout.nav.nodes[station.accessNodeId]!, nodeId: station.accessNodeId }
        ],
        nodeId: station.accessNodeId
      };
    }
  }

  if (worker.location.kind === 'station') {
    const station = getStation(layout, worker.location.stationId);
    const slot = station.slots[worker.location.slotIndex]!;
    return {
      steps: [
        ...[...slot.approach].reverse().map(point => ({ point })),
        { point: layout.nav.nodes[station.accessNodeId]!, nodeId: station.accessNodeId }
      ],
      nodeId: station.accessNodeId
    };
  }

  const nodeId = worker.location.nodeId;
  return { steps: [{ point: layout.nav.nodes[nodeId]!, nodeId }], nodeId };
}

function dropRedundantSteps(start: { x: number; y: number }, steps: RouteStep[]): RouteStep[] {
  const result: RouteStep[] = [];
  let previous = start;
  for (const step of steps) {
    if (samePoint(previous, step.point)) continue;
    result.push(step);
    previous = step.point;
  }
  return result;
}
