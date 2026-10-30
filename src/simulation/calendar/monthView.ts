import {calendarById} from '../../game/calendar';
import {addCampaignDays,compareCampaignDates,parseCampaignDate,weekday} from '../campaignTime';
import type {GameUniverse} from '../universe/types';
import {calendarEventViews} from './index';

/** Read-only calendar projection. Browsing a month never advances or processes the career. */
export function selectCalendarMonth(universe:Pick<GameUniverse,'calendarId'|'currentDate'>,month:number){
 const calendar=calendarById(universe.calendarId);
 if(!Number.isInteger(month)||month<1||month>12)throw new Error('Invalid calendar month');
 const first=parseCampaignDate(`${calendar.season}-${String(month).padStart(2,'0')}-01`);
 const offset=['Monday','Tuesday','Wednesday','Thursday','Friday','Saturday','Sunday'].indexOf(weekday(first));
 const events=calendarEventViews(calendar,universe.currentDate);
 const monthEvents=events.filter(e=>Number(e.weekendStartDate.slice(5,7))===month||Number(e.raceDate.slice(5,7))===month);
 let count=31;
 while(count>28){try{parseCampaignDate(`${calendar.season}-${String(month).padStart(2,'0')}-${count}`);break;}catch{count--;}}
 const cells=Array.from({length:42},(_,index)=>{
  const day=index-offset+1;if(day<1||day>count)return null;
  const date=addCampaignDays(first,day-1);
  const event=monthEvents.find(e=>compareCampaignDates(e.weekendStartDate,date)<=0&&compareCampaignDates(date,e.raceDate)<=0)??null;
  return {day,date,current:date===universe.currentDate,event};
 });
 return {season:calendar.season,month,cells,events:monthEvents};
}
