import type { GrandPrix } from './types';

type Entry = [id: string, name: string, downforce: GrandPrix['downforce'], hot?: boolean];

const ENTRIES: Entry[] = [
  ['BHR', 'Bahrain GP', 'MEDIUM', true],
  ['SAU', 'Saudi Arabian GP', 'LOW', true],
  ['AUS', 'Australian GP', 'MEDIUM'],
  ['JPN', 'Japanese GP', 'HIGH'],
  ['CHN', 'Chinese GP', 'MEDIUM'],
  ['MIA', 'Miami GP', 'MEDIUM', true],
  ['EMI', 'Emilia-Romagna GP', 'MEDIUM'],
  ['MON', 'Monaco GP', 'HIGH'],
  ['CAN', 'Canadian GP', 'LOW'],
  ['ESP', 'Spanish GP', 'HIGH'],
  ['AUT', 'Austrian GP', 'MEDIUM'],
  ['GBR', 'British GP', 'HIGH'],
  ['HUN', 'Hungarian GP', 'HIGH', true],
  ['BEL', 'Belgian GP', 'LOW'],
  ['NED', 'Dutch GP', 'HIGH'],
  ['ITA', 'Italian GP', 'LOW'],
  ['AZE', 'Azerbaijan GP', 'LOW'],
  ['SGP', 'Singapore GP', 'HIGH', true],
  ['USA', 'United States GP', 'MEDIUM'],
  ['MEX', 'Mexico City GP', 'HIGH'],
  ['BRA', 'Sao Paulo GP', 'MEDIUM'],
  ['LVG', 'Las Vegas GP', 'LOW'],
  ['QAT', 'Qatar GP', 'HIGH', true],
  ['ABU', 'Abu Dhabi GP', 'MEDIUM']
];

/** A 24-race season. Weeks follow a realistic rhythm with a summer break. */
const WEEKS = [10, 12, 14, 15, 17, 18, 20, 21, 23, 24, 26, 27, 29, 34, 35, 36, 38, 39, 42, 43, 45, 46, 48, 49];

export const GRAND_PRIX_CALENDAR: GrandPrix[] = ENTRIES.map(([id, name, downforce, hot], index) => ({
  id,
  name,
  week: WEEKS[index]!,
  downforce,
  hot: hot ?? false
}));
