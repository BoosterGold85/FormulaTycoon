import type { DriverWorld } from '../game/drivers/types';
import { BUCKETS, TRAITS } from '../game/drivers/types';
import { GRID } from '../game/drivers/grid';
import { MARKET } from '../game/drivers/market';
import { TEAM_BRANDS } from '../game/brandRegistry';
import { effectiveEnd } from '../simulation/drivers/contracts';
import { array, choice, nullable, number, object, requireValid, text } from './validation';

export function validateDriverWorld(input:unknown, season:number, week:number):asserts input is DriverWorld {
 const driverIds=[...GRID,...MARKET].map(d=>d.id),teamIds=TEAM_BRANDS.map(t=>t.id);
 const driverId=choice(driverIds),teamId=choice(teamIds),rating=number(0,100),int=number(0,Number.MAX_SAFE_INTEGER,true);
 const year=number(2026,9999,true);
 const seatSeason=object({season:year,teamId,starts:int,wins:int,podiums:int,poles:int,championships:int,points:number()});
 const driver=object({id:driverId,name:text,nationality:text,ageAt2026:number(16,65,true),
   stage:choice(['ROOKIE','DEVELOPING','PRIME','VETERAN','LATE_CAREER']),category:choice(['GRID','PROSPECT','RESERVE']),
   ability:object(Object.fromEntries(BUCKETS.map(k=>[k,rating]))),traits:array(choice(TRAITS)),
   hidden:object({potential:rating,peakAge:number(20,45,true),growth:choice(['EARLY','STEADY','LATE']),decline:number(0,5)}),
   personality:object(Object.fromEntries(['ambition','loyalty','patience','ego','professionalism','risk'].map(k=>[k,rating]))),
   dynamic:object(Object.fromEntries(['form','morale','confidence','fatigue'].map(k=>[k,rating]))),
   commercial:object({home:text,region:text,globalAppeal:rating}),
   comfort:object(Object.fromEntries(['frontResponse','rearStability','braking','downforce'].map(k=>[k,rating]))),
   familiarity:object({teamId:nullable(teamId),organization:rating,car:rating}),experience:rating,summary:text,
   history:object({seasons:array(seatSeason),contractIds:array(text)})});
 const contract=object({id:text,teamId,driverId,seat:choice([1,2]),startSeason:year,endSeason:year,
   annualSalaryM:number(0,250),performanceBonusM:number(0,50),status:choice(['SIGNED','EXPIRED','RELEASED']),
   option:nullable(object({season:year,deadlineSeason:year,deadlineWeek:number(0,52,true),salaryM:number(0,250),state:choice(['PENDING','EXERCISED','DECLINED','LAPSED'])}))});
 const observation=object({precision:rating,lastSeason:year,lastWeek:number(0,52,true),reports:int});
 object({season:year,week:number(0,52,true),drivers:object(Object.fromEntries(driverIds.map(id=>[id,driver]))),
   contracts:array(contract),knowledge:object(Object.fromEntries(teamIds.map(id=>[id,object(Object.fromEntries(driverIds.map(d=>[d,observation])))]))),nextContractNumber:number(23,Number.MAX_SAFE_INTEGER,true)})(input,'drivers');
 const world=input as DriverWorld;
 requireValid(world.season===season && world.week===week,'drivers.calendar');
 const ids=new Set<string>();
 for(const [id,d] of Object.entries(world.drivers)) {
   requireValid(d.id===id&&d.traits.length<=3&&new Set(d.traits).size===d.traits.length,'driver.identity/traits');
   for(const s of d.history.seasons) requireValid(s.season<world.season&&s.wins<=s.podiums&&s.podiums<=s.starts&&s.poles<=s.starts,'driver.history');
 }
 for(const c of world.contracts) {
   requireValid(!ids.has(c.id)&&c.endSeason>=c.startSeason&&c.endSeason-c.startSeason<=5,'contract.identity/term');ids.add(c.id);
   if(c.option) requireValid(c.option.season===c.endSeason+1&&c.option.deadlineSeason>=c.startSeason&&c.option.deadlineSeason<=c.endSeason,'contract.option');
   requireValid(c.status!=='EXPIRED'||effectiveEnd(c)<world.season,'contract.expiry');
   requireValid(c.status!=='SIGNED'||effectiveEnd(c)>=world.season,'contract.active.expiry');
   if(c.option?.state==='PENDING') requireValid(world.season<c.option.deadlineSeason||(world.season===c.option.deadlineSeason&&world.week<=c.option.deadlineWeek),'contract.deadline');
   requireValid(world.drivers[c.driverId]!.history.contractIds.includes(c.id),'contract.history');
   if(c.id.startsWith('contract.new.')) requireValid(Number(c.id.slice(13))<world.nextContractNumber,'contract.counter');
 }
 for(const d of Object.values(world.drivers)) {
   requireValid(new Set(d.history.contractIds).size===d.history.contractIds.length&&d.history.contractIds.every(id=>world.contracts.some(c=>c.id===id&&c.driverId===d.id)),'driver.contractHistory');
 }
 for(let i=0;i<world.contracts.length;i++) for(let j=i+1;j<world.contracts.length;j++) {
   const a=world.contracts[i]!,b=world.contracts[j]!;
   if(a.status==='RELEASED'||b.status==='RELEASED') continue;
   if(a.startSeason<=effectiveEnd(b)&&b.startSeason<=effectiveEnd(a)) requireValid(a.driverId!==b.driverId&&!(a.teamId===b.teamId&&a.seat===b.seat),'contract.overlap');
 }
 for(const observations of Object.values(world.knowledge)) for(const o of Object.values(observations)) {
   requireValid(o.lastSeason<world.season||(o.lastSeason===world.season&&o.lastWeek<=world.week),'scouting.date');
 }
}
