import { SAVE_V1, SAVE_V2, SAVE_V3, SAVE_V4 } from './contracts';
import {validateDatedUniverseV4} from './contracts/datedValidationV4';
import { validateReleasedUniverse } from './contracts/preCalendarValidation';
import { object, number, saveId, text, timestamp, requireValid } from './validation';

/** Source-version boundary for migrations, including the explicit v3 -> v4 -> v5 chain. */
export function assertHistoricalSave(input: unknown, version: 1 | 2 | 3 | 4): void {
  const contract = version === 1 ? SAVE_V1 : version === 2 ? SAVE_V2 : version === 3 ? SAVE_V3 : SAVE_V4;
  object({saveVersion:number(version,version,true),gameVersion:text,saveId,createdAt:timestamp,updatedAt:timestamp,
    universe:v=>version===4?validateDatedUniverseV4(v,contract):validateReleasedUniverse(v,contract)})(input,`save.v${version}`);
  const raw = input as {createdAt:string;updatedAt:string};
  requireValid(Date.parse(raw.createdAt) <= Date.parse(raw.updatedAt), 'save.timestamps');
}
