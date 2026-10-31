import React from 'react';
import { Animated, StyleSheet, View } from 'react-native';
import type { WorkActivity } from '../../game/models';
import type { HeadquartersWorker } from '../../simulation/headquarters';
import type { workerAppearance } from './workerAppearance';
import { WorkerArm } from './WorkerArm';
import { workerPose } from './workerPoses';

const STATE_COLOR = { IDLE: '#8C9AAD', WALKING: '#F2B544', WORKING: '#63E6A8' } as const;
type Rotation = Animated.AnimatedInterpolation<string>;
type Motion = {
  body: Animated.AnimatedInterpolation<number>;
  legA: Animated.AnimatedInterpolation<number>;
  legB: Animated.AnimatedInterpolation<number>;
  carry: Animated.AnimatedInterpolation<number>;
  arm: Rotation; elbow: Rotation; farArm: Rotation; farElbow: Rotation; lean: Rotation;
};

/** Costume and articulated pose only. Feet retain the route-replay anchor supplied by WorkerSprite. */
export const WorkerFigure = React.memo(function WorkerFigure({ worker, activity, k, size, look, animated, facing, uniform }: {
  worker: HeadquartersWorker; activity: WorkActivity | null; k: number;
  size: ReturnType<typeof spriteSize>; look: ReturnType<typeof workerAppearance>;
  animated: Motion; facing: Animated.Value; uniform: string;
}) {
  const pose = workerPose(worker.state, activity, worker.role);
  const headTop = size.dot + 2 * k;
  const shirtTop = headTop + size.head + 0.7 * k;
  const left = (size.box - size.body) / 2;
  const legsTop = size.height - size.legHeight;
  const capColor = look.hiVis ? '#344F63' : '#B52C40';
  const armTool = pose.prop === 'WRENCH' || pose.prop === 'PART' ? pose.prop : 'NONE';
  return <Animated.View pointerEvents="none" testID={`worker-pose-${pose.name}`} style={[s.figure, {
    width: size.box, height: size.height,
    transform: [{ translateY: animated.body }, { scaleX: facing }, { rotate: animated.lean }]
  }]}>
    <View style={[s.dot, { left: (size.box - size.dot) / 2, width: size.dot, height: size.dot, borderRadius: size.dot / 2, backgroundColor: STATE_COLOR[worker.state] }]} />
    {/* Far arm sits behind the shirt; its elbow has its own counter-motion. */}
    {pose.prop !== 'BOX' ? <WorkerArm k={k} x={left + 0.3 * k} y={shirtTop + k} uniform={uniform} skin={look.skin} glove={look.gloves}
      shoulder={animated.farArm} elbow={animated.farElbow} tool="NONE" far /> : null}
    {[0, 1].map(index => <Animated.View key={index} style={[s.leg, {
      left: size.box / 2 + (index === 0 ? -3.5 * k : 0.9 * k), top: legsTop,
      width: size.leg, height: size.legHeight - 0.7 * k, borderRadius: 0.7 * k,
      transform: [{ translateY: index === 0 ? animated.legA : animated.legB }, { rotate: `${index === 0 ? pose.stance : -pose.stance}deg` }]
    }]}>
      <View style={{ position: 'absolute', left: 0.3 * k, top: k, width: 0.45 * k, height: '70%', backgroundColor: '#617985', opacity: 0.65 }} />
      <View style={[s.boot, { bottom: -0.7 * k, left: -0.3 * k, width: 3.7 * k, height: 1.9 * k, borderRadius: 0.7 * k }]} />
    </Animated.View>)}
    <View style={[s.neck, { left: size.box / 2 - 1.1 * k, top: shirtTop - 1.2 * k, width: 2.2 * k, height: 2 * k, backgroundColor: look.skin }]} />
    <View style={[s.shirt, { left, top: shirtTop, width: size.body, height: size.torso, borderTopLeftRadius: 2.3 * k, borderTopRightRadius: 2.3 * k, borderBottomLeftRadius: 1.2 * k, borderBottomRightRadius: 1.2 * k, backgroundColor: uniform }]}>
      <View style={{ position: 'absolute', top: 0, left: -0.9 * k, width: size.body + 1.8 * k, height: 2.8 * k, borderRadius: 1.5 * k, backgroundColor: uniform, borderTopWidth: 0.35 * k, borderTopColor: '#A6B9C2' }} />
      <View style={{ position: 'absolute', top: 0.6 * k, left: size.body / 2 - k, width: 2 * k, height: 1.5 * k, borderRadius: k, backgroundColor: '#243845' }} />
      {look.overalls ? <View style={{ position: 'absolute', top: 2.6 * k, left: 1.5 * k, right: 1.5 * k, bottom: 0, backgroundColor: look.manufacturing ? '#3B554C' : '#334552', borderTopLeftRadius: k, borderTopRightRadius: k }} /> : null}
      {look.hiVis ? <>
        <View style={{ position: 'absolute', left: k, top: k, bottom: 0, width: 1.3 * k, backgroundColor: '#E8E69B' }} />
        <View style={{ position: 'absolute', right: k, top: k, bottom: 0, width: 1.3 * k, backgroundColor: '#E8E69B' }} />
        <View style={{ position: 'absolute', left: 0, right: 0, bottom: 1.5 * k, height: 1.3 * k, backgroundColor: '#E8E69B' }} />
      </> : <View style={{ position: 'absolute', left: 1.3 * k, top: 3.6 * k, width: 2.6 * k, height: k, backgroundColor: '#E0E7E5', opacity: 0.85 }} />}
      <View style={{ position: 'absolute', left: 0.4 * k, right: 0.4 * k, bottom: 0, height: k, backgroundColor: '#253947' }} />
    </View>
    <View style={[s.head, { left: (size.box - size.head) / 2 + 0.25 * k, top: headTop, width: size.head, height: size.head, borderRadius: 2.2 * k, backgroundColor: look.skin }]}>
      <View style={{ position: 'absolute', top: -0.5 * k, left: -0.5 * k, right: -0.5 * k, height: (look.longHair ? 2.5 : 1.8) * k, borderTopLeftRadius: 2.4 * k, borderTopRightRadius: 2.4 * k, backgroundColor: look.cap ? capColor : look.hair }} />
      {look.cap ? <View style={{ position: 'absolute', right: -2 * k, top: 0.6 * k, width: 3 * k, height: 1.1 * k, backgroundColor: capColor, borderRadius: 0.5 * k }} /> : null}
      {look.longHair && !look.cap ? <View style={{ position: 'absolute', left: -1.3 * k, top: k, width: 1.7 * k, height: 4.5 * k, borderRadius: k, backgroundColor: look.hair }} /> : null}
      {look.headset ? <View style={{ position: 'absolute', left: -0.6 * k, top: 1.2 * k, width: 1.1 * k, height: 2.3 * k, borderRadius: 0.5 * k, backgroundColor: '#1A2C38', borderTopWidth: 0.7 * k, borderTopColor: '#B5C8CB' }}><View style={{ position: 'absolute', bottom: 0, right: -0.8 * k, width: 1.5 * k, height: 0.35 * k, backgroundColor: '#507080' }} /></View> : null}
    </View>
    {pose.prop === 'TABLET' ? <View style={[s.tablet, { left: left + size.body - 0.2 * k, top: shirtTop + 2.4 * k, width: 5.2 * k, height: 4.4 * k, borderRadius: 0.7 * k, transform: [{ rotate: '-12deg' }] }]}><View style={{ margin: 0.7 * k, flex: 1, backgroundColor: '#78B6C5' }} /></View> : null}
    {pose.prop === 'BOX' ? <Animated.View style={[s.box, { left: left + 2 * k, top: shirtTop + 3.1 * k, width: 9.2 * k, height: 6.1 * k, transform: [{ translateY: animated.carry }] }]}><View style={{ alignSelf: 'center', width: 1.3 * k, height: '100%', backgroundColor: '#E8CFA0' }} /></Animated.View> : null}
    {pose.prop === 'BOX' ? <WorkerArm k={k} x={left + 0.3 * k} y={shirtTop + k} uniform={uniform} skin={look.skin} glove={look.gloves}
      shoulder={animated.farArm} elbow={animated.farElbow} tool="NONE" far /> : null}
    <WorkerArm k={k} x={left + size.body - 0.2 * k} y={shirtTop + k} uniform={uniform} skin={look.skin} glove={look.gloves}
      shoulder={animated.arm} elbow={animated.elbow} tool={armTool} />
  </Animated.View>;
});

export function spriteSize(k: number) {
  const head = 5.8 * k, torso = 8.6 * k, legHeight = 7.5 * k;
  const dot = Math.max(4, 3.5 * k);
  return { head, torso, legHeight, dot, body: 9.8 * k, leg: 2.6 * k, box: 20 * k,
    shadow: 2.5 * k, height: dot + 2 * k + head + 0.7 * k + torso - 0.8 * k + legHeight };
}
const s = StyleSheet.create({
  figure: { transformOrigin: 'bottom' },
  dot: { position: 'absolute', top: 0, borderWidth: 1, borderColor: '#0B1119' },
  head: { position: 'absolute' },
  neck: { position: 'absolute' },
  shirt: { position: 'absolute', borderWidth: 0.6, borderColor: '#23333D' },
  leg: { position: 'absolute', backgroundColor: '#2A3E50', transformOrigin: 'top' },
  boot: { position: 'absolute', backgroundColor: '#14242E' },
  tablet: { position: 'absolute', backgroundColor: '#263D4C', borderWidth: 0.7, borderColor: '#B8CDD0' },
  box: { position: 'absolute', backgroundColor: '#BD9560', borderWidth: 0.7, borderTopColor: '#E9C997', borderColor: '#705B40' }
});
