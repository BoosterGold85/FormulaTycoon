import React from 'react';
import {Text, View} from 'react-native';
import {useDesign} from '../design/system';
import type {TeamScreenModel} from '../../simulation/teamScreen';
import {contrast, inkOn} from './colors';

/** Full-width team band in the team's primary colour, accent stripe below, four stat tiles. */
export function TeamBand({model, wide}: {model: TeamScreenModel; wide: boolean}) {
  const {ui, styles} = useDesign(), {team, tiles} = model, ink = inkOn(team.colors.primary);
  // A near-black team colour disappears on the near-black page: give the band a top stripe too.
  const lowContrast = contrast(team.colors.primary, ui.bg) < 1.4;
  return <View testID="team-band" style={{backgroundColor: team.colors.primary, borderBottomWidth: 4, borderBottomColor: team.colors.accent,
    borderTopWidth: lowContrast ? 3 : 0, borderTopColor: team.colors.secondary}}>
    <View style={{width: '100%', maxWidth: 1360, alignSelf: 'center', paddingHorizontal: 16, paddingVertical: wide ? 22 : 16,
      flexDirection: wide ? 'row' : 'column', alignItems: wide ? 'center' : 'stretch', gap: 16}}>
      <View style={{flex: wide ? 1 : undefined, minWidth: 0, gap: 2}}>
        <Text style={[styles.eyebrow, {color: ink, opacity: .8}]}>YOUR TEAM</Text>
        <Text accessibilityRole="header" numberOfLines={1} adjustsFontSizeToFit
          style={[styles.title, {color: ink, fontSize: wide ? 72 : 44, lineHeight: wide ? 74 : 46}]}>{team.name}</Text>
        <Text numberOfLines={2} style={{color: ink, opacity: .85, fontSize: 14}}>{[team.base, team.identity].filter(Boolean).join(' · ')}</Text>
      </View>
      <View style={{flexDirection: 'row', flexWrap: 'wrap', gap: 10, width: wide ? 640 : '100%'}}>
        {tiles.map(t => <View key={t.key} testID={`tile-${t.key}`} style={{flexGrow: 1, flexBasis: wide ? 140 : '45%', minWidth: 0,
          backgroundColor: 'rgba(0,0,0,0.38)', borderRadius: 8, paddingVertical: 10, paddingHorizontal: 12, gap: 2}}>
          <Text style={[styles.eyebrow, {color: '#D8DEE8', fontSize: 10}]}>{t.label}</Text>
          <Text numberOfLines={1} adjustsFontSizeToFit style={[styles.title, {color: '#FFFFFF', fontSize: 34, lineHeight: 36}]}>{t.value}</Text>
          <Text numberOfLines={1} style={{color: '#C3CAD6', fontSize: 11}}>{t.caption}</Text>
        </View>)}
      </View>
    </View>
  </View>;
}
