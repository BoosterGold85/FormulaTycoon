import { CANONICAL_DEVELOPMENT_CONTEXT } from './canonicalDevelopment';
import { HEADQUARTERS_LAYOUT, STARTING_STAFF } from './headquartersData';
import type { GameDefinition } from '../simulation/universe/types';

/** Application composition only; individual engines can still run with custom definitions. */
export const DEFAULT_GAME_DEFINITION: GameDefinition = {
  version: 'campaign-date-2026-v4',
  driverEra: 2026,
  driverDataVersion: 2,
  headquarters: { layout: HEADQUARTERS_LAYOUT, roster: STARTING_STAFF },
  development: CANONICAL_DEVELOPMENT_CONTEXT
};
