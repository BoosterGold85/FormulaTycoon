import {cosmeticOnly} from './resolve';
import type {ResolvedRoster} from './types';

export type RosterTarget = 'CURRENT_CAREER' | 'NEW_CAREER';
export type RosterApplication =
  | {ok: true; display: ResolvedRoster; newCareer: ResolvedRoster | null}
  | {ok: false; reason: string};

/**
 * The one rule for applying packs. Cosmetic changes may touch a running career because the
 * simulation never reads them. Stats only enter through a brand-new career, never mid-season.
 */
export function planRosterApplication(roster: ResolvedRoster, target: RosterTarget): RosterApplication {
  if (target === 'NEW_CAREER') return {ok: true, display: roster, newCareer: roster};
  if (roster.type === 'full') return {ok: false, reason:
    'Full packs change driver stats, so they can only be used when starting a new career. You can still apply its names and colours to this career.'};
  return {ok: true, display: cosmeticOnly(roster), newCareer: null};
}
