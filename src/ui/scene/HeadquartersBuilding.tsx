import React, { useMemo } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import type { HeadquartersLayout } from '../../game/models';
import type { Point3, Projection } from '../isometric';
import { IsoBox, IsoFace, IsoPlane, IsoPlanePrimitive } from './IsoShapes';
import { propArt } from './propArt';
import { ARCHITECTURE, DRESSING, EQUIPMENT, FLOOR_DETAILS } from './dressing';
import { sceneDepth } from './depth';
import { AmbientDetails } from './AmbientDetails';
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
  projection,
  reducedMotion
}: {
  reducedMotion: boolean;
  layout: HeadquartersLayout;
  projection: Projection;
}) {
  const { width: w, depth: d } = layout;
  const props = useMemo(() => [...layout.props, ...DRESSING], [layout]);
  const art = useMemo(() => props.map(prop => { const recipe = propArt(prop); return { prop, art: { ...recipe, boxes: sortBoxes(recipe.boxes) } }; }), [props]);
  const planes = useMemo(() => art.flatMap(item => item.art.planes), [art]);

  return (
    <>
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
      {/* Low-contrast contact shadows are static and never tick with workers. */}
      {props.filter(prop => prop.kind !== 'carBay').map(prop => (
        <IsoPlane key={`shadow-${prop.id}`} rect={{ ...prop.area, x: prop.area.x + 0.12, y: prop.area.y + 0.12 }} color="rgba(0,0,0,0.25)" projection={projection} />
      ))}
      {EQUIPMENT.map(item => <IsoPlane key={`shade-${item.id}`} rect={{ x: item.x - 0.2, y: item.y - 0.1, width: 0.65, depth: 0.6 }} color="rgba(0,0,0,0.18)" projection={projection} />)}
      {FLOOR_DETAILS.map((item, index) => <IsoPlanePrimitive key={`mark-${index}`} item={item} projection={projection} />)}


      <BackWalls width={w} depth={d} projection={projection} />

      <AmbientDetails projection={projection} reducedMotion={reducedMotion} />
    </View>
    {/* Props and workers are siblings in a shared floor-depth space. The prop recipes stay memoized. */}
    {art.map(({ prop, art: recipe }) => (
      <View key={prop.id} pointerEvents="none" style={[StyleSheet.absoluteFill, { zIndex: sceneDepth(prop.area.x + prop.area.width / 2, prop.area.y + prop.area.depth / 2) }]}>
        {recipe.boxes.map((item, index) => <IsoBox key={index} item={item} projection={projection} />)}
        {prop.kind === 'transporter' ? (
          <IsoFace axis="y" from={{ x: prop.area.x + prop.area.width + 0.025, y: prop.area.y + 0.35 }} length={1.6} z={0.98} height={0.35} color="#243347" projection={projection}>
            <Text numberOfLines={1} style={{ color: '#F0F4F8', fontWeight: '900', fontStyle: 'italic', textAlign: 'center', fontSize: Math.max(6, projection.tileX * 0.34) }}>FT RACING</Text>
          </IsoFace>
        ) : null}
      </View>
    ))}
    {EQUIPMENT.map(item => (
      <View key={item.id} pointerEvents="none" style={[StyleSheet.absoluteFill, { zIndex: sceneDepth(item.x, item.y) }]}>
        {sortBoxes(item.art.boxes).map((part, index) => <IsoBox key={index} item={part} projection={projection} />)}
      </View>
    ))}
    {ARCHITECTURE.map((item, index) => (
      <View key={`structure-${index}`} pointerEvents="none" style={[StyleSheet.absoluteFill, { zIndex: sceneDepth(item.x + item.width / 2, item.y + item.depth / 2) }]}>
        <IsoBox item={item} projection={projection} />
      </View>
    ))}
    </>
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
        <View style={[styles.banner, { left: 0.5 * unit, top: wallPx * 0.08, width: 3.7 * unit, height: wallPx * 0.24 }]}>
          <Text style={[styles.bannerText, { fontSize: Math.max(7, unit * 0.42) }]} numberOfLines={1}>
            FT RACING
          </Text>
        </View>
        <View style={[styles.window, { left: 5.3 * unit, top: wallPx * 0.3, width: 4.3 * unit, height: wallPx * 0.36 }]} />
        <View style={[styles.stripe, { top: wallPx * 0.74 }]} />
        <View style={styles.skirting} />
        {[0.12, 0.24, 0.36, 0.48, 0.60].map(top => (
          <View key={top} style={{ position: 'absolute', left: 5.1 * unit, width: 4.5 * unit, top: wallPx * top, height: 1, backgroundColor: '#4B6074', opacity: 0.5 }} />
        ))}
        <View style={{ position: 'absolute', left: 5.2 * unit, width: 4.4 * unit, top: wallPx * 0.09, height: 2, backgroundColor: '#C5E4E8' }} />
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
      <IsoPlane rect={{ x: -WALL_THICKNESS, y: -WALL_THICKNESS, width: width + WALL_THICKNESS, depth: WALL_THICKNESS }} z={WALL_HEIGHT} color="#6C8092" projection={projection} />
      <IsoPlane rect={{ x: -WALL_THICKNESS, y: 0, width: WALL_THICKNESS, depth }} z={WALL_HEIGHT} color="#6C8092" projection={projection} />
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
