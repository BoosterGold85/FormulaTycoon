import type {GameUniverse} from '../simulation/universe';
import type {DevelopmentContext} from '../game/development';
import {estimateResearch} from '../simulation/qualifying/research';
import {SAVE_V7,SAVE_V8} from './contracts';
import {validateUniverseV7} from './contracts/validationV7';

/**
 * V7 -> V8 after frozen V7 validation. Careers keep their development rules and history. A career
 * with drivers gains empty qualifying state: no session is backfilled, and the season Research total
 * is the owner-approved estimate from work already done on current projects (frozen v8 parts).
 */
export function migrateQualifyingUniverse(input:unknown):GameUniverse {
 validateUniverseV7(input,SAVE_V7);
 const old=JSON.parse(JSON.stringify(input)) as GameUniverse;
 const context=SAVE_V8.definition.development as DevelopmentContext;
 const migrated:GameUniverse={...old,definitionVersion:SAVE_V8.definition.version};
 if(!old.drivers)return migrated;
 const researchPoints=Object.fromEntries(context.teams.map(t=>[t.id,old.development.teams[t.id]?estimateResearch(old.development.teams[t.id]!,context):0]));
 return {...migrated,qualifying:{rules:1,researchPoints,sessions:{}}};
}
