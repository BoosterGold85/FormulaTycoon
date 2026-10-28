import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import type { Workstation as WorkstationModel } from '../../game/models';
import { gridToScreen } from '../isometric';

type Props = {
  station: WorkstationModel;
  originX: number;
  originY: number;
};

function Car() {
  return (
    <View style={styles.carWrap}>
      <View style={styles.rearWing} />
      <View style={styles.carBody}>
        <View style={styles.cockpit} />
      </View>
      <View style={styles.frontWing} />
    </View>
  );
}

function Desk({ sim = false }: { sim?: boolean }) {
  return (
    <View style={styles.desk}>
      <View style={styles.monitor} />
      {sim ? <View style={styles.simSeat} /> : <View style={styles.keyboard} />}
    </View>
  );
}

function Crates() {
  return (
    <View style={styles.crateRow}>
      <View style={styles.crate} />
      <View style={styles.crate} />
      <View style={styles.crate} />
    </View>
  );
}

export function Workstation({ station, originX, originY }: Props) {
  const p = gridToScreen(station.grid, originX, originY);
  return (
    <View style={[styles.wrap, { left: p.x - 36, top: p.y - 44, zIndex: Math.round(p.y) }]}>
      <View style={styles.platform} />
      <View style={styles.content}>
        {station.variant === 'car' ? <Car /> : null}
        {station.variant === 'desk' ? <Desk /> : null}
        {station.variant === 'sim' ? <Desk sim /> : null}
        {station.variant === 'crate' ? <Crates /> : null}
      </View>
      <View style={styles.label}>
        <Text style={styles.labelText}>{station.name.toUpperCase()}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    position: 'absolute',
    width: 72,
    height: 64,
    alignItems: 'center'
  },
  platform: {
    position: 'absolute',
    bottom: 8,
    width: 70,
    height: 28,
    backgroundColor: '#111A27',
    borderWidth: 1,
    borderColor: '#3A4A60',
    transform: [{ rotateZ: '45deg' }, { scaleY: 0.5 }]
  },
  content: {
    position: 'absolute',
    top: 4,
    width: 64,
    height: 38,
    alignItems: 'center',
    justifyContent: 'center'
  },
  desk: {
    width: 48,
    height: 24,
    borderRadius: 5,
    backgroundColor: '#5A6471',
    borderBottomWidth: 5,
    borderBottomColor: '#353D47'
  },
  monitor: {
    position: 'absolute',
    width: 18,
    height: 13,
    borderRadius: 2,
    backgroundColor: '#7EF0D2',
    left: 15,
    top: -10,
    borderWidth: 2,
    borderColor: '#17202A'
  },
  keyboard: {
    position: 'absolute',
    width: 19,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#C6D0DB',
    left: 15,
    top: 8
  },
  simSeat: {
    position: 'absolute',
    width: 14,
    height: 18,
    borderRadius: 4,
    backgroundColor: '#D92D44',
    left: 17,
    top: 9
  },
  carWrap: {
    width: 60,
    height: 22,
    alignItems: 'center',
    justifyContent: 'center'
  },
  carBody: {
    width: 46,
    height: 14,
    borderRadius: 8,
    backgroundColor: '#E13A46'
  },
  cockpit: {
    position: 'absolute',
    width: 12,
    height: 10,
    borderRadius: 6,
    backgroundColor: '#141A22',
    left: 18,
    top: 2
  },
  rearWing: {
    position: 'absolute',
    left: 1,
    width: 8,
    height: 20,
    borderRadius: 2,
    backgroundColor: '#E8EDF4'
  },
  frontWing: {
    position: 'absolute',
    right: 0,
    width: 9,
    height: 22,
    borderRadius: 2,
    backgroundColor: '#E8EDF4'
  },
  crateRow: {
    flexDirection: 'row',
    gap: 3,
    alignItems: 'flex-end'
  },
  crate: {
    width: 16,
    height: 20,
    backgroundColor: '#C98A48',
    borderWidth: 2,
    borderColor: '#82562D'
  },
  label: {
    position: 'absolute',
    bottom: -9,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 5,
    backgroundColor: '#0E151F',
    borderWidth: 1,
    borderColor: '#304158'
  },
  labelText: {
    color: '#9FB1C8',
    fontSize: 7,
    fontWeight: '800',
    letterSpacing: 0.6
  }
});
