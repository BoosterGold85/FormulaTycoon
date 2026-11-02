import {SAVE_V6} from './contracts';
import {validateUniverseV6} from './contracts/validationV6';
import {object,number,saveId,text,timestamp,requireValid} from './validation';

/** Released V6 envelope boundary. Kept apart from V1-V5 source validation, which must cold-load without
 * live registries; V6's released semantics read the append-only static calendar registry. */
export function assertHistoricalSaveV6(input:unknown):void {
 object({saveVersion:number(6,6,true),gameVersion:text,saveId,createdAt:timestamp,updatedAt:timestamp,
  universe:v=>validateUniverseV6(v,SAVE_V6)})(input,'save.v6');
 const raw=input as {createdAt:string;updatedAt:string};
 requireValid(Date.parse(raw.createdAt)<=Date.parse(raw.updatedAt),'save.timestamps');
}
