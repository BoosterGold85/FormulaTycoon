import {expect,test} from '@jest/globals';
import {createHash} from 'crypto';
import {DEFAULT_GAME_DEFINITION as definition} from '../../game/defaultGame';
import {advanceCampaignTo,createGameUniverse} from '../universe';
import type {CampaignDate} from '../campaignTime';

/**
 * Determinism guard for presentation work: every stored qualifying result (laps, sectors, calls, order,
 * grid, reasons) of a headless season must stay byte-identical. Recorded on the untouched engine before the
 * broadcast restyle; a change here means a result, lap time, RNG key or seed use changed.
 * Re-recorded once for owner-approved event-driven calls (conditions changes, yellow flags): only sessions with an
 * event changed; every event-free session is proven byte-identical by qualifying.test.ts (per-session fixture).
 */
const FINGERPRINT:Record<number,string>={
 11:'48f271318f93c595326ce6f0fef6be4098f26155ac8f45c8ca09a525a6d20108',
 42:'e3db00bc556080ad8c36d5283292011109284ca953abd0dfc35e666fe663d7bb'
};
const hash=(seed:number)=>{
 const u=advanceCampaignTo(createGameUniverse(definition,seed),definition,'2026-12-14' as CampaignDate);
 expect(Object.keys(u.qualifying!.sessions).length).toBeGreaterThan(20);
 return createHash('sha256').update(JSON.stringify(u.qualifying)).digest('hex');
};

test.each([11,42])('stored qualifying results for seed %i are unchanged',seed=>{
 expect(hash(seed)).toBe(FINGERPRINT[seed]);
});
