import {expect,test} from '@jest/globals';
import {createHash} from 'crypto';
import {DEFAULT_GAME_DEFINITION as definition} from '../../game/defaultGame';
import {advanceCampaignTo,createGameUniverse} from '../universe';
import type {CampaignDate} from '../campaignTime';

/**
 * Determinism guard for presentation work: every stored qualifying result (laps, sectors, calls, order,
 * grid, reasons) of a headless season must stay byte-identical. Recorded on the untouched engine before the
 * broadcast restyle; a change here means a result, lap time, RNG key or seed use changed.
 */
const FINGERPRINT:Record<number,string>={
 11:'7ef8b7419df1088dc040f378a9c0026bbf0bf1398c6d98df8b1fb4e5edaac55c',
 42:'3f19e4d9fe6933321d5165478474cc2487d58924273b07c2d910e670fa2f1207'
};
const hash=(seed:number)=>{
 const u=advanceCampaignTo(createGameUniverse(definition,seed),definition,'2026-12-14' as CampaignDate);
 expect(Object.keys(u.qualifying!.sessions).length).toBeGreaterThan(20);
 return createHash('sha256').update(JSON.stringify(u.qualifying)).digest('hex');
};

test.each([11,42])('stored qualifying results for seed %i are unchanged',seed=>{
 expect(hash(seed)).toBe(FINGERPRINT[seed]);
});
