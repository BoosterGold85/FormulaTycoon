export type GridPoint = {
  x: number;
  y: number;
};

export type Department =
  | 'AERO'
  | 'STRATEGY'
  | 'SIMULATOR'
  | 'CAR_BAY'
  | 'LOGISTICS';

export type Workstation = {
  id: string;
  name: string;
  department: Department;
  grid: GridPoint;
  variant: 'desk' | 'sim' | 'car' | 'crate';
};

export type Worker = {
  id: string;
  name: string;
  role: string;
  stationId: string;
  startGrid: GridPoint;
  delayMs: number;
  uniform: 'navy' | 'red' | 'white';
};
