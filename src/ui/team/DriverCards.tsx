import React from 'react';
import {Pressable, Text, View} from 'react-native';
import {useDesign} from '../design/system';
import type {TeamScreenModel} from '../../simulation/teamScreen';
import {AssetImage} from '../assets/AssetImage';
import {helmetAsset} from '../assets/assetPaths';
import {Chip, Meter, Panel} from './bits';
import {contrast, inkOn, toneColor} from './colors';

type Driver = TeamScreenModel['drivers'][number];
/**
 * Teammates get different portrait tints and frames so they scan apart: the first two team colours that are
 * visible on the card surface (a near-black primary would vanish), primary first.
 */
export function portraitColors(team: TeamScreenModel['team'], surface: string): [string, string] {
  const all = [team.colors.primary, team.colors.secondary, team.colors.accent];
  const seen = all.filter(c => contrast(c, surface) >= 1.6);
  const pick = [...seen, ...all.filter(c => !seen.includes(c))];
  return [pick[0]!, pick[1]!];
}

export function DriverCard({driver: d, index, team, wide, onPress}: {driver: Driver; index: number; team: TeamScreenModel['team']; wide: boolean; onPress: () => void}) {
  const {ui, styles} = useDesign(), frame = portraitColors(team, ui.surface)[index]!, size = wide ? 112 : 92;
  return <Pressable accessibilityRole="button" accessibilityLabel={`View ${d.name}`} onPress={onPress} testID={`team-driver-${index}`}
    style={({pressed}) => ({flexDirection: 'row', backgroundColor: pressed ? ui.raised : ui.surface, borderRadius: 10, overflow: 'hidden'})}>
    <View style={{width: 6, backgroundColor: frame}}/>
    <View style={{flex: 1, flexDirection: 'row', gap: 14, padding: 14, minWidth: 0}}>
      <View style={{width: size, height: size, borderRadius: 10, borderWidth: 3, borderColor: frame, overflow: 'hidden',
        backgroundColor: ui.bg}}>
        <AssetImage testID={`asset-helmet-${index}`} asset={helmetAsset(d.name, team)} width="100%" aspect={1} compact/>
        {d.number !== null ? <View style={{position: 'absolute', right: 0, bottom: 0, minWidth: 34, paddingHorizontal: 5, paddingVertical: 1,
          borderTopLeftRadius: 8, backgroundColor: frame, alignItems: 'center'}}>
          <Text style={[styles.title, {color: inkOn(frame), fontSize: 24, lineHeight: 28}]}>{d.number}</Text></View> : null}
      </View>
      <View style={{flex: 1, minWidth: 0, gap: 6}}>
        <View style={[styles.row, {gap: 8, flexWrap: 'wrap', alignItems: 'baseline'}]}>
          <Text numberOfLines={1} style={[styles.title, {fontSize: wide ? 32 : 26, lineHeight: wide ? 34 : 28}]}>{d.name}</Text>
          <Text style={[styles.muted, {fontSize: 12}]}>{d.nationality} · {d.age}</Text>
        </View>
        {d.story ? <Text style={{color: ui.gold, fontWeight: '700', fontSize: 13}}>{d.story}</Text> : null}
        <View style={{flexDirection: 'row', gap: 16}}>
          {([['Form', d.form], ['Morale', d.morale]] as const).map(([label, v]) => <View key={label} style={{flex: 1, gap: 3}}>
            <View style={styles.between}><Text style={[styles.muted, {fontSize: 12}]}>{label}</Text><Text style={{color: ui.ink, fontSize: 12}}>{v.word}</Text></View>
            <Meter value={v.value} color={toneColor(ui, v.tone)}/>
          </View>)}
        </View>
        <View style={{flexDirection: 'row', flexWrap: 'wrap', gap: 6}}>{d.chips.map(c => <Chip key={c} text={c} mono={c.startsWith('Talent')}/>)}</View>
      </View>
    </View>
  </Pressable>;
}

/** Head-to-head strip. Before any session: an empty neutral dashed bar, never a half fill that reads as a lead. */
export function TeammateBattle({model}: {model: TeamScreenModel}) {
  const {ui, styles} = useDesign(), b = model.battle;
  if (!b) return null;
  const [w0, w1] = b.wins, total = w0 + w1, [c0, c1] = portraitColors(model.team, ui.surface);
  return <Panel testID="teammate-battle" style={{flexDirection: 'row', alignItems: 'center', gap: 12, flexWrap: 'wrap', paddingVertical: 12}}>
    <Text style={styles.eyebrow}>TEAMMATE BATTLE</Text>
    <View style={{flex: 1, minWidth: 220, flexDirection: 'row', alignItems: 'center', gap: 10}}>
      <Text style={[styles.title, {fontSize: 22}]}>{b.codes[0]}</Text>
      {total ? <View accessibilityLabel={`${b.codes[0]} ${w0}, ${b.codes[1]} ${w1}`} style={{flex: 1, height: 10, borderRadius: 10, overflow: 'hidden', flexDirection: 'row', backgroundColor: ui.raised}}>
        <View style={{flex: w0, backgroundColor: c0}}/>
        <View style={{width: 2, backgroundColor: ui.bg}}/>
        <View style={{flex: w1, backgroundColor: c1}}/>
      </View> : <View testID="battle-empty" style={{flex: 1, height: 10, borderRadius: 10, borderWidth: 1.5, borderStyle: 'dashed', borderColor: ui.line}}/>}
      <Text style={[styles.title, {fontSize: 22}]}>{b.codes[1]}</Text>
    </View>
    <Text style={[styles.muted, {fontSize: 12}]}>{b.text}</Text>
  </Panel>;
}
