/** Canonical fictional organizations. Display branding is never a foreign key. */
export const TEAM_BRANDS = [
  ['team.mclarin', 'Mclarin Racing', '#EF9845', 'Engineering-led innovation', 90, 70, 65, 55, 88, 88, 65, '#202B39', '#FFFFFF'],
  ['team.ferano', 'Ferano Corse', '#DA4656', 'Historic powerhouse, high expectations', 97, 35, 35, 85, 92, 85, 65, '#202B39', '#FFFFFF'],
  ['team.mercurion', 'Mercurion GP', '#A8BDC6', 'Patient technical scale', 91, 75, 75, 65, 82, 96, 45, '#247E83', '#20222A'],
  ['team.vortex', 'Vortex Racing', '#687FC0', 'Aggressive elite and driver pipeline', 94, 30, 92, 30, 82, 90, 93, '#202B39', '#E7C77C'],
  ['team.arden', 'Arden Motorsport', '#4EB18C', 'Ambitious luxury-backed organization', 78, 60, 40, 85, 88, 82, 60, '#202B39', '#E8DFB7'],
  ['team.wellington', 'Wellington Racing', '#5A9DDB', 'Independent dynasty rebuilding', 80, 85, 65, 75, 68, 85, 45, '#202B39', '#FFFFFF'],
  ['team.alpinor', 'Alpinor GP', '#6DA4D4', 'Works engineering, variable execution', 72, 40, 70, 60, 72, 80, 65, '#283952', '#F2C7A5'],
  ['team.hartman', 'Hartman Racing', '#BFC6D4', 'Pragmatic independent efficiency', 60, 75, 60, 70, 55, 65, 35, '#344053', '#FFFFFF'],
  ['team.veloce', 'Veloce Racing', '#9B87DF', 'Young-driver opportunities', 63, 55, 98, 20, 65, 72, 83, '#253044', '#E7E9F1'],
  ['team.auden', 'Auden Motorsport', '#CC795D', 'Long-term manufacturer investment', 70, 92, 70, 75, 82, 92, 45, '#26313B', '#E6D6BD'],
  ['team.caldera', 'Caldera Racing', '#B6A37B', 'Commercially ambitious entrant', 62, 80, 40, 90, 96, 78, 55, '#283D49', '#FFFFFF']
].map(([id, name, color, philosophy, prestige, patience, youthPreference, veteranPreference, commercialFocus, developmentFocus, riskTolerance, secondary, accent]) => ({
  id: id as string, name: name as string,
  // Single authored palette. `color` remains the existing primary compatibility alias.
  colors: {primary: color as string, secondary: secondary as string, accent: accent as string},
  color: color as string, philosophy: philosophy as string,
  prestige: prestige as number, patience: patience as number, youthPreference: youthPreference as number,
  veteranPreference: veteranPreference as number, commercialFocus: commercialFocus as number,
  developmentFocus: developmentFocus as number, riskTolerance: riskTolerance as number,
  expectedPerformance: (prestige as number) > 85 ? 'FRONT_RUNNING' : 'BUILDING',
  budgetPhilosophy: (patience as number) > 75 ? 'LONG_TERM' : 'RESULTS_LED'
}));
export function teamBrand(id: string) {
  const team = TEAM_BRANDS.find(t => t.id === id);
  if (!team) throw new Error(`Unknown canonical team: ${id}`);
  return team;
}
/** Deliberate content mapping, NOT a claim of equivalence with real organizations. */
export const LEGACY_TEAM_MAP: Record<string, string> = {
  aurora: 'team.vortex', rossa: 'team.ferano', silverline: 'team.mercurion', papaya: 'team.mclarin',
  emerald: 'team.arden', azure: 'team.alpinor', northstar: 'team.wellington', falcon: 'team.hartman',
  ironworks: 'team.veloce', kestrel: 'team.auden'
};
