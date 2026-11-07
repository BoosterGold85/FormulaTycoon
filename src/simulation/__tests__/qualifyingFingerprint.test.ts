import {expect,test} from '@jest/globals';
import {createHash} from 'crypto';
import {DEFAULT_GAME_DEFINITION as definition} from '../../game/defaultGame';
import {advanceCampaignTo,createGameUniverse} from '../universe';
import type {CampaignDate} from '../campaignTime';

/**
 * Determinism guard for presentation work: every stored qualifying result (laps, sectors, calls, order,
 * grid, reasons) of a headless season must stay byte-identical. Recorded on the untouched engine before the
 * broadcast restyle; a change here means a result, lap time, RNG key or seed use changed.
 * Re-recorded for owner-approved event-driven calls, again when the owner halved yellow-flag frequency, and for red flags (conditions changes, yellow flags): only sessions with an
 * event changed; every event-free session is proven byte-identical by qualifying.test.ts (per-session fixture).
 */
const FINGERPRINT:Record<number,string>={
 11:'bc20264773902258d7cf45e55a410767c82eef449548d2cb83630eabd91f48c7',
 42:'e9cbccab80ae43563c387b8a1a09d39fdcf3c8a3c3f5cd7a6dec5f05c0ba0ae8'
};
const hash=(seed:number)=>{
 const u=advanceCampaignTo(createGameUniverse(definition,seed),definition,'2026-12-14' as CampaignDate);
 expect(Object.keys(u.qualifying!.sessions).length).toBeGreaterThan(20);
 return createHash('sha256').update(JSON.stringify(u.qualifying)).digest('hex');
};

test.each([11,42])('stored qualifying results for seed %i are unchanged',seed=>{
 expect(hash(seed)).toBe(FINGERPRINT[seed]);
});
