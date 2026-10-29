import type {GameUniverse} from '../simulation/universe/types';
import type {DatedUniverseV4} from './contracts/preCalendarTypes';
import {SAVE_V4,SAVE_V5} from './contracts';
import {validateDatedUniverseV4} from './contracts/datedValidationV4';

/** Only after frozen V4 validation: attach released content, preserve all dated/earned state. */
export function migrateCalendarUniverse(input:unknown):GameUniverse {
 validateDatedUniverseV4(input,SAVE_V4);
 const old=JSON.parse(JSON.stringify(input)) as DatedUniverseV4;
 return {...old,definitionVersion:SAVE_V5.definition.version,calendarId:SAVE_V5.calendarId!};
}
