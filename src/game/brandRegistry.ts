import { DEFAULT_ROSTER, TEAM_SLOT_IDS, displayTeam } from './roster';
/**
 * Canonical fictional organizations. Display branding (name, colours, identity) comes from the
 * roster pack: the default pack here, the player's active pack through `teamBrand`. Branding is
 * never a foreign key, and organization traits below are simulation content, not pack data.
 */
const ORGANIZATIONS: Array<[string, number, number, number, number, number, number, number]> = [
  ['team.mclarin', 90, 70, 65, 55, 88, 88, 65],
  ['team.ferano', 97, 35, 35, 85, 92, 85, 65],
  ['team.mercurion', 91, 75, 75, 65, 82, 96, 45],
  ['team.vortex', 94, 30, 92, 30, 82, 90, 93],
  ['team.arden', 78, 60, 40, 85, 88, 82, 60],
  ['team.wellington', 80, 85, 65, 75, 68, 85, 45],
  ['team.alpinor', 72, 40, 70, 60, 72, 80, 65],
  ['team.hartman', 60, 75, 60, 70, 55, 65, 35],
  ['team.veloce', 63, 55, 98, 20, 65, 72, 83],
  ['team.auden', 70, 92, 70, 75, 82, 92, 45],
  ['team.caldera', 62, 80, 40, 90, 96, 78, 55]
];
export const TEAM_BRANDS = ORGANIZATIONS.map(([id, prestige, patience, youthPreference, veteranPreference, commercialFocus, developmentFocus, riskTolerance], index) => {
  const pack = DEFAULT_ROSTER.teams[index]!;
  if (TEAM_SLOT_IDS[index] !== id) throw new Error(`Team slot ${index + 1} must stay ${TEAM_SLOT_IDS[index]}`);
  return {
  id, name: pack.name,
  // Single authored palette. `color` remains the existing primary compatibility alias.
  colors: {...pack.colors}, color: pack.colors.primary, philosophy: pack.identity,
  prestige, patience, youthPreference, veteranPreference, commercialFocus, developmentFocus, riskTolerance,
  expectedPerformance: prestige > 85 ? 'FRONT_RUNNING' : 'BUILDING',
  budgetPhilosophy: patience > 75 ? 'LONG_TERM' : 'RESULTS_LED'
  };
});
type TeamBrand = typeof TEAM_BRANDS[number];
/** Presentation read: canonical organization plus the active roster pack's display branding. */
export function teamBrand(id: string): TeamBrand {
  const team = TEAM_BRANDS.find(t => t.id === id);
  if (!team) throw new Error(`Unknown canonical team: ${id}`);
  const shown = displayTeam(id);
  return shown ? {...team, name: shown.name, colors: {...shown.colors}, color: shown.colors.primary, philosophy: shown.identity} : team;
}
/** Deliberate content mapping, NOT a claim of equivalence with real organizations. */
export const LEGACY_TEAM_MAP: Record<string, string> = {
  aurora: 'team.vortex', rossa: 'team.ferano', silverline: 'team.mercurion', papaya: 'team.mclarin',
  emerald: 'team.arden', azure: 'team.alpinor', northstar: 'team.wellington', falcon: 'team.hartman',
  ironworks: 'team.veloce', kestrel: 'team.auden'
};
