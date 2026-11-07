import {expect,test} from '@jest/globals';
import {doubleLoopRanges,loopPath,outlineAspect,pointAt} from '../qualifying/trackGeometry';

const melbourne=[[8,45],[17,20],[38,14],[54,29],[78,23],[92,38],[78,67],[59,69],[46,86],[22,78]];

test('the Melbourne map loop is closed, fits its box and has increasing arc fractions',()=>{
 const w=300,h=Math.round(w*outlineAspect(melbourne)),path=loopPath(melbourne,w,h);
 expect(path.pts[0]).toEqual(path.pts[path.pts.length-1]);
 expect(path.fractions[0]).toBe(0);expect(path.fractions.at(-1)).toBeCloseTo(1,10);
 for(let i=1;i<path.fractions.length;i++)expect(path.fractions[i]!).toBeGreaterThan(path.fractions[i-1]!);
 for(const p of path.pts){expect(p.x).toBeGreaterThanOrEqual(-1e-9);expect(p.x).toBeLessThanOrEqual(w+1e-9);expect(p.y).toBeGreaterThanOrEqual(-1e-9);expect(p.y).toBeLessThanOrEqual(h+1e-9);}
 // Fills the box in at least one direction.
 const xs=path.pts.map(p=>p.x),ys=path.pts.map(p=>p.y);
 expect(Math.max(Math.max(...xs)-Math.min(...xs),(Math.max(...ys)-Math.min(...ys))*w/h)).toBeCloseTo(w,0);
});

test('positions wrap at the line and the two-lap table is strictly increasing',()=>{
 const path=loopPath(melbourne,300,220),start=pointAt(path,0),lap=pointAt(path,1),r=doubleLoopRanges(path);
 expect(lap.x).toBeCloseTo(start.x,6);expect(lap.y).toBeCloseTo(start.y,6);
 for(let i=1;i<r.input.length;i++)expect(r.input[i]!).toBeGreaterThan(r.input[i-1]!);
 expect(r.input[0]).toBe(0);expect(r.input.at(-1)).toBeCloseTo(2,10);
});
