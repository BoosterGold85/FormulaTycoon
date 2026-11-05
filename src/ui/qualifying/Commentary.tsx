import React from 'react';
import {Text,View} from 'react-native';
import type {CommentaryLine} from '../../simulation/qualifying';
import {useDesign} from '../design/system';

/** Badge text on a team colour: dark ink on light colours, white on dark ones (WCAG relative luminance). */
const onColor=(hex:string)=>{const c=[1,3,5].map(i=>{let v=parseInt(hex.slice(i,i+2),16)/255;return v<=.04045?v/12.92:((v+.055)/1.055)**2.4;});
 const l=.2126*c[0]!+.7152*c[1]!+.0722*c[2]!;return (l+.05)/(.0186+.05)>(1.05)/(l+.05)?'#17202C':'#FFFFFF';};
/** Announcer (whole field) and team radio (the player's engineer). Every line comes from the stored session. */
export function Commentary({lines,names,teamColor}:{lines:CommentaryLine[];names:Record<string,string>;teamColor:string}){
 const {ui,styles,teamInk}=useDesign();
 return <View testID="commentary" style={{minHeight:104,gap:8}}>
  {lines.length?lines.slice(0,3).map((l,i)=>l.kind==='RADIO'
   ?<View key={l.at+l.text} style={{flexDirection:'row',gap:8,alignItems:'flex-start',opacity:i===0?1:.75}}>
     <View accessibilityLabel={`Team radio, ${names[l.driverId!]}`} style={{paddingHorizontal:6,paddingVertical:3,borderRadius:3,backgroundColor:teamColor}}>
      <Text style={{color:onColor(teamColor),fontSize:10,fontWeight:'900',letterSpacing:.6}}>RADIO</Text></View>
     <View style={{flex:1,borderLeftWidth:3,borderLeftColor:teamColor,paddingLeft:8}}>
      <Text style={{color:teamInk(teamColor),fontSize:10,fontWeight:'900',letterSpacing:.8}}>{(names[l.driverId!]??'').toUpperCase()}</Text>
      <Text style={[styles.body,{fontStyle:'italic',fontWeight:i===0?'700':'400'}]}>“{l.text}”</Text></View></View>
   :<View key={l.at+l.text} style={{flexDirection:'row',gap:8,alignItems:'flex-start',opacity:i===0?1:.75}}>
     <View accessibilityLabel="Commentary" style={{paddingHorizontal:6,paddingVertical:3,borderRadius:3,backgroundColor:ui.navBackground}}>
      <Text style={{color:ui.navText,fontSize:10,fontWeight:'900',letterSpacing:.6}}>LIVE</Text></View>
     <Text style={[styles.body,{flex:1,fontWeight:i===0?'900':'600'}]}>{l.text}</Text></View>)
   :<Text style={styles.muted}>The pit lane is open. Cars are getting ready to go out.</Text>}
 </View>;
}
