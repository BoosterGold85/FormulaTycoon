import React from 'react';
import { Animated, StyleSheet, View } from 'react-native';

/** Two connected limb segments; the forearm pivots around a visible elbow inside the upper arm. */
export const WorkerArm = React.memo(function WorkerArm({ k, x, y, shoulder, elbow, uniform, skin, glove, tool, far = false }: {
  k: number; x: number; y: number;
  shoulder: Animated.AnimatedInterpolation<string>;
  elbow: Animated.AnimatedInterpolation<string>;
  uniform: string; skin: string; glove: boolean;
  tool: 'NONE' | 'WRENCH' | 'PART'; far?: boolean;
}) {
  const width = 2.6 * k, upper = 4.2 * k, forearm = 3.7 * k;
  return <Animated.View pointerEvents="none" style={[s.upper, {
    left: x - width / 2, top: y, width, height: upper, borderRadius: width / 2,
    backgroundColor: uniform, borderWidth: 0, opacity: far ? 0.8 : 1,
    transform: [{ rotate: shoulder }]
  }]}>
    <Animated.View style={[s.forearm, {
      top: upper - width / 2, left: -0.5 * k, width, height: forearm + width,
      transformOrigin: `50% ${width / 2}px`, transform: [{ rotate: elbow }]
    }]}>
      <View style={[s.sleeve, { top: width / 2, width, height: forearm - 0.2 * k, borderRadius: k, backgroundColor: uniform, borderWidth: 0 }]} />
      <View style={[s.joint, { width, height: width, borderRadius: width / 2, backgroundColor: uniform, borderWidth: 0 }]} />
      <View style={[s.cuff, { top: forearm - 0.5 * k, width, height: 0.55 * k }]} />
      <View style={[s.hand, { top: forearm + 0.2 * k, width: 2.4 * k, height: 2.2 * k, borderRadius: k, backgroundColor: glove ? '#D7C79E' : skin, borderWidth: 0 }]}>
        {tool === 'WRENCH' ? <View style={[s.tool, { top: -1.5 * k, left: k, width: 1.1 * k, height: 5 * k, transform: [{ rotate: '30deg' }] }]}>
          <View style={{ position: 'absolute', top: -k, left: -0.9 * k, width: 2.8 * k, height: 2.1 * k, borderRadius: 0.5 * k, borderWidth: 0.8 * k, borderTopWidth: 0, borderColor: '#DCE7E9' }} />
        </View> : null}
        {tool === 'PART' ? <View style={{ position: 'absolute', left: -k, top: k, width: 5 * k, height: 1.8 * k, borderRadius: 0.7 * k, backgroundColor: '#B5C7D0', borderWidth: 0.5 * k, borderColor: '#E8F0E7', transform: [{ rotate: '-20deg' }] }} /> : null}
      </View>
    </Animated.View>
  </Animated.View>;
});
const s = StyleSheet.create({
  upper: { position: 'absolute', transformOrigin: 'top', borderColor: '#172632' },
  forearm: { position: 'absolute' },
  sleeve: { position: 'absolute' },
  joint: { position: 'absolute' },
  cuff: { position: 'absolute', backgroundColor: '#BEC8C9', opacity: 0.45 },
  hand: { position: 'absolute' },
  tool: { position: 'absolute', backgroundColor: '#CCD9DE', borderRadius: 0.5 }
});
