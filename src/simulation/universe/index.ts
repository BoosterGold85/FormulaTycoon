import {DEFAULT_CALENDAR_ID,calendarById} from '../../game/calendar';
import {createDriverWorld,refreshDriverStatuses} from '../drivers';
import {advanceDevelopmentWeek,createDevelopmentWorld,startNextSeason} from '../development';
import {advanceHeadquarters,createHeadquartersState} from '../headquarters';
import {NEW_CAREER_DATE,addCampaignDays,campaignContext,legacyWeekDate,nextCampaignDate,seasonStart,type CampaignDate} from '../campaignTime';
import {developmentState,developmentView} from '../campaignTime/developmentView';
import {dueCampaignEvents} from './campaignEvents';
import type {GameDefinition,GameUniverse} from './types';
export * from './types';

export function assertDefinition(universe:GameUniverse,definition:GameDefinition):void {
 if(universe.definitionVersion!==definition.version)throw new Error('Game definition mismatch: explicit content migration required');
}
export function createGameUniverse(definition:GameDefinition,seed:number):GameUniverse {
 if(!Number.isInteger(seed)||seed<0||seed>0xffffffff)throw new Error('Universe seed must be a uint32');
 const calendarId=definition.calendarId??DEFAULT_CALENDAR_ID;calendarById(calendarId);
 return {definitionVersion:definition.version,calendarId,currentDate:NEW_CAREER_DATE,seed,playerTeamId:definition.driverEra?'team.wellington':null,
  ...(definition.driverEra?{drivers:createDriverWorld(definition.driverDataVersion!==1)}:{}),
  headquarters:createHeadquartersState(definition.headquarters.layout,definition.headquarters.roster),
  development:developmentState(createDevelopmentWorld(definition.development,seed))};
}
/** HQ milliseconds remain visual time. Never advance the career from a frame or morning replay. */
export function advanceUniverseHeadquarters(universe:GameUniverse,definition:GameDefinition,dtMs:number):GameUniverse {
 assertDefinition(universe,definition);
 if(!Number.isFinite(dtMs)||dtMs<0)throw new Error('HQ duration must be finite and nonnegative');
 const headquarters=advanceHeadquarters(universe.headquarters,definition.headquarters.layout,dtMs);
 return headquarters===universe.headquarters?universe:{...universe,headquarters};
}
export function restartUniverseHeadquarters(universe:GameUniverse,definition:GameDefinition):GameUniverse {
 assertDefinition(universe,definition);
 return {...universe,headquarters:createHeadquartersState(definition.headquarters.layout,definition.headquarters.roster)};
}

type SeasonTransition={standings:string[];regulationReset?:boolean};
/** The only campaign advancement path. Every command consumes the same ordered due-work pipeline. */
function advanceTo(universe:GameUniverse,definition:GameDefinition,target:CampaignDate,transition?:SeasonTransition):GameUniverse {
 assertDefinition(universe,definition);nextCampaignDate(universe.currentDate,target);
 if(target===universe.currentDate)return universe;
 const old=campaignContext(universe.currentDate),end=campaignContext(target);
 if(end.season!==old.season&&!transition)throw new Error('Season boundary requires explicit standings transition');
 if(end.season>old.season+1)throw new Error('Process season boundaries individually');
 let current=universe;
 // Discover work again from the latest state on every entered date. A future handler that
 // schedules later work must not be hidden behind an interval plan frozen before the jump.
 for(let date=addCampaignDays(current.currentDate,1);;date=addCampaignDays(date,1)){
  for(const event of dueCampaignEvents(current,date)){
   // The previous day's temporal view is the ONE bridge into the compatibility kernel,
   // even if another instruction shares this event's date. Never derive a second clock.
   switch(event.kind){
    case 'SEASON_TRANSITION':
     current={...current,development:developmentState(startNextSeason(developmentView(current.development,addCampaignDays(event.date,-1)),definition.development,transition!.standings,{regulationReset:transition!.regulationReset}))};
     break;
    case 'DEVELOPMENT_WEEK':
     current={...current,development:developmentState(advanceDevelopmentWeek(developmentView(current.development,addCampaignDays(event.date,-1)),definition.development))};
     break;
    case 'CONTRACT_STATUS_CHECK':
     if(current.drivers)current={...current,drivers:refreshDriverStatuses(current.drivers,event.date)};
     break;
    default: {
     const unhandled:never=event.kind;
     throw new Error(`Unhandled campaign event: ${unhandled}`);
    }
   }
   current={...current,currentDate:event.date};
  }
  current={...current,currentDate:date};
  if(date===target)break;
 }
 return current;
}
export function advanceCampaignTo(universe:GameUniverse,definition:GameDefinition,target:CampaignDate):GameUniverse {
 return advanceTo(universe,definition,target);
}
export function advanceCampaignByDays(universe:GameUniverse,definition:GameDefinition,days:number):GameUniverse {
 if(!Number.isSafeInteger(days)||days<0)throw new Error('Career advancement requires nonnegative integer days');
 return advanceCampaignTo(universe,definition,addCampaignDays(universe.currentDate,days));
}
/** Compatibility command: one completed prototype work week, derived solely from currentDate. */
export function advanceUniverseWeek(universe:GameUniverse,definition:GameDefinition):GameUniverse {
 assertDefinition(universe,definition);const time=campaignContext(universe.currentDate);
 if(time.week>=definition.development.regulations.seasonWeeks)return universe;
 return advanceCampaignTo(universe,definition,legacyWeekDate(time.seasonIndex,time.week+1));
}
/** Existing explicit reset, not an offseason scheduler. Never fabricate standings. */
export function startUniverseSeason(universe:GameUniverse,definition:GameDefinition,standings:string[],options:{regulationReset?:boolean}={}):GameUniverse {
 assertDefinition(universe,definition);const time=campaignContext(universe.currentDate);
 if(time.week!==definition.development.regulations.seasonWeeks)throw new Error('Finish the current development season before starting the next');
 const ids=definition.development.teams.map(t=>t.id);
 if(standings.length!==ids.length||new Set(standings).size!==ids.length||standings.some(id=>!ids.includes(id)))throw new Error('Standings must contain every team exactly once');
 return advanceTo(universe,definition,seasonStart(time.season+1),{standings,...options});
}
