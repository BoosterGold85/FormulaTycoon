import {TECHNICAL_AXES,type CircuitDefinition,type TechnicalAxis} from '../../game/calendar/types';
import type {Driver} from '../../game/drivers/types';
import {computeCarProfile} from '../development';
import {carCompatibility} from '../drivers/carFit';
import {technicalPerformanceAtTrack} from '../trackPerformance';
import type {GameDefinition,GameUniverse} from '../universe/types';

/**
 * One-lap car pace at this circuit, 0..100, read ONCE from the canonical session boundary
 * (fitted parts, circuit package context). Demand-weighted like suitability, but reliability and
 * cooling stay hazard capabilities, never generic speed. No track/team ID enters the math.
 */
const PACE_AXES = TECHNICAL_AXES.filter(a => a !== 'reliability' && a !== 'cooling') as TechnicalAxis[];
export function carPace(universe: GameUniverse, definition: GameDefinition, teamId: string, track: CircuitDefinition): number {
  const {car} = technicalPerformanceAtTrack(universe, definition, teamId, track);
  let total = 0, weighted = 0;
  for (const axis of PACE_AXES) { const w = track.demands[axis] ** 3; total += w; weighted += w * car.values[axis]; }
  return total > 0 ? weighted / total : 50;
}

/** Seconds per car-pace point and per driver-pace point (provisional game weights: the car dominates). */
export const CAR_SECONDS = 0.11;
export const DRIVER_SECONDS = 0.012;

/** Dry one-lap driver level: talent, the Qualifying Specialist trait, form/confidence and comfort with this car. */
export function driverPace(driver: Driver, universe: GameUniverse, definition: GameDefinition, teamId: string): number {
  const team = universe.development.teams[teamId]!, profile = definition.development.teams.find(t => t.id === teamId)!;
  const comfort = carCompatibility(driver, computeCarProfile(team, profile));
  return driver.ability.talent + (driver.traits.includes('Qualifying Specialist') ? 3 : 0)
    + (driver.dynamic.form - 50) * 0.06 + (driver.dynamic.confidence - 65) * 0.03
    + (comfort === 'Comfortable' ? 0 : comfort === 'Adapting' ? -4 : -10);
}
/** Extra seconds in the wet: adaptability and the Wet Weather Specialist trait. */
export function wetSkillPenalty(driver: Driver, wet: number): number {
  if (wet <= 0) return 0;
  return wet * ((85 - driver.ability.adaptability) * 0.02 - (driver.traits.includes('Wet Weather Specialist') ? 0.25 : 0));
}
