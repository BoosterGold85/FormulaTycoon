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
   // Track map: only cars out of the garage are placed, within their three-lap run, and a lost lap stands still.
   expect(r.onTrack===null).toBe(r.phase==='GARAGE'||r.phase==='MISSED');
   if(r.onTrack){expect(r.onTrack.laps).toBeGreaterThanOrEqual(0);expect(r.onTrack.laps).toBeLessThan(r.phase==='OUT_LAP'?Infinity:3);expect(r.onTrack.moving).toBe(r.phase!=='OFF');}
   if(r.phase==='FLYING')expect(Math.floor(r.onTrack!.laps)).toBe(1);
   if(r.phase==='IN_LAP')expect(Math.floor(r.onTrack!.laps)).toBe(2);
  });
  expect(rows.some(r=>r.moved!==0&&r.time===null)).toBe(false);
 }
});

import {FORMAT,bestTime,qualifyingHeadline,selectQualifyingGrid} from '../qualifying';
test('result headlines tell the stored story: pole, margins, teammate knock-outs; no pronouns',()=>{
 const seen=new Set<string>();
 for(const seed of [1,2,3,4,5,6]){
  const w=advanceCampaignTo(createGameUniverse(definition,seed),definition,'2026-12-14' as CampaignDate);
  for(const s of Object.values(w.qualifying!.sessions)){
   const grid=selectQualifyingGrid(w,s.eventId)!;
   expect(grid.rows.filter(r=>r.headline).length).toBe(grid.rows.filter(r=>r.mine).length);
   for(const g of s.grid!.filter(g=>g.teamId===w.playerTeamId)){
    const h=qualifyingHeadline(w,s,g.driverId)!,r=s.segments[g.segment]!,cut=FORMAT[g.segment].cars-FORMAT[g.segment].out;
    expect(h.headline).not.toMatch(/\b(his|her|he|she)\b/i);
    expect(h.detail).not.toMatch(/\b(his|her|he|she)\b/i);
    const kind=h.headline.replace(/[A-Z][a-z]+$/,'·').replace(/[\d.]+s/,'#');seen.add(kind);
    if(h.headline==='Pole position!')expect(g.position).toBe(1);
    if(h.headline==='Front row')expect(g.position).toBe(2);
    const from=/^([\d.]+)s from (Q2|Q3)$/.exec(h.headline);
    if(from){
     const margin=bestTime(r.laps,g.driverId)!-bestTime(r.laps,r.order[cut-1]!)!;
     expect(margin).toBeLessThan(0.1);expect(Number(from[1])).toBeCloseTo(margin,2);
     expect(from[2]).toBe(g.segment==='Q1'?'Q2':'Q3');
    }
    if(h.headline.startsWith('Knocked out by teammate')){
     const mate=s.entrants.find(e=>e.teamId===g.teamId&&e.driverId!==g.driverId)!.driverId;
     expect(r.order[cut-1]).toBe(mate);
     expect(h.headline).toContain(w.drivers!.drivers[mate]!.name.split(' ').slice(-1)[0]!);
    }
    if(h.tone==='GOOD')expect(g.segment).toBe('Q3');
   }
  }
 }
 // The sample exercises more than one kind of story.
 expect(seen.size).toBeGreaterThan(3);
});
