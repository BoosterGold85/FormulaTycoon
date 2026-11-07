import {expect,test} from '@jest/globals';
import {createHash} from 'crypto';
import {DEFAULT_GAME_DEFINITION as definition} from '../../game/defaultGame';
import {advanceCampaignTo,createGameUniverse} from '../universe';
import type {CampaignDate} from '../campaignTime';

/**
 * Determinism guard for presentation work: every stored qualifying result (laps, sectors, calls, order,
 * grid, reasons) of a headless season must stay byte-identical. Recorded on the untouched engine before the
 * broadcast restyle; a change here means a result, lap time, RNG key or seed use changed.
 * Re-recorded for owner-approved event-driven calls, and again when the owner halved yellow-flag frequency (conditions changes, yellow flags): only sessions with an
 * event changed; every event-free session is proven byte-identical by qualifying.test.ts (per-session fixture).
 */
const FINGERPRINT:Record<number,string>={
 11:'6383fabacfbf1ec264ab0163322034481540d41bcdbbcef406cbf6be7a936048',
 42:'8914ae4349d5db83860607ffc965a66ad2b610347233269e03cf6c1ed2a6df3b'
};
const hash=(seed:number)=>{
 const u=advanceCampaignTo(createGameUniverse(definition,seed),definition,'2026-12-14' as CampaignDate);
 expect(Object.keys(u.qualifying!.sessions).length).toBeGreaterThan(20);
 return createHash('sha256').update(JSON.stringify(u.qualifying)).digest('hex');
};

test.each([11,42])('stored qualifying results for seed %i are unchanged',seed=>{
 expect(hash(seed)).toBe(FINGERPRINT[seed]);
});
