import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import type { DepartmentDefinition } from '../../game/models';
import { gridToScreen, type Projection } from '../isometric';

export const DepartmentSign = React.memo(function DepartmentSign({
  department,
  projection,
  selected,
  onPress,
  activity
}: {
  department: DepartmentDefinition;
  projection: Projection;
  selected: boolean;
  onPress: (department: DepartmentDefinition) => void;
  /** Actual player project in this department, e.g. "Floor · Design" (display only). */
  activity?: string;
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
    </View>
  );
});

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
