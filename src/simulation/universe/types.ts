import type {CampaignDate} from '../campaignTime';
import type { DriverWorld } from '../../game/drivers/types';
import type { DevelopmentContext } from '../../game/development';
import type { HeadquartersLayout, WorkerDefinition } from '../../game/models';
import type { DevelopmentState } from '../development';
import type { HeadquartersState } from '../headquarters';

/** Immutable content/configuration supplied to simulation, never copied into runtime entities. */
export type GameDefinition = {
  /** Bump when content/rules change in a way that needs a saved-state migration. */
  version: string;
  driverEra?: 2026;
  driverDataVersion?: 1 | 2;
  headquarters: { layout: HeadquartersLayout; roster: WorkerDefinition[] };
  development: DevelopmentContext;
};

/** Serializable state only: no React values, timers, PRNG objects or wall-clock timestamps. */
export type GameUniverse = {
  definitionVersion: string;
  readonly currentDate: CampaignDate;
  seed: number;
  /** Null until the player selects a team. No rival is silently converted to player control. */
  playerTeamId: string | null;
  headquarters: HeadquartersState;
  /** Clock-free car/development state; temporal kernel views derive from currentDate. */
  development: DevelopmentState;
  drivers?: DriverWorld;
};
