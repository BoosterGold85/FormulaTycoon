import {calendarYear,daysBetween,parseCampaignDate} from '../campaignTime/date';
import {TECHNICAL_AXES,type CalendarDefinition} from '../../game/calendar/types';

/** Content-authoring boundary. Unknown/invalid data never becomes a playable calendar. */
export function validateCalendarDefinition(input:unknown):asserts input is CalendarDefinition {
 const assert=(ok:unknown,field:string)=>{if(!ok)throw new Error(`Invalid calendar: ${field}`);};
 const c=input as CalendarDefinition;
 assert(c&&typeof c==='object'&&!Array.isArray(c),'object');
 assert(typeof c.id==='string'&&/^calendar\.\d{4}\.v\d+$/.test(c.id),'id');
 assert(Number.isInteger(c.season)&&c.season>=2026&&c.season<=9999,'season');
 assert(typeof c.profileVersion==='string'&&c.profileVersion.length>0,'profileVersion');
 assert(c.tracks&&typeof c.tracks==='object'&&!Array.isArray(c.tracks),'tracks');
 const unit=(v:unknown)=>typeof v==='number'&&Number.isFinite(v)&&v>=0&&v<=1;
 for(const [id,t] of Object.entries(c.tracks)){
  assert(t&&typeof t==='object'&&t.id===id&&/^track\.[a-z_]+$/.test(id),'track identity');
  assert(typeof t.name==='string'&&t.name.length>0&&typeof t.country==='string'&&t.country.length>0,'track name');
  assert(['STREET','PERMANENT','HYBRID'].includes(t.type),'track type');
  assert(t.demands&&Object.keys(t.demands).length===TECHNICAL_AXES.length&&TECHNICAL_AXES.every(k=>unit(t.demands[k])),'demands');
  assert(TECHNICAL_AXES.reduce((sum,k)=>sum+t.demands[k],0)>0,'empty demands');
  assert(t.packageContext&&['LOW','MEDIUM','HIGH'].includes(t.packageContext.downforce)&&typeof t.packageContext.hot==='boolean','packages');
  const m=t.metadata;
  assert(m&&['overtakingDifficulty','qualifyingImportance','safetyCarTendency','tyreSeverity','kerbSeverity','trackEvolution'].every(k=>unit(m[k as keyof typeof m])),'metadata');
  assert(m.altitudeM===null||(Number.isFinite(m.altitudeM)&&m.altitudeM>=-500&&m.altitudeM<=5000),'altitude');
  assert(typeof m.night==='boolean'&&['LOW','MEDIUM','HIGH'].includes(m.rainTendency),'conditions');
  assert(['INITIAL','PROVISIONAL'].includes(t.profileStatus)&&typeof t.rationale==='string'&&t.rationale.length>0,'rationale');
 }
 assert(Array.isArray(c.events)&&c.events.length>0,'events');
 const ids=new Set<string>();const usedTracks=new Set<string>();
 for(const [index,e] of c.events.entries()){
  assert(e&&typeof e==='object'&&typeof e.id==='string'&&e.id.startsWith(`event.${c.season}.`)&&!ids.has(e.id),'event id');ids.add(e.id);
  assert(e.round===index+1,'round/order');
  assert(Object.hasOwn(c.tracks,e.trackId),'track reference');usedTracks.add(e.trackId);
  const start=parseCampaignDate(e.weekendStartDate),end=parseCampaignDate(e.raceDate);
  assert(calendarYear(start)===c.season&&calendarYear(end)===c.season&&daysBetween(start,end)===2,'weekend dates');
  assert(index===0||daysBetween(c.events[index-1]!.raceDate,start)>0,'overlap/order');
  assert(typeof e.sprint==='boolean','sprint');
 }
 assert(usedTracks.size===Object.keys(c.tracks).length,'unused track');
}
