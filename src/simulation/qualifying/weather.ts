import type {CircuitDefinition} from '../../game/calendar/types';
import {randomFor} from '../randomStreams';
import {SESSION_MINUTES,type Confidence,type Forecast,type Weather} from './types';

/** Chance that the weather changes during the session, by the circuit's authored tendency (provisional game weights). */
const CHANGE_CHANCE: Record<CircuitDefinition['metadata']['rainTendency'], number> = { LOW: 0.1, MEDIUM: 0.2, HIGH: 0.32 };
/** Above this wetness intermediates beat slicks. */
export const CROSSOVER = 0.34;

export function sessionWeather(seed: number, calendarId: string, eventId: string, track: CircuitDefinition): Weather {
  const rng = randomFor(seed, 'qualifying-weather', calendarId, eventId);
  if (rng.next() >= CHANGE_CHANCE[track.metadata.rainTendency]) return { kind: 'DRY', changeMinute: null };
  const kind = rng.next() < 0.6 ? 'RAIN' : 'DRYING';
  return { kind, changeMinute: rng.int(4, SESSION_MINUTES - 5) };
}

/** Track wetness 0..0.85 at a session minute. Rain soaks quickly; a wet track dries slowly. */
export function wetnessAt(weather: Weather, minute: number): number {
  if (weather.kind === 'DRY' || weather.changeMinute === null) return 0;
  const since = minute - weather.changeMinute;
  if (weather.kind === 'RAIN') return since < 0 ? 0 : Math.min(0.85, 0.12 + 0.09 * since);
  return since < 0 ? 0.7 : Math.max(0, 0.7 - 0.05 * since);
}

/** Research points at which forecast accuracy is about two thirds of the way to its ceiling. */
export const RESEARCH_SCALE = 160;
/** 0.35..0.9: research makes a team better informed, never certain. */
export function forecastAccuracy(researchPoints: number): number {
  return 0.35 + 0.55 * (1 - Math.exp(-Math.max(0, researchPoints) / RESEARCH_SCALE));
}
export const confidenceFor = (accuracy: number): Confidence => accuracy < 0.55 ? 'LOW' : accuracy < 0.75 ? 'MEDIUM' : 'HIGH';

const clampMinute = (m: number) => Math.max(0, Math.min(SESSION_MINUTES - 1, Math.round(m)));
/** Each team's own forecast stream; a wrong forecast misses or invents the change. */
export function teamForecast(seed: number, calendarId: string, eventId: string, teamId: string, actual: Weather, researchPoints: number): Forecast {
  const accuracy = forecastAccuracy(researchPoints), confidence = confidenceFor(accuracy);
  const rng = randomFor(seed, 'qualifying-forecast', calendarId, eventId, teamId);
  // Errors are asymmetric: a poorly informed team more often misses rain than invents it.
  const right = rng.next() >= (1 - accuracy) * (actual.kind === 'DRY' ? 0.45 : 0.8);
  const error = (rng.next() + rng.next() + rng.next() - 1.5) * 2;
  if (actual.kind === 'DRYING') {
    // A wet morning is plain to see; only the drying time is uncertain.
    return { kind: 'DRYING', changeMinute: clampMinute(actual.changeMinute! + error * (1 - accuracy) * (right ? 12 : 25)), confidence };
  }
  if (!right) {
    return actual.kind === 'RAIN' ? { kind: 'DRY', changeMinute: null, confidence }
      : { kind: 'RAIN', changeMinute: rng.int(4, SESSION_MINUTES - 5), confidence };
  }
  return actual.kind === 'DRY' ? { kind: 'DRY', changeMinute: null, confidence }
    : { kind: 'RAIN', changeMinute: clampMinute(actual.changeMinute! + error * (1 - accuracy) * 12), confidence };
}
