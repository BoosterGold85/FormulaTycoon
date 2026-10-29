import {campaignContext,deadlinePassed,type CampaignDate} from '../campaignTime';
import type { DriverContract, DriverWorld } from '../../game/drivers/types';
import { TEAM_BRANDS } from '../../game/brandRegistry';
export type DriverResult = {ok:true;world:DriverWorld} | {ok:false;reason:string};
export const effectiveEnd = (c:DriverContract) => c.option?.state === 'EXERCISED' ? c.option.season : c.endSeason;
export const annualSalary = (c:DriverContract,season:number) => c.option?.state==='EXERCISED'&&season===c.option.season?c.option.salaryM:c.annualSalaryM;
export function activeContracts(world:DriverWorld,date:CampaignDate,teamId?:string) {
 const {season}=campaignContext(date);
 return world.contracts.filter(c => c.role!=='RESERVE' && c.status==='SIGNED' && c.startSeason<=season && effectiveEnd(c)>=season && (!teamId || c.teamId===teamId));
}
/** Calendar transitions never pay salaries/bonuses. Finance will consume obligations, not duplicate them. */
export function refreshDriverStatuses(world:DriverWorld,date:CampaignDate):DriverWorld {
 const {season}=campaignContext(date);
 let changed=false;
 const contracts=world.contracts.map(c=>{
   const missed=c.option?.state==='PENDING'&&deadlinePassed(date,c.option.decisionDate);
   const next=missed?{...c,option:{...c.option!,state:'LAPSED' as const}}:c;
   const result=next.status==='SIGNED'&&effectiveEnd(next)<season?{...next,status:'EXPIRED' as const}:next;
   if(result!==c)changed=true;return result;
 });
 return changed?{...world,contracts}:world;
}
export function decideTeamOption(world:DriverWorld,observer:string,id:string,exercise:boolean,date:CampaignDate):DriverResult {
 const c=world.contracts.find(c=>c.id===id);
 if (!c||c.teamId!==observer||c.status!=='SIGNED'||!c.option) return {ok:false,reason:'INVALID_OPTION'};
 const desired=exercise?'EXERCISED':'DECLINED';
 if (c.option.state===desired) return {ok:true,world};
 if (c.option.state!=='PENDING'||deadlinePassed(date,c.option.decisionDate)) return {ok:false,reason:'OPTION_CLOSED'};
 if (exercise && world.contracts.some(other=>other.id!==id&&other.status==='SIGNED'&&other.startSeason<=c.option!.season&&effectiveEnd(other)>=c.option!.season&&
   (other.driverId===c.driverId||(c.seat!==null&&other.seat!==null&&other.teamId===c.teamId&&other.seat===c.seat)))) return {ok:false,reason:'CONFLICT'};
 return {ok:true,world:{...world,contracts:world.contracts.map(item=>item.id===id?{...item,option:{...item.option!,state:desired}}:item)}};
}
export function signDriverContract(world:DriverWorld,request:Omit<DriverContract,'id'|'status'>,date:CampaignDate):DriverResult {
 const {season}=campaignContext(date);
 if (request.role==='RESERVE'||!Object.hasOwn(world.drivers,request.driverId)||!TEAM_BRANDS.some(t=>t.id===request.teamId)||request.seat===null||![1,2].includes(request.seat)||
   !Number.isInteger(request.startSeason)||!Number.isInteger(request.endSeason)||request.startSeason<season||
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
