import type {GameDefinition} from '../../simulation/universe/types';
import {validateDevelopmentRulesV6} from '../developmentRulesValidation';
import {requireValid} from '../validation';
import type {ReleasedContent} from './index';
import {validateUniverseV5} from './validationV5';

/** Released V6 universe semantics (Weekly Development Loop V1): rules 1/2 identity, rules-2 project
 * fields and real-weekend submissions, validated against the FROZEN v6 content snapshot. */
export function validateUniverseV6(input:unknown,content:ReleasedContent):void {
 requireValid(input&&typeof input==='object'&&!Array.isArray(input),'universe');
 const raw=input as Record<string,unknown>;
 requireValid(raw.definitionVersion===content.definition.version,'universe.definitionVersion');
 validateUniverseV5(validateDevelopmentRulesV6(raw,content.definition as GameDefinition),content);
}
