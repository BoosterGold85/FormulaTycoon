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
  calendarId?: string;
  driverEra?: 2026;
  driverDataVersion?: 1 | 2;
  /** Development rules for NEW careers created from this definition (saved careers keep theirs). */
  developmentRules?: DevelopmentRules;
  headquarters: { layout: HeadquartersLayout; roster: WorkerDefinition[] };
  development: DevelopmentContext;
};

/** Serializable state only: no React values, timers, PRNG objects or wall-clock timestamps. */
export type GameUniverse = {
  definitionVersion: string;
  readonly currentDate: CampaignDate;
  /** Immutable content identity, not another clock or copied calendar. */
  readonly calendarId: string;
  seed: number;
  /** Null until the player selects a team. No rival is silently converted to player control. */
  playerTeamId: string | null;
  headquarters: HeadquartersState;
  /** Clock-free car/development state; temporal kernel views derive from currentDate. */
  development: DevelopmentState;
  drivers?: DriverWorld;
  /** Save v6: development rules this career runs. Migrated careers keep 1; new careers use 2. */
  developmentRules: DevelopmentRules;
};
/** 1 = released compatibility cadence; 2 = real race-weekend fitting, events and quality bonus. */
export type DevelopmentRules = 1 | 2 | 3;
/** Rules 2 and later fit at the career's real race weekends and support decisions/refine/hold. */
export const usesRaceWeekends = (rules: DevelopmentRules | undefined): boolean => rules === 2 || rules === 3;
