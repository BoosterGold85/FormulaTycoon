import type { DriverContract, DriverWorld } from '../../game/drivers/types';
import { TEAM_BRANDS } from '../../game/brandRegistry';
export type DriverResult = {ok:true;world:DriverWorld} | {ok:false;reason:string};
export const effectiveEnd = (c:DriverContract) => c.option?.state === 'EXERCISED' ? c.option.season : c.endSeason;
export const annualSalary = (c:DriverContract,season:number) => c.option?.state==='EXERCISED'&&season===c.option.season?c.option.salaryM:c.annualSalaryM;
export function activeContracts(world:DriverWorld,teamId?:string) {
 return world.contracts.filter(c => c.status==='SIGNED' && c.startSeason<=world.season && effectiveEnd(c)>=world.season && (!teamId || c.teamId===teamId));
}
/** Calendar transitions never pay salaries/bonuses. Finance will consume obligations, not duplicate them. */
export function updateDriverCalendar(world:DriverWorld,season:number,week:number):DriverWorld {
 if (!Number.isInteger(season)||!Number.isInteger(week)||week<0||week>52||season>9999||season<world.season||(season===world.season&&week<world.week)) throw new Error('Invalid driver calendar');
 if (season===world.season&&week===world.week) return world;
 return {...world,season,week,contracts:world.contracts.map(c=>{
   const missed=c.option?.state==='PENDING' && (season>c.option.deadlineSeason || (season===c.option.deadlineSeason&&week>c.option.deadlineWeek));
   const next=missed ? {...c,option:{...c.option!,state:'LAPSED' as const}} : c;
   return next.status==='SIGNED' && effectiveEnd(next)<season ? {...next,status:'EXPIRED' as const} : next;
 })};
}
export function decideTeamOption(world:DriverWorld,observer:string,id:string,exercise:boolean):DriverResult {
 const c=world.contracts.find(c=>c.id===id);
 if (!c||c.teamId!==observer||c.status!=='SIGNED'||!c.option) return {ok:false,reason:'INVALID_OPTION'};
 const desired=exercise?'EXERCISED':'DECLINED';
 if (c.option.state===desired) return {ok:true,world};
 if (c.option.state!=='PENDING'||world.season>c.option.deadlineSeason||(world.season===c.option.deadlineSeason&&world.week>c.option.deadlineWeek)) return {ok:false,reason:'OPTION_CLOSED'};
 if (exercise && world.contracts.some(other=>other.id!==id&&other.status==='SIGNED'&&other.startSeason<=c.option!.season&&effectiveEnd(other)>=c.option!.season&&
   (other.driverId===c.driverId||(other.teamId===c.teamId&&other.seat===c.seat)))) return {ok:false,reason:'CONFLICT'};
 return {ok:true,world:{...world,contracts:world.contracts.map(item=>item.id===id?{...item,option:{...item.option!,state:desired}}:item)}};
}
export function signDriverContract(world:DriverWorld,request:Omit<DriverContract,'id'|'status'>):DriverResult {
 if (!Object.hasOwn(world.drivers,request.driverId)||!TEAM_BRANDS.some(t=>t.id===request.teamId)||![1,2].includes(request.seat)||
   !Number.isInteger(request.startSeason)||!Number.isInteger(request.endSeason)||request.startSeason<world.season||
   request.endSeason<request.startSeason||request.endSeason>9999||request.endSeason-request.startSeason>5||
   !Number.isFinite(request.annualSalaryM)||request.annualSalaryM<0||request.annualSalaryM>250||
   !Number.isFinite(request.performanceBonusM)||request.performanceBonusM<0||request.performanceBonusM>50||request.option!==null) return {ok:false,reason:'INVALID_CONTRACT'};
 // New negotiated options are deliberately not offered in V1; starting options have fixed terms.
 if (world.contracts.some(c=>c.status==='SIGNED'&&c.startSeason<=request.endSeason&&effectiveEnd(c)>=request.startSeason&&
   (c.driverId===request.driverId||(c.teamId===request.teamId&&c.seat===request.seat)))) return {ok:false,reason:'CONFLICT'};
 const id=`contract.new.${world.nextContractNumber}`;
 return {ok:true,world:{...world,nextContractNumber:world.nextContractNumber+1,
   drivers:{...world.drivers,[request.driverId]:{...world.drivers[request.driverId]!,history:{...world.drivers[request.driverId]!.history,
     contractIds:[...world.drivers[request.driverId]!.history.contractIds,id]}}},
   contracts:[...world.contracts,{...request,id,status:'SIGNED'}]}};
}
