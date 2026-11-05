import React from 'react';
import {Text,View} from 'react-native';
import {Card,Chip,Disclosure,Section,useDesign} from '../design/system';
import {DriverPortrait} from '../art/DriverPortrait';
import {resolvePortraitColors} from '../art/portraitPalette';
import type {ResolvedDriver,ResolvedRoster,ResolvedTeam} from '../../game/roster';

/** Read-only preview of a validated pack merged over the default roster. Shows no hidden ratings. */
export function PackPreview({roster}:{roster:ResolvedRoster}){const {ui,styles}=useDesign();
 const grid=roster.drivers.filter(d=>d.group==='grid'),free=roster.drivers.filter(d=>d.group==='freeAgent');
 const fromPack=roster.teams.filter(t=>t.fromPack).length+roster.drivers.filter(d=>d.fromPack).length;
 const changed=roster.drivers.filter(d=>d.statsChanged).length;
 return <View style={{gap:12}} testID="roster-pack-preview">
  <Card hero style={{gap:8}}>
   <View style={styles.between}><Text accessibilityRole="header" style={[styles.heading,{flex:1}]}>{roster.packName}</Text><Chip text={roster.type==='full'?'FULL PACK':'COSMETIC PACK'} tone={roster.type==='full'?'gold':'green'}/></View>
   {roster.author?<Text style={styles.muted}>By {roster.author}</Text>:null}
   {roster.description?<Text style={styles.body}>{roster.description}</Text>:null}
   <Text style={styles.muted}>{roster.teams.length} teams · {grid.length} race drivers · {free.length} free agents. {fromPack} entries come from this pack; everything else uses the default roster.</Text>
   <Text style={styles.muted}>{roster.type==='full'
    ?changed?`Changes the stats of ${changed} driver${changed===1?'':'s'}. Stats only apply to a new career.`:'Uses the default stats for every driver.'
    :'Names, colours, numbers and helmets only. Results do not change.'}</Text>
  </Card>
  <Section title="Teams and race drivers" meta={`${roster.teams.length} teams`}/>
  <View style={{flexDirection:'row',flexWrap:'wrap',gap:12}}>
   {roster.teams.map(t=><TeamPreview key={t.id} team={t} drivers={grid.filter(d=>Math.ceil(d.slot/2)===t.slot)} full={roster.type==='full'}/>)}
  </View>
  <Disclosure title={`Free agents (${free.length})`}>
   <View>{free.map(d=><DriverLine key={d.id} driver={d} colors={{primary:'#9DAEBB',secondary:'#354553',accent:'#FFFFFF'}} full={roster.type==='full'}/>)}</View>
  </Disclosure>
 </View>;
}
function TeamPreview({team,drivers,full}:{team:ResolvedTeam;drivers:ResolvedDriver[];full:boolean}){const {ui,styles}=useDesign();
 return <Card accent={team.colors.primary} style={{flexGrow:1,flexBasis:300,minWidth:0,gap:6}} accessibilityLabel={`${team.name} preview`}>
  <View style={styles.between}>
   <View style={{flex:1,minWidth:0}}><Text style={[styles.heading,{fontSize:17}]} numberOfLines={1}>{team.name}</Text><Text style={styles.muted} numberOfLines={1}>{team.base} · slot {team.slot}</Text></View>
   <View style={{flexDirection:'row',gap:4}} accessibilityLabel={`Colours ${team.colors.primary}, ${team.colors.secondary}, ${team.colors.accent}`}>
    {[team.colors.primary,team.colors.secondary,team.colors.accent].map((c,i)=><View key={i} style={{width:18,height:18,borderRadius:9,backgroundColor:c,borderWidth:1,borderColor:ui.line}}/>)}
   </View>
  </View>
  <Text style={styles.muted} numberOfLines={2}>{team.identity}</Text>
  {!team.fromPack?<Text style={[styles.muted,{fontSize:11}]}>Team details from the default roster</Text>:null}
  {drivers.map(d=><DriverLine key={d.id} driver={d} colors={team.colors} full={full}/>)}
 </Card>;
}
function DriverLine({driver:d,colors,full}:{driver:ResolvedDriver;colors:ResolvedTeam['colors'];full:boolean}){const {ui,styles}=useDesign();
 return <View style={{flexDirection:'row',alignItems:'center',gap:10,borderTopWidth:1,borderTopColor:ui.line,paddingVertical:6}}>
  <DriverPortrait {...resolvePortraitColors(colors)} size={44}/>
  <View style={{flex:1,minWidth:0,gap:2}}>
   <Text style={{color:ui.ink,fontWeight:'800',fontSize:14}} numberOfLines={1}>{d.number!==null?`#${d.number}  `:''}{d.name}</Text>
   <Text style={[styles.muted,{fontSize:11}]} numberOfLines={1}>{d.nationality} · {d.archetype} · helmet {d.helmetPattern+1}</Text>
  </View>
  {full&&d.statsChanged?<Chip text="NEW STATS" tone="gold"/>:!d.fromPack?<Chip text="DEFAULT"/>:null}
 </View>;
}
