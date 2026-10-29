/** Exact owner-supplied Pole to Paddock 2026 observations. Reference overall is NOT an FT rating. */
export type SourcePerformance = {
  season: 2026; dataset: 'P2P 2026'; overallReference: number;
  pace: number; racecraft: number; tyreManagement: number; qualifying: number; consistency: number; discipline: number;
  rankingContext?: { gradedRounds: 13; totalRounds: 18; ranked: false };
};
type Row = [string,number,number,number,number,number,number,number];
const ROWS: Row[] = [
 ['antonello',89.1,91.0,95.0,90.1,90.9,85.3,90.6],
 ['verhoeven',85.1,92.3,86.9,85.0,86.6,70.8,95.2],
 ['ronnis',82.8,87.5,81.2,82.6,83.7,78.5,94.8],
 ['harlton',82.7,83.2,85.9,88.4,84.3,86.2,89.4],
 ['leclair',82.4,85.7,86.3,82.6,85.5,73.9,93.8],
 ['roussel',81.5,78.4,87.9,86.6,86.9,76.1,90.7],
 ['piastra',76.7,76.3,76.5,80.1,79.7,84.7,91.3],
 ['gasson',73.6,77.9,67.7,71.5,74.3,86.6,88.3],
 ['larsen',71.8,72.2,73.4,69.1,69.0,88.3,92.0],
 ['hadrian',71.3,68.3,70.4,77.5,78.5,75.8,92.7],
 ['lindholm',68.2,64.9,69.8,71.1,67.7,85.5,90.4],
 ['hollenberg',66.9,70.8,60.9,67.8,65.3,84.3,83.4],
 ['bearford',64.9,65.3,57.9,66.3,68.4,79.5,91.4],
 ['ortez',64.8,63.1,68.9,62.0,59.4,82.3,91.9],
 ['bortelli',64.6,64.4,58.4,63.6,66.5,82.6,89.5],
 ['takase',64.5,68.6,56.8,70.1,56.8,78.0,92.0],
 ['sainor',64.0,62.5,64.7,59.4,65.8,82.6,82.9],
 ['colavita',61.7,59.9,63.1,65.9,62.1,79.0,80.8],
 ['alburn',59.9,59.8,62.7,53.0,55.7,78.0,89.5],
 ['peralta',59.7,58.9,63.3,55.6,56.4,77.6,81.7],
 ['alvarro',59.4,56.6,58.8,56.4,61.4,78.1,89.2],
 ['sterling',58.9,56.8,62.3,57.5,51.0,77.9,91.0],
 ['botten',51.5,45.8,49.8,47.6,53.9,71.4,89.1]
];
export const PERFORMANCE_2026: Record<string,SourcePerformance> = Object.fromEntries(ROWS.map(
 ([id,overallReference,pace,racecraft,tyreManagement,qualifying,consistency,discipline]) => [
  `driver.${id}`,{season:2026,dataset:'P2P 2026',overallReference,pace,racecraft,tyreManagement,qualifying,consistency,discipline,
   ...(['alvarro','sterling','botten'].includes(id)?{rankingContext:{gradedRounds:13,totalRounds:18,ranked:false}}:{})}
 ]));
