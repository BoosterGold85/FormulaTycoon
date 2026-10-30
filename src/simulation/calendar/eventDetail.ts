import {calendarById} from '../../game/calendar';
import {teamBrand} from '../../game/brandRegistry';
import type {GameDefinition,GameUniverse} from '../universe/types';
import {AXIS_LABELS,demandLabel,evaluateTeamAtTrack} from '../trackPerformance';
import {TECHNICAL_AXES} from '../../game/calendar/types';
import {eventDateLabel,eventStatus} from './index';

/** Public read model deliberately omits numeric car values/internal field scores. */
export function selectEventDetail(universe:GameUniverse,definition:GameDefinition,eventId:string) {
 const calendar=calendarById(universe.calendarId),event=calendar.events.find(e=>e.id===eventId);
 if(!event)throw new Error('Unknown calendar event');
 const track=calendar.tracks[event.trackId]!;
 const fit=universe.playerTeamId?evaluateTeamAtTrack(universe,definition,universe.playerTeamId,track):null;
 return {id:event.id,round:event.round,venue:track.name,country:track.country,dates:eventDateLabel(event),sprint:event.sprint,
  status:eventStatus(event,universe.currentDate),type:track.type,rationale:track.rationale,provisional:track.profileStatus==='PROVISIONAL',
  demands:TECHNICAL_AXES.map(axis=>({axis,label:AXIS_LABELS[axis],level:demandLabel(track.demands[axis])})),
  playerTeam:universe.playerTeamId?teamBrand(universe.playerTeamId).name:null,
  fit:fit?{label:fit.label,strengths:fit.strengths,concerns:fit.concerns}:null};
}
