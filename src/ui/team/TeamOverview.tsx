import React from 'react';
import {SafeAreaView, ScrollView, View, useWindowDimensions} from 'react-native';
import type {NavTab} from '../../game/hudPlaceholders';
import type {GameDefinition, GameUniverse} from '../../simulation/universe';
import {selectTeamScreen} from '../../simulation/teamScreen';
import {BottomNav} from '../components/BottomNav';
import {useDesign} from '../design/system';
import {BroadcastTheme} from '../theme';
import {TeamBand} from './TeamBand';
import {CarCard} from './CarCard';
import {DriverCard, TeammateBattle} from './DriverCards';
import {FactoryTile, OrganisationTile} from './FactoryOrg';
import {SeasonStrip} from './SeasonStrip';
import {LinkText} from './bits';
import {Text} from 'react-native';

type Props = {universe: GameUniverse; definition: GameDefinition; onNavigate: (tab: NavTab) => void;
  onDriver: (id: string) => void; onView: (view: 'car' | 'development' | 'organization') => void};

/** Team overview on the broadcast surface (owner decision F): same near-black language as live timing, both themes. */
export function TeamOverview(props: Props) { return <BroadcastTheme><Overview {...props}/></BroadcastTheme>; }

function Overview({universe, definition, onNavigate, onDriver, onView}: Props) {
  const {ui, styles} = useDesign(), wide = useWindowDimensions().width >= 1000;
  const model = selectTeamScreen(universe, definition);
  const car = <CarCard model={model} wide={wide} onViewCar={() => onView('car')}/>;
  const drivers = <View style={{gap: 12}}>
    <View style={styles.between}><Text style={styles.eyebrow}>YOUR DRIVERS</Text><LinkText label="Manage drivers" onPress={() => onNavigate('DRIVERS')}/></View>
    {model.drivers.map((d, i) => <DriverCard key={d.id} driver={d} index={i} team={model.team} wide={wide} onPress={() => onDriver(d.id)}/>)}
    <TeammateBattle model={model}/>
  </View>;
  const factory = <FactoryTile model={model} onOpen={() => onView('development')}/>;
  const organisation = <OrganisationTile model={model} onOpen={() => onView('organization')}/>;
  return <SafeAreaView style={{flex: 1, backgroundColor: ui.bg}}>
    <ScrollView testID="team-overview" style={{flex: 1}} contentContainerStyle={{paddingBottom: 24}}>
      <TeamBand model={model} wide={wide}/>
      <View style={{width: '100%', maxWidth: 1360, alignSelf: 'center', padding: 16, gap: 16}}>
        {wide ? <View style={{flexDirection: 'row', gap: 16, alignItems: 'flex-start'}}>
          <View style={{flex: 1.12, gap: 16, minWidth: 0}}>{car}<View style={{flexDirection: 'row', gap: 16}}>{factory}{organisation}</View></View>
          <View style={{flex: 1, minWidth: 0}}>{drivers}</View>
        </View> : <>{car}{drivers}{factory}{organisation}</>}
        <SeasonStrip model={model} wide={wide} onCalendar={() => onNavigate('RACE')}/>
      </View>
    </ScrollView>
    <BottomNav active="TEAM" onSelect={next => onNavigate(next)}/>
  </SafeAreaView>;
}
