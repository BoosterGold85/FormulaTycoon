import type {DatedUniverseV4} from './preCalendarTypes';
import type {ReleasedContent} from './index';
import {validateReleasedUniverse} from './preCalendarValidation';
import {parseCampaignDate,deadlinePassed} from '../../simulation/campaignTime/date';
import {campaignContext} from '../../simulation/campaignTime/calendarPolicyV4';
import {object,number,choice,requireValid} from '../validation';

/** Strict v4 input -> non-persisted dated projection for unchanged content/structural checks. */
export function validateDatedUniverseV4(input:unknown,content:ReleasedContent):asserts input is DatedUniverseV4 {
 const definition=content.definition;
 requireValid(input&&typeof input==='object'&&!Array.isArray(input),'universe');
 const raw=input as Record<string,any>;
 requireValid(raw.definitionVersion===definition.version,'universe.definitionVersion');
 const date=parseCampaignDate(raw.currentDate),time=campaignContext(date);
 const {currentDate:_date,...root}=raw;
 requireValid(root.development&&typeof root.development==='object'&&!Array.isArray(root.development),'development');
 requireValid(!Object.hasOwn(root.development,'season')&&!Object.hasOwn(root.development,'week'),'development.clock');
 const development={...root.development,season:time.seasonIndex,week:time.week};
 let drivers:Record<string,unknown>|undefined;
 if(Object.hasOwn(root,'drivers')){
  const state=root.drivers;
  requireValid(state&&typeof state==='object'&&!Array.isArray(state),'drivers');
  requireValid(!Object.hasOwn(state,'season')&&!Object.hasOwn(state,'week'),'drivers.clock');
  requireValid(Array.isArray(state.contracts),'drivers.contracts');
  const contracts=state.contracts.map((c:any)=>{
   requireValid(c&&typeof c==='object','contract');
   if(!c.option)return c;
   object({season:number(2026,9999,true),decisionDate:v=>{parseCampaignDate(v);},salaryM:number(0,250),state:choice(['PENDING','EXERCISED','DECLINED','LAPSED'])})(c.option,'option');
   const {decisionDate,...option}=c.option;
   const deadline=campaignContext(parseCampaignDate(decisionDate));
   requireValid(option.state!=='PENDING'||!deadlinePassed(date,decisionDate),'option.deadline');
   return {...c,option:{...option,deadlineSeason:deadline.season,deadlineWeek:deadline.week}};
  });
  drivers={...state,contracts,season:time.season,week:time.week};
 }
 validateReleasedUniverse({...root,development,...(drivers?{drivers}:{})},content);
}
