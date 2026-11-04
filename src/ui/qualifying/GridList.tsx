import React from 'react';
import {Text,View} from 'react-native';
import type {GridRow} from '../../simulation/qualifying';
import {useDesign} from '../design/system';

/** The starting grid: position, team colour paired with the team name, driver and gap. */
export function GridList({rows,reasons=false}:{rows:GridRow[];reasons?:boolean}){const {ui,styles,teamInk}=useDesign();
 return <View testID="qualifying-grid" style={{borderTopWidth:1,borderTopColor:ui.line}}>{rows.map(r=>
  <View key={r.driverId} accessibilityLabel={`P${r.position} ${r.name}, ${r.team}, ${r.gap}`} style={{paddingVertical:8,paddingHorizontal:8,gap:3,borderBottomWidth:1,borderBottomColor:ui.line,backgroundColor:r.mine?ui.accentMuted:'transparent'}}>
   <View style={{flexDirection:'row',alignItems:'center',gap:10}}>
    <Text style={{width:24,color:ui.ink,fontWeight:'900',textAlign:'right'}}>{r.position}</Text>
    <View style={{width:4,height:28,borderRadius:2,backgroundColor:r.color}}/>
    <View style={{flex:1,minWidth:0}}><Text numberOfLines={1} style={{color:ui.ink,fontWeight:r.mine?'900':'700',fontSize:13}}>{r.name}</Text>
     <Text numberOfLines={1} style={{color:teamInk(r.color),fontSize:11,fontWeight:'700'}}>{r.team}</Text></View>
    <Text style={[styles.muted,{fontVariant:['tabular-nums'],textAlign:'right'}]}>{r.gap}</Text>
   </View>
   {reasons&&r.mine?r.reasons.map(t=><Text key={t} style={[styles.muted,{paddingLeft:38}]}>· {t}</Text>):null}
  </View>)}</View>;
}
