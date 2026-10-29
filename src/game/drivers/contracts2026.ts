export type StartingContract = {teamId:string;annualSalaryM:number;endSeason:number;optionSeason?:number;
  provenance:{status:'CONFIRMED'|'REPORTED';context:'new deal'|'2026 base'}};
type Row=[string,string,number,number,number|null,'CONFIRMED'|'REPORTED','new deal'|'2026 base'];
const ROWS:Row[]=[
 ['verhoeven','vortex',107,2030,null,'CONFIRMED','new deal'],
 ['harlton','ferano',60,2027,2028,'CONFIRMED','2026 base'],
 ['leclair','ferano',53,2030,null,'REPORTED','new deal'],
 ['alvarro','arden',40,2027,null,'CONFIRMED','new deal'],
 ['ronnis','mclarin',35,2030,null,'CONFIRMED','new deal'],
 ['roussel','mercurion',34,2027,null,'CONFIRMED','2026 base'],
 ['sainor','wellington',30,2027,null,'CONFIRMED','new deal'],
 ['piastra','mclarin',27,2028,null,'CONFIRMED','new deal'],
 ['sterling','arden',17,2027,null,'CONFIRMED','new deal'],
 ['gasson','alpinor',15,2028,null,'CONFIRMED','new deal'],
 ['alburn','wellington',12,2027,null,'CONFIRMED','2026 base'],
 ['peralta','caldera',10,2029,null,'CONFIRMED','new deal'],
 ['ortez','hartman',7,2026,2027,'CONFIRMED','2026 base'],
 ['hollenberg','auden',7,2027,null,'CONFIRMED','2026 base'],
 ['hadrian','vortex',5,2027,null,'CONFIRMED','2026 base'],
 ['takase','vortex',5,2026,null,'REPORTED','2026 base'],
 ['botten','caldera',5,2027,2028,'CONFIRMED','2026 base'],
 ['antonello','mercurion',2,2027,null,'CONFIRMED','2026 base'],
 ['bortelli','auden',2,2028,null,'REPORTED','2026 base'],
 ['bearford','hartman',1,2026,2027,'CONFIRMED','2026 base'],
 ['larsen','veloce',1,2026,null,'CONFIRMED','2026 base'],
 ['colavita','alpinor',0.75,2027,null,'CONFIRMED','2026 base'],
 ['lindholm','veloce',0.75,2026,null,'CONFIRMED','2026 base']
];
export const CONTRACTS_2026:Record<string,StartingContract>=Object.fromEntries(ROWS.map(
 ([id,team,salary,end,option,status,context])=>[`driver.${id}`,{teamId:`team.${team}`,annualSalaryM:salary,endSeason:end,
   ...(option===null?{}:{optionSeason:option}),provenance:{status,context}}]));
