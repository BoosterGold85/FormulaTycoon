import type {PartDefinition,TeamDevelopmentProfile} from '../../game/development';
import type {DevelopmentProject,ProjectStage} from '../development';
import {clamp} from '../development/random';
import {randomFor} from '../randomStreams';

/**
 * Development rules 3: passive weekly variation. Each non-READY project's week is NORMAL most of the
 * time, sometimes a little better/worse, occasionally a setback or breakthrough and rarely a stall or
 * major breakthrough. Seeded from its own new namespace ('development-week'), keyed by project, stage
 * and the processed week, so it is drawn once per week, never consumes another stream, and can be
 * recomputed for presentation. Effects only touch EXISTING authoritative paths:
 * - speed: a scale on that week's stage work inside the unchanged kernel work rule;
 * - quality: project bonusPoints, read by the existing fitting/outcome model (capped at +/-25%).
 */
export type WeekKind = 'NORMAL' | 'MINOR_UP' | 'MINOR_DOWN' | 'SETBACK' | 'STALL' | 'BREAKTHROUGH' | 'MAJOR_BREAKTHROUGH';
export type WeekVariation = {
  kind: WeekKind;
  /** Multiplier on this week's stage work after any decision delay (1 = the expected rate). */
  scale: number;
  /** Quality bonus points added to the project (PERFORMANCE work only). */
  bonus: number;
  /** Department quality 0-1 that shaped the odds (facilities for research/manufacturing, staff for design). */
  quality: number;
  /** Workday (0 = Monday) the swing becomes visible in the replay. Presentation detail from the same draw. */
  day: number;
};
export const NORMAL_WEEK: WeekVariation = { kind: 'NORMAL', scale: 1, bonus: 0, quality: 0.5, day: 2 };

/** Organization quality for the department doing this stage. Uses existing profile data only. */
export function departmentQuality(profile: TeamDevelopmentProfile, part: PartDefinition, stage: Exclude<ProjectStage, 'READY'>): number {
  const f = profile.facilities;
  if (stage === 'RESEARCH') return clamp((part.researchMethod === 'WIND_TUNNEL' ? (f.windTunnel + f.cfd) / 2 : f.rig) / 5, 0, 1);
  if (stage === 'MANUFACTURING') return clamp(f.manufacturing / 5, 0, 1);
  const staff = part.area === 'AERO' ? profile.staff.aero : profile.staff.vehicleDynamics;
  return clamp((staff - 60) / 35, 0, 1);
}

/** Probabilities (better departments: fewer severe stalls, more and bigger breakthroughs). */
export function weekOdds(quality: number): Array<[WeekKind, number]> {
  const q = clamp(quality, 0, 1), weak = 1 - q;
  return [
    ['STALL', 0.03 + 0.04 * weak],
    ['SETBACK', 0.09 + 0.07 * weak],
    ['MINOR_DOWN', 0.14 + 0.04 * weak],
    ['MINOR_UP', 0.14 + 0.04 * q],
    ['BREAKTHROUGH', 0.06 + 0.05 * q],
    ['MAJOR_BREAKTHROUGH', 0.015 + 0.02 * q]
  ];
}

export function weekVariation(seed: number, profile: TeamDevelopmentProfile, project: DevelopmentProject, part: PartDefinition,
  season: number, week: number): WeekVariation {
  if (project.stage === 'READY') return { ...NORMAL_WEEK, quality: 1 };
  const stage = project.stage;
  const quality = departmentQuality(profile, part, stage);
  const random = randomFor(seed, 'development-week', project.id, stage, `${season}:${week}`);
  const roll = random.next(), size = random.next(), flavour = random.next();
  const day = 1 + Math.floor(random.next() * 3);
  let kind: WeekKind = 'NORMAL', cumulative = 0;
  for (const [candidate, p] of weekOdds(quality)) { cumulative += p; if (roll < cumulative) { kind = candidate; break; } }
  const performance = project.reason === 'PERFORMANCE';
  const concept = stage !== 'MANUFACTURING';
  let scale = 1, bonus = 0;
  switch (kind) {
    case 'STALL': scale = 0; if (performance && stage !== 'RESEARCH' && flavour < 0.4) bonus = -4; break;
    case 'SETBACK': scale = 0.25 + 0.2 * size; break;
    case 'MINOR_DOWN': scale = 0.8 + 0.1 * size; break;
    case 'MINOR_UP': scale = 1.1 + 0.1 * size; break;
    case 'BREAKTHROUGH':
      // Concept-stage breakthroughs are either faster OR better; workshop breakthroughs are speed.
      if (performance && concept && flavour < 0.5) { scale = 1.15 + 0.1 * size; bonus = 4; }
      else scale = 1.5 + 0.4 * quality + 0.1 * size;
      break;
    case 'MAJOR_BREAKTHROUGH': scale = 2.2 + 0.4 * quality; if (performance && concept) bonus = 6; break;
    default: break;
  }
  return { kind, scale, bonus, quality, day };
}
