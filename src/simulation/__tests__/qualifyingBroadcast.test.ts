import {expect,test} from '@jest/globals';
import {DEFAULT_GAME_DEFINITION as definition} from '../../game/defaultGame';
import {advanceCampaignTo,createGameUniverse} from '../universe';
import type {CampaignDate} from '../campaignTime';
import {BEATS_PER_MINUTE,SESSION_MINUTES,codesFor,driverCodes,liveTiming} from '../qualifying';

const u=advanceCampaignTo(createGameUniverse(definition,11),definition,'2026-03-09' as CampaignDate);
const session=u.qualifying!.sessions['event.2026.melbourne']!;
test('the fixture session is complete',()=>expect(session.status).toBe('COMPLETE'));

test('every driver in the world gets a unique three-letter code, stable across reads',()=>{
 const codes=driverCodes(u),values=Object.values(codes);
 expect(values.length).toBe(Object.keys(u.drivers!.drivers).length);
 expect(new Set(values).size).toBe(values.length);
 for(const c of values)expect(c).toMatch(/^[A-Z]{3}$/);
 expect(driverCodes(u)).toEqual(codes);
});

test('code clashes resolve deterministically, whatever the input order',()=>{
 const a=[{id:'d1',name:'Ana Martin'},{id:'d2',name:'Bo Martinez'},{id:'d3',name:'Cy Martell'},{id:'d4',name:'Émile Ångström'}];
 const codes=codesFor(a);
 expect(codes).toEqual(codesFor([...a].reverse()));
 expect(codes.d1).toBe('MAR');
 expect(codes.d2).toBe('BMA');
 expect(new Set(Object.values(codes)).size).toBe(4);
 expect(codes.d4).toBe('ANG');
});

test('broadcast tower fields agree with the stored timing at every beat',()=>{
 for(let beat=0;beat<=SESSION_MINUTES*BEATS_PER_MINUTE;beat++){
  const live=liveTiming(u,session,beat),rows=live.rows;
  rows.forEach((r,i)=>{
   expect(r.code).toBe(driverCodes(u)[r.driverId]);
   // Interval: exactly the time gap to the car directly ahead, only when both are timed.
   const ahead=rows[i-1];
   if(r.time!==null&&ahead?.time!=null)expect(r.interval).toBe(`+${(r.time-ahead.time).toFixed(3)}`);
   else expect(r.interval).toBeNull();
   // Last lap: PB means it set the shown best; SLOWER is measured against that best.
   if(r.last?.kind==='PB')expect(r.time).not.toBeNull();
   if(r.last?.kind==='SLOWER')expect(Number(r.last.text)).toBeGreaterThan(0);
   if(r.time===null)expect(r.moved).toBe(0);
   if(r.phase!=='GARAGE'||r.last)expect(r.tyre).not.toBeNull();
  });
  expect(rows.some(r=>r.moved!==0&&r.time===null)).toBe(false);
 }
});
