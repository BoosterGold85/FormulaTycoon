import React from 'react';
import {Text,View} from 'react-native';
import type {LapTyre} from '../../simulation/qualifying';
import {useDesign} from '../design/system';

const LETTER:Record<LapTyre,string>={NEW_SOFT:'S',USED_SOFT:'S',MEDIUM:'M',USED_MEDIUM:'M',INTER:'I'};
const WORD:Record<LapTyre,string>={NEW_SOFT:'new soft',USED_SOFT:'used soft',MEDIUM:'new medium',USED_MEDIUM:'used medium',INTER:'intermediate'};
/** Compound ring with its letter (meaning never rides on colour alone); used sets are drawn with a dashed ring. */
export function TyreIcon({tyre,size=26}:{tyre:LapTyre|null;size?:number}){
 const {ui,styles}=useDesign();
 if(!tyre)return <View accessibilityLabel="No tyre fitted yet" style={{width:size,height:size,alignItems:'center',justifyContent:'center'}}><Text style={styles.muted}>–</Text></View>;
 const ring=tyre==='INTER'?ui.tyreInter:tyre==='MEDIUM'||tyre==='USED_MEDIUM'?ui.tyreMedium:ui.tyreSoft,used=tyre.startsWith('USED');
 return <View accessibilityLabel={`Tyre: ${WORD[tyre]}`} style={{width:size,height:size,borderRadius:size/2,borderWidth:Math.max(2,Math.round(size/9)),borderColor:ring,borderStyle:used?'dashed':'solid',
  alignItems:'center',justifyContent:'center',backgroundColor:'#000000'}}>
  <Text style={{color:'#FFFFFF',fontSize:Math.round(size*.42),lineHeight:Math.round(size*.5),...(ui.fonts.displayBold?{fontFamily:ui.fonts.displayBold}:{fontWeight:'900'})}}>{LETTER[tyre]}</Text>
 </View>;
}
