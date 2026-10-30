import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Animated, Easing, Pressable, StyleSheet, View } from 'react-native';
import type { GridPoint, Uniform, WorkActivity } from '../../game/models';
import type { HeadquartersWorker } from '../../simulation/headquarters';
import { sceneDepth } from '../scene/depth';
import { WorkerFigure, spriteSize } from './WorkerFigure';
import { workerAppearance } from './workerAppearance';
import { workerPose } from './workerPoses';
import { gridToScreen, type Projection } from '../isometric';

type Props = {
  worker: HeadquartersWorker;
  reducedMotion: boolean;
  activity: WorkActivity | null;
  walkSpeed: number;
  projection: Projection;
  selected: boolean;
  onPress: (workerId: string) => void;
};

const UNIFORM: Record<Uniform, string> = {
  navy: '#2F5E9E',
  red: '#D93A4C',
  white: '#E9EEF5',
  orange: '#F08A2C'
};

/** Existing activity cadence and body motion; arm artwork uses workerPoses at the same cadence. */
const WORK_MOTION: Record<WorkActivity, { period: number; bob: number }> = {
  TYPING: { period: 260, bob: 0 },
  SIMULATOR: { period: 420, bob: 0.6 },
  CAR_SERVICE: { period: 750, bob: 2.2 },
  FABRICATING: { period: 380, bob: 0.8 },
  HAULING: { period: 900, bob: 1.6 }
};

/**
 * Renders one worker. Movement replays the simulation's planned route with
 * native-driver animations, so React only re-renders on state changes.
 */
export const WorkerSprite = React.memo(function WorkerSprite({
  worker,
  reducedMotion,
  activity,
  walkSpeed,
  projection,
  selected,
  onPress
}: Props) {
  const k = projection.tileX / 17;
  const look = useMemo(() => workerAppearance(worker.id, worker.role), [worker.id, worker.role]);
  const [depthBand, setDepthBand] = useState(() => sceneDepth(worker.position.x, worker.position.y));
  const toScreen = (point: GridPoint) => gridToScreen(point, projection);

  const position = useRef(new Animated.ValueXY(toScreen(worker.position))).current;
  const facing = useRef(new Animated.Value(worker.facing === 'right' ? 1 : -1)).current;
  const cycle = useRef(new Animated.Value(0)).current;
  const walkRef = useRef<{
    routeId: number;
    projection: Projection;
    animation: Animated.CompositeAnimation;
  } | null>(null);
  const latest = useRef(worker);
  latest.current = worker;

  const snapToWorker = () => {
    position.setValue(toScreen(latest.current.position));
    facing.setValue(latest.current.facing === 'right' ? 1 : -1);
  };

  // Follow the authoritative route whenever a new one starts walking.
  useEffect(() => {
    if (worker.state !== 'WALKING') return;
    const current = walkRef.current;
    if (current && current.routeId === worker.routeId && current.projection === projection) return;
    current?.animation.stop();

    const segments: Animated.CompositeAnimation[] = [];
    let previous = worker.position;
    position.setValue(toScreen(previous));
    for (const step of worker.route) {
      const length = Math.hypot(step.point.x - previous.x, step.point.y - previous.y);
      const screenDx = step.point.x - step.point.y - (previous.x - previous.y);
      const animations: Animated.CompositeAnimation[] = [
        Animated.timing(position, {
          toValue: toScreen(step.point),
          duration: (length / walkSpeed) * 1000,
          easing: Easing.linear,
          useNativeDriver: true
        })
      ];
      if (Math.abs(screenDx) > 1e-6) {
        animations.push(
          Animated.timing(facing, {
            toValue: screenDx > 0 ? 1 : -1,
            duration: 0,
            useNativeDriver: true
          })
        );
      }
      segments.push(Animated.parallel(animations));
      previous = step.point;
    }

    const animation = Animated.sequence(segments);
    const entry = { routeId: worker.routeId, projection, animation };
    walkRef.current = entry;
    animation.start(({ finished }) => {
      if (walkRef.current !== entry) return;
      walkRef.current = null;
      if (finished && latest.current.state !== 'WALKING') snapToWorker();
    });
    // A route is immutable for its routeId, so these are the only triggers.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [worker.routeId, worker.state, projection]);

  useEffect(() => () => walkRef.current?.animation.stop(), []);

  // Translation stays animated; only this sprite re-renders when crossing a quarter-tile depth band.
  useEffect(() => {
    let band = sceneDepth(latest.current.position.x, latest.current.position.y);
    const listener = position.y.addListener(({ value }) => {
      const next = sceneDepth((value - projection.originY) / projection.tileY, 0);
      if (next !== band) {
        band = next;
        setDepthBand(next);
      }
    });
    return () => position.y.removeListener(listener);
  }, [position, projection]);

  // Standing still: make sure the sprite matches the simulation exactly.
  useEffect(() => {
    if (worker.state === 'WALKING' || walkRef.current) return;
    snapToWorker();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [worker.state, worker.position.x, worker.position.y, worker.facing, projection]);

  const motion = worker.state === 'WORKING' && activity ? WORK_MOTION[activity] : null;
  const period = worker.state === 'WALKING' ? 320 : motion?.period ?? 1400;

  useEffect(() => {
    cycle.setValue(0);
    if (reducedMotion) return;
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(cycle, { toValue: 1, duration: period / 2, easing: Easing.inOut(Easing.sin), useNativeDriver: true, isInteraction: false }),
        Animated.timing(cycle, { toValue: 0, duration: period / 2, easing: Easing.inOut(Easing.sin), useNativeDriver: true })
      ])
    );
    loop.start();
    return () => loop.stop();
  }, [cycle, period, reducedMotion]);

  const animated = useMemo(() => {
    const walking = worker.state === 'WALKING';
    const pose = workerPose(worker.state, activity, worker.role);
    const angle = (range: [number, number]) => cycle.interpolate({ inputRange: [0, 1], outputRange: range.map(value => `${value}deg`) });
    const bob = walking ? 1.2 * k : (motion?.bob ?? 0.4) * k;
    return {
      body: cycle.interpolate({ inputRange: [0, 1], outputRange: [0, walking ? -bob : bob] }),
      legA: cycle.interpolate({ inputRange: [0, 1], outputRange: [0, walking ? -2 * k : 0] }),
      legB: cycle.interpolate({ inputRange: [0, 1], outputRange: [walking ? -2 * k : 0, 0] }),
      lean: cycle.interpolate({ inputRange: [0, 0.65, 1], outputRange: walking ? ['0deg', '0deg', '0deg'] : activity === 'CAR_SERVICE' ? ['0deg', '12deg', '4deg'] : activity === 'FABRICATING' ? ['2deg', '8deg', '2deg'] : ['0deg', '0deg', '0deg'] }),
      carry: cycle.interpolate({ inputRange: [0, 1], outputRange: [0, activity === 'HAULING' && !walking ? -2 * k : 0] }),
      arm: angle(pose.shoulder), elbow: angle(pose.elbow),
      farArm: angle(pose.farShoulder), farElbow: angle(pose.farElbow)
    };
  }, [cycle, k, motion, worker.state, worker.role, activity]);

  const size = useMemo(() => spriteSize(k), [k]);

  return (
    <Animated.View
      style={[
        styles.anchor,
        {
          zIndex: depthBand,
          left: -size.box / 2,
          top: -size.height,
          width: size.box,
          height: size.height + size.shadow,
          transform: position.getTranslateTransform()
        }
      ]}
    >
      <Pressable
        onPress={() => onPress(worker.id)}
        hitSlop={10}
        accessibilityRole="button"
        accessibilityLabel={`${worker.name}, ${worker.role}, ${worker.state.toLowerCase()}`}
        style={styles.fill}
      >
        <View
          style={[
            styles.shadow,
            selected && styles.shadowSelected,
            { width: size.body * 1.7, height: size.shadow * 2, bottom: 0, borderRadius: size.body }
          ]}
        />
        <View pointerEvents="none" style={[styles.shadow, {
          width: size.body * 1.05, height: size.shadow, bottom: size.shadow * 0.6,
          borderRadius: size.body, backgroundColor: 'rgba(6,14,22,0.48)'
        }]} />
        <WorkerFigure worker={worker} activity={activity} k={k} size={size} look={look} animated={animated} facing={facing} uniform={UNIFORM[worker.uniform]} />
      </Pressable>
    </Animated.View>
  );
});


const styles = StyleSheet.create({
  anchor: {
    position: 'absolute',
    alignItems: 'center'
  },
  fill: {
    flex: 1,
    alignItems: 'center'
  },
  shadow: {
    position: 'absolute',
    backgroundColor: 'rgba(0,0,0,0.25)'
  },
  shadowSelected: {
    backgroundColor: 'rgba(242,181,68,0.55)',
    borderWidth: 1.5,
    borderColor: '#F2B544'
  },
});
