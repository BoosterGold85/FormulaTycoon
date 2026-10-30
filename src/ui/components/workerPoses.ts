import type { WorkActivity } from '../../game/models';
import type { WorkerState } from '../../simulation/headquarters/types';

/** Cosmetic keyframes only. Never schedules work or changes an authoritative worker. */
type Angles = [number, number];
export type WorkerPose = {
  name: 'IDLE' | 'WALK' | 'SERVICE' | 'INSPECT' | 'DESK' | 'SIMULATOR' | 'FABRICATE' | 'CARRY';
  shoulder: Angles;
  elbow: Angles;
  farShoulder: Angles;
  farElbow: Angles;
  prop: 'NONE' | 'WRENCH' | 'TABLET' | 'PART' | 'BOX';
  stance: number;
};
const POSES: Record<WorkerPose['name'], WorkerPose> = {
  IDLE: { name: 'IDLE', shoulder: [-5, -2], elbow: [-30, -34], farShoulder: [7, 5], farElbow: [-20, -24], prop: 'NONE', stance: 2 },
  WALK: { name: 'WALK', shoulder: [-16, 16], elbow: [-24, -36], farShoulder: [16, -16], farElbow: [-36, -24], prop: 'NONE', stance: 3 },
  SERVICE: { name: 'SERVICE', shoulder: [-28, -34], elbow: [-72, -82], farShoulder: [-15, -19], farElbow: [-65, -73], prop: 'WRENCH', stance: 8 },
  INSPECT: { name: 'INSPECT', shoulder: [-18, -20], elbow: [-95, -89], farShoulder: [-34, -30], farElbow: [-82, -86], prop: 'TABLET', stance: 3 },
  DESK: { name: 'DESK', shoulder: [-36, -39], elbow: [-66, -60], farShoulder: [-32, -29], farElbow: [-68, -74], prop: 'NONE', stance: 2 },
  SIMULATOR: { name: 'SIMULATOR', shoulder: [-30, -34], elbow: [-80, -74], farShoulder: [-28, -26], farElbow: [-74, -80], prop: 'TABLET', stance: 4 },
  FABRICATE: { name: 'FABRICATE', shoulder: [-42, -48], elbow: [-66, -74], farShoulder: [-24, -28], farElbow: [-82, -78], prop: 'PART', stance: 7 },
  CARRY: { name: 'CARRY', shoulder: [25, 22], elbow: [-115, -112], farShoulder: [15, 18], farElbow: [-100, -103], prop: 'BOX', stance: 5 }
};

export function workerPose(state: WorkerState, activity: WorkActivity | null, role: string): WorkerPose {
  if (state === 'WALKING') return POSES.WALK;
  if (state !== 'WORKING') return POSES.IDLE;
  if (activity === 'CAR_SERVICE') return /mechanic/i.test(role) ? POSES.SERVICE : POSES.INSPECT;
  if (activity === 'FABRICATING') return POSES.FABRICATE;
  if (activity === 'HAULING') return POSES.CARRY;
  if (activity === 'SIMULATOR') return POSES.SIMULATOR;
  return POSES.DESK;
}
