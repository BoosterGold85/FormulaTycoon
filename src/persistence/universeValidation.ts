import type {GameDefinition,GameUniverse} from '../simulation/universe';
import {releasedContentFor} from './contracts';
import {validateUniverseV5} from './contracts/validationV5';
import {validateDevelopmentRulesV6} from './developmentRulesValidation';
import {requireValid} from './validation';

/** V6 = V5 structure + per-career development rules + rules-2 project decisions/fitting records. */
export function validateUniverse(input:unknown,definition:GameDefinition):asserts input is GameUniverse {
 requireValid(input&&typeof input==='object'&&!Array.isArray(input),'universe');
 const raw=input as Record<string,unknown>;
 requireValid(raw.definitionVersion===definition.version,'universe.definitionVersion');
 const projection=validateDevelopmentRulesV6(raw,definition);
 validateUniverseV5(projection,releasedContentFor(definition.version));
}
