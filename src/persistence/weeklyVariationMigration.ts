import type {GameUniverse} from '../simulation/universe';
import {SAVE_V6,SAVE_V7} from './contracts';
import {validateUniverseV6} from './contracts/validationV6';

/** V6 -> V7 after frozen V6 validation: identity only. The career KEEPS its development rules (1 or 2),
 * so released careers never gain weekly variation retroactively. New careers start on rules 3. */
export function migrateWeeklyVariationUniverse(input:unknown):GameUniverse {
 validateUniverseV6(input,SAVE_V6);
 const old=JSON.parse(JSON.stringify(input)) as GameUniverse;
 return {...old,definitionVersion:SAVE_V7.definition.version};
}
