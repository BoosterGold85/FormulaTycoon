import {validateDatedUniverseV4} from './datedValidationV4';
import type {ReleasedContent} from './index';
import {isReleasedCalendarId} from '../../game/calendar/releasedIds';
import {requireValid} from '../validation';

/** Released V5 universe semantics: one static calendar identity over the frozen dated V4 structure.
 * V6 reuses this for the structure it shares; V5 source saves validate with SAVE_V5 content. */
export function validateUniverseV5(input:unknown,content:ReleasedContent):void {
 requireValid(input&&typeof input==='object'&&!Array.isArray(input),'universe');
 const {calendarId,...dated}=input as Record<string,unknown>;
 requireValid(dated.definitionVersion===content.definition.version,'universe.definitionVersion');
 requireValid(isReleasedCalendarId(calendarId),'universe.calendarId');
 validateDatedUniverseV4(dated,content);
}
