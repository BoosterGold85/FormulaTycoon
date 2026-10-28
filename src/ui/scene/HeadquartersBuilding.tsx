import React, { useMemo } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import type { HeadquartersLayout } from '../../game/models';
import type { Point3, Projection } from '../isometric';
import { IsoBox, IsoFace, IsoPlane, IsoPlanePrimitive } from './IsoShapes';
import { propArt } from './propArt';
import { sortBoxes, type PlanePrimitive } from './primitives';

export const WALL_HEIGHT = 2.3;
const WALL_THICKNESS = 0.2;
const CORRIDOR_COLOR = '#283341';

/** Everything that should be visible when the camera fits the scene. */
export function sceneExtents(layout: HeadquartersLayout): Point3[] {
  const { width: w, depth: d } = layout;
  return [
    { x: -WALL_THICKNESS, y: -WALL_THICKNESS, z: WALL_HEIGHT },
    { x: w, y: -WALL_THICKNESS, z: WALL_HEIGHT },
    { x: -WALL_THICKNESS, y: d, z: WALL_HEIGHT },
    { x: w, y: d, z: -0.3 },
    { x: 12.1, y: 6.1, z: 1.9 },
    { x: 12.1, y: 10.0, z: 0 },
    { x: 2.6, y: 11.7, z: 0 },
    { x: 7.0, y: 11.7, z: 0 }
  ];
}

const OUTDOOR: PlanePrimitive[] = [
  { x: 2.6, y: 10.15, width: 4.4, depth: 1.55, color: '#2B3542' },
  { x: 10.2, y: 5.9, width: 1.9, depth: 4.6, color: '#222B37' },
  { x: 4.1, y: 9.75, width: 0.8, depth: 0.4, color: '#B8892E' },
  { x: 9.88, y: 6.9, width: 0.12, depth: 2.4, color: '#E1B341' }
];

/** Static diorama: floor, rooms, walls and furniture. Rendered once per projection. */
export const HeadquartersBuilding = React.memo(function HeadquartersBuilding({
  layout,
  projection
}: {
  layout: HeadquartersLayout;
  projection: Projection;
}) {
  const { width: w, depth: d } = layout;
  const art = useMemo(() => layout.props.map(propArt), [layout]);
  const boxes = useMemo(() => sortBoxes(art.flatMap(item => item.boxes)), [art]);
  const planes = useMemo(() => art.flatMap(item => item.planes), [art]);

  return (
    <View pointerEvents="none" style={StyleSheet.absoluteFill}>
      {OUTDOOR.map((plane, index) => (
        <IsoPlanePrimitive key={`out-${index}`} item={plane} projection={projection} />
      ))}

      {/* Floor slab with visible edges, diorama style. */}
      <IsoFace axis="x" from={{ x: 0, y: d }} length={w} z={-0.3} height={0.3} color="#3A4656" projection={projection} />
      <IsoFace axis="y" from={{ x: w, y: 0 }} length={d} z={-0.3} height={0.3} color="#2C3644" projection={projection} />
      <IsoPlane rect={{ x: 0, y: 0, width: w, depth: d }} color={CORRIDOR_COLOR} projection={projection} />

      {layout.departments.map(department => (
        <IsoPlane
          key={department.id}
          rect={department.area}
          color={department.floorColor}
          projection={projection}
        />
      ))}
      <IsoPlane rect={{ x: 4.47, y: 0.3, width: 0.06, depth: 9.5 }} color="#4A5868" projection={projection} />
      <IsoPlane rect={{ x: 5.0, y: 4.97, width: 4.8, depth: 0.06 }} color="#4A5868" projection={projection} />

      {planes.map((plane, index) => (
        <IsoPlanePrimitive key={`plane-${index}`} item={plane} projection={projection} />
      ))}

      <BackWalls width={w} depth={d} projection={projection} />

      {boxes.map((item, index) => (
        <IsoBox key={`box-${index}`} item={item} projection={projection} />
      ))}
    </View>
  );
});

function BackWalls({
  width,
  depth,
  projection
}: {
  width: number;
  depth: number;
  projection: Projection;
}) {
  const unit = projection.tileX;
  const wallPx = WALL_HEIGHT * projection.zUnit;
  return (
    <>
      {/* Wall along the back-right edge (y = 0). Local x runs with grid x. */}
      <IsoFace axis="x" from={{ x: 0, y: 0 }} length={width} z={0} height={WALL_HEIGHT} color="#1C2633" projection={projection}>
        <View style={[styles.banner, { left: 0.5 * unit, top: wallPx * 0.3, width: 3.7 * unit, height: wallPx * 0.3 }]}>
          <Text style={[styles.bannerText, { fontSize: Math.max(7, unit * 0.42) }]} numberOfLines={1}>
            FT RACING
          </Text>
        </View>
        <View style={[styles.window, { left: 5.3 * unit, top: wallPx * 0.3, width: 4.3 * unit, height: wallPx * 0.36 }]} />
        <View style={[styles.stripe, { top: wallPx * 0.74 }]} />
        <View style={styles.skirting} />
      </IsoFace>

      {/* Wall along the back-left edge (x = 0). Local x runs from y = depth back to y = 0. */}
      <IsoFace axis="y" from={{ x: 0, y: 0 }} length={depth} z={0} height={WALL_HEIGHT} color="#18212D" projection={projection}>
        <View style={[styles.simScreen, { left: (depth - 9.2) * unit, top: wallPx * 0.3, width: 2.0 * unit, height: wallPx * 0.38 }]} />
        <View style={[styles.timingWall, { left: (depth - 6.2) * unit, top: wallPx * 0.28, width: 2.6 * unit, height: wallPx * 0.42 }]}>
          {[0, 1, 2, 3].map(row => (
            <View key={row} style={[styles.timingRow, { width: `${86 - row * 14}%` }]} />
          ))}
        </View>
        <View style={[styles.whiteboard, { left: (depth - 2.9) * unit, top: wallPx * 0.3, width: 2.2 * unit, height: wallPx * 0.38 }]} />
        <View style={[styles.stripe, { top: wallPx * 0.74 }]} />
        <View style={styles.skirting} />
      </IsoFace>

      {/* Wall tops and exposed ends give the walls some thickness. */}
      <IsoPlane rect={{ x: -WALL_THICKNESS, y: -WALL_THICKNESS, width: width + WALL_THICKNESS, depth: WALL_THICKNESS }} z={WALL_HEIGHT} color="#4B5A6D" projection={projection} />
      <IsoPlane rect={{ x: -WALL_THICKNESS, y: 0, width: WALL_THICKNESS, depth }} z={WALL_HEIGHT} color="#4B5A6D" projection={projection} />
      <IsoFace axis="y" from={{ x: width, y: -WALL_THICKNESS }} length={WALL_THICKNESS} z={0} height={WALL_HEIGHT} color="#27313E" projection={projection} />
      <IsoFace axis="x" from={{ x: -WALL_THICKNESS, y: depth }} length={WALL_THICKNESS} z={0} height={WALL_HEIGHT} color="#323D4B" projection={projection} />
    </>
  );
}

const styles = StyleSheet.create({
  window: {
    position: 'absolute',
    backgroundColor: '#3E6C8F',
    borderWidth: 2,
    borderColor: '#5B7590'
  },
  banner: {
    position: 'absolute',
    backgroundColor: '#D92D44',
    borderRadius: 2,
    alignItems: 'center',
    justifyContent: 'center'
  },
  bannerText: {
    color: '#FFFFFF',
    fontWeight: '900',
    fontStyle: 'italic',
    letterSpacing: 0.4
  },
  stripe: {
    position: 'absolute',
    left: 0,
    right: 0,
    height: 3,
    backgroundColor: '#D92D44',
    opacity: 0.55
  },
  skirting: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    height: 4,
    backgroundColor: '#111821'
  },
  simScreen: {
    position: 'absolute',
    backgroundColor: '#2D6F96',
    borderWidth: 2,
    borderColor: '#0E141B'
  },
  timingWall: {
    position: 'absolute',
    backgroundColor: '#0E141B',
    borderWidth: 2,
    borderColor: '#2B3747',
    paddingHorizontal: 4,
    paddingVertical: 3,
    justifyContent: 'space-around'
  },
  timingRow: {
    height: 2,
    backgroundColor: '#63E6A8',
    opacity: 0.85
  },
  whiteboard: {
    position: 'absolute',
    backgroundColor: '#DDE4EC',
    borderWidth: 2,
    borderColor: '#8796A8'
  }
});
