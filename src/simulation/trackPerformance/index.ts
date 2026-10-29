import {TECHNICAL_AXES,type CircuitDefinition,type TechnicalAxis} from '../../game/calendar/types';
import type {GameDefinition,GameUniverse} from '../universe/types';
import {technicalCar,type TechnicalCar} from './carVector';
export * from './carVector';

export const AXIS_LABELS:Record<TechnicalAxis,string>={straightLine:'Straight-line speed',aeroEfficiency:'Aero efficiency',
 lowSpeed:'Low-speed cornering',mediumSpeed:'Medium-speed cornering',highSpeed:'High-speed aero',traction:'Traction',
 braking:'Braking stability',mechanicalGrip:'Mechanical grip',tyrePreservation:'Tyre preservation',cooling:'Cooling',reliability:'Reliability'};
export const demandLabel=(demand:number)=>demand>=.85?'VERY HIGH':demand>=.65?'HIGH':demand>=.4?'MEDIUM':'LOW';
const fitLabel=(score:number)=>score>=85?'EXCELLENT':score>=78?'STRONG':score>=70?'COMPETITIVE':score>=60?'MIXED':score>=50?'WEAK':'POOR';

/** Technical suitability only. Cubic emphasis gives the defining demands more influence.
 * Normalized positive weights keep output bounded; neither track ID nor team ID enters math.
 * The internal score is circuit-specific, never a universal car rating or finishing prediction.
 */
export function evaluateCarAtTrack(car:TechnicalCar,track:CircuitDefinition) {
 let total=0,weighted=0;
 const factors=TECHNICAL_AXES.map(axis=>{
  const value=car.values[axis],demand=track.demands[axis];
  if(!Number.isFinite(value)||value<0||value>100||!Number.isFinite(demand)||demand<0||demand>1)throw new Error('Invalid technical value/demand');
  const weight=demand**3;total+=weight;weighted+=value*weight;
  return {axis,value,demand,weight};
 });
 if(total===0)throw new Error('Track needs a positive demand');
 const score=Math.max(0,Math.min(100,weighted/total));
 // Statements are selected from actual relevant characteristics, never authored for a team.
 const relevant=factors.filter(f=>f.demand>=.65);
 const strengths=relevant.filter(f=>f.value>=75).sort((a,b)=>(b.value-70)*b.weight-(a.value-70)*a.weight).slice(0,3).map(f=>AXIS_LABELS[f.axis]);
 const concerns=relevant.filter(f=>f.value<70).sort((a,b)=>(70-b.value)*b.weight-(70-a.value)*a.weight).slice(0,3).map(f=>AXIS_LABELS[f.axis]);
 return {score,label:fitLabel(score),strengths,concerns};
}
export function evaluateTeamAtTrack(universe:GameUniverse,definition:GameDefinition,teamId:string,track:CircuitDefinition) {
 const team=universe.development.teams[teamId],profile=definition.development.teams.find(t=>t.id===teamId);
 if(!team||!profile)throw new Error('Unknown car team');
 return evaluateCarAtTrack(technicalCar(team,profile,track),track);
}
/** Internal/debug evidence only; not a prediction or public field ranking. */
export function compareFieldAtTrack(universe:GameUniverse,definition:GameDefinition,track:CircuitDefinition) {
 return definition.development.teams.map(t=>({teamId:t.id,...evaluateTeamAtTrack(universe,definition,t.id,track)}))
  .sort((a,b)=>b.score-a.score||(a.teamId<b.teamId?-1:a.teamId>b.teamId?1:0));
}
