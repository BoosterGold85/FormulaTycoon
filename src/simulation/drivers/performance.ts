import type { SourcePerformance } from '../../game/drivers/performance2026';
import type { Abilities } from '../../game/drivers/types';
/** Starting observation -> three buckets only. Do not overwrite authored ability in other areas. */
export function deriveStartingAbilities(authored:Abilities,source:SourcePerformance):Abilities {
 return {...authored,talent:(source.pace+source.qualifying)/2,racecraft:(source.racecraft+source.tyreManagement)/2,
   composure:(source.consistency+source.discipline)/2};
}
export function formLabel(value:number) {
 if(!Number.isFinite(value)||value<0||value>100)throw new Error('Invalid form');
 return value>=85?'EXCELLENT':value>=65?'GOOD':value>=40?'NORMAL':value>=20?'POOR':'STRUGGLING';
}
