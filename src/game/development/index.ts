import { GRAND_PRIX_CALENDAR } from './calendar';
import { PART_DEFINITIONS } from './parts';
import { DEVELOPMENT_REGULATIONS } from './regulations';
import { RIVAL_TEAMS } from './teams';
import type { DevelopmentContext } from './types';

export * from './types';
export { GRAND_PRIX_CALENDAR } from './calendar';
export { PACE_WEIGHTS, PART_CONTRIBUTIONS, PART_DEFINITIONS } from './parts';
export { DEVELOPMENT_REGULATIONS } from './regulations';
export { RIVAL_TEAMS } from './teams';

export const DEFAULT_DEVELOPMENT_CONTEXT: DevelopmentContext = {
  parts: PART_DEFINITIONS,
  regulations: DEVELOPMENT_REGULATIONS,
  calendar: GRAND_PRIX_CALENDAR,
  teams: RIVAL_TEAMS
};
