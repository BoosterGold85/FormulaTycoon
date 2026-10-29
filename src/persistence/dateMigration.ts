import type { GameUniverse as HistoricalUniverse } from './contracts/preCalendarTypes';
import type { GameUniverse } from '../simulation/universe/types';
import {legacyWeekDate} from '../simulation/campaignTime/calendarPolicyV4';
import {SAVE_V4} from './contracts';

/** Called only after full frozen source validation. Existing progress determines the date. */
export function migrateV3Universe(input:HistoricalUniverse):GameUniverse {
 const old=JSON.parse(JSON.stringify(input)) as HistoricalUniverse;
 const {season,week,...development}=old.development;
 const {drivers:previous,...root}=old;
 let drivers:GameUniverse['drivers'];
 if(previous){
  const {season:_season,week:_week,contracts,...state}=previous;
  drivers={...state,contracts:contracts.map(c=>{
   if(!c.option)return {...c,option:null};
   const {deadlineSeason,deadlineWeek,...option}=c.option;
   return {...c,option:{...option,decisionDate:legacyWeekDate(deadlineSeason-2025,deadlineWeek)}};
  }) as NonNullable<GameUniverse['drivers']>['contracts']};
 }
 return {...root,definitionVersion:SAVE_V4.definition.version,currentDate:legacyWeekDate(season,week),development,...(drivers?{drivers}:{})};
}
