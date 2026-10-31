import React, { useEffect, useRef } from 'react';
import { Animated, Easing, Pressable, StyleSheet, Text, View } from 'react-native';
import type { DepartmentDefinition } from '../../game/models';
import { gridToScreen, type Projection } from '../isometric';

export const DepartmentSign = React.memo(function DepartmentSign({
  department,
  projection,
  selected,
  onPress,
  activity,
  bubble,
  bubbleKey,
  reducedMotion = false
}: {
  department: DepartmentDefinition;
  projection: Projection;
  selected: boolean;
  onPress: (department: DepartmentDefinition) => void;
  /** Actual player project in this department, e.g. "Floor · Design" (display only). */
  activity?: string;
  bubble?: string;
  bubbleKey?: string;
  reducedMotion?: boolean;
}) {
  const point = gridToScreen(department.labelPoint, projection, department.labelHeight);
  return (
    <View style={[styles.anchor, { left: point.x, top: point.y }]} pointerEvents="box-none">
      <Pressable
        onPress={() => onPress(department)}
        hitSlop={6}
        accessibilityRole="button"
        accessibilityLabel={`${department.name} department${activity ? `, working on ${activity}` : ''}`}
        style={[styles.sign, selected && styles.signSelected, !!activity && styles.signActive]}
      >
        <View style={[styles.swatch, { backgroundColor: department.floorColor }, !!activity && styles.swatchActive]} />
        <View>
          <Text style={styles.text} numberOfLines={1}>
            {department.shortName.toUpperCase()}
          </Text>
          {activity ? <Text style={styles.activity} numberOfLines={1}>{activity}</Text> : null}
        </View>
      </Pressable>
      {bubble ? <ProgressBubble key={bubbleKey} text={bubble} reducedMotion={reducedMotion} /> : null}
    </View>
  );
});

/** One-shot "+10 Research" lift after a turn; purely presentational, timed by animation only. */
function ProgressBubble({ text, reducedMotion }: { text: string; reducedMotion: boolean }) {
  const t = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    const run = Animated.timing(t, { toValue: 1, duration: reducedMotion ? 2800 : 2600, easing: Easing.out(Easing.quad), useNativeDriver: true });
    run.start();
    return () => run.stop();
  }, [t, reducedMotion]);
  const style = reducedMotion
    ? { opacity: t.interpolate({ inputRange: [0, 0.85, 1], outputRange: [1, 1, 0] }) }
    : { opacity: t.interpolate({ inputRange: [0, 0.15, 0.75, 1], outputRange: [0, 1, 1, 0] }),
        transform: [{ translateY: t.interpolate({ inputRange: [0, 1], outputRange: [-14, -40] }) }] };
  return <Animated.View pointerEvents="none" style={[styles.bubble, style]}><Text style={styles.bubbleText}>{text}</Text></Animated.View>;
}

const styles = StyleSheet.create({
  signActive: {
    borderColor: '#63E6A8'
  },
  swatchActive: {
    borderColor: '#63E6A8'
  },
  activity: {
    maxWidth: 92,
    color: '#9FE3C3',
    fontSize: 8,
    fontWeight: '700'
  },
  bubble: {
    position: 'absolute',
    paddingHorizontal: 7,
    paddingVertical: 3,
    borderRadius: 8,
    backgroundColor: 'rgba(17,29,42,0.92)',
    borderWidth: 1,
    borderColor: '#63E6A8'
  },
  bubbleText: {
    color: '#F6F2E9',
    fontSize: 10,
    fontWeight: '900'
  },
  anchor: {
    position: 'absolute',
    width: 0,
    height: 0,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'visible'
  },
  sign: {
    position: 'absolute',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 6,
    paddingVertical: 3,
    borderRadius: 7,
    backgroundColor: 'rgba(10,16,25,0.82)',
    borderWidth: 1,
    borderColor: '#3A4C63'
  },
  signSelected: {
    borderColor: '#F2B544'
  },
  swatch: {
    width: 7,
    height: 7,
    borderRadius: 2,
    borderWidth: 1,
    borderColor: '#8DA0B6'
  },
  text: {
    color: '#DCE4EE',
    fontSize: 9,
    fontWeight: '900',
    letterSpacing: 0.5
  }
});
