import {calendarById} from '../game/calendar';
import {teamBrand} from '../game/brandRegistry';
import {calendarWindow} from './calendar';
import {selectEventDetail} from './calendar/eventDetail';
import {driverView} from './drivers';
import {getPart,stageWork} from './development';
import {countWorkersByState} from './headquarters';
import type {GameDefinition,GameUniverse} from './universe/types';

/** Public read models compose existing owners. No new ratings, forecasts or state transitions. */
export function selectDriverRoster(universe:GameUniverse){
 if(!universe.drivers||!universe.playerTeamId)throw new Error('No driver organization');
 const all=Object.keys(universe.drivers.drivers).map(id=>driverView(universe.drivers!,universe.playerTeamId!,id,universe.currentDate));
 return {yourDrivers:all.filter(d=>d.raceSeat&&d.teamId===universe.playerTeamId),
  available:all.filter(d=>d.teamId===null&&d.category!=='PROSPECT'),prospects:all.filter(d=>d.category==='PROSPECT'),
  reserves:all.filter(d=>d.category==='RESERVE'),grid:all.filter(d=>d.category==='GRID')};
}
export function selectTeamOverview(universe:GameUniverse,definition:GameDefinition){
 if(!universe.playerTeamId)throw new Error('No player team');
 const brand=teamBrand(universe.playerTeamId),team=universe.development.teams[brand.id]!;
 const next=calendarWindow(calendarById(universe.calendarId),universe.currentDate).next;
 const briefing=next?selectEventDetail(universe,definition,next.id):null;
 return {brand,drivers:selectDriverRoster(universe).yourDrivers,briefing,staff:countWorkersByState(universe.headquarters),
  projects:team.projects.map(project=>({id:project.id,name:getPart(definition.development,project.partId).name,
   stage:project.stage,progress:project.stage==='READY'?100:Math.max(0,Math.min(100,Math.round(project.progress/stageWork(project,getPart(definition.development,project.partId))*100)))})),
  fittedParts:definition.development.parts.map(part=>({id:part.id,name:part.name,spec:team.parts[part.id].spec}))};
}
