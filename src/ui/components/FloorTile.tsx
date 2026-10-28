import React from 'react';
import { StyleSheet, View } from 'react-native';
import { gridToScreen } from '../isometric';

type Props = {
  gridX: number;
  gridY: number;
  originX: number;
  originY: number;
  alternate?: boolean;
};

const TILE = 54;

export function FloorTile({ gridX, gridY, originX, originY, alternate }: Props) {
  const p = gridToScreen({ x: gridX, y: gridY }, originX, originY);
  return (
    <View
      pointerEvents="none"
      style={[
        styles.tile,
        {
          left: p.x - TILE / 2,
          top: p.y - TILE / 2,
          backgroundColor: alternate ? '#1B2636' : '#223044'
        }
      ]}
    />
  );
}

const styles = StyleSheet.create({
  tile: {
    position: 'absolute',
    width: TILE,
    height: TILE,
    borderWidth: 1,
    borderColor: '#304158',
    transform: [{ rotateZ: '45deg' }, { scaleY: 0.5 }]
  }
});
