import { CANONICAL_DEVELOPMENT_CONTEXT } from './canonicalDevelopment';
import { HEADQUARTERS_LAYOUT, STARTING_STAFF } from './headquartersData';
import type { GameDefinition } from '../simulation/universe/types';

/** Application composition only; individual engines can still run with custom definitions. */
export const DEFAULT_GAME_DEFINITION: GameDefinition = {
  version: 'driver-world-2026-v2',
  driverEra: 2026,
  headquarters: { layout: HEADQUARTERS_LAYOUT, roster: STARTING_STAFF },
  development: CANONICAL_DEVELOPMENT_CONTEXT
};
