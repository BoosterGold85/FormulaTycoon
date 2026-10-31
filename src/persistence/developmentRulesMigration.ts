import type {GameUniverse} from '../simulation/universe';
import {SAVE_V5,SAVE_V6} from './contracts';
import {validateUniverseV5} from './contracts/validationV5';

/** V5 -> V6 after frozen V5 validation: identity + development rules 1. Every earned project,
 * submission, date, contract and RNG identity is preserved; released cadence is NOT retimed. */
export function migrateDevelopmentRulesUniverse(input:unknown):GameUniverse {
 validateUniverseV5(input,SAVE_V5);
 const old=JSON.parse(JSON.stringify(input)) as Omit<GameUniverse,'developmentRules'>;
 return {...old,definitionVersion:SAVE_V6.definition.version,developmentRules:1};
}
