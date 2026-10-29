import React from 'react';
import { Animated, StyleSheet, View } from 'react-native';
import type { WorkActivity } from '../../game/models';
import type { HeadquartersWorker } from '../../simulation/headquarters';
import type { workerAppearance } from './workerAppearance';

const STATE_COLOR = { IDLE: '#8C9AAD', WALKING: '#F2B544', WORKING: '#63E6A8' } as const;

type Motion = {
  body: Animated.AnimatedInterpolation<number>;
  legA: Animated.AnimatedInterpolation<number>;
  legB: Animated.AnimatedInterpolation<number>;
  carry: Animated.AnimatedInterpolation<number>;
  arm: Animated.AnimatedInterpolation<string>;
  lean: Animated.AnimatedInterpolation<string>;
};

/** Memoized costume and pose: depth changes only need to move its outer anchor. */
export const WorkerFigure = React.memo(function WorkerFigure({ worker, activity, k, size, look, animated, facing, uniform }: {
  worker: HeadquartersWorker;
  activity: WorkActivity | null;
  k: number;
  size: ReturnType<typeof spriteSize>;
  look: ReturnType<typeof workerAppearance>;
  animated: Motion;
  facing: Animated.Value;
  uniform: string;
}) {
  return (
        <Animated.View
          style={[
            styles.figure,
            { width: size.box, height: size.height, transform: [{ translateY: animated.body }, { scaleX: facing }, { rotate: animated.lean }] }
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
          <View style={[styles.head, { width: size.head, height: size.head, borderRadius: size.head / 2, backgroundColor: look.skin }]}>
            <View style={{ position: 'absolute', top: -0.5 * k, left: -0.5 * k, right: -0.5 * k, height: (look.longHair ? 4.5 : 2.8) * k, borderTopLeftRadius: 4 * k, borderTopRightRadius: 4 * k, backgroundColor: look.cap ? '#B52C40' : look.hair }} />
            {look.longHair && !look.cap ? <View style={{ position: 'absolute', left: -2 * k, top: 2 * k, width: 2.5 * k, height: 5 * k, borderRadius: 2 * k, backgroundColor: look.hair }} /> : null}
            {look.headset ? <View style={{ position: 'absolute', right: -1 * k, top: 1.5 * k, width: 2 * k, height: 4 * k, borderRadius: k, backgroundColor: '#15232F', borderBottomWidth: k, borderBottomColor: '#9EAFB9' }} /> : null}
          </View>
          <View
            style={[
              styles.torso,
              {
                width: size.body,
                height: size.torso,
                borderRadius: size.body * 0.35,
                backgroundColor: uniform
              }
            ]}
          >
            <View style={{ position: 'absolute', top: size.torso * 0.23, left: 0, right: 0, height: look.hiVis ? 2.5 * k : k, backgroundColor: look.hiVis ? '#E0D773' : '#EEF2ED', opacity: 0.9 }} />
            {look.overalls ? <View style={{ position: 'absolute', bottom: 0, left: 2 * k, width: 3 * k, height: size.torso * 0.6, backgroundColor: '#253343' }} /> : null}
            <Animated.View
              style={[
                styles.arm,
                {
                  width: size.arm,
                  height: size.torso * 0.85,
                  right: -size.arm * 0.6,
                  top: size.torso * 0.08,
                  borderRadius: size.arm / 2,
                  backgroundColor: uniform,
                  transform: [{ rotate: animated.arm }]
                }
              ]}
            >
              {worker.state === 'WORKING' && (activity === 'CAR_SERVICE' || activity === 'FABRICATING') ? <View style={{ position: 'absolute', bottom: -2 * k, left: k, width: 1.5 * k, height: 5 * k, backgroundColor: '#C2CCD5', borderTopWidth: k, borderTopColor: '#E2E8ED' }} /> : null}
            </Animated.View>
          </View>
          {worker.state === 'WORKING' && activity === 'HAULING' ? <Animated.View style={{ position: 'absolute', bottom: size.legHeight, right: 0, width: 8 * k, height: 6 * k, backgroundColor: '#C09A68', borderWidth: 0.5, borderColor: '#836747', transform: [{ translateY: animated.carry }] }}><View style={{ alignSelf: 'center', width: k, height: '100%', backgroundColor: '#DEC7A1' }} /></Animated.View> : null}
          <View style={[styles.legs, { gap: size.arm * 0.6 }]}>
            <Animated.View style={[styles.leg, { width: size.leg, height: size.legHeight, transform: [{ translateY: animated.legA }] }]} />
            <Animated.View style={[styles.leg, { width: size.leg, height: size.legHeight, transform: [{ translateY: animated.legB }] }]} />
          </View>
        </Animated.View>
  );
});

export function spriteSize(k: number) {
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
