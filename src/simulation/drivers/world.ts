import {PERFORMANCE_2026} from '../../game/drivers/performance2026';
import {CONTRACTS_2026} from '../../game/drivers/contracts2026';
import {deriveStartingAbilities} from './performance';
import { GRID } from '../../game/drivers/grid';
import { MARKET } from '../../game/drivers/market';
import { BUCKETS, type Driver, type DriverWorld } from '../../game/drivers/types';
import { TEAM_BRANDS } from '../../game/brandRegistry';

/** Fixed fictional identities with source-backed starting performance; no scripted future careers. */
export function createDriverWorld(aligned = true): DriverWorld {
 const drivers: DriverWorld['drivers'] = {};
 const contracts: DriverWorld['contracts'] = [];
 [...GRID, ...MARKET.filter(d=>aligned||d.id!=='driver.takase')].forEach((seed, index) => {
   const id = seed.id;
   const experience = seed.age >= 35 ? 90 : seed.age >= 27 ? 76 : seed.age >= 23 ? 52 : 25;
   const region = ['Mexican','Brazilian','Argentine','Paraguayan'].includes(seed.nationality) ? 'Latin America'
     : ['Thai','Chinese','Japanese','Indian'].includes(seed.nationality) ? 'Asia'
     : ['American','Canadian'].includes(seed.nationality) ? 'North America' : 'International';
   const contractId = `contract.2026.${index+1}`;
   drivers[id] = {
     id, name: seed.name, nationality: seed.nationality, ageAt2026: seed.age,
     category: index < 22 ? 'GRID' : index < 32 ? 'PROSPECT' : 'RESERVE',
     stage: seed.age >= 40 ? 'LATE_CAREER' : seed.age >= 34 ? 'VETERAN' : seed.age >= 26 ? 'PRIME' : seed.age >= 21 ? 'DEVELOPING' : 'ROOKIE',
     ability: Object.fromEntries(BUCKETS.map((key,i) => [key,seed.values[i]])) as Driver['ability'],
     hidden: { potential: seed.potential, peakAge: seed.age >= 34 ? 30 : 29 + index%4,
       growth: index%3 === 0 ? 'LATE' : index%3 === 1 ? 'EARLY' : 'STEADY', decline: 0.7 + index%4*0.3 },
     personality: { ambition: 65+index%6*5, loyalty: 45+index%5*10, patience: 40+index%6*10,
       ego: 40+index%5*10, professionalism: 75+index%5*5, risk: 40+index%7*8 },
     dynamic: {form:50,morale:65,confidence:65,fatigue:0},
     commercial:{home:seed.nationality,region,globalAppeal:seed.values[5]},
     comfort:{frontResponse:40+index%5*12,rearStability:45+index%4*15,braking:50+index%5*10,downforce:35+index%6*10},
     familiarity:{teamId:seed.teamId??null,organization:seed.teamId ? 65+index%4*10 : 0,car:seed.teamId ? 55+index%4*12 : 0},
     traits:[...seed.traits],experience,summary:seed.summary,history:{seasons:[],contractIds:seed.teamId ? [contractId] : []}
   };
   if (seed.teamId) contracts.push({id:contractId,teamId:seed.teamId,driverId:id,
     seat: GRID.filter(s => s.teamId === seed.teamId).findIndex(s => s.id === id) === 0 ? 1 : 2,
     startSeason:2026,endSeason:2027,annualSalaryM:Math.round((seed.values[0]+seed.values[5]-130)*0.42*10)/10,
     performanceBonusM:0.35,status:'SIGNED',
     option:{season:2028,deadlineSeason:2027,deadlineWeek:40,salaryM:Math.round((seed.values[0]+seed.values[5]-125)*0.42*10)/10,state:'PENDING'}});
 });
 if(aligned) {
   for(const d of Object.values(drivers)) {
     const source=PERFORMANCE_2026[d.id];
     if(source) {d.sourcePerformance=JSON.parse(JSON.stringify(source));d.ability=deriveStartingAbilities(d.ability,source);}
   }
   for(const c of contracts) {
     const data=CONTRACTS_2026[c.driverId]!;
     c.teamId=data.teamId;c.endSeason=data.endSeason;c.annualSalaryM=data.annualSalaryM;c.provenance={...data.provenance};
     c.option=data.optionSeason?{season:data.optionSeason,deadlineSeason:data.endSeason,deadlineWeek:40,salaryM:data.annualSalaryM,state:'PENDING'}:null;
   }
   const reserve=drivers['driver.takase']!;
   reserve.affiliatedTeamIds=['team.vortex','team.veloce'];
   reserve.familiarity={teamId:'team.vortex',organization:70,car:65};
   reserve.history.contractIds=['contract.reserve.takase.2026'];
   const data=CONTRACTS_2026[reserve.id]!;
   contracts.push({id:reserve.history.contractIds[0]!,driverId:reserve.id,teamId:data.teamId,role:'RESERVE',seat:null,
     startSeason:2026,endSeason:data.endSeason,annualSalaryM:data.annualSalaryM,performanceBonusM:0,status:'SIGNED',option:null,provenance:{...data.provenance}});
 }
 const knowledge: DriverWorld['knowledge'] = {};
 for (const team of TEAM_BRANDS) knowledge[team.id] = Object.fromEntries(Object.values(drivers).map(driver => [driver.id,
   {precision: driver.category === 'GRID' ? 100 : driver.category === 'PROSPECT' ? 20 : 65,lastSeason:2026,lastWeek:0,reports:0}]));
 return {season:2026,week:0,drivers,contracts,knowledge,nextContractNumber:23};
}
