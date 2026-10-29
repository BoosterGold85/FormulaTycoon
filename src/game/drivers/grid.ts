import type { Trait } from './types';
export type DriverSeed = { id: string; name: string; nationality: string; age: number; teamId?: string;
  values: [number, number, number, number, number, number]; potential: number; traits: Trait[]; summary: string };
/** Fictional starting profiles, ages, salaries and reputation; no real records or likenesses. */
export const GRID: DriverSeed[] = [
 ['ronnis','Lando Ronnis','British',26,'mclarin',[94,92,92,91,86,94],97,['Qualifying Specialist','Calm Under Pressure'],'Modern champion-caliber star with adaptable speed.'],
 ['piastra','Oscar Piastra','Australian',24,'mclarin',[92,94,87,95,85,84],98,['Calm Under Pressure','Tire Whisperer'],'Composed young elite racer and quick technical learner.'],
 ['leclair','Charles Leclair','Monégasque',28,'ferano',[96,89,92,84,87,92],97,['Qualifying Specialist','Low-Grip Specialist'],'Precision and raw speed in difficult machinery.'],
 ['harlton','Lewis Harlton','British',40,'ferano',[88,96,96,94,98,99],96,['Wet Weather Specialist','Technical Leader'],'Legendary veteran with global appeal and engineering experience.'],
 ['roussel','George Roussel','British',27,'mercurion',[93,91,87,94,92,86],96,['Qualifying Specialist','Calm Under Pressure'],'Prime front-runner with composed execution and feedback.'],
 ['antonello','Kimi Antonello','Italian',19,'mercurion',[91,82,94,80,71,84],99,['Wet Weather Specialist','High-Speed Specialist'],'Exceptional young adaptable talent, still building experience.'],
 ['verhoeven','Max Verhoeven','Dutch',28,'vortex',[99,98,99,97,93,94],100,['Wet Weather Specialist','Aggressive Defender'],'Benchmark pace and car control under pressure.'],
 ['hadrian','Isaac Hadrian','French',21,'vortex',[87,85,84,76,74,74],97,['Late Braker','Comeback Racer'],'Aggressive high-upside racer still establishing consistency.'],
 ['alvarro','Fernando Alvarro','Spanish',44,'arden',[89,98,98,94,99,94],95,['Technical Leader','Low-Grip Specialist'],'Veteran race reader who extracts more from imperfect cars.'],
 ['sterling','Lance Sterling','Canadian',27,'arden',[78,79,82,70,77,86],85,['Wet Weather Specialist','Sponsor Favorite'],'Established racer with backing and condition-sensitive strengths.'],
 ['sainor','Carlos Sainor','Spanish',31,'wellington',[89,93,94,94,97,89],95,['Setup Expert','Technical Leader'],'Complete development leader with strong changeable-weather execution.'],
 ['alburn','Alex Alburn','Thai',29,'wellington',[88,90,93,88,91,85],93,['Low-Grip Specialist','Comeback Racer'],'Adaptable extractor of pace from imperfect equipment.'],
 ['gasson','Pierre Gasson','French',29,'alpinor',[87,90,86,90,92,85],92,['Technical Leader'],'Experienced midfield leader and dependable communicator.'],
 ['colavita','Franco Colavita','Argentine',22,'alpinor',[85,81,84,75,73,93],95,['Sponsor Favorite','Late Braker'],'Popular young racer with regional appeal and growth ahead.'],
 ['ortez','Esteban Ortez','French',29,'hartman',[85,91,83,89,87,78],90,['Aggressive Defender'],'Dependable midfield race executor.'],
 ['bearford','Oliver Bearford','British',20,'hartman',[87,83,88,80,75,81],98,['Comeback Racer'],'Young developing driver with substantial upside.'],
 ['larsen','Liam Larsen','New Zealander',24,'veloce',[83,88,85,77,77,77],92,['Aggressive Defender'],'Determined racer fighting to establish his career.'],
 ['lindholm','Arvid Lindholm','British',18,'veloce',[85,77,85,72,66,75],98,['High-Speed Specialist'],'Very young promoted prospect with an uncertain ceiling.'],
 ['hollenberg','Nico Hollenberg','German',38,'auden',[84,88,86,93,98,82],89,['Setup Expert','Technical Leader'],'Experienced technical veteran valued for diagnosis and development.'],
 ['bortelli','Gabriel Bortelli','Brazilian',21,'auden',[85,83,86,85,78,82],96,['Calm Under Pressure'],'Balanced developing driver with meaningful growth potential.'],
 ['peralta','Sergio Peralta','Mexican',35,'caldera',[84,92,87,84,91,98],91,['Tire Whisperer','Sponsor Favorite'],'Experienced tire manager with exceptional Latin American reach.'],
 ['botten','Valtteri Botten','Finnish',36,'caldera',[87,85,84,92,96,85],90,['Qualifying Specialist','Setup Expert'],'Professional veteran with valuable feedback and qualifying knowledge.']
].map(row => {
 const [id,name,nationality,age,team,values,potential,traits,summary] = row as [string,string,string,number,string,DriverSeed['values'],number,Trait[],string];
 return {id:`driver.${id}`,name,nationality,age,teamId:`team.${team}`,values,potential,traits,summary};
});
