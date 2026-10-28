import type { Worker, Workstation } from './models';

export const WORKSTATIONS: Workstation[] = [
  { id: 'aero', name: 'Aero', department: 'AERO', grid: { x: 1, y: 1 }, variant: 'desk' },
  { id: 'strategy', name: 'Strategy', department: 'STRATEGY', grid: { x: 4, y: 1 }, variant: 'desk' },
  { id: 'sim', name: 'Simulator', department: 'SIMULATOR', grid: { x: 1, y: 4 }, variant: 'sim' },
  { id: 'car-a', name: 'Car 01', department: 'CAR_BAY', grid: { x: 3, y: 3 }, variant: 'car' },
  { id: 'car-b', name: 'Car 02', department: 'CAR_BAY', grid: { x: 5, y: 4 }, variant: 'car' },
  { id: 'logistics', name: 'Logistics', department: 'LOGISTICS', grid: { x: 2, y: 6 }, variant: 'crate' }
];

export const WORKERS: Worker[] = [
  { id: 'maya', name: 'Maya', role: 'Aero Engineer', stationId: 'aero', startGrid: { x: 6.7, y: 7 }, delayMs: 250, uniform: 'navy' },
  { id: 'owen', name: 'Owen', role: 'Strategist', stationId: 'strategy', startGrid: { x: 7.1, y: 7.1 }, delayMs: 600, uniform: 'white' },
  { id: 'leo', name: 'Leo', role: 'Driver Coach', stationId: 'sim', startGrid: { x: 7.4, y: 6.7 }, delayMs: 950, uniform: 'red' },
  { id: 'nia', name: 'Nia', role: 'Race Mechanic', stationId: 'car-a', startGrid: { x: 6.8, y: 7.4 }, delayMs: 1250, uniform: 'navy' },
  { id: 'jules', name: 'Jules', role: 'Race Mechanic', stationId: 'car-b', startGrid: { x: 7.3, y: 7.5 }, delayMs: 1550, uniform: 'navy' },
  { id: 'sam', name: 'Sam', role: 'Logistics Lead', stationId: 'logistics', startGrid: { x: 7.7, y: 7.2 }, delayMs: 1850, uniform: 'red' }
];
