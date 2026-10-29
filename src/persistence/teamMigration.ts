import { SAVE_V3, INITIAL_V3, SAVE_V1 } from './contracts';
import { initialReleasedDrivers } from './contracts/preCalendarRules';

import type { GameUniverse } from './contracts/preCalendarTypes';
import { validateReleasedUniverse } from './contracts/preCalendarValidation';

/** Preserve earned parts/projects/spend/history. The new entrant alone receives an initial car. */
export function migrateTenTeamUniverse(input:unknown):GameUniverse {
 validateReleasedUniverse(input,SAVE_V1);
 const old=JSON.parse(JSON.stringify(input)) as GameUniverse;
 const LEGACY_TEAM_MAP=SAVE_V3.legacyTeamMap;
 const mapped:GameUniverse['development']['teams']={};
 for(const [id,team] of Object.entries(old.development.teams)) {
   const next=LEGACY_TEAM_MAP[id];
   if(!next) throw new Error(`Unmapped legacy team: ${id}`);
   mapped[next]={...team,teamId:next}; // Project IDs stay opaque/stable: pending RNG outcomes are preserved.
 }
 mapped['team.caldera']=JSON.parse(JSON.stringify(INITIAL_V3.caldera));
 const drivers=initialReleasedDrivers(2025+old.development.season,old.development.week);
 return {...old,definitionVersion:SAVE_V3.definition.version,playerTeamId:'team.wellington',drivers,
   development:{...old.development,teams:mapped,submissions:old.development.submissions.map(s=>({...s,teamId:LEGACY_TEAM_MAP[s.teamId]!}))}};
}
