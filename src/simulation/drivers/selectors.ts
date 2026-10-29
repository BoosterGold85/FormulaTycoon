import { BUCKETS, type Bucket, type Driver, type DriverWorld } from '../../game/drivers/types';
import { teamBrand } from '../../game/brandRegistry';
import { activeContracts, effectiveEnd, annualSalary } from './contracts';
export const GRADES=['F','D','C-','C','C+','B-','B','B+','A-','A','A+'] as const;
const FLOORS=[0,40,55,60,65,70,75,80,85,90,95];
export function gradeIndex(raw:number):number {
 if (!Number.isFinite(raw)||raw<0||raw>100) throw new Error('Ability outside 0–100');
 return FLOORS.reduce((index,floor,i)=>raw>=floor?i:index,0);
}
export const gradeFor=(raw:number)=>GRADES[gradeIndex(raw)]!;
export const BUCKET_LABELS:Record<Bucket,string>={talent:'Talent',racecraft:'Racecraft',adaptability:'Adaptability',composure:'Composure',feedback:'Technical Feedback',marketability:'Marketability'};
/** Grade-only disclosure DTO. No raw ability, hidden potential, personality numbers or universal rating. */
export function driverView(world:DriverWorld,observer:string,id:string) {
 const d=world.drivers[id]; const known=world.knowledge[observer]?.[id];
 if (!Object.hasOwn(world.drivers,id)||!Object.hasOwn(world.knowledge,observer)||!Object.hasOwn(world.knowledge[observer]!,id)||!d||!known) throw new Error('Unknown driver/observer');
 const contract=activeContracts(world).find(c=>c.driverId===id);
 const bounds=Object.fromEntries(BUCKETS.map((key,i)=>{
   if (d.category==='PROSPECT'&&known.precision<30&&key==='adaptability') return [key,'Unknown'];
   const center=gradeIndex(d.ability[key]);
   const radius=known.precision>=100?0:known.precision>=70?1:known.precision>=40?2:3;
   return [key, radius===0?GRADES[center]:`${GRADES[Math.max(0,center-radius)]} to ${GRADES[Math.min(10,center+radius)]}`];
 })) as Record<Bucket,string>;
 return {id:d.id,name:d.name,nationality:d.nationality,age:d.ageAt2026+world.season-2026,stage:d.stage,category:d.category,
   grades:bounds,team:contract?teamBrand(contract.teamId).name:'Available',teamId:contract?.teamId??null,
   contractId:contract?.id??null,
   contract:contract ? `${contract.startSeason}–${effectiveEnd(contract)} · $${annualSalary(contract,world.season)}M / year` : 'No race-seat contract',
   option:contract?.option ? `${contract.option.season} team option · ${contract.option.state.toLowerCase()} · decide by ${contract.option.deadlineSeason} W${contract.option.deadlineWeek}` : null,
   specialties:known.precision>=75?d.traits:d.traits.slice(0,1),unknownTraits:known.precision<75,
   familiarity:contract&&d.familiarity.teamId===contract.teamId?(d.familiarity.organization>=80?'Established':'Adapting'):'New organization',
   potential:known.precision<40?'Uncertain':d.hidden.potential>=96?'Very High':d.hidden.potential>=90?'High':'Established ceiling',
   confidence:known.precision>=90?'High':known.precision>=50?'Medium':'Low',reports:known.reports,
   summary:d.summary,commercial:`${d.commercial.home} · ${d.commercial.region} · ${known.precision>=100?gradeFor(d.commercial.globalAppeal)+' global reach':'Commercial reach under review'}`,
   fit:'Car comfort profile recorded; race effects not simulated',
   history:d.history.seasons.map(s=>({...s,team:teamBrand(s.teamId).name})), lastObserved:`${known.lastSeason} W${known.lastWeek}`};
}
export function observeDriver(world:DriverWorld,observer:string,id:string):DriverWorld {
 const old=world.knowledge[observer]?.[id];
 if(!Object.hasOwn(world.drivers,id)||!Object.hasOwn(world.knowledge,observer)||!Object.hasOwn(world.knowledge[observer]!,id)||!old) throw new Error('Unknown observer/driver');
 const next={...old,precision:Math.min(100,old.precision+20),reports:old.reports+1,lastSeason:world.season,lastWeek:world.week};
 return {...world,knowledge:{...world.knowledge,[observer]:{...world.knowledge[observer],[id]:next}}};
}
/** Future engineering input; deliberately not applied as a hidden development bonus in B. */
export function technicalContribution(driver:Driver,teamId:string|null=driver.familiarity.teamId) {return {feedback:driver.ability.feedback,experience:driver.experience,teamFamiliarity:teamId!==null&&driver.familiarity.teamId===teamId?driver.familiarity.organization:0};}
/** Future sponsor input, distinct from on-track strength. */
export function commercialContribution(driver:Driver) {return {...driver.commercial,marketability:driver.ability.marketability};}
/** Initial asking-price estimate ($M/year), not a player-facing overall ability score. */
export function marketValue(driver:Driver) {
 const a=driver.ability;
 return Math.max(0.5,Math.round((a.talent*.18+a.racecraft*.15+a.adaptability*.12+a.composure*.12+a.feedback*.16+a.marketability*.27+
   driver.experience*.06+(driver.ageAt2026<25?driver.hidden.potential*.04:0)+driver.dynamic.form*.03-64)*10)/10);
}
