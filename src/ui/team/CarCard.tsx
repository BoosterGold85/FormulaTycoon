import React from 'react';
import {Text, View} from 'react-native';
import {useDesign} from '../design/system';
import type {CarBar, TeamScreenModel} from '../../simulation/teamScreen';
import {AssetImage} from '../assets/AssetImage';
import {carAsset} from '../assets/assetPaths';
import {LinkText, Panel, Tag} from './bits';
import {toneColor} from './colors';

/** Current car: art on a dark garage floor, and how it compares with the grid average. */
export function CarCard({model, wide, onViewCar}: {model: TeamScreenModel; wide: boolean; onViewCar: () => void}) {
  const {ui, styles} = useDesign(), car = model.car;
  const fitColor = car.fit ? toneColor(ui, car.fit.tone) : ui.muted;
  return <Panel testID="team-car-card">
    <View style={[styles.row, {flexWrap: 'wrap', gap: 10}]}>
      <Text style={styles.eyebrow}>CURRENT CAR · {(car.venue ?? 'No upcoming race').toUpperCase()}</Text>
      {car.fit ? <View testID="team-car-suitability"><Tag text={car.fit.label} color={fitColor}/></View> : null}
    </View>
    <View style={{flexDirection: wide ? 'row' : 'column', gap: 18, alignItems: wide ? 'center' : 'stretch'}}>
      <GarageFloor team={model.team}/>
      <View style={{flex: wide ? 1 : undefined, gap: 12, minWidth: 0}}>
        <Text style={styles.eyebrow}>VS GRID AVERAGE</Text>
        {car.bars.map(b => <Bar key={b.key} bar={b}/>)}
        {car.other.length ? <Text style={[styles.muted, {fontSize: 12}]}>
          {car.venue ? `At ${car.venue}: ` : ''}{car.other.map(o => `${o.kind === 'STRENGTH' ? '▲' : '▼'} ${o.text}`).join(' · ')}</Text> : null}
        <LinkText label="View car" onPress={onViewCar}/>
      </View>
    </View>
  </Panel>;
}

function GarageFloor({team}: {team: TeamScreenModel['team']}) {
  const {ui} = useDesign();
  // Dark radial "garage floor" in flat layers; the car file itself is transparent and the game adds the shadow.
  return <View style={{flex: 1.15, minWidth: 0, aspectRatio: 1.45, borderRadius: 10, overflow: 'hidden', backgroundColor: ui.bg,
    alignItems: 'center', justifyContent: 'center'}}>
    {[1.3, 1, .72].map((s, i) => <View key={s} style={{position: 'absolute', width: `${s * 100}%`, aspectRatio: 1, borderRadius: 9999,
      backgroundColor: ui.raised, opacity: .22 + i * .14}}/>)}
    <View style={{position: 'absolute', bottom: '18%', width: '62%', height: '12%', borderRadius: 999, backgroundColor: '#000', opacity: .45}}/>
    <AssetImage testID="asset-car" src={carAsset(team.shortName)} label={`${team.name} car`} width="86%" aspect={1.6}
      placeholder="PLACE CAR IMAGE HERE"/>
  </View>;
}

function Bar({bar}: {bar: CarBar}) {
  const {ui, styles} = useDesign(), color = toneColor(ui, bar.tone);
  const fill = Math.max(4, Math.min(100, 50 + bar.delta * 3.3));
  return <View accessibilityLabel={`${bar.label} ${bar.delta >= 0 ? '+' : ''}${bar.delta} versus grid average`} style={{gap: 4}}>
    <View style={styles.between}>
      <View style={[styles.row, {gap: 8, flex: 1, minWidth: 0}]}>
        <Text style={{color: ui.ink, fontSize: 14, fontWeight: '600'}}>{bar.label}</Text>
        {bar.tag ? <Tag text={bar.tag.kind === 'STRENGTH' ? '▲ STRENGTH' : '▼ CONCERN'} color={bar.tag.kind === 'STRENGTH' ? ui.green : ui.caution}/> : null}
      </View>
      <Text style={[styles.figure, {color, fontSize: 14}]}>{bar.delta > 0 ? '+' : bar.delta < 0 ? '−' : '±'}{Math.abs(bar.delta)}</Text>
    </View>
    <View style={{height: 8, borderRadius: 8, backgroundColor: ui.raised}}>
      <View style={{width: `${fill}%`, height: 8, borderRadius: 8, backgroundColor: color}}/>
      <View accessibilityLabel="Grid average" style={{position: 'absolute', left: '50%', top: -3, width: 2, height: 14, marginLeft: -1, backgroundColor: ui.muted}}/>
    </View>
    {bar.tag ? <Text style={[styles.muted, {fontSize: 12}]}>{bar.tag.text}</Text> : null}
  </View>;
}
