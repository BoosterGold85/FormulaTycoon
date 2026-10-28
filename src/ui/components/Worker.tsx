import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Animated, Easing, StyleSheet, Text, View } from 'react-native';
import type { Worker as WorkerModel, Workstation } from '../../game/models';
import { gridToScreen } from '../isometric';

type Props = {
  worker: WorkerModel;
  station: Workstation;
  originX: number;
  originY: number;
  runId: number;
};

const uniformColors = {
  navy: '#3367A8',
  red: '#D93A4C',
  white: '#E9EEF5'
} as const;

export function Worker({ worker, station, originX, originY, runId }: Props) {
  const start = useMemo(
    () => gridToScreen(worker.startGrid, originX, originY),
    [worker.startGrid, originX, originY]
  );
  const target = useMemo(() => {
    const point = gridToScreen(station.grid, originX, originY);
    return { x: point.x + 23, y: point.y - 8 };
  }, [station.grid, originX, originY]);

  const position = useRef(new Animated.ValueXY(start)).current;
  const bob = useRef(new Animated.Value(0)).current;
  const pulse = useRef(new Animated.Value(0.35)).current;
  const [working, setWorking] = useState(false);

  useEffect(() => {
    position.stopAnimation();
    bob.stopAnimation();
    pulse.stopAnimation();
    position.setValue(start);
    bob.setValue(0);
    pulse.setValue(0.35);
    setWorking(false);

    const timer = setTimeout(() => {
      Animated.timing(position, {
        toValue: target,
        duration: 1700 + worker.delayMs / 4,
        easing: Easing.inOut(Easing.cubic),
        useNativeDriver: true
      }).start(({ finished }) => {
        if (!finished) return;
        setWorking(true);
        Animated.loop(
          Animated.sequence([
            Animated.timing(bob, { toValue: -2, duration: 500, useNativeDriver: true }),
            Animated.timing(bob, { toValue: 0, duration: 500, useNativeDriver: true })
          ])
        ).start();
        Animated.loop(
          Animated.sequence([
            Animated.timing(pulse, { toValue: 1, duration: 850, useNativeDriver: true }),
            Animated.timing(pulse, { toValue: 0.35, duration: 850, useNativeDriver: true })
          ])
        ).start();
      });
    }, worker.delayMs);

    return () => clearTimeout(timer);
  }, [runId, start.x, start.y, target.x, target.y, worker.delayMs, position, bob, pulse]);

  return (
    <Animated.View
      style={[
        styles.anchor,
        {
          zIndex: Math.round(target.y + 25),
          transform: position.getTranslateTransform()
        }
      ]}
    >
      <Animated.View style={[styles.worker, { transform: [{ translateY: bob }] }]}>
        {working ? <Animated.View style={[styles.workingDot, { opacity: pulse }]} /> : null}
        <View style={styles.head} />
        <View style={[styles.body, { backgroundColor: uniformColors[worker.uniform] }]}>
          <View style={styles.badge} />
        </View>
        <View style={styles.legs}>
          <View style={styles.leg} />
          <View style={styles.leg} />
        </View>
      </Animated.View>
      <View style={styles.namePlate}>
        <Text style={styles.name}>{worker.name}</Text>
        <Text style={[styles.state, working && styles.stateWorking]}>
          {working ? 'WORKING' : 'WALKING'}
        </Text>
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  anchor: {
    position: 'absolute',
    left: -12,
    top: -34,
    width: 56,
    alignItems: 'center'
  },
  worker: {
    width: 24,
    height: 38,
    alignItems: 'center'
  },
  workingDot: {
    position: 'absolute',
    right: -4,
    top: 7,
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#63E6A8'
  },
  head: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#E9B996',
    borderWidth: 1,
    borderColor: '#7E5A46'
  },
  body: {
    marginTop: 1,
    width: 17,
    height: 18,
    borderRadius: 5,
    borderWidth: 1,
    borderColor: '#19212C',
    alignItems: 'center'
  },
  badge: {
    marginTop: 4,
    width: 6,
    height: 3,
    borderRadius: 1,
    backgroundColor: '#E13A46'
  },
  legs: {
    flexDirection: 'row',
    gap: 3
  },
  leg: {
    width: 5,
    height: 7,
    backgroundColor: '#131A24',
    borderBottomLeftRadius: 2,
    borderBottomRightRadius: 2
  },
  namePlate: {
    marginTop: 1,
    minWidth: 49,
    alignItems: 'center',
    paddingHorizontal: 4,
    paddingVertical: 2,
    borderRadius: 5,
    backgroundColor: 'rgba(9,14,21,0.86)'
  },
  name: {
    color: '#F5F7FA',
    fontSize: 7,
    fontWeight: '800'
  },
  state: {
    color: '#D5A23C',
    fontSize: 5,
    fontWeight: '900',
    letterSpacing: 0.6
  },
  stateWorking: {
    color: '#63E6A8'
  }
});
