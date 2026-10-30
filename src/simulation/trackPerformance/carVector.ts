import type {CircuitDefinition,TechnicalVector} from '../../game/calendar/types';
import type {TeamDevelopmentProfile} from '../../game/development';
import {computeCarProfile,type TeamDevelopmentState} from '../development';

export type TechnicalCar={values:TechnicalVector};
/** Coarse translation v1. Reads the existing six attribute truths, never averages part specs anew.
 * No drag penalty/tradeoff can honestly be inferred from a scalar part rating; none is invented.
 */
export function technicalCar(team:TeamDevelopmentState,profile:TeamDevelopmentProfile,track?:CircuitDefinition):TechnicalCar {
 const car=computeCarProfile(team,profile,track?{id:track.id,name:track.name,week:0,...track.packageContext}:undefined);
 const a=car.attributes;
 const bounded=(value:number)=>Math.max(0,Math.min(100,value));
 const values:TechnicalVector={
  straightLine:.85*a.power+.15*a.dragEfficiency,
  aeroEfficiency:a.dragEfficiency,
  lowSpeed:.7*a.mechanicalGrip+.3*a.downforce,
  mediumSpeed:.55*a.downforce+.45*a.mechanicalGrip,
  highSpeed:.9*a.downforce+.1*a.dragEfficiency,
  traction:.85*a.mechanicalGrip+.15*a.power,
  braking:.8*a.mechanicalGrip+.2*a.downforce,
  mechanicalGrip:a.mechanicalGrip,
  tyrePreservation:a.tyreManagement,
  cooling:a.cooling,
  reliability:car.reliability
 };
 for(const key of Object.keys(values) as Array<keyof TechnicalVector>)values[key]=bounded(values[key]);
 return {values};
}
