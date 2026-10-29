import type { Driver } from '../../game/drivers/types';
import { computeCarProfile, type CarProfile } from '../development';
import type { GameUniverse, GameDefinition } from '../universe/types';
import { currentDriverContract } from './selectors';
/** Coarse attribute compatibility, not a race pace modifier or a driver rating. */
export function carCompatibility(driver:Driver,car:CarProfile):'Comfortable'|'Adapting'|'Challenging' {
 const target={frontResponse:car.attributes.downforce,rearStability:car.attributes.mechanicalGrip,
   braking:car.attributes.mechanicalGrip,downforce:car.attributes.downforce};
 const gap=(Object.keys(target) as Array<keyof typeof target>).reduce((sum,key)=>sum+Math.abs(driver.comfort[key]-target[key]),0)/4;
 return gap<18?'Comfortable':gap<32?'Adapting':'Challenging';
}

/** Domain-owned driver/car compatibility. No track/event input and no pace modifier. */
export function selectDriverCarFit(universe:GameUniverse, definition:GameDefinition, driverId:string):ReturnType<typeof carCompatibility>|null {
 const world=universe.drivers;
 if(!world)return null;
 if(!Object.hasOwn(world.drivers,driverId))throw new Error('Unknown driver');
 const contract=currentDriverContract(world,driverId,universe.currentDate);
 if(!contract)return null;
 const team=universe.development.teams[contract.teamId];
 const profile=definition.development.teams.find(t=>t.id===contract.teamId);
 if(!team||!profile)throw new Error('Unknown driver car team');
 return carCompatibility(world.drivers[driverId]!,computeCarProfile(team,profile));
}
