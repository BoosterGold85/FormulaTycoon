import React, { useMemo, useState } from 'react';
import {
  Pressable,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  useWindowDimensions,
  View
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { WORKERS, WORKSTATIONS } from '../game/headquartersData';
import { FloorTile } from './components/FloorTile';
import { Workstation } from './components/Workstation';
import { Worker } from './components/Worker';

const GRID_SIZE = 8;

export function HeadquartersScreen() {
  const { width } = useWindowDimensions();
  const [runId, setRunId] = useState(0);
  const originX = width / 2;
  const originY = 54;

  const tiles = useMemo(
    () =>
      Array.from({ length: GRID_SIZE * GRID_SIZE }, (_, index) => ({
        x: index % GRID_SIZE,
        y: Math.floor(index / GRID_SIZE)
      })),
    []
  );

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar style="light" />
      <View style={styles.screen}>
        <View style={styles.header}>
          <View>
            <Text style={styles.eyebrow}>TEAM HEADQUARTERS</Text>
            <Text style={styles.title}>FORMULA TYCOON</Text>
          </View>
          <View style={styles.weekPill}>
            <Text style={styles.weekTop}>WEEK 1</Text>
            <Text style={styles.weekBottom}>PRE-SEASON</Text>
          </View>
        </View>

        <View style={styles.statsRow}>
          <Stat label="STAFF" value="6 / 6" />
          <Stat label="MORALE" value="82%" />
          <Stat label="CAR" value="B" />
          <Stat label="CASH" value="$18.4M" />
        </View>

        <View style={styles.sceneCard}>
          <View style={styles.sceneTopRow}>
            <View>
              <Text style={styles.sceneTitle}>RACE OPERATIONS</Text>
              <Text style={styles.sceneSubtitle}>Factory floor · Prototype build</Text>
            </View>
            <View style={styles.livePill}>
              <View style={styles.liveDot} />
              <Text style={styles.liveText}>LIVE</Text>
            </View>
          </View>

          <View style={styles.scene}>
            <View style={styles.backWall}>
              <Text style={styles.wallLogo}>FT</Text>
              <Text style={styles.wallText}>FORMULA TYCOON RACING</Text>
            </View>

            {tiles.map(tile => (
              <FloorTile
                key={`${tile.x}-${tile.y}`}
                gridX={tile.x}
                gridY={tile.y}
                originX={originX - 22}
                originY={originY + 46}
                alternate={(tile.x + tile.y) % 2 === 0}
              />
            ))}

            {WORKSTATIONS.map(station => (
              <Workstation
                key={station.id}
                station={station}
                originX={originX - 22}
                originY={originY + 46}
              />
            ))}

            {WORKERS.map(worker => {
              const station = WORKSTATIONS.find(item => item.id === worker.stationId);
              if (!station) return null;
              return (
                <Worker
                  key={worker.id}
                  worker={worker}
                  station={station}
                  originX={originX - 22}
                  originY={originY + 46}
                  runId={runId}
                />
              );
            })}
          </View>

          <Pressable style={styles.workdayButton} onPress={() => setRunId(value => value + 1)}>
            <Text style={styles.workdayButtonText}>↻  RUN WORKDAY AGAIN</Text>
          </Pressable>
        </View>

        <View style={styles.activityCard}>
          <Text style={styles.activityTitle}>TODAY AT HQ</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.activityScroll}>
            <Activity time="09:00" title="Aero package" detail="Front wing concept" />
            <Activity time="11:30" title="Simulator" detail="Long-run program" />
            <Activity time="14:00" title="Car build" detail="Pre-season spec" />
            <Activity time="17:00" title="Freight" detail="Pack test rig" />
          </ScrollView>
        </View>

        <View style={styles.nav}>
          <NavItem label="HQ" active />
          <NavItem label="TEAM" />
          <NavItem label="DRIVERS" />
          <NavItem label="CALENDAR" />
          <NavItem label="HISTORY" />
        </View>
      </View>
    </SafeAreaView>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.stat}>
      <Text style={styles.statValue}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  );
}

function Activity({ time, title, detail }: { time: string; title: string; detail: string }) {
  return (
    <View style={styles.activity}>
      <Text style={styles.activityTime}>{time}</Text>
      <Text style={styles.activityName}>{title}</Text>
      <Text style={styles.activityDetail}>{detail}</Text>
    </View>
  );
}

function NavItem({ label, active = false }: { label: string; active?: boolean }) {
  return (
    <View style={styles.navItem}>
      <View style={[styles.navIcon, active && styles.navIconActive]} />
      <Text style={[styles.navLabel, active && styles.navLabelActive]}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: '#09101A'
  },
  screen: {
    flex: 1,
    backgroundColor: '#09101A',
    paddingHorizontal: 14,
    paddingTop: 8
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12
  },
  eyebrow: {
    color: '#6C7D91',
    fontSize: 9,
    fontWeight: '900',
    letterSpacing: 1.8
  },
  title: {
    color: '#F3F5F8',
    fontSize: 23,
    fontWeight: '900',
    letterSpacing: 0.5
  },
  weekPill: {
    borderRadius: 9,
    paddingHorizontal: 10,
    paddingVertical: 7,
    backgroundColor: '#151F2C',
    borderWidth: 1,
    borderColor: '#27364A',
    alignItems: 'flex-end'
  },
  weekTop: {
    color: '#E13A46',
    fontWeight: '900',
    fontSize: 9
  },
  weekBottom: {
    color: '#91A0B3',
    fontWeight: '700',
    fontSize: 7,
    marginTop: 1
  },
  statsRow: {
    flexDirection: 'row',
    gap: 7,
    marginBottom: 9
  },
  stat: {
    flex: 1,
    backgroundColor: '#111A26',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#1F2C3D',
    paddingVertical: 7,
    alignItems: 'center'
  },
  statValue: {
    color: '#F0F3F7',
    fontWeight: '900',
    fontSize: 12
  },
  statLabel: {
    color: '#66788D',
    fontSize: 6,
    fontWeight: '900',
    letterSpacing: 1.1,
    marginTop: 2
  },
  sceneCard: {
    flex: 1,
    minHeight: 430,
    overflow: 'hidden',
    backgroundColor: '#0E1723',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#25344A'
  },
  sceneTopRow: {
    paddingHorizontal: 13,
    paddingTop: 11,
    paddingBottom: 7,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    zIndex: 999
  },
  sceneTitle: {
    color: '#E9EEF4',
    fontWeight: '900',
    fontSize: 11,
    letterSpacing: 1
  },
  sceneSubtitle: {
    color: '#6E8094',
    fontSize: 8,
    marginTop: 2
  },
  livePill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: '#11241F',
    borderColor: '#244F41',
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 4
  },
  liveDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#63E6A8'
  },
  liveText: {
    color: '#7DE8B2',
    fontWeight: '900',
    fontSize: 7
  },
  scene: {
    flex: 1,
    position: 'relative',
    marginTop: -4
  },
  backWall: {
    position: 'absolute',
    top: 4,
    left: 18,
    right: 18,
    height: 58,
    borderRadius: 9,
    backgroundColor: '#151F2C',
    borderWidth: 1,
    borderColor: '#27374C',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16
  },
  wallLogo: {
    color: '#E13A46',
    fontWeight: '900',
    fontStyle: 'italic',
    fontSize: 25,
    marginRight: 9
  },
  wallText: {
    color: '#61748A',
    fontSize: 8,
    fontWeight: '900',
    letterSpacing: 1.1
  },
  workdayButton: {
    alignSelf: 'center',
    marginBottom: 10,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 9,
    backgroundColor: '#D92D44',
    zIndex: 999
  },
  workdayButtonText: {
    color: '#FFFFFF',
    fontSize: 8,
    fontWeight: '900',
    letterSpacing: 0.8
  },
  activityCard: {
    marginTop: 9,
    paddingTop: 9
  },
  activityTitle: {
    color: '#6F8094',
    fontSize: 8,
    fontWeight: '900',
    letterSpacing: 1.4,
    marginBottom: 6
  },
  activityScroll: {
    gap: 7,
    paddingRight: 12
  },
  activity: {
    width: 116,
    backgroundColor: '#111A26',
    borderWidth: 1,
    borderColor: '#1F2C3D',
    borderRadius: 9,
    padding: 8
  },
  activityTime: {
    color: '#E13A46',
    fontSize: 7,
    fontWeight: '900'
  },
  activityName: {
    color: '#EBEFF4',
    fontSize: 9,
    fontWeight: '800',
    marginTop: 2
  },
  activityDetail: {
    color: '#687B91',
    fontSize: 7,
    marginTop: 1
  },
  nav: {
    height: 58,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    borderTopWidth: 1,
    borderTopColor: '#1C293A',
    marginTop: 8
  },
  navItem: {
    width: 56,
    alignItems: 'center'
  },
  navIcon: {
    width: 14,
    height: 7,
    borderRadius: 4,
    backgroundColor: '#344357',
    marginBottom: 4
  },
  navIconActive: {
    backgroundColor: '#E13A46'
  },
  navLabel: {
    color: '#5F7187',
    fontSize: 6,
    fontWeight: '900',
    letterSpacing: 0.5
  },
  navLabelActive: {
    color: '#F0F3F7'
  }
});
