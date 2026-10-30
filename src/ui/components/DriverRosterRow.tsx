import React from 'react';
import {Pressable,Text,View} from 'react-native';
import type {driverView} from '../../simulation/drivers';
import {teamBrand} from '../../game/brandRegistry';
import {TeamDriverPortrait} from '../art/DriverPortrait';
import {useDesign} from '../design/system';

/** A personnel identity, not a second source of grades, form or employment. */
export function DriverRosterRow({driver:d,onPress,featured=false}:{driver:ReturnType<typeof driverView>;onPress:()=>void;featured?:boolean}){const {ui,styles}=useDesign();
 const color=d.teamId?teamBrand(d.teamId).color:ui.accent;
 return <Pressable accessibilityRole="button" accessibilityLabel={`View ${d.name}`} onPress={onPress}
  style={({pressed})=>({minHeight:featured?116:82,paddingVertical:12,paddingHorizontal:featured?10:0,
   flexDirection:'row',gap:10,alignItems:'center',backgroundColor:pressed?ui.raised:featured?ui.surface:'transparent',
   borderLeftWidth:featured?3:0,borderLeftColor:color,borderBottomWidth:featured?0:1,borderBottomColor:ui.line})}>
  <TeamDriverPortrait teamId={d.teamId} size={featured?80:48}/>
  <View style={{flex:1,minWidth:0,gap:5}}>
   <Text style={{fontSize:featured?20:15,fontWeight:'900',color:ui.ink,letterSpacing:-.4}}>{d.name}</Text>
   <Text style={[styles.muted,{fontSize:11}]}>{d.team}</Text>
   <Text style={[styles.muted,{fontSize:11}]}>{d.form} · {d.contractEnd?`Through ${d.contractEnd}`:'No contract'}</Text>
  </View>
  <View style={{maxWidth:featured?65:90,alignItems:'flex-end',gap:2}}><Text style={[styles.eyebrow,{fontSize:10,letterSpacing:.7}]}>TALENT</Text><Text style={{fontSize:featured?28:15,fontWeight:'900',color:featured?ui.ink:ui.green}}>{d.grades.talent}</Text><Text style={{color:ui.accent,fontSize:17}}>›</Text></View>
 </Pressable>;
}
