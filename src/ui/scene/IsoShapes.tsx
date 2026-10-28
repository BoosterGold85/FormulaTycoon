import React from 'react';
import { StyleSheet, View } from 'react-native';
import { gridToScreen, type Projection } from '../isometric';
import { shade, type BoxPrimitive, type PlanePrimitive } from './primitives';

/**
 * Isometric faces are built from plain Views using single transforms per View
 * (nested where two are needed) so the result does not depend on how a
 * platform composes multiple transforms.
 */

type Rect = { x: number; y: number; width: number; depth: number };

/** A horizontal rectangle (floor, desk top) at elevation z. */
export function IsoPlane({
  rect,
  z = 0,
  color,
  borderColor,
  projection,
  children
}: {
  rect: Rect;
  z?: number;
  color: string;
  borderColor?: string;
  projection: Projection;
  children?: React.ReactNode;
}) {
  const centre = gridToScreen(
    { x: rect.x + rect.width / 2, y: rect.y + rect.depth / 2 },
    projection,
    z
  );
  const width = rect.width * projection.tileX * Math.SQRT2;
  const height = rect.depth * projection.tileX * Math.SQRT2;
  return (
    <View
      pointerEvents="none"
      style={[
        styles.abs,
        {
          left: centre.x - width / 2,
          top: centre.y - height / 2,
          width,
          height,
          transform: [{ scaleY: projection.tileY / projection.tileX }]
        }
      ]}
    >
      <View
        style={[
          StyleSheet.absoluteFill,
          {
            backgroundColor: color,
            borderColor,
            borderWidth: borderColor ? 1.5 : 0,
            transform: [{ rotate: '45deg' }]
          }
        ]}
      >
        {children}
      </View>
    </View>
  );
}

/**
 * A vertical face running along the x axis (facing +y, lower-left on screen)
 * or along the y axis (facing +x, lower-right). `from` is where it starts in
 * grid units; length runs along the axis. Children are laid out on the face.
 */
export function IsoFace({
  axis,
  from,
  length,
  z,
  height,
  color,
  projection,
  children
}: {
  axis: 'x' | 'y';
  from: { x: number; y: number };
  length: number;
  z: number;
  height: number;
  color: string;
  projection: Projection;
  children?: React.ReactNode;
}) {
  const end = axis === 'x' ? { x: from.x + length, y: from.y } : { x: from.x, y: from.y + length };
  const a = gridToScreen(from, projection, z + height / 2);
  const b = gridToScreen(end, projection, z + height / 2);
  const width = length * projection.tileX;
  const pixelHeight = height * projection.zUnit;
  const angle = Math.atan(projection.tileY / projection.tileX) * (axis === 'x' ? 1 : -1);
  return (
    <View
      pointerEvents="none"
      style={[
        styles.abs,
        {
          left: (a.x + b.x) / 2 - width / 2,
          top: (a.y + b.y) / 2 - pixelHeight / 2,
          width,
          height: pixelHeight,
          backgroundColor: color,
          overflow: 'hidden',
          transform: [{ skewY: `${angle}rad` }]
        }
      ]}
    >
      {children}
    </View>
  );
}

export const IsoBox = React.memo(function IsoBox({
  item,
  projection
}: {
  item: BoxPrimitive;
  projection: Projection;
}) {
  const { x, y, width, depth, z, height, color } = item;
  return (
    <>
      <IsoFace
        axis="x"
        from={{ x, y: y + depth }}
        length={width}
        z={z}
        height={height}
        color={item.frontColor ?? shade(color, 0.82)}
        projection={projection}
      />
      <IsoFace
        axis="y"
        from={{ x: x + width, y }}
        length={depth}
        z={z}
        height={height}
        color={item.sideColor ?? shade(color, 0.64)}
        projection={projection}
      />
      <IsoPlane
        rect={{ x, y, width, depth }}
        z={z + height}
        color={item.topColor ?? shade(color, 1.12)}
        projection={projection}
      />
    </>
  );
});

export function IsoPlanePrimitive({
  item,
  projection
}: {
  item: PlanePrimitive;
  projection: Projection;
}) {
  return (
    <IsoPlane
      rect={item}
      color={item.color}
      borderColor={item.borderColor}
      projection={projection}
    />
  );
}

const styles = StyleSheet.create({
  abs: {
    position: 'absolute'
  }
});
