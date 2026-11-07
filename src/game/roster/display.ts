import {DEFAULT_ROSTER} from './resolve';
import type {ResolvedDriver, ResolvedRoster, ResolvedTeam} from './types';

/**
 * Presentation-only roster layer: names, colours, numbers, helmets and bios shown on screen.
 * The simulation never reads this. Changing it cannot change a result, a seed or a save.
 */
let active: ResolvedRoster = DEFAULT_ROSTER, version = 0;
let teams = new Map(active.teams.map(t => [t.id, t]));
let drivers = new Map(active.drivers.map(d => [d.id, d]));
const listeners = new Set<() => void>();

export const activeDisplayRoster = () => active;
/** Changes whenever the display roster does; lets presentation caches invalidate. */
export const displayRosterVersion = () => version;
/** Name to show for a driver: the active pack's, else the name stored in the save. */
export const displayDriverName = (id: string, saved: string) => drivers.get(id)?.name ?? saved;
export const displayTeam = (id: string): ResolvedTeam | undefined => teams.get(id);
export const displayDriver = (id: string): ResolvedDriver | undefined => drivers.get(id);
export function setDisplayRoster(roster: ResolvedRoster) {
  active = roster; version++; teams = new Map(roster.teams.map(t => [t.id, t])); drivers = new Map(roster.drivers.map(d => [d.id, d]));
  listeners.forEach(listener => listener());
}
export function subscribeDisplayRoster(listener: () => void) { listeners.add(listener); return () => { listeners.delete(listener); }; }
