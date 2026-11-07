import {describe,expect,test} from '@jest/globals';
import {DEFAULT_ROSTER} from '../../../../game/roster';
import {CHARCOAL,OFF_WHITE,contrast,formShade} from '../color';
import {carArt} from '../car';
import {HELMET_PATTERN_NAMES,helmetArt} from '../helmet';
import {toSvg,type VectorArt} from '../shapes';

const fills=(art:VectorArt)=>art.layers.flatMap(l=>l.shapes.map(s=>s.kind==='stroke'?s.stroke:s.fill));
const teams=DEFAULT_ROSTER.teams;

describe('parametric helmet',()=>{
 test('deterministic, text-free SVG at any size',()=>{
  const art=helmetArt({colors:teams[0]!.colors,pattern:3,detail:'full'});
  expect(toSvg(art,200,'x')).toBe(toSvg(helmetArt({colors:teams[0]!.colors,pattern:3,detail:'full'}),200,'x'));
  expect(toSvg(art,48,'x')).not.toMatch(/<text|<image|NaN/);
 });
 test('teammates never share a design for any team in the default roster',()=>{
  for(const t of teams){
   const [a,b]=DEFAULT_ROSTER.drivers.filter(d=>d.group==='grid'&&Math.ceil(d.slot/2)===t.slot);
   const svg=(p:number)=>toSvg(helmetArt({colors:t.colors,pattern:p,detail:'full'}),100,'x');
   expect(svg(a!.helmetPattern)).not.toBe(svg(b!.helmetPattern));
  }
 });
 test('all 8 patterns are distinct, and the small version carries fewer shapes',()=>{
  const c=teams[2]!.colors;
  expect(new Set(HELMET_PATTERN_NAMES.map((_,i)=>toSvg(helmetArt({colors:c,pattern:i,detail:'full'}),100,'x'))).size).toBe(8);
  const count=(d:'full'|'small')=>helmetArt({colors:c,pattern:0,detail:d}).layers.reduce((n,l)=>n+l.shapes.length,0);
  expect(count('small')).toBeLessThan(count('full'));
 });
 test('subject uses only the palette slots plus one form shade per colour',()=>{
  for(const t of teams){
   const c=t.colors,allowed=new Set([c.primary,c.secondary,c.accent,OFF_WHITE,CHARCOAL,'#DCE8F1',
    ...[c.primary,c.secondary,c.accent,OFF_WHITE,CHARCOAL].map(formShade)]);
   for(const f of fills(helmetArt({colors:c,pattern:t.slot%8,detail:'full'})))expect(allowed.has(f)).toBe(true);
  }
 });
 test('very dark shells get a pale visor seal so the charcoal visor stays visible',()=>{
  const dark=teams.find(t=>contrast(t.colors.primary,CHARCOAL)<1.8)!;
  expect(fills(helmetArt({colors:dark.colors,pattern:0,detail:'full'}))).toContain(OFF_WHITE);
 });
});

describe('parametric car',()=>{
 test('same geometry for every team; only colours change',()=>{
  const shape=(i:number)=>toSvg(carArt({colors:teams[i]!.colors,detail:'full'}),320,'x').replace(/#[0-9A-F]{6}/gi,'#');
  for(let i=1;i<teams.length;i++)expect(shape(i)).toBe(shape(0));
 });
 test('rims use team primary unless the primary would vanish into the tyre',()=>{
  const light=teams.find(t=>contrast(t.colors.primary,CHARCOAL)>=1.6)!;
  expect(fills(carArt({colors:light.colors,detail:'full'}))).toContain(light.colors.primary);
  expect(toSvg(carArt({colors:light.colors,detail:'small'}),56,'x')).not.toMatch(/NaN|<text/);
 });
});
