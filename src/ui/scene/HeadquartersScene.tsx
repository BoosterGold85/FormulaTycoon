import React, { useCallback, useMemo, useRef } from 'react';
import { Pressable, StyleSheet, View, type GestureResponderEvent } from 'react-native';
import type { DepartmentDefinition, HeadquartersLayout } from '../../game/models';
import { departmentAtPoint, getStation, type HeadquartersState } from '../../simulation/headquarters';
import { DepartmentSign } from '../components/DepartmentSign';
import { WorkerSprite } from '../components/WorkerSprite';
import { useReducedMotion } from '../hooks/useReducedMotion';
import { fitProjection, screenToGrid } from '../isometric';
import { HeadquartersBuilding, sceneExtents } from './HeadquartersBuilding';

const TOP_INSET = 40;

export type Selection =
  | { kind: 'worker'; id: string }
  | { kind: 'department'; id: DepartmentDefinition['id'] }
  | null;

type Props = {
  layout: HeadquartersLayout;
  state: HeadquartersState;
  width: number;
  height: number;
  selection: Selection;
  onSelect: (selection: Selection) => void;
};

/** The isometric headquarters viewport: static building plus live workers. */
export function HeadquartersScene({ layout, state, width, height, selection, onSelect }: Props) {
  const reducedMotion = useReducedMotion();
  const projection = useMemo(() => {
    // Keep clear of the status strip and leave spare room below for info cards.
    const fitted = fitProjection(sceneExtents(layout), width, height - TOP_INSET, 10, 0.3);
    return { ...fitted, originY: fitted.originY + TOP_INSET };
  }, [layout, width, height]);

  const rootRef = useRef<View>(null);
  const windowOffset = useRef({ x: 0, y: 0 });
  const measure = useCallback(() => {
    rootRef.current?.measureInWindow((x, y) => {
      windowOffset.current = { x, y };
    });
  }, []);

  const onFloorPress = useCallback(
    (event: GestureResponderEvent) => {
      const { locationX, locationY, pageX, pageY } = event.nativeEvent;
      // Touch events carry locationX/Y; some web click events only carry page coordinates.
      const point = Number.isFinite(locationX)
        ? { x: locationX, y: locationY }
        : { x: pageX - windowOffset.current.x, y: pageY - windowOffset.current.y };
      const department = departmentAtPoint(layout, screenToGrid(point, projection));
      onSelect(department ? { kind: 'department', id: department.id } : null);
    },
    [layout, projection, onSelect]
  );
  const onWorkerPress = useCallback((id: string) => onSelect({ kind: 'worker', id }), [onSelect]);
  const onDepartmentPress = useCallback(
    (department: DepartmentDefinition) => onSelect({ kind: 'department', id: department.id }),
    [onSelect]
  );

  return (
    <View ref={rootRef} onLayout={measure} style={StyleSheet.absoluteFill}>
      <HeadquartersBuilding layout={layout} projection={projection} reducedMotion={reducedMotion} />
      <Pressable style={[StyleSheet.absoluteFill, { zIndex: 1 }]} onPress={onFloorPress} accessible={false} />
      <View style={[StyleSheet.absoluteFill, { zIndex: 2000 }]} pointerEvents="box-none">
        {layout.departments.map(department => (
          <DepartmentSign
            key={department.id}
            department={department}
            projection={projection}
            selected={selection?.kind === 'department' && selection.id === department.id}
            onPress={onDepartmentPress}
          />
        ))}
      </View>
      {state.workers.map(worker => (
          <WorkerSprite
            key={worker.id}
            worker={worker}
            reducedMotion={reducedMotion}
            activity={worker.assignment ? getStation(layout, worker.assignment.stationId).activity : null}
            walkSpeed={layout.walkSpeed}
            projection={projection}
            selected={selection?.kind === 'worker' && selection.id === worker.id}
            onPress={onWorkerPress}
          />
        ))}
    </View>
  );
}
