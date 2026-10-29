/** Test oracle for frozen pre-calendar fixtures, never imported by the application. */
import type {GameUniverse,DriverWorld} from '../persistence/contracts/preCalendarTypes';
import type {GameDefinition} from '../simulation/universe/types';
import {advanceDevelopmentWeek,startNextSeason} from '../simulation/development';
import {releasedEffectiveEnd} from '../persistence/contracts/preCalendarRules';
function oldDriverTime(world:DriverWorld,season:number,week:number):DriverWorld {
 return {...world,season,week,contracts:world.contracts.map(c=>{
  const missed=c.option?.state==='PENDING'&&(season>c.option.deadlineSeason||(season===c.option.deadlineSeason&&week>c.option.deadlineWeek));
  const next=missed?{...c,option:{...c.option!,state:'LAPSED' as const}}:c;
  return next.status==='SIGNED'&&releasedEffectiveEnd(next)<season?{...next,status:'EXPIRED' as const}:next;
 })};
}
export function advancePreCalendarWeek(world:GameUniverse,definition:GameDefinition):GameUniverse {
 const development=advanceDevelopmentWeek(world.development,definition.development);
 return {...world,development,...(world.drivers?{drivers:oldDriverTime(world.drivers,2025+development.season,development.week)}:{})};
}
export function startPreCalendarSeason(world:GameUniverse,definition:GameDefinition):GameUniverse {
 const development=startNextSeason(world.development,definition.development,definition.development.teams.map(t=>t.id));
 return {...world,development,...(world.drivers?{drivers:oldDriverTime(world.drivers,2025+development.season,0)}:{})};
}
