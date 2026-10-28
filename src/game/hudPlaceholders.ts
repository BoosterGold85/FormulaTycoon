/**
 * Placeholder presentation data for the HUD. There is no calendar or team
 * system yet; these values are display-only and not game state.
 */
export const HUD_PLACEHOLDERS = {
  teamName: 'Your Team',
  day: 'Monday',
  nextEvent: 'Preseason'
} as const;

export type NavTab = 'HQ' | 'TEAM' | 'DRIVERS' | 'RACE' | 'HISTORY';

export const NAV_TABS: Array<{ id: NavTab; label: string; available: boolean }> = [
  { id: 'HQ', label: 'HQ', available: true },
  { id: 'TEAM', label: 'TEAM', available: false },
  { id: 'DRIVERS', label: 'DRIVERS', available: false },
  { id: 'RACE', label: 'RACE', available: false },
  { id: 'HISTORY', label: 'HISTORY', available: false }
];
