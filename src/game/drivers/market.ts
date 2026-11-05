import { seedFromRoster, type DriverSeed } from './grid';
import { DEFAULT_ROSTER } from '../roster';
/** Free agents from the default fictional roster pack: slots 1-10 prospects, 11-21 reserves. */
export const MARKET: DriverSeed[] = DEFAULT_ROSTER.drivers.filter(d => d.group === 'freeAgent').map(d => seedFromRoster(d));
