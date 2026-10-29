import { DEFAULT_DEVELOPMENT_CONTEXT } from './development';
import { HEADQUARTERS_LAYOUT, STARTING_STAFF } from './headquartersData';
import type { GameDefinition } from '../simulation/universe/types';

/** Application composition only; individual engines can still run with custom definitions. */
export const DEFAULT_GAME_DEFINITION: GameDefinition = {
  version: 'hq-development-v1',
  headquarters: { layout: HEADQUARTERS_LAYOUT, roster: STARTING_STAFF },
  development: DEFAULT_DEVELOPMENT_CONTEXT
};
