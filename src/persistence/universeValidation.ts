import type { GameDefinition, GameUniverse } from '../simulation/universe';
import { releasedContentFor } from './contracts';
import { validateReleasedUniverse } from './contracts/preCalendarValidation';

/** A released definition ID resolves to its historical contract, never the caller's live arrays. */
export function validateUniverse(input: unknown, definition: GameDefinition): asserts input is GameUniverse {
  validateReleasedUniverse(input, releasedContentFor(definition.version));
}
