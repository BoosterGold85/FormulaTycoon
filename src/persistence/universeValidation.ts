import type {GameDefinition,GameUniverse} from '../simulation/universe';
import {releasedContentFor} from './contracts';
import {validateDatedUniverseV4} from './contracts/datedValidationV4';
import {isReleasedCalendarId} from '../game/calendar/releasedIds';
import {requireValid} from './validation';

/** V5 adds exactly one static-content identity, never a second campaign clock. */
export function validateUniverse(input:unknown,definition:GameDefinition):asserts input is GameUniverse {
 requireValid(input&&typeof input==='object'&&!Array.isArray(input),'universe');
 const {calendarId,...dated}=input as Record<string,unknown>;
 requireValid(dated.definitionVersion===definition.version,'universe.definitionVersion');
 requireValid(isReleasedCalendarId(calendarId),'universe.calendarId');
 validateDatedUniverseV4(dated,releasedContentFor(definition.version));
}
