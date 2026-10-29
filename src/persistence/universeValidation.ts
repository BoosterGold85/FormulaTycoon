import type {GameDefinition,GameUniverse} from '../simulation/universe';
import {releasedContentFor,SAVE_V5} from './contracts';
import {validateDatedUniverseV4} from './contracts/datedValidationV4';
import {requireValid} from './validation';

/** V5 adds exactly one static-content identity, never a second campaign clock. */
export function validateUniverse(input:unknown,definition:GameDefinition):asserts input is GameUniverse {
 requireValid(input&&typeof input==='object'&&!Array.isArray(input),'universe');
 const {calendarId,...dated}=input as Record<string,unknown>;
 requireValid(dated.definitionVersion===definition.version,'universe.definitionVersion');
 requireValid(calendarId===SAVE_V5.calendarId,'universe.calendarId');
 validateDatedUniverseV4(dated,releasedContentFor(definition.version));
}
