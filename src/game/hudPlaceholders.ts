/**
 * Placeholder presentation data for the HUD. Development has team/calendar definitions,
 * day/date and next event now come from domain selectors. The team placeholder is not game state.
 */
export const HUD_PLACEHOLDERS = {
  teamName: 'Your Team'
} as const;

export type NavTab = 'HQ' | 'TEAM' | 'DRIVERS' | 'RACE' | 'HISTORY';

export const NAV_TABS: Array<{ id: NavTab; label: string; available: boolean }> = [
  { id: 'HQ', label: 'HQ', available: true },
  { id: 'TEAM', label: 'TEAM', available: true },
  { id: 'DRIVERS', label: 'DRIVERS', available: true },
  { id: 'RACE', label: 'RACE', available: true },
  { id: 'HISTORY', label: 'HISTORY', available: false }
];
