import type {GameDefinition} from '../../simulation/universe/types';
import {validateDevelopmentRulesV7} from '../developmentRulesValidation';
import {requireValid} from '../validation';
import type {ReleasedContent} from './index';
import {validateUniverseV5} from './validationV5';

/** Released V7 universe semantics (Core Gameplay Feel V2): rules 1/2/3, no qualifying state,
 * validated against the FROZEN v7 content snapshot. */
export function validateUniverseV7(input:unknown,content:ReleasedContent):void {
 requireValid(input&&typeof input==='object'&&!Array.isArray(input),'universe');
 const raw=input as Record<string,unknown>;
 requireValid(raw.definitionVersion===content.definition.version,'universe.definitionVersion');
 validateUniverseV5(validateDevelopmentRulesV7(raw,content.definition as GameDefinition),content);
}
