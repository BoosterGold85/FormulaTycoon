import {SAVE_V7} from './contracts';
import {validateUniverseV7} from './contracts/validationV7';
import {object,number,saveId,text,timestamp,requireValid} from './validation';

/** Released V7 envelope boundary (frozen v7 content and semantics). */
export function assertHistoricalSaveV7(input:unknown):void {
 object({saveVersion:number(7,7,true),gameVersion:text,saveId,createdAt:timestamp,updatedAt:timestamp,
  universe:v=>validateUniverseV7(v,SAVE_V7)})(input,'save.v7');
 const raw=input as {createdAt:string;updatedAt:string};
 requireValid(Date.parse(raw.createdAt)<=Date.parse(raw.updatedAt),'save.timestamps');
}
