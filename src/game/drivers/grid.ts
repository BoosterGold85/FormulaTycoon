import type { Trait } from './types';
import { DEFAULT_ROSTER, GRID_SLOT_IDS, TEAM_SLOT_IDS, gridTeamSlot, type ResolvedDriver } from '../roster';
export type DriverSeed = { id: string; name: string; nationality: string; age: number; teamId?: string;
  values: [number, number, number, number, number, number]; potential: number; traits: Trait[]; summary: string };
/** Seed shape the driver world is built from. `nationality` here is the simulation's home market. */
export function seedFromRoster(d: ResolvedDriver, teamId?: string): DriverSeed {
 const s = d.stats;
 return {id: d.id, name: d.name, nationality: s.homeMarket, age: s.age, ...(teamId ? {teamId} : {}),
  values: [s.talent, s.racecraft, s.adaptability, s.composure, s.feedback, s.marketability], potential: s.potential,
  traits: [...s.traits], summary: d.bio};
}
/** Starting grid from the default fictional roster pack (`src/game/roster/defaultRoster.json`). */
export const GRID: DriverSeed[] = DEFAULT_ROSTER.drivers.filter(d => d.group === 'grid')
 .map(d => seedFromRoster(d, TEAM_SLOT_IDS[gridTeamSlot(d.slot) - 1]));
if (GRID.length !== GRID_SLOT_IDS.length) throw new Error('Default roster grid is incomplete');
