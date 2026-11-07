import React from 'react';
import {Pressable,Text,View} from 'react-native';
import type {TowerRow} from '../../simulation/qualifying';
import {useDesign} from '../design/system';
import {PHASE,SectorStrip} from './LiveTower';
import {TyreIcon} from './TyreIcon';

/** The clicked or tapped tower row in full (click again or × to close): name, team and every timing figure for that car right now. */
export function TowerDetail({row,onClose}:{row:TowerRow|undefined;onClose:()=>void}){
 const {ui,styles,teamInk}=useDesign();
 if(!row)return <Text style={styles.muted}>Click or tap a driver for full name and timing.</Text>;
 const fact=(label:string,value:string,color=ui.ink)=><View style={{gap:2,minWidth:64}}><Text style={[styles.eyebrow,{fontSize:10}]}>{label}</Text><Text style={[styles.figure,{color}]}>{value}</Text></View>;
 return <View testID="tower-detail" style={{flexDirection:'row',gap:12,padding:12,borderRadius:8,backgroundColor:ui.surface,borderLeftWidth:6,borderLeftColor:row.color}}>
  <View style={{flex:1,minWidth:0,gap:8}}>
   <View style={styles.between}>
    <View style={{flex:1,minWidth:0}}>
     <Text numberOfLines={1} style={styles.heading}>{row.time===null?'–':`P${row.position}`}  {row.name}</Text>
     <Text numberOfLines={1} style={{color:teamInk(row.color),fontSize:12,fontWeight:'800'}}>{row.team.toUpperCase()}{row.mine?' · YOUR CAR':''} · {PHASE[row.phase].toUpperCase()}</Text>
    </View>
    <TyreIcon tyre={row.tyre} size={30}/>
    <Pressable accessibilityRole="button" accessibilityLabel="Close driver detail" onPress={onClose} style={{minWidth:44,minHeight:44,alignItems:'center',justifyContent:'center'}}>
     <Text style={{color:ui.muted,fontSize:20,fontWeight:'900'}}>×</Text></Pressable>
   </View>
   <View style={{flexDirection:'row',flexWrap:'wrap',gap:16}}>
    {fact('GAP',row.time===null?'No time':row.gap)}{fact('INTERVAL',row.interval??'–',ui.muted)}
    {fact('LAST LAP',row.last?.text??'–',row.last?.kind==='PB'?ui.green:row.last?.kind==='OFF'?ui.danger:ui.gold)}
   </View>
   <SectorStrip sectors={row.sectors} large/>
  </View>
 </View>;
}
