import type { Driver } from '../../game/drivers/types';
import type { CarProfile } from '../development';
/** Coarse attribute compatibility, not a race pace modifier or a driver rating. */
export function carCompatibility(driver:Driver,car:CarProfile):'Comfortable'|'Adapting'|'Challenging' {
 const target={frontResponse:car.attributes.downforce,rearStability:car.attributes.mechanicalGrip,
   braking:car.attributes.mechanicalGrip,downforce:car.attributes.downforce};
 const gap=(Object.keys(target) as Array<keyof typeof target>).reduce((sum,key)=>sum+Math.abs(driver.comfort[key]-target[key]),0)/4;
 return gap<18?'Comfortable':gap<32?'Adapting':'Challenging';
}
