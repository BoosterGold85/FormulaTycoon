import {addCampaignDays,campaignContext,compareCampaignDates,nextCampaignDate,type CampaignDate} from '../campaignTime';
import {calendarById} from '../../game/calendar';
import {usesRaceWeekends,type GameUniverse} from './types';
import {qualifyingDate} from '../qualifying/campaign';

/** Transient work instructions, not saved session/results or a second campaign clock. */
export type CampaignEventKind='DEVELOPMENT_WEEK'|'SEASON_TRANSITION'|'DEVELOPMENT_FITTING'|'QUALIFYING'|'QUALIFYING_CLOSE'|'CONTRACT_STATUS_CHECK';
export type CampaignEvent={id:string;date:CampaignDate;kind:CampaignEventKind;eventId?:string};

// Preserve the released development-before-contract ordering. New timed systems must choose
// an explicit priority here, not rely on object iteration or handler registration order.
// Rules-2 race-weekend fitting (FP1, a Friday in every released event) sits between them.
// Qualifying (Saturday) and its close (Sunday) follow fitting and precede contract checks.
const PRIORITY:Record<CampaignEventKind,number>={DEVELOPMENT_WEEK:10,SEASON_TRANSITION:10,DEVELOPMENT_FITTING:15,QUALIFYING:16,QUALIFYING_CLOSE:17,CONTRACT_STATUS_CHECK:20};
export function compareCampaignEvents(a:CampaignEvent,b:CampaignEvent):number {
 return compareCampaignDates(a.date,b.date)||PRIORITY[a.kind]-PRIORITY[b.kind]||(a.id<b.id?-1:a.id>b.id?1:0);
}

/** All current work in (currentDate, target], processed when ENTERING each date.
 * Both released calendars use the frozen March-2/completed-week bridge. Contract checks
 * remain daily, including the day AFTER an inclusive option deadline. Qualifying runs only for careers
 * that carry qualifying state (save v8); no session is invented for older careers.
 * Recompute after loading: currentDate is the processed-through watermark, not a saved queue.
 */
export function dueCampaignEvents(universe:Pick<GameUniverse,'currentDate'|'drivers'>&Partial<Pick<GameUniverse,'developmentRules'|'calendarId'|'qualifying'>>,target:CampaignDate):CampaignEvent[] {
 const weekends=usesRaceWeekends(universe.developmentRules)&&universe.calendarId?calendarById(universe.calendarId).events:[];
 const sessions=universe.qualifying&&universe.drivers&&universe.calendarId?calendarById(universe.calendarId).events:[];
 nextCampaignDate(universe.currentDate,target);
 if(target===universe.currentDate)return [];
 const events:CampaignEvent[]=[];
 for(let date=addCampaignDays(universe.currentDate,1);;date=addCampaignDays(date,1)){
  const before=campaignContext(addCampaignDays(date,-1)),after=campaignContext(date);
  if(after.season!==before.season)events.push({id:`season:${after.season}`,date,kind:'SEASON_TRANSITION'});
  else if(after.week!==before.week)events.push({id:`development:${after.seasonIndex}:${after.week}`,date,kind:'DEVELOPMENT_WEEK'});
  for(const weekend of weekends)if(weekend.weekendStartDate===date)events.push({id:`fitting:${universe.calendarId}:${weekend.id}`,date,kind:'DEVELOPMENT_FITTING',eventId:weekend.id});
  for(const weekend of sessions){
   const saturday=qualifyingDate(weekend);
   if(saturday===date)events.push({id:`qualifying:${universe.calendarId}:${weekend.id}`,date,kind:'QUALIFYING',eventId:weekend.id});
   if(addCampaignDays(saturday,1)===date)events.push({id:`qualifying-close:${universe.calendarId}:${weekend.id}`,date,kind:'QUALIFYING_CLOSE',eventId:weekend.id});
  }
  if(universe.drivers)events.push({id:`contracts:${date}`,date,kind:'CONTRACT_STATUS_CHECK'});
  if(date===target)break;
 }
 return events.sort(compareCampaignEvents);
}
