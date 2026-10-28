import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import type { DepartmentDefinition } from '../../game/models';
import { gridToScreen, type Projection } from '../isometric';

export const DepartmentSign = React.memo(function DepartmentSign({
  department,
  projection,
  selected,
  onPress
}: {
  department: DepartmentDefinition;
  projection: Projection;
  selected: boolean;
  onPress: (department: DepartmentDefinition) => void;
}) {
  const point = gridToScreen(department.labelPoint, projection, department.labelHeight);
  return (
    <View style={[styles.anchor, { left: point.x, top: point.y }]} pointerEvents="box-none">
      <Pressable
        onPress={() => onPress(department)}
        hitSlop={6}
        accessibilityRole="button"
        accessibilityLabel={`${department.name} department`}
        style={[styles.sign, selected && styles.signSelected]}
      >
        <View style={[styles.swatch, { backgroundColor: department.floorColor }]} />
        <Text style={styles.text} numberOfLines={1}>
          {department.shortName.toUpperCase()}
        </Text>
      </Pressable>
    </View>
  );
});

const styles = StyleSheet.create({
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
