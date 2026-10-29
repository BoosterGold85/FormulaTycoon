import { SAVE_V1, SAVE_V2, SAVE_V3 } from './contracts';
import { validateReleasedUniverse } from './contracts/preCalendarValidation';
import { object, number, saveId, text, timestamp, requireValid } from './validation';

/** Source-version boundary for migrations, including the future explicit v3 -> v4 step. */
export function assertHistoricalSave(input: unknown, version: 1 | 2 | 3): void {
  const contract = version === 1 ? SAVE_V1 : version === 2 ? SAVE_V2 : SAVE_V3;
  object({saveVersion:number(version,version,true),gameVersion:text,saveId,createdAt:timestamp,updatedAt:timestamp,
    universe:v=>validateReleasedUniverse(v,contract)})(input,`save.v${version}`);
  const raw = input as {createdAt:string;updatedAt:string};
  requireValid(Date.parse(raw.createdAt) <= Date.parse(raw.updatedAt), 'save.timestamps');
}
