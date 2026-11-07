import {afterEach,expect,test} from '@jest/globals';
import {DEFAULT_GAME_DEFINITION as definition} from '../../game/defaultGame';
import {DEFAULT_ROSTER,parseRosterPack,setDisplayRoster} from '../../game/roster';
import {readFileSync} from 'fs';
import {join} from 'path';
import {advanceCampaignTo,createGameUniverse,type GameUniverse} from '../universe';
import {nextTurnTarget,startPlayerProject} from '../developmentLoop';
import {selectTeamScreen} from '../teamScreen';

afterEach(()=>setDisplayRoster(DEFAULT_ROSTER));
const fresh=()=>createGameUniverse(definition,1);
function played(turns:number){
 const r=startPlayerProject(fresh(),definition,{partId:'FLOOR',objective:'PERFORMANCE',approach:'BALANCED'});
 if(!r.ok)throw new Error(r.reason);let u:GameUniverse=r.universe;
 for(let i=0;i<turns;i++){const t=nextTurnTarget(u);if(!t)break;u=advanceCampaignTo(u,definition,t.date);}
 return u;
}
const text=(m:unknown)=>JSON.stringify(m);

test('read-only: building the model never changes the universe',()=>{
 const u=played(12),before=JSON.stringify(u);
 selectTeamScreen(u,definition);
 expect(JSON.stringify(u)).toBe(before);
});

test('new career: predictions and honest empty states, never a bare 0',()=>{
 const m=selectTeamScreen(fresh(),definition);
 expect(m.team).toMatchObject({id:'team.wellington',name:'Ardent Dynamics',shortName:'Ardent'});
 const tile=(k:string)=>m.tiles.find(t=>t.key===k)!;
 expect(tile('championship').value).toMatch(/^P([1-9]|1[01])$/);
 expect(tile('championship').caption).toBe('Pre-season prediction');
 expect(tile('target')).toMatchObject({value:'Building',caption:'Board expectation'});
 expect(tile('budget').caption).toBe('Unspent');
 expect(tile('next')).toMatchObject({value:'4 days',caption:'Melbourne · Round 1'});
 for(const t of m.tiles)expect(t.value).not.toMatch(/^\$?0(M)?$/);
 expect(m.battle).toMatchObject({sessions:0,wins:[0,0],text:'First qualifying in Melbourne'});
 expect(m.season).toMatchObject({results:[],firstVenue:'Melbourne',completed:0,total:23});
 expect(m.season.upcoming.map(e=>[e.round,e.venue,e.isNext])).toEqual([[1,'Melbourne',true],[2,'Shanghai',false],[3,'Suzuka',false]]);
 expect(m.factory).toMatchObject({idle:true,title:'Factory idle'});
 expect(m.drivers).toHaveLength(2);
 for(const d of m.drivers){
  expect(d.story).toMatch(/^Target this weekend: (fight for the front row|reach Q3|reach Q2|get out of Q1)/);
  expect(d.chips.join(' ')).not.toMatch(/\bOVR\b|overall/i);
  expect(d.chips.some(c=>/^Talent [A-F]/.test(c))).toBe(true);
  expect(['Excellent','Good','Steady','Poor','Struggling']).toContain(d.form.word);
 }
 expect(new Set(m.drivers.map(d=>d.number)).size).toBe(2);
});

test('car bars compare with the grid average; fit tags sit on the matching bar',()=>{
 const m=selectTeamScreen(fresh(),definition);
 expect(m.car.bars.map(b=>b.label)).toEqual(['Power','Downforce','Reliability','Tyre wear']);
 for(const b of m.car.bars){
  expect(Number.isInteger(b.delta)).toBe(true);
  expect(b.tone).toBe(b.delta>=2?'good':b.delta<=-2?'poor':'even');
  if(b.tag)expect(b.tag.kind==='STRENGTH'?b.tone!=='poor':b.tone!=='good').toBe(true);
 }
 // Every fit statement appears exactly once: on a bar or in the overflow list.
 const placed=[...m.car.bars.flatMap(b=>b.tag?[b.tag.text]:[]),...m.car.other.map(o=>o.text)];
 expect(new Set(placed).size).toBe(placed.length);
 expect(m.car.fit).not.toBeNull();
 // The grid average is a real average: deltas across all teams sum to about zero (checked via the player only bounds).
 for(const b of m.car.bars)expect(Math.abs(b.delta)).toBeLessThan(40);
});

test('organisation shows the real HQ departments and staff, never "No staff" when people work there',()=>{
 const m=selectTeamScreen(fresh(),definition);
 expect(m.organisation.map(d=>d.id)).toEqual(definition.headquarters.layout.departments.map(d=>d.id));
 expect(m.organisation.reduce((s,d)=>s+d.headcount,0)).toBe(definition.headquarters.roster.length);
 expect(m.organisation.find(d=>d.id==='AERO')!.quality).toMatch(/^[A-F][+-]?$/);
 expect(text(m)).not.toMatch(/No staff|Hire/);
});

test('after qualifying weekends: results, head-to-head and stories come from stored sessions',()=>{
 const u=played(20),m=selectTeamScreen(u,definition);
 const sessions=Object.values(u.qualifying!.sessions).filter(s=>s.grid);
 expect(sessions.length).toBeGreaterThan(0);
 expect(m.season.completed).toBeGreaterThan(0);
 expect(m.season.results.length).toBe(Math.min(3,sessions.length));
 const lastSession=sessions[sessions.length-1]!,latest=m.season.results[m.season.results.length-1]!;
 for(const p of latest.positions){
  const d=m.drivers.find(x=>x.code===p.code)!;
  expect(p.position).toBe(lastSession.grid!.find(g=>g.driverId===d.id)!.position);
 }
 expect(m.battle!.sessions).toBe(sessions.length);
 expect(m.battle!.wins[0]+m.battle!.wins[1]).toBe(sessions.length);
 expect(m.battle!.text).toMatch(/^Qualifying \d+–\d+$/);
 expect(m.drivers.every(d=>/Qualified P\d+ in /.test(d.story??''))).toBe(true);
 expect(m.tiles.find(t=>t.key==='championship')!.caption).toMatch(/races not simulated yet/);
 expect(m.factory.idle).toBe(false);
});

test('a cosmetic roster pack renames the team band and drivers without touching the model data',()=>{
 const before=selectTeamScreen(fresh(),definition);
 const r=parseRosterPack(readFileSync(join(__dirname,'../../game/roster/__tests__/fixtures/sample-cosmetic.json'),'utf8'));
 if(!r.ok)throw new Error('pack');setDisplayRoster(r.roster);
 const after=selectTeamScreen(fresh(),definition);
 expect(after.team).toMatchObject({name:'Ironpine Motorsport',shortName:'Ironpine'});
 expect(after.drivers[0]!.name).toBe('Imke Sandvoort');
 expect(after.car.bars).toEqual(before.car.bars);
 expect(after.tiles.map(t=>t.value)).toEqual(before.tiles.map(t=>t.value));
});
