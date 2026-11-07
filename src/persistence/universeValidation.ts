import type {GameDefinition,GameUniverse} from '../simulation/universe';
import {releasedContentFor} from './contracts';
import {validateUniverseV5} from './contracts/validationV5';
import {validateDevelopmentRulesV7} from './developmentRulesValidation';
import {validateQualifyingState} from './qualifyingValidation';
import {requireValid} from './validation';

/** V8 = V7 structure (development rules 1/2/3) + Qualifying V1 state. Qualifying is validated on its
 * own and removed before the frozen shared structural rules run on the rest. */
export function validateUniverse(input:unknown,definition:GameDefinition):asserts input is GameUniverse {
 requireValid(input&&typeof input==='object'&&!Array.isArray(input),'universe');
 const raw=input as Record<string,unknown>;
 requireValid(raw.definitionVersion===definition.version,'universe.definitionVersion');
 const {qualifying:_qualifying,...rest}=raw;
 const projection=validateDevelopmentRulesV7(rest,definition);
 validateUniverseV5(projection,releasedContentFor(definition.version));
 validateQualifyingState(raw,definition);
}
