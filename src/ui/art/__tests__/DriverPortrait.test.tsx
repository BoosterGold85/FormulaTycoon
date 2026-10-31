import {test,expect} from '@jest/globals';
import React,{act} from 'react';
import {StyleSheet} from 'react-native';
import {DriverPortrait,TeamDriverPortrait} from '../DriverPortrait';
import {portraitColorsForTeam,resolvePortraitColors,PORTRAIT_VISOR,type PortraitColors} from '../portraitPalette';
import {TEAM_BRANDS,teamBrand} from '../../../game/brandRegistry';
import {DEFAULT_GAME_DEFINITION} from '../../../game/defaultGame';
import {createGameUniverse} from '../../../simulation/universe';
import {driverView,signDriverContract} from '../../../simulation/drivers';
import {NEW_CAREER_DATE} from '../../../simulation/campaignTime';
// Already installed through jest-expo. No new test dependency.
const {create}=require('react-test-renderer');
const PALETTES:PortraitColors[]=[
 {primary:'#FF8700',secondary:'#1E1E1E',accent:'#FFFFFF'},
 {primary:'#D83A4C',secondary:'#1E1E1E',accent:'#FFFFFF'},
 {primary:'#BEC8CD',secondary:'#247E83',accent:'#000000'}
];
const color=(tree:any,id:string)=>StyleSheet.flatten(tree.root.findByProps({testID:id}).props.style).backgroundColor;
const geometry=(node:any):unknown=>node===null||typeof node!=='object'?node:{
 type:node.type,testID:node.props?.testID,
 style:Object.fromEntries(Object.entries(StyleSheet.flatten(node.props?.style)||{}).filter(([key])=>!key.toLowerCase().includes('color'))),
 children:node.children?.map(geometry)
};

test('one mounted template recolors all six regions across three palettes with fixed visor and identical geometry',()=>{
 let tree:any;
 try{
  act(()=>{tree=create(<DriverPortrait {...PALETTES[0]!} size={100}/>);});
  const original=geometry(tree.toJSON());
  for(const palette of PALETTES){
   act(()=>tree.update(<DriverPortrait {...palette} size={100}/>));
   for(const region of ['helmet','suit'])for(const token of ['primary','secondary','accent'] as const)
    expect(color(tree,`${region}-${token}`)).toBe(palette[token]);
   expect(color(tree,'portrait-visor')).toBe(PORTRAIT_VISOR);
   expect(geometry(tree.toJSON())).toEqual(original);
  }
 }finally{if(tree)act(()=>tree.unmount());}
});

test('the same mounted portrait follows current employment after a domain signing and never follows stale familiarity',()=>{
 const initial=createGameUniverse(DEFAULT_GAME_DEFINITION,7),observer=initial.playerTeamId!,id='driver.sainor';
 let world=initial.drivers!,tree:any;
 const view=()=>driverView(world,observer,id,NEW_CAREER_DATE);
 try{
  act(()=>{tree=create(<TeamDriverPortrait teamId={view().teamId}/>);});
  expect(color(tree,'helmet-primary')).toBe(teamBrand(observer).colors.primary);
  // Test fixture releases the old deal and destination seat; no game command/rule is added.
  world={...world,contracts:world.contracts.map(c=>c.driverId===id||(c.teamId==='team.ferano'&&c.seat===1)
   ?{...c,status:'EXPIRED' as const}:c)};
  const signed=signDriverContract(world,{driverId:id,teamId:'team.ferano',seat:1,startSeason:2026,endSeason:2027,
   annualSalaryM:10,performanceBonusM:0,option:null},NEW_CAREER_DATE);
  expect(signed.ok).toBe(true);if(!signed.ok)throw new Error(signed.reason);world=signed.world;
  const beforeRender=JSON.stringify(world);
  act(()=>tree.update(<TeamDriverPortrait teamId={view().teamId}/>));
  const expected=resolvePortraitColors(teamBrand('team.ferano').colors);
  for(const region of ['helmet','suit'])for(const token of ['primary','secondary','accent'] as const)
   expect(color(tree,`${region}-${token}`)).toBe(expected[token]);
  expect(color(tree,'portrait-visor')).toBe(PORTRAIT_VISOR);
  expect(world.drivers[id]!.familiarity.teamId).toBe(observer);
  expect(JSON.stringify(world)).toBe(beforeRender);
  expect(world.drivers[id]).not.toHaveProperty('helmetColor');expect(world.drivers[id]).not.toHaveProperty('suitColor');
  world={...world,contracts:world.contracts.map(c=>c.driverId===id?{...c,status:'EXPIRED' as const}:c)};
  act(()=>tree.update(<TeamDriverPortrait teamId={view().teamId}/>));
  expect(view().teamId).toBeNull();expect(color(tree,'helmet-primary')).toBe(portraitColorsForTeam(null).primary);
 }finally{if(tree)act(()=>tree.unmount());}
});

test('contrast fallbacks cover light/dark near-matches and absent accent without changing canonical input',()=>{
 for(const [primary,secondary,expected] of [['#F0F0F0','#EDEDED',PORTRAIT_VISOR],['#101010','#111111','#FFFFFF']]){
  const input=Object.freeze({primary:primary!,secondary:secondary!});
  expect(resolvePortraitColors(input)).toMatchObject({primary,secondary:expected,accent:'#FFFFFF',visor:PORTRAIT_VISOR});
  expect(input.secondary).toBe(secondary);
 }
 expect(resolvePortraitColors(PALETTES[2]!)).toMatchObject(PALETTES[2]!);
});

test('all eleven teams expose one canonical palette and existing primary alias; card geometry scales without new assets',()=>{
 for(const team of TEAM_BRANDS){
  expect(team.color).toBe(team.colors.primary);expect(portraitColorsForTeam(team.id)).toBe(team.colors);
  for(const color of Object.values(team.colors))expect(color).toMatch(/^#[0-9A-Fa-f]{6}$/);
 }
 for(const size of [80,100,120,140]){
  const element=DriverPortrait({...PALETTES[0]!,size});
  expect(element.props.style).toMatchObject({width:size,height:size*1.12});
 }
});
