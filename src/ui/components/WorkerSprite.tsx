import React, { useEffect, useMemo, useRef } from 'react';
import { Animated, Easing, Pressable, StyleSheet, View } from 'react-native';
import type { GridPoint, Uniform, WorkActivity } from '../../game/models';
import type { HeadquartersWorker } from '../../simulation/headquarters';
import { gridToScreen, type Projection } from '../isometric';

type Props = {
  worker: HeadquartersWorker;
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

const STATE_COLOR = { IDLE: '#8C9AAD', WALKING: '#F2B544', WORKING: '#63E6A8' } as const;

/** How each activity moves the body and arm during the working loop. */
const WORK_MOTION: Record<WorkActivity, { period: number; bob: number; arm: [string, string] }> = {
  TYPING: { period: 260, bob: 0, arm: ['-8deg', '8deg'] },
  SIMULATOR: { period: 420, bob: 0.6, arm: ['-12deg', '6deg'] },
  CAR_SERVICE: { period: 750, bob: 2.2, arm: ['-50deg', '-10deg'] },
  FABRICATING: { period: 380, bob: 0.8, arm: ['-70deg', '15deg'] },
  HAULING: { period: 900, bob: 1.6, arm: ['-90deg', '-30deg'] }
};

/**
 * Renders one worker. Movement replays the simulation's planned route with
 * native-driver animations, so React only re-renders on state changes.
 */
export const WorkerSprite = React.memo(function WorkerSprite({
  worker,
  activity,
  walkSpeed,
  projection,
  selected,
  onPress
}: Props) {
  const k = projection.tileX / 17;
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
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(cycle, { toValue: 1, duration: period / 2, easing: Easing.inOut(Easing.sin), useNativeDriver: true }),
        Animated.timing(cycle, { toValue: 0, duration: period / 2, easing: Easing.inOut(Easing.sin), useNativeDriver: true })
      ])
    );
    loop.start();
    return () => loop.stop();
  }, [cycle, period]);

  const animated = useMemo(() => {
    const walking = worker.state === 'WALKING';
    const bob = walking ? 1.2 * k : (motion?.bob ?? 0.4) * k;
    return {
      body: cycle.interpolate({ inputRange: [0, 1], outputRange: [0, walking ? -bob : bob] }),
      legA: cycle.interpolate({ inputRange: [0, 1], outputRange: [0, walking ? -2 * k : 0] }),
      legB: cycle.interpolate({ inputRange: [0, 1], outputRange: [walking ? -2 * k : 0, 0] }),
      arm: cycle.interpolate({
        inputRange: [0, 1],
        outputRange: walking ? ['-20deg', '20deg'] : motion?.arm ?? ['0deg', '0deg']
      })
    };
  }, [cycle, k, motion, worker.state]);

  const size = useMemo(() => spriteSize(k), [k]);
  const depth = worker.position.x + worker.position.y;

  return (
    <Animated.View
      style={[
        styles.anchor,
        {
          zIndex: worker.state === 'WALKING' ? 1000 : Math.round(depth * 10),
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
        <Animated.View
          style={[
            styles.figure,
            { width: size.box, height: size.height, transform: [{ translateY: animated.body }, { scaleX: facing }] }
          ]}
        >
          <View
            style={[
              styles.statusDot,
              {
                width: size.dot,
                height: size.dot,
                borderRadius: size.dot / 2,
                backgroundColor: STATE_COLOR[worker.state]
              }
            ]}
          />
          <View style={[styles.head, { width: size.head, height: size.head, borderRadius: size.head / 2 }]} />
          <View
            style={[
              styles.torso,
              {
                width: size.body,
                height: size.torso,
                borderRadius: size.body * 0.35,
                backgroundColor: UNIFORM[worker.uniform]
              }
            ]}
          >
            <Animated.View
              style={[
                styles.arm,
                {
                  width: size.arm,
                  height: size.torso * 0.85,
                  right: -size.arm * 0.6,
                  top: size.torso * 0.08,
                  borderRadius: size.arm / 2,
                  backgroundColor: UNIFORM[worker.uniform],
                  transform: [{ rotate: animated.arm }]
                }
              ]}
            />
          </View>
          <View style={[styles.legs, { gap: size.arm * 0.6 }]}>
            <Animated.View style={[styles.leg, { width: size.leg, height: size.legHeight, transform: [{ translateY: animated.legA }] }]} />
            <Animated.View style={[styles.leg, { width: size.leg, height: size.legHeight, transform: [{ translateY: animated.legB }] }]} />
          </View>
        </Animated.View>
      </Pressable>
    </Animated.View>
  );
});

function spriteSize(k: number) {
  const head = 7.5 * k;
  const torso = 9 * k;
  const legHeight = 5 * k;
  const dot = Math.max(4, 3.5 * k);
  return {
    head,
    torso,
    legHeight,
    dot,
    body: 9 * k,
    arm: 3 * k,
    leg: 3 * k,
    box: 18 * k,
    shadow: 2.5 * k,
    height: head + torso + legHeight + dot + 3 * k
  };
}

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
    backgroundColor: 'rgba(0,0,0,0.35)'
  },
  shadowSelected: {
    backgroundColor: 'rgba(242,181,68,0.55)',
    borderWidth: 1.5,
    borderColor: '#F2B544'
  },
  figure: {
    alignItems: 'center',
    justifyContent: 'flex-end'
  },
  statusDot: {
    marginBottom: 2,
    borderWidth: 1,
    borderColor: '#0B1119'
  },
  head: {
    backgroundColor: '#E9B996',
    borderWidth: 1,
    borderColor: '#7E5A46'
  },
  torso: {
    marginTop: 0.5,
    borderWidth: 1,
    borderColor: '#141B25'
  },
  arm: {
    position: 'absolute',
    transformOrigin: 'top',
    borderWidth: 0.5,
    borderColor: '#141B25'
  },
  legs: {
    flexDirection: 'row'
  },
  leg: {
    backgroundColor: '#1A222D',
    borderBottomLeftRadius: 1.5,
    borderBottomRightRadius: 1.5
  }
});
