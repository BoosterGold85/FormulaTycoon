import type {GameDefinition,GameUniverse} from '../simulation/universe';
import {releasedContentFor} from './contracts';
import {validateUniverseV5} from './contracts/validationV5';
import {validateDevelopmentRulesV7} from './developmentRulesValidation';
import {requireValid} from './validation';

/** V7 = V6 structure + development rules 3 (passive weekly variation; no new project fields). */
export function validateUniverse(input:unknown,definition:GameDefinition):asserts input is GameUniverse {
 requireValid(input&&typeof input==='object'&&!Array.isArray(input),'universe');
 const raw=input as Record<string,unknown>;
 requireValid(raw.definitionVersion===definition.version,'universe.definitionVersion');
 const projection=validateDevelopmentRulesV7(raw,definition);
 validateUniverseV5(projection,releasedContentFor(definition.version));
}
