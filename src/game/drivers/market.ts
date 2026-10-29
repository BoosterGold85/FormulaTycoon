import type { DriverSeed } from './grid';
export const MARKET: DriverSeed[] = [
 ['cordeiro','Rafael Cordeiro','Brazilian',20,[82,77,81,78,69,75],95,'Composed prospect with strong tire learning.'],
 ['stoyanov','Nikolai Stoyanov','Bulgarian',19,[83,79,76,73,68,69],97,'Fast assertive prospect with execution to refine.'],
 ['dunley','Aidan Dunley','Irish',20,[84,80,83,70,65,72],98,'Aggressive pace, still learning restraint.'],
 ['minaro','Gabriele Minaro','Italian',21,[81,78,79,80,73,72],94,'Precise and technically curious prospect.'],
 ['bergman','Dino Bergman','Swedish',22,[80,81,78,82,76,70],93,'Balanced and composed developing racer.'],
 ['leones','Noel Leones','Mexican',21,[78,81,84,76,69,82],96,'Adaptable racer with regional appeal.'],
 ['stenmark','Martin Stenmark','Norwegian',20,[82,78,87,74,68,70],99,'Changeable-condition specialist with a high ceiling.'],
 ['durand','Joshua Durand','Paraguayan',22,[79,84,80,79,72,77],97,'Patient tire-aware race executor.'],
 ['mainor','Kiran Mainor','Indian',24,[78,80,80,83,82,85],92,'Technically thoughtful and commercially promising.'],
 ['van-hoven','Laurens van Hoven','Dutch',21,[81,79,84,82,74,73],98,'Versatile quiet prospect with late growth potential.'],
 ['vale','Mara Vale','American',26,[82,84,85,87,88,88],90,'Experienced reserve with US commercial appeal.'],
 ['okada','Ren Okada','Japanese',30,[84,85,86,91,95,81],89,'Technical test driver and setup specialist.'],
 ['moreau','Luc Moreau','French',33,[83,88,87,90,94,78],87,'Former race driver with engineering leadership.'],
 ['duarte','Ines Duarte','Portuguese',23,[82,80,87,81,78,77],96,'Young low-grip specialist.'],
 ['mensah','Kojo Mensah','Ghanaian',25,[81,85,86,84,80,85],94,'Adaptable journeyman with a growing following.'],
 ['zheng','Lin Zheng','Chinese',24,[80,82,83,85,82,94],93,'Commercially attractive reserve and steady racer.'],
 ['varga','Tomas Varga','Czech',36,[78,88,85,93,96,72],84,'Veteran engineering reference and mentor.'],
 ['bellini','Sofia Bellini','Italian',22,[84,79,83,76,75,86],97,'Fast developing junior with a strong audience.'],
 ['sayed','Amir Sayed','Emirati',27,[79,82,81,87,85,90],88,'Professional reserve with regional commercial reach.'],
 ['navarro','Elena Navarro','Spanish',29,[85,87,90,89,91,84],92,'Experienced reserve and versatile setup tester.'],
 ['takase','Yuto Takase','Japanese',25,[80,82,85,84,83,80],91,'Experienced reserve associated with the Vortex and Veloce driver system.']
].map((row,index) => {
 const [id,name,nationality,age,values,potential,summary]=row as [string,string,string,number,DriverSeed['values'],number,string];
 return {id:`driver.${id}`,name,nationality,age,values,potential,summary,traits: index%3===0 ? ['Calm Under Pressure'] : index%3===1 ? ['Setup Expert'] : ['Wet Weather Specialist']};
});
