import React from 'react';
import {Animated,View} from 'react-native';
import type {LiveSector,SectorColor} from '../../simulation/qualifying';
import {useDesign} from '../design/system';

/**
 * Mini-sectors for one sector of a lap. The simulation times whole sectors only, so blocks never get their own
 * colour: while the sector is being driven they fill in white with the replay's glide, and once the sector time
 * is stored they all take its real purple, green or yellow. Nothing here can colour a block early.
 */
export function MiniSectors({sector,running,progress,count,width,height}:{sector:LiveSector;running:boolean;progress:Animated.Value;count:number;width?:number;height:number}){
 const {ui}=useDesign(),gap=2,block=width===undefined?undefined:(width-gap*(count-1))/count;
 const color=(c:SectorColor)=>c==='PURPLE'?ui.sectorPurple:c==='GREEN'?ui.sectorGreen:ui.sectorYellow;
 return <View style={{width,height,flexDirection:'row',gap,...(width===undefined?{flex:1}:null)}}>{Array.from({length:count},(_,j)=>
  <View key={j} style={{...(block===undefined?{flex:1}:{width:block}),height,borderRadius:2,backgroundColor:sector?color(sector.color):ui.chip,overflow:'hidden'}}>
   {!sector&&running?<Animated.View style={{flex:1,backgroundColor:ui.ink,opacity:progress.interpolate({inputRange:[j/count,(j+1)/count],outputRange:[0,.85],extrapolate:'clamp'})}}/>:null}
  </View>)}</View>;
}
/** Index of the sector being driven right now on a flying lap (null otherwise). */
export const runningSector=(phase:string,sectors:LiveSector[])=>phase==='FLYING'?(()=>{const i=sectors.findIndex(s=>!s);return i<0?null:i;})():null;
