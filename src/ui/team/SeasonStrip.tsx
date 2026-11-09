import React from 'react';
import {ScrollView, Text, View} from 'react-native';
import {useDesign} from '../design/system';
import type {TeamScreenModel} from '../../simulation/teamScreen';
import {AssetImage} from '../assets/AssetImage';
import {trackAsset} from '../assets/assetPaths';
import {LinkText, Meter, Panel} from './bits';

const TILE = {borderRadius: 8, padding: 12, gap: 4, minWidth: 180} as const;

/** Last results, the next race and the two after it, and season progress. Scrolls sideways on phones. */
export function SeasonStrip({model, wide, onCalendar}: {model: TeamScreenModel; wide: boolean; onCalendar: () => void}) {
  const {ui, styles} = useDesign(), s = model.season;
  const tiles = <>
    {s.results.length ? s.results.map(r => <View key={r.eventId} style={[TILE, {backgroundColor: ui.raised}]}>
      <Text style={styles.eyebrow}>R{r.round} · QUALIFYING</Text>
      <Text numberOfLines={1} style={[styles.title, {fontSize: 20, lineHeight: 22}]}>{r.venue}</Text>
      <Text style={[styles.figure, {fontSize: 12, color: ui.muted}]}>{r.positions.map(p => `${p.code} ${p.position ? `P${p.position}` : '–'}`).join('  ')}</Text>
    </View>) : <View testID="season-no-results" style={[TILE, {flexGrow: wide ? 1.6 : 0, borderWidth: 1.5, borderStyle: 'dashed', borderColor: ui.line, alignItems: 'center', justifyContent: 'center'}]}>
      <Text style={[styles.muted, {textAlign: 'center'}]}>No results yet</Text>
      <Text style={[styles.muted, {textAlign: 'center'}]}>Your first race is {s.firstVenue}</Text>
    </View>}
    {s.upcoming.map(e => <View key={e.eventId} testID={e.isNext ? 'season-next' : undefined}
      style={[TILE, {flexDirection: 'row', alignItems: 'center', gap: 10, backgroundColor: e.isNext ? ui.accentMuted : ui.raised,
        borderWidth: e.isNext ? 2 : 0, borderColor: ui.danger}]}>
      <AssetImage asset={trackAsset(e.trackId, e.venue)} width={72} aspect={1.4} compact/>
      <View style={{gap: 2, flexShrink: 1}}>
        <Text style={[styles.eyebrow, {color: e.isNext ? ui.danger : ui.muted}]}>{e.isNext ? `NEXT · R${e.round}` : `R${e.round}`}</Text>
        <Text numberOfLines={1} style={[styles.title, {fontSize: 20, lineHeight: 22}]}>{e.venue}</Text>
        <Text style={[styles.muted, {fontSize: 12}]}>{e.dates}</Text>
      </View>
    </View>)}
    <View testID="season-progress" style={[TILE, {backgroundColor: ui.raised, justifyContent: 'center'}]}>
      <Text style={styles.eyebrow}>SEASON PROGRESS</Text>
      <Text style={[styles.figure, {fontSize: 24}]}>{s.completed} / {s.total}</Text>
      <Meter value={s.completed / s.total * 100} color={ui.danger} height={4}/>
    </View>
  </>;
  return <Panel testID="team-season">
    <View style={styles.between}><Text style={styles.eyebrow}>SEASON</Text><LinkText label="Full calendar" onPress={onCalendar}/></View>
    {wide ? <View style={{flexDirection: 'row', gap: 12, alignItems: 'stretch'}}>{tiles}</View>
      : <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{gap: 10}}>{tiles}</ScrollView>}
  </Panel>;
}
