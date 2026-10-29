/** A game calendar date, never a wall-clock instant. No Date/Intl/locale/timezone APIs. */
declare const dateBrand: unique symbol;
export type CampaignDate = string & { readonly [dateBrand]: true };
const MONTHS=['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
const WEEKDAYS=['Monday','Tuesday','Wednesday','Thursday','Friday','Saturday','Sunday'];
const leap=(year:number)=>year%4===0&&(year%100!==0||year%400===0);
const monthDays=(y:number,m:number)=>[31,leap(y)?29:28,31,30,31,30,31,31,30,31,30,31][m-1]!;
export function parseCampaignDate(input:unknown):CampaignDate {
 if(typeof input!=='string'||!/^\d{4}-\d{2}-\d{2}$/.test(input))throw new Error('Invalid campaign date');
 const y=Number(input.slice(0,4)),m=Number(input.slice(5,7)),d=Number(input.slice(8,10));
 if(y<1||y>9999||m<1||m>12||d<1||d>monthDays(y,m))throw new Error('Invalid campaign date');
 return input as CampaignDate;
}
export const calendarYear=(date:CampaignDate)=>Number(parseCampaignDate(date).slice(0,4));
const yearDays=(year:number)=>365*(year-1)+Math.floor((year-1)/4)-Math.floor((year-1)/100)+Math.floor((year-1)/400);
function ordinal(date:CampaignDate):number {
 parseCampaignDate(date);const y=calendarYear(date),m=Number(date.slice(5,7)),d=Number(date.slice(8,10));
 let n=yearDays(y)+d-1;for(let month=1;month<m;month++)n+=monthDays(y,month);return n;
}
function fromOrdinal(value:number):CampaignDate {
 if(!Number.isSafeInteger(value)||value<0||value>=yearDays(10000))throw new Error('Campaign date outside supported range');
 let lo=1,hi=10000;while(lo+1<hi){const mid=Math.floor((lo+hi)/2);if(yearDays(mid)<=value)lo=mid;else hi=mid;}
 let rest=value-yearDays(lo),month=1;while(rest>=monthDays(lo,month)){rest-=monthDays(lo,month);month++;}
 return parseCampaignDate(`${String(lo).padStart(4,'0')}-${String(month).padStart(2,'0')}-${String(rest+1).padStart(2,'0')}`);
}
export function addCampaignDays(date:CampaignDate,days:number):CampaignDate {
 if(!Number.isSafeInteger(days))throw new Error('Days must be a safe integer');return fromOrdinal(ordinal(date)+days);
}
export const daysBetween=(from:CampaignDate,to:CampaignDate)=>ordinal(to)-ordinal(from);
export const compareCampaignDates=(a:CampaignDate,b:CampaignDate)=>Math.sign(daysBetween(b,a));
export const deadlinePassed=(date:CampaignDate,deadline:CampaignDate)=>compareCampaignDates(date,deadline)>0;
export const weekday=(date:CampaignDate)=>WEEKDAYS[ordinal(date)%7]!;
export const formatCampaignDate=(date:CampaignDate)=>{parseCampaignDate(date);return `${MONTHS[Number(date.slice(5,7))-1]} ${Number(date.slice(8,10))}, ${calendarYear(date)}`;};
