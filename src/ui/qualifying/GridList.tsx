import React from 'react';
import {Text,View} from 'react-native';
import type {GridRow} from '../../simulation/qualifying';
import {useDesign} from '../design/system';


/** The starting grid: position, team colour bar paired with the team name, driver and gap. columns: 2 splits P1–11 | P12–22. */
export function GridList({rows,reasons=false,columns=1}:{rows:GridRow[];reasons?:boolean;columns?:1|2}){
 const {ui,styles,teamInk}=useDesign();
 // A knockout line wherever the stored deciding segment changes (Q3 → Q2 → Q1).
 const line=(r:GridRow)=>{const prev=rows[rows.indexOf(r)-1];return prev&&prev.segment!==r.segment?`KNOCKED OUT IN ${r.segment}`:null;};
 const row=(r:GridRow)=><View key={r.driverId}>
  {line(r)?<View style={{flexDirection:'row',alignItems:'center',gap:8,paddingVertical:6}}><View style={{flex:1,height:1,backgroundColor:ui.danger}}/>
   <Text style={[styles.eyebrow,{color:ui.danger,fontSize:10}]}>{line(r)}</Text><View style={{flex:1,height:1,backgroundColor:ui.danger}}/></View>:null}
  <View accessibilityLabel={`P${r.position} ${r.name}, ${r.team}, ${r.gap}`} style={{paddingVertical:7,paddingHorizontal:8,gap:3,borderBottomWidth:1,borderBottomColor:ui.line,
   backgroundColor:r.mine?ui.surfaceElevated:'transparent',borderLeftWidth:r.mine?3:0,borderLeftColor:r.color}}>
   <View style={{flexDirection:'row',alignItems:'center',gap:10}}>
    <Text style={[styles.heading,{width:30,textAlign:'right'}]}>{r.position}</Text>
    <View style={{width:6,height:28,borderRadius:2,backgroundColor:r.color}}/>
    <View style={{flex:1,minWidth:0}}><Text numberOfLines={1} style={{color:ui.ink,fontWeight:r.mine?'900':'700',fontSize:13}}>{r.name}</Text>
     <Text numberOfLines={1} style={{color:teamInk(r.color),fontSize:11,fontWeight:'700'}}>{r.team}</Text></View>
    <Text style={[styles.figure,{color:ui.muted,textAlign:'right',fontSize:13}]}>{r.gap}</Text>
   </View>
   {reasons&&r.mine?r.reasons.map(t=><Text key={t} style={[styles.muted,{paddingLeft:38}]}>· {t}</Text>):null}
  </View></View>;
 if(columns===1)return <View testID="qualifying-grid" style={{borderTopWidth:1,borderTopColor:ui.line}}>{rows.map(row)}</View>;
 const half=Math.ceil(rows.length/2);
 return <View testID="qualifying-grid" style={{flexDirection:'row',gap:24}}>
  {[rows.slice(0,half),rows.slice(half)].map((col,i)=><View key={i} style={{flex:1,minWidth:0,borderTopWidth:1,borderTopColor:ui.line}}>{col.map(row)}</View>)}
 </View>;
}
