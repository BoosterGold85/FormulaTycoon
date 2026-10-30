import React from 'react';
import {View,type ViewStyle} from 'react-native';
import {portraitColorsForTeam,resolvePortraitColors,type PortraitColors} from './portraitPalette';

/** One team-neutral shoulders-up template. All dimensions scale from the same 100×112 drawing. */
export function DriverPortrait({primary,secondary,accent,background,size=100}:PortraitColors&{size?:number}) {
 const colors=resolvePortraitColors({primary,secondary,accent,background}),scale=size/100;
 const shape=(x:number,y:number,width:number,height:number,fill:string,extra:ViewStyle={}):ViewStyle=>({
  position:'absolute',left:x*scale,top:y*scale,width:width*scale,height:height*scale,
  backgroundColor:fill,...extra
 });
 return <View testID="driver-portrait" accessibilityElementsHidden importantForAccessibility="no-hide-descendants"
  style={{width:size,height:size*1.12,overflow:'hidden'}}>
  <View testID="portrait-background" style={shape(4,10,92,100,colors.background,{borderRadius:46*scale})}/>
  <View style={shape(5,103,90,7,'#09131D',{borderRadius:45*scale})}/>
  <View testID="suit-primary" style={shape(2,69,96,39,colors.primary,{
   borderTopLeftRadius:36*scale,borderTopRightRadius:36*scale,borderBottomLeftRadius:7*scale,borderBottomRightRadius:7*scale,overflow:'hidden'
  })}>
   <View testID="suit-secondary" style={shape(0,0,24,39,colors.secondary)}/>
   <View style={shape(72,0,24,39,colors.secondary)}/>
   <View testID="suit-accent" style={shape(16,6,11,33,colors.accent,{transform:[{rotate:'-16deg'}]})}/>
   <View style={shape(69,6,11,33,colors.accent,{transform:[{rotate:'16deg'}]})}/>
   <View style={shape(47,14,2,25,colors.accent,{opacity:.6})}/>
   <View style={shape(0,0,42,8,'#FFFFFF',{opacity:.13,borderRadius:8*scale})}/>
   <View style={shape(83,0,13,39,'#000000',{opacity:.13})}/>
  </View>
  <View style={shape(35,66,30,12,colors.secondary,{borderRadius:5*scale})}/>
  <View testID="helmet-primary" style={shape(20,4,60,69,colors.primary,{
   borderTopLeftRadius:29*scale,borderTopRightRadius:29*scale,borderBottomLeftRadius:19*scale,borderBottomRightRadius:19*scale,overflow:'hidden'
  })}>
   <View testID="helmet-secondary" style={shape(25,0,15,29,colors.secondary)}/>
   <View testID="helmet-accent" style={shape(18,0,7,29,colors.accent)}/>
   <View style={shape(2,8,19,20,'#FFFFFF',{opacity:.18,borderTopLeftRadius:18*scale})}/>
   <View style={shape(51,0,9,69,'#000000',{opacity:.16})}/>
   <View style={shape(8,51,44,10,colors.accent,{borderBottomLeftRadius:8*scale,borderBottomRightRadius:8*scale})}/>
   <View style={shape(18,51,24,4,colors.primary)}/>
  </View>
  <View testID="portrait-visor" style={shape(23,31,54,18,colors.visor,{
   borderTopLeftRadius:4*scale,borderTopRightRadius:4*scale,borderBottomLeftRadius:9*scale,borderBottomRightRadius:9*scale,
   borderTopWidth:2*scale,borderTopColor:'#9EAEB8'
  })}/>
  <View style={shape(29,36,21,2,'#8097A6',{opacity:.55})}/>
 </View>;
}

/** Current employment → canonical palette. This wrapper has no visual state or memoized identity. */
export function TeamDriverPortrait({teamId,size=100}:{teamId:string|null;size?:number}) {
 return <DriverPortrait {...portraitColorsForTeam(teamId)} size={size}/>;
}
