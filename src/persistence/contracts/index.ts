import type { GameDefinition } from '../../simulation/universe/types';
import type { DriverWorld } from '../../game/drivers/types';
import type { TeamDevelopmentState } from '../../simulation/development/types';
import v1 from './v1.json';
import v2 from './v2.json';
import v3 from './v3.json';
import initialV3 from './v3-initial.json';

export type ReleasedDriverContent = {
  ids: string[]; teamIds: string[]; buckets: string[]; traits: string[]; aligned: boolean;
};
export type ReleasedContent = {
  saveVersion: 1 | 2 | 3;
  definition: GameDefinition;
  legacyTeamMap: Record<string, string>;
  drivers?: ReleasedDriverContent;
};
/** Detached checked-in data, recursively frozen. Never derive a released contract from live imports. */
function freezeSnapshot<T>(input: T): T {
  const copy = JSON.parse(JSON.stringify(input)) as T;
  function freeze(value: unknown): void {
    if (value && typeof value === 'object') {
      Object.values(value).forEach(freeze);
      Object.freeze(value);
    }
  }
  freeze(copy);
  return copy;
}
export const SAVE_V1 = freezeSnapshot(v1 as unknown as ReleasedContent);
export const SAVE_V2 = freezeSnapshot(v2 as unknown as ReleasedContent);
export const SAVE_V3 = freezeSnapshot(v3 as unknown as ReleasedContent);
export const INITIAL_V3 = freezeSnapshot(initialV3 as unknown as {drivers: DriverWorld; caldera: TeamDevelopmentState});

export function releasedContentFor(definitionVersion: string): ReleasedContent {
  const contract = [SAVE_V1, SAVE_V2, SAVE_V3].find(c => c.definition.version === definitionVersion);
  if (!contract) throw new Error('Unknown released content: explicit validation/migration required');
  return contract;
}
