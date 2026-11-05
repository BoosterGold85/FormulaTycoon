import React from 'react';
import {Text,View,useWindowDimensions} from 'react-native';
import type {NavTab} from '../../game/hudPlaceholders';
import type {GameUniverse} from '../../simulation/universe';
import {selectQualifyingGrid,type GridRow} from '../../simulation/qualifying';
import {Action,Screen,Section,useDesign} from '../design/system';
import {TeamDriverPortrait} from '../art/DriverPortrait';
import {GridList} from './GridList';
import {BroadcastTheme} from '../theme';

type Props={universe:GameUniverse;eventId:string;onClose:()=>void;onNavigate:(tab:NavTab)=>void};
/** Qualifying result on the broadcast surface: the moment for each of the player's cars, then the full grid. Read-only. */
export function QualifyingReport(props:Props){return <BroadcastTheme><ReportView {...props}/></BroadcastTheme>;}
function ReportView({universe,eventId,onClose,onNavigate}:Props){
 const {styles}=useDesign(),wide=useWindowDimensions().width>=1000;
 const grid=selectQualifyingGrid(universe,eventId);
 if(!grid)return null;
 const mine=grid.rows.filter(r=>r.mine),[a,b]=mine;
 return <Screen title="Qualifying result" kicker={`${grid.venue.toUpperCase()} · SATURDAY`} subtitle={`${grid.date} · ${grid.weather}`} tab="HQ" onNavigate={onNavigate} maxWidth={1200}>
  <View style={{flexDirection:wide?'row':'column',gap:16}}>{mine.map(r=><Moment key={r.driverId} row={r}/>)}</View>
  {a&&b?<Text style={styles.body}>{a.name} out-qualified {b.name} by {b.position-a.position} {b.position-a.position===1?'place':'places'}.</Text>:null}
  <Section title="Starting grid" meta={grid.weather}/>
  <GridList rows={grid.rows} columns={wide?2:1}/>
  <Text style={styles.muted}>The grid is saved with the race weekend. The race itself is not simulated yet.</Text>
  <Action label="BACK TO HQ" onPress={onClose}/>
 </Screen>;
}

/** One driver's result as a broadcast moment: helmet, team colour, huge position and the session's story. */
function Moment({row}:{row:GridRow}){
 const {ui,styles,teamInk}=useDesign(),h=row.headline;
 const tone=h?.tone==='GOOD'?ui.green:h?.tone==='BAD'?ui.danger:ui.gold;
 return <View testID={`result-${row.driverId}`} style={{flex:1,borderRadius:10,overflow:'hidden',backgroundColor:ui.surface,borderTopWidth:8,borderTopColor:row.color}}>
  <View style={{flexDirection:'row',alignItems:'flex-end',gap:12,paddingHorizontal:18,paddingTop:16}}>
   <Text accessibilityRole="header" accessibilityLabel={`P${row.position}, ${row.name}`} style={[styles.title,{fontSize:96,lineHeight:92,letterSpacing:-1}]}>P{row.position}</Text>
   <View style={{flex:1}}/>
   <TeamDriverPortrait teamId={row.teamId} size={112}/>
  </View>
  <View style={{height:4,backgroundColor:row.color}}/>
  <View style={{padding:18,gap:8}}>
   <View><Text style={styles.heading}>{row.name}</Text><Text style={{color:teamInk(row.color),fontSize:12,fontWeight:'800',letterSpacing:.8}}>{row.team.toUpperCase()}</Text></View>
   {h?<View style={{gap:4,borderLeftWidth:4,borderLeftColor:tone,paddingLeft:10}}>
    <Text style={[styles.heading,{fontSize:30,lineHeight:32,color:ui.ink}]}>{h.headline}</Text>
    <Text style={[styles.figure,{color:ui.muted,fontSize:13}]}>{h.detail}</Text></View>:null}
   <View style={{gap:3,marginTop:4}}><Text style={styles.eyebrow}>WHY</Text>{row.reasons.map(t=><Text key={t} style={styles.body}>· {t}</Text>)}</View>
  </View>
 </View>;
}
