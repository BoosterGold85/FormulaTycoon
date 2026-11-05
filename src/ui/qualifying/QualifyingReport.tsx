import React from 'react';
import {Text,View,useWindowDimensions} from 'react-native';
import type {NavTab} from '../../game/hudPlaceholders';
import type {GameUniverse} from '../../simulation/universe';
import {selectQualifyingGrid} from '../../simulation/qualifying';
import {Action,Card,Disclosure,Screen,useDesign} from '../design/system';
import {GridList} from './GridList';
import {BroadcastTheme} from '../theme';

type Props={universe:GameUniverse;eventId:string;onClose:()=>void;onNavigate:(tab:NavTab)=>void};
/** Qualifying Report Card on the broadcast surface: where the player's cars start and the stored reasons why. Read-only. */
export function QualifyingReport(props:Props){return <BroadcastTheme><ReportView {...props}/></BroadcastTheme>;}
function ReportView({universe,eventId,onClose,onNavigate}:Props){
 const {ui,styles,teamInk}=useDesign(),wide=useWindowDimensions().width>=1000;
 const grid=selectQualifyingGrid(universe,eventId);
 if(!grid)return null;
 const mine=grid.rows.filter(r=>r.mine);
 const [a,b]=mine;
 return <Screen title="Qualifying result" kicker={`REPORT CARD · ${grid.venue.toUpperCase()}`} subtitle={`${grid.date} · ${grid.weather}`} tab="HQ" onNavigate={onNavigate}>
  <View style={{flexDirection:wide?'row':'column',gap:14}}>{mine.map(r=><Card key={r.driverId} hero accent={r.color} style={{flex:1,borderTopWidth:6}}>
   <View style={styles.between}><Text style={[styles.eyebrow,{color:r.segment==='Q3'?ui.green:r.segment==='Q2'?ui.gold:ui.danger}]}>{r.segment==='Q3'?'TOP-10 SHOOT-OUT':`KNOCKED OUT IN ${r.segment}`}</Text><Text style={[styles.figure,{color:ui.muted}]}>{r.gap}</Text></View>
   <View style={[styles.row,{alignItems:'flex-end'}]}><Text accessibilityRole="header" style={[styles.title,{fontSize:64,lineHeight:64}]}>P{r.position}</Text>
    <View style={{paddingBottom:8,flex:1,minWidth:0}}><Text style={styles.heading}>{r.name}</Text><Text style={{color:teamInk(r.color),fontSize:12,fontWeight:'800',letterSpacing:.8}}>{r.team.toUpperCase()}</Text></View></View>
   <View style={{gap:4}}><Text style={styles.eyebrow}>WHY</Text>{r.reasons.map(t=><Text key={t} style={styles.body}>· {t}</Text>)}</View>
  </Card>)}</View>
  {a&&b?<Text style={styles.body}>{a.name} out-qualified {b.name} by {b.position-a.position} {b.position-a.position===1?'place':'places'}.</Text>:null}
  <Disclosure title="Starting grid">
   <GridList rows={grid.rows}/>
  </Disclosure>
  <Text style={styles.muted}>The grid is saved with the race weekend. The race itself is not simulated yet.</Text>
  <Action label="BACK TO HQ" onPress={onClose}/>
 </Screen>;
}
