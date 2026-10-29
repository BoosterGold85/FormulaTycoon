/**
 * Placeholder presentation data for the HUD. Development has team/calendar definitions,
 * but the HUD is not connected to campaign progression yet. These are not game state.
 */
export const HUD_PLACEHOLDERS = {
  teamName: 'Your Team',
  day: 'Monday',
  nextEvent: 'Preseason'
} as const;

export type NavTab = 'HQ' | 'TEAM' | 'DRIVERS' | 'RACE' | 'HISTORY';

export const NAV_TABS: Array<{ id: NavTab; label: string; available: boolean }> = [
  { id: 'HQ', label: 'HQ', available: true },
  { id: 'TEAM', label: 'TEAM', available: true },
  { id: 'DRIVERS', label: 'DRIVERS', available: true },
  { id: 'RACE', label: 'RACE', available: false },
  { id: 'HISTORY', label: 'HISTORY', available: false }
];
