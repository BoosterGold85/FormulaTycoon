import React, { useEffect, useRef } from 'react';
import { Animated, Easing, StyleSheet, Text, View } from 'react-native';
import type { Projection } from '../isometric';
import { IsoFace, IsoPlane } from './IsoShapes';

/** One native opacity clock shared by the timing wall and equipment LEDs. */
export const AmbientDetails = React.memo(function AmbientDetails({ projection, reducedMotion }: {
  projection: Projection;
  reducedMotion: boolean;
}) {
  const pulse = useRef(new Animated.Value(0.65)).current;
  useEffect(() => {
    if (reducedMotion) { pulse.setValue(0.8); return; }
    const loop = Animated.loop(Animated.sequence([
      Animated.timing(pulse, { toValue: 1, duration: 1900, easing: Easing.inOut(Easing.sin), useNativeDriver: true, isInteraction: false }),
      Animated.timing(pulse, { toValue: 0.55, duration: 1900, easing: Easing.inOut(Easing.sin), useNativeDriver: true, isInteraction: false })
    ]));
    loop.start();
    return () => loop.stop();
  }, [pulse, reducedMotion]);
  return (
    <>
      <IsoFace axis="y" from={{ x: 0.035, y: 3.85 }} length={2.25} z={0.85} height={0.7} color="#0B1721" projection={projection}>
        <View style={styles.dataWall}>
          <Text style={styles.heading}>LIVE TIMING</Text>
          {[0, 1, 2].map(row => (
            <View key={row} style={styles.line}>
              <View style={[styles.dot, { backgroundColor: row === 1 ? '#D65C6C' : '#66D3B6' }]} />
              <Animated.View style={[styles.trace, { width: `${80 - row * 16}%`, opacity: pulse }]} />
            </View>
          ))}
        </View>
      </IsoFace>
      <IsoFace axis="y" from={{ x: 0.035, y: 6.95 }} length={1.8} z={0.85} height={0.65} color="#182E42" projection={projection}>
        <View style={styles.trackScreen}>
          <View style={styles.horizon} />
          <View style={styles.track} />
          <Animated.View style={[styles.apex, { opacity: pulse }]} />
        </View>
      </IsoFace>
      <IsoFace axis="x" from={{ x: 0.55, y: 0.025 }} length={2.8} z={0.8} height={0.65} color="#30495E" projection={projection}>
        <View style={styles.blueprint}>
          <View style={styles.wing} /><View style={styles.centreLine} />
        </View>
      </IsoFace>

    </>
  );
});

const styles = StyleSheet.create({
  dataWall: { flex: 1, padding: 3, justifyContent: 'space-around' },
  heading: { fontSize: 4, letterSpacing: 0.5, color: '#BDD4DF', fontWeight: '800' },
  line: { flexDirection: 'row', gap: 3, alignItems: 'center' },
  dot: { width: 2, height: 2 },
  trace: { height: 1.5, backgroundColor: '#6BD5BE' },
  trackScreen: { flex: 1, overflow: 'hidden', backgroundColor: '#29465B' },
  horizon: { height: '36%', backgroundColor: '#6093AF' },
  track: { position: 'absolute', left: '35%', top: '40%', width: '38%', height: '85%', backgroundColor: '#29323D', transform: [{ rotate: '-18deg' }], borderLeftWidth: 2, borderLeftColor: '#E2E8DB', borderRightWidth: 2, borderRightColor: '#D35862' },
  apex: { position: 'absolute', right: 3, top: 3, width: 2, height: 2, backgroundColor: '#93EDCA' },
  blueprint: { flex: 1, margin: 4, borderWidth: 0.5, borderColor: '#6D9CB4', justifyContent: 'center', alignItems: 'center' },
  wing: { width: '72%', height: 3, borderWidth: 0.7, borderColor: '#B7D9E8', transform: [{ rotate: '-9deg' }] },
  centreLine: { position: 'absolute', width: 0.5, height: '100%', backgroundColor: '#6896AC' },
  brand: { color: '#F0F4F8', fontWeight: '900', fontStyle: 'italic', textAlign: 'center' }
});
