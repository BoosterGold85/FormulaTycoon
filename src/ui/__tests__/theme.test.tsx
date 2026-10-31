import {test,expect} from '@jest/globals';
import React,{act} from 'react';
import {ThemeProvider,useTheme,readThemePreference,writeThemePreference,THEME_PREFERENCE_KEY} from '../theme';
import {TEAM_BRANDS} from '../../game/brandRegistry';
import {readableTeamInk,themeTokens} from '../design/tokens';
const {create}=require('react-test-renderer');

test('light is default; valid dark preference survives; corrupt or unavailable storage is safe',()=>{
 expect(readThemePreference({getItem:()=>null,setItem:()=>{}})).toBe('light');
 expect(readThemePreference({getItem:()=> 'dark',setItem:()=>{}})).toBe('dark');
 expect(readThemePreference({getItem:()=> 'light',setItem:()=>{}})).toBe('light');
 expect(readThemePreference({getItem:()=> 'invalid',setItem:()=>{}})).toBe('light');
 expect(readThemePreference({getItem:()=>{throw new Error('blocked');},setItem:()=>{}})).toBe('light');
 const writes:string[][]=[];
 writeThemePreference('dark',{getItem:()=>null,setItem:(key,value)=>{writes.push([key,value]);}});
 expect(writes).toEqual([[THEME_PREFERENCE_KEY,'dark']]);
 expect(()=>writeThemePreference('light',{getItem:()=>null,setItem:()=>{throw new Error('blocked');}})).not.toThrow();
});

test('theme changes update the same mounted children rather than remounting their state',()=>{
 let api:ReturnType<typeof useTheme>,mounts=0,tree:any;
 function Probe(){
  api=useTheme();const [preserved]=React.useState(()=>++mounts);
  return React.createElement('probe',{mode:api.theme.mode,preserved});
 }
 try{
  act(()=>{tree=create(<ThemeProvider><Probe/></ThemeProvider>);});
  expect(tree.root.findByType('probe').props).toMatchObject({mode:'light',preserved:1});
  act(()=>api.setMode('dark'));
  expect(tree.root.findByType('probe').props).toMatchObject({mode:'dark',preserved:1});
  act(()=>api.setMode('light'));
  expect(tree.root.findByType('probe').props).toMatchObject({mode:'light',preserved:1});
  expect(mounts).toBe(1);
 }finally{if(tree)act(()=>tree.unmount());}
});

test('both modes expose the same semantic contract and accessible text, status and button pairs',()=>{
 const luminance=(hex:string)=>{
  const rgb=[1,3,5].map(i=>parseInt(hex.slice(i,i+2),16)/255).map(v=>v<=.04045?v/12.92:((v+.055)/1.055)**2.4);
  return rgb[0]!*.2126+rgb[1]!*.7152+rgb[2]!*.0722;
 };
 const contrast=(a:string,b:string)=>{const x=luminance(a),y=luminance(b);return (Math.max(x,y)+.05)/(Math.min(x,y)+.05);};
 expect(Object.keys(themeTokens('light')).sort()).toEqual(Object.keys(themeTokens('dark')).sort());
 for(const mode of ['light','dark'] as const){
  const t=themeTokens(mode);
  for(const bg of [t.background,t.surface,t.surfaceElevated,t.hero,t.chip,t.weekend,t.nextWeekend]){
   for(const ink of [t.textPrimary,t.textSecondary,t.success,t.warning,t.danger,t.accent])expect(contrast(ink,bg)).toBeGreaterThanOrEqual(4.5);
  }
  expect(contrast(t.onAccent,t.accent)).toBeGreaterThanOrEqual(4.5);
  expect(contrast(t.navText,t.navBackground)).toBeGreaterThanOrEqual(4.5);
  expect(contrast(t.navAccent,t.navSelected)).toBeGreaterThanOrEqual(4.5);
 }
});


test('team-colored text remains readable on both themes without mutating team identities',()=>{
 const before=JSON.stringify(TEAM_BRANDS);
 const luminance=(hex:string)=>{const c=[1,3,5].map(i=>parseInt(hex.slice(i,i+2),16)/255).map(v=>v<=.04045?v/12.92:((v+.055)/1.055)**2.4);return c[0]!*.2126+c[1]!*.7152+c[2]!*.0722;};
 for(const mode of ['light','dark'] as const)for(const team of TEAM_BRANDS){
  const t=themeTokens(mode),ink=readableTeamInk(team.colors.primary,t),a=luminance(ink);
  for(const bg of [t.background,t.surface,t.hero,t.surfaceElevated]){const b=luminance(bg);expect((Math.max(a,b)+.05)/(Math.min(a,b)+.05)).toBeGreaterThanOrEqual(4.5);}
 }
 expect(JSON.stringify(TEAM_BRANDS)).toBe(before);
});
