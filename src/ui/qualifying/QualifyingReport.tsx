import React from 'react';
import {Text,View,useWindowDimensions} from 'react-native';
import type {NavTab} from '../../game/hudPlaceholders';
import type {GameUniverse} from '../../simulation/universe';
import {selectQualifyingGrid} from '../../simulation/qualifying';
import {Action,Card,Disclosure,Screen,useDesign} from '../design/system';
import {GridList} from './GridList';

/** Qualifying Report Card: where the player's cars start and the stored reasons why. Read-only. */
export function QualifyingReport({universe,eventId,onClose,onNavigate}:{universe:GameUniverse;eventId:string;onClose:()=>void;onNavigate:(tab:NavTab)=>void}){
 const {ui,styles}=useDesign(),wide=useWindowDimensions().width>=1000;
 const grid=selectQualifyingGrid(universe,eventId);
 if(!grid)return null;
 const mine=grid.rows.filter(r=>r.mine);
 const [a,b]=mine;
 return <Screen title="Qualifying result" kicker={`REPORT CARD · ${grid.venue.toUpperCase()}`} subtitle={`${grid.date} · ${grid.weather}`} tab="HQ" onNavigate={onNavigate}>
  <View style={{flexDirection:wide?'row':'column',gap:14}}>{mine.map(r=><Card key={r.driverId} hero accent={r.segment==='Q3'?ui.green:r.segment==='Q2'?ui.gold:ui.danger} style={{flex:1}}>
   <View style={styles.between}><Text style={styles.eyebrow}>{r.segment==='Q3'?'TOP-10 SHOOT-OUT':`KNOCKED OUT IN ${r.segment}`}</Text><Text style={styles.muted}>{r.gap}</Text></View>
   <View style={[styles.row,{alignItems:'flex-end'}]}><Text accessibilityRole="header" style={[styles.title,{fontSize:44,lineHeight:46}]}>P{r.position}</Text><Text style={[styles.heading,{paddingBottom:6}]}>{r.name}</Text></View>
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
