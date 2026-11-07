import React from 'react';
import {Pressable, Text, View} from 'react-native';
import {useDesign} from '../design/system';
import type {TeamScreenModel} from '../../simulation/teamScreen';
import {AssetImage} from '../assets/AssetImage';
import {factoryAsset} from '../assets/assetPaths';
import {LinkText, Meter, Panel} from './bits';

export function FactoryTile({model, onOpen}: {model: TeamScreenModel; onOpen: () => void}) {
  const {ui, styles} = useDesign(), f = model.factory;
  return <Panel testID="team-factory" style={{flex: 1, gap: 10}}>
    <View style={{flexDirection: 'row', alignItems: 'center', gap: 12}}>
      <AssetImage testID="asset-factory" src={factoryAsset(!f.idle)} label="Factory" width={76} aspect={1} placeholder="PLACE FACTORY ICON HERE"/>
      <View style={{flex: 1, minWidth: 0, gap: 2}}>
        <Text style={styles.eyebrow}>FACTORY</Text>
        <Text numberOfLines={1} adjustsFontSizeToFit style={[styles.title, {fontSize: 26, lineHeight: 28}]}>{f.title}</Text>
        <Text numberOfLines={1} style={[styles.muted, {fontSize: 12}]}>{f.line}</Text>
      </View>
    </View>
    {!f.idle ? <View style={{gap: 4}}><Meter value={f.progress} color={ui.green}/>
      <View style={styles.between}><Text numberOfLines={1} style={[styles.muted, {fontSize: 12}]}>{f.stage} · {f.progress}%{f.more > 0 ? ` · +${f.more} more` : ''}</Text>
        <LinkText label="View" onPress={onOpen}/></View></View>
      : <Pressable accessibilityRole="button" accessibilityLabel="Start project" onPress={onOpen}
        style={({pressed}) => ({minHeight: 44, paddingHorizontal: 16, borderRadius: 8, alignItems: 'center', justifyContent: 'center', backgroundColor: ui.accent, opacity: pressed ? .8 : 1})}>
        <Text style={{color: ui.onAccent, fontWeight: '900', fontSize: 13}}>Start project</Text></Pressable>}
  </Panel>;
}

/** The real HQ departments: headcount from the HQ roster, quality only where the game has a rating. */
export function OrganisationTile({model, onOpen}: {model: TeamScreenModel; onOpen: () => void}) {
  const {ui, styles} = useDesign();
  return <Panel testID="team-organisation" style={{flex: 1, gap: 6}}>
    <View style={styles.between}><Text style={styles.eyebrow}>ORGANISATION</Text><LinkText label="View HQ" onPress={onOpen}/></View>
    <View style={{flexDirection: 'row', flexWrap: 'wrap', rowGap: 6, columnGap: 16}}>
      {model.organisation.map(d => <View key={d.id} style={{flexBasis: '45%', flexGrow: 1, minWidth: 0}}>
        <Text numberOfLines={1} style={{color: ui.ink, fontSize: 13, fontWeight: '700'}}>{d.name}</Text>
        <Text numberOfLines={1} style={[styles.muted, {fontSize: 12}]}>{d.headcount ? `${d.headcount} staff` : 'No staff assigned'}{d.quality ? ` · ${d.quality}` : ''}</Text>
      </View>)}
    </View>
  </Panel>;
}
