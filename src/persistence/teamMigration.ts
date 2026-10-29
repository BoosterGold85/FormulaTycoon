import { LEGACY_GAME_DEFINITION } from '../game/legacyGame';
import { DEFAULT_GAME_DEFINITION } from '../game/defaultGame';
import { LEGACY_TEAM_MAP } from '../game/brandRegistry';
import { createDevelopmentWorld } from '../simulation/development';
import { createDriverWorld, updateDriverCalendar } from '../simulation/drivers';
import type { GameUniverse } from '../simulation/universe';
import { validateUniverse } from './universeValidation';

/** Preserve earned parts/projects/spend/history. The new entrant alone receives an initial car. */
export function migrateTenTeamUniverse(input:unknown):GameUniverse {
 validateUniverse(input,LEGACY_GAME_DEFINITION);
 const old=JSON.parse(JSON.stringify(input)) as GameUniverse;
 const fresh=createDevelopmentWorld(DEFAULT_GAME_DEFINITION.development,old.seed);
 const mapped:typeof fresh.teams={};
 for(const [id,team] of Object.entries(old.development.teams)) {
   const next=LEGACY_TEAM_MAP[id];
   if(!next) throw new Error(`Unmapped legacy team: ${id}`);
   mapped[next]={...team,teamId:next}; // Project IDs stay opaque/stable: pending RNG outcomes are preserved.
 }
 mapped['team.caldera']={...fresh.teams['team.caldera']!,aeroAllowance:1.2};
 const drivers=updateDriverCalendar(createDriverWorld(),2025+old.development.season,old.development.week);
 return {...old,definitionVersion:DEFAULT_GAME_DEFINITION.version,playerTeamId:'team.wellington',drivers,
   development:{...old.development,teams:mapped,submissions:old.development.submissions.map(s=>({...s,teamId:LEGACY_TEAM_MAP[s.teamId]!}))}};
}
