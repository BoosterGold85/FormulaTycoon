import type {
  DepartmentDefinition,
  DepartmentId,
  GridPoint,
  HeadquartersLayout
} from '../../game/models';
import { pointInRect } from './geometry';
import { getStationsInDepartment } from './layout';
import type { HeadquartersState, HeadquartersWorker, WorkerState } from './types';

export function departmentAtPoint(
  layout: HeadquartersLayout,
  point: GridPoint
): DepartmentDefinition | null {
  return layout.departments.find(department => pointInRect(point, department.area)) ?? null;
}

export type DepartmentStatus = 'Active' | 'Staff arriving' | 'Unstaffed';

export type DepartmentSummary = {
  id: DepartmentId;
  staffCount: number;
  workingCount: number;
  status: DepartmentStatus;
  stations: Array<{ id: string; name: string; assigned: number; capacity: number }>;
};

export function summarizeDepartment(
  state: HeadquartersState,
  layout: HeadquartersLayout,
  id: DepartmentId
): DepartmentSummary {
  const stations = getStationsInDepartment(layout, id);
  const stationIds = new Set<string>(stations.map(station => station.id));
  const staff = state.workers.filter(
    worker => worker.assignment && stationIds.has(worker.assignment.stationId)
  );
  const workingCount = staff.filter(worker => worker.state === 'WORKING').length;

  return {
    id,
    staffCount: staff.length,
    workingCount,
    status: staff.length === 0 ? 'Unstaffed' : workingCount > 0 ? 'Active' : 'Staff arriving',
    stations: stations.map(station => ({
      id: station.id,
      name: station.name,
      capacity: station.slots.length,
      assigned: state.stations[station.id].slots.filter(Boolean).length
    }))
  };
}

export function countWorkersByState(state: HeadquartersState): Record<WorkerState, number> {
  const counts: Record<WorkerState, number> = { IDLE: 0, WALKING: 0, WORKING: 0 };
  for (const worker of state.workers) counts[worker.state] += 1;
  return counts;
}

/** True when nothing will change until a new assignment is made. */
export function isHeadquartersSettled(state: HeadquartersState): boolean {
  return state.workers.every(worker => worker.route.length === 0);
}

export function getWorker(state: HeadquartersState, id: string): HeadquartersWorker | undefined {
  return state.workers.find(worker => worker.id === id);
}
