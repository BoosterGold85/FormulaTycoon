/** Type-only historical shapes. Old JSON/schema/rules are unchanged by the v4 live clock removal. */
import type { GameUniverse as CurrentUniverse } from '../../simulation/universe/types';
import type { DriverWorld as CurrentDrivers, DriverContract } from '../../game/drivers/types';
import type { DevelopmentWorld } from '../../simulation/development/types';
export type HistoricalContract=Omit<DriverContract,'option'>&{option:null|{season:number;deadlineSeason:number;deadlineWeek:number;salaryM:number;state:'PENDING'|'EXERCISED'|'DECLINED'|'LAPSED'}};
export type DriverWorld=Omit<CurrentDrivers,'contracts'>&{season:number;week:number;contracts:HistoricalContract[]};
export type GameUniverse=Omit<CurrentUniverse,'currentDate'|'development'|'drivers'>&{development:DevelopmentWorld;drivers?:DriverWorld};
