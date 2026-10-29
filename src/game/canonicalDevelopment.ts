import { DEFAULT_DEVELOPMENT_CONTEXT, RIVAL_TEAMS } from './development';
import { TEAM_BRANDS, LEGACY_TEAM_MAP } from './brandRegistry';

/** Preserve ten calibrated profiles, deliberately initialize an eleventh independent entrant. */
export const CANONICAL_DEVELOPMENT_CONTEXT = {
 ...DEFAULT_DEVELOPMENT_CONTEXT,
 regulations: { ...DEFAULT_DEVELOPMENT_CONTEXT.regulations,
   aeroTestingAllowance: [0.7,0.75,0.8,0.85,0.9,0.95,1,1.05,1.1,1.15,1.2] },
 teams: TEAM_BRANDS.map(brand => {
   const old = RIVAL_TEAMS.find(t => LEGACY_TEAM_MAP[t.id] === brand.id);
   const base = old ?? RIVAL_TEAMS.find(t => t.id === 'kestrel')!;
   return { ...base, id: brand.id, name: brand.name, controlledBy: brand.id === 'team.wellington' ? 'PLAYER' as const : 'AI' as const,
     ...(old ? {} : { carLevel: 62, developmentBudget: 40, correlation: 65, aggression: 0.45 }) };
 })
};
