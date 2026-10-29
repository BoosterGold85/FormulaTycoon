import {
  PACE_WEIGHTS,
  PART_CONTRIBUTIONS,
  type CarAttribute,
  type GrandPrix,
  type PartId,
  type TeamDevelopmentProfile
} from '../../game/development';
import type { TeamDevelopmentState } from './types';

export type CarProfile = {
  attributes: Record<CarAttribute, number>;
  /** Weighted lap-time strength, 0-100. */
  pace: number;
  /** 0-100; the weakest part drags this down. */
  reliability: number;
};

/** Bonus applied when a matching circuit package is available. */
const PACKAGE_BONUS = { dragEfficiency: 3, cooling: 6 } as const;

/**
 * Translates part ratings into car characteristics. Pass an event to include
 * circuit-specific packages and the circuit's demands.
 */
export function computeCarProfile(
  team: TeamDevelopmentState,
  profile: TeamDevelopmentProfile,
  event?: GrandPrix
): CarProfile {
  const attributes = { power: profile.powerUnit.rating } as Record<CarAttribute, number>;
  for (const [attribute, weights] of Object.entries(PART_CONTRIBUTIONS)) {
    let value = 0;
    for (const [partId, weight] of Object.entries(weights)) {
      value += team.parts[partId as PartId].rating * (weight ?? 0);
    }
    attributes[attribute as CarAttribute] = value;
  }

  if (event?.downforce === 'LOW' && team.circuitPackages.includes('LOW_DRAG')) {
    attributes.dragEfficiency += PACKAGE_BONUS.dragEfficiency;
  }
  if (event?.hot && team.circuitPackages.includes('HIGH_COOLING')) {
    attributes.cooling += PACKAGE_BONUS.cooling;
  }

  const weights = event ? circuitWeights(event) : PACE_WEIGHTS;
  let pace = 0;
  for (const attribute of Object.keys(weights) as CarAttribute[]) {
    pace += attributes[attribute] * weights[attribute];
  }

  const reliabilities = Object.values(team.parts).map(part => part.reliability);
  const mean = reliabilities.reduce((sum, value) => sum + value, 0) / reliabilities.length;
  // Hot races punish poor cooling.
  const heatPenalty = event?.hot ? Math.max(0, 75 - attributes.cooling) * 0.2 : 0;
  const reliability = 0.7 * mean + 0.3 * Math.min(...reliabilities) - heatPenalty;

  return { attributes, pace, reliability: Math.max(0, reliability) };
}

/** Low-downforce tracks reward efficiency and power; high-downforce tracks reward load and grip. */
export function circuitWeights(event: GrandPrix): Record<CarAttribute, number> {
  const shift = event.downforce === 'LOW' ? -0.08 : event.downforce === 'HIGH' ? 0.08 : 0;
  return {
    ...PACE_WEIGHTS,
    downforce: PACE_WEIGHTS.downforce + shift,
    mechanicalGrip: PACE_WEIGHTS.mechanicalGrip + shift / 2,
    dragEfficiency: PACE_WEIGHTS.dragEfficiency - shift / 2,
    power: PACE_WEIGHTS.power - shift
  };
}
