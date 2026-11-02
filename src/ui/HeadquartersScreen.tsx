import type {CampaignDate} from '../simulation/campaignTime';
import React, { useCallback, useEffect, useState } from 'react';
import { Pressable, SafeAreaView, StyleSheet, Text, View, type LayoutChangeEvent } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { HEADQUARTERS_LAYOUT } from '../game/headquartersData';
import type { NavTab } from '../game/hudPlaceholders';
import { countWorkersByState } from '../simulation/headquarters';
import { BottomNav } from './components/BottomNav';
import { SelectionCard } from './components/SelectionCard';
import type { HeadquartersState } from '../simulation/headquarters';
import { HeadquartersScene, type Selection } from './scene/HeadquartersScene';
import { useTheme } from './theme';
import { DAY_MS, type HqDevelopment, type WeekTimeline } from '../simulation/developmentLoop';
import { HqDevelopmentCard } from './components/HqDevelopmentCard';
import { useWeekPlayback } from './hooks/useWeekPlayback';

export function HeadquartersScreen({ state, restartDay, onNavigate,activity={},hq=null,replay=null,onReplayDone=()=>{},onOpenDevelopment=()=>{},showCard=true }: { nextEvent?:{venue:string;detail:string};currentDate?:CampaignDate;state: HeadquartersState; restartDay: () => void; onNavigate: (tab:NavTab)=>void;
  activity?:Record<string,{project:string;stage:string}|undefined>;hq?:HqDevelopment|null;
  /** An already processed week to replay (presentation only), keyed per turn. */
  replay?:{timeline:WeekTimeline;key:string;weekOf?:string|null}|null;onReplayDone?:()=>void;onOpenDevelopment?:()=>void;showCard?:boolean }) {
  const {theme}=useTheme(),styles=makeStyles(theme);
  const [size, setSize] = useState<{ width: number; height: number } | null>(null);
  const [selection, setSelection] = useState<Selection>(null);
  const [toast, setToast] = useState<string | null>(null);

  useEffect(() => {
    if (!toast) return;
    const timer = setTimeout(() => setToast(null), 1600);
    return () => clearTimeout(timer);
  }, [toast]);

  const onLayout = useCallback((event: LayoutChangeEvent) => {
    const { width, height } = event.nativeEvent.layout;
    setSize(current =>
      current && current.width === width && current.height === height ? current : { width, height }
    );
  }, []);

  const onSelectTab = useCallback((tab: NavTab, available: boolean) => {
    if(available) onNavigate(tab);
    else setToast(`${tab} · Coming soon`);
  }, [onNavigate]);

  const counts = countWorkersByState(state);
  const playback = useWeekPlayback(replay?.timeline ?? null, replay?.key, onReplayDone);
  const [dock, setDock] = useState<{ x: number; y: number } | null>(null);
  const live = playback.playing && replay && playback.frame ? { frame: playback.frame, timeline: replay.timeline, speed: playback.speed, setSpeed: playback.setSpeed, skip: playback.skip, weekOf: replay.weekOf } : null;
  const sceneReplay = live && size ? {
    pieces: replay!.timeline.pieces.filter(p => p.day === live.frame.day),
    callouts: replay!.timeline.callouts.filter(c => c.day === live.frame.day || ((c.kind === 'STALL' || c.kind === 'SETBACK') && c.day < live.frame.day)),
    sink: dock ?? { x: size.width / 2, y: size.height - 80 }, runKey: `${replay!.key}:${live.frame.day}`, dayMs: DAY_MS[live.speed],
    tallies: departmentTallies(replay!.timeline, live.frame.state) } : null;

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar style="light" />

      <View style={styles.viewport} onLayout={onLayout}>
        {size ? (
          <HeadquartersScene
            layout={HEADQUARTERS_LAYOUT}
            state={state}
            width={size.width}
            height={size.height}
            selection={selection}
            onSelect={setSelection}
            activity={activity}
            replay={sceneReplay}
          />
        ) : null}

        <View style={styles.statusStrip} pointerEvents="box-none">
          <View style={styles.statusPill}>
            <View style={[styles.liveDot, counts.WORKING === state.workers.length && styles.liveDotOn]} />
            <Text style={styles.statusText}>
              {counts.WORKING}/{state.workers.length} AT WORK
              {counts.WALKING > 0 ? `  ·  ${counts.WALKING} ARRIVING` : ''}
            </Text>
          </View>
          <Pressable
            style={styles.restart}
            onPress={() => {
              setSelection(null);
              restartDay();
            }}
            accessibilityRole="button"
            accessibilityLabel="Restart the workday"
          >
            <Text style={styles.restartText}>↻ NEW DAY</Text>
          </Pressable>
        </View>

        {selection ? (
          <>
            <Pressable
              style={StyleSheet.absoluteFill}
              onPress={() => setSelection(null)}
              accessibilityLabel="Dismiss card"
            />
            <View style={styles.cardDock} pointerEvents="box-none">
              <SelectionCard selection={selection} state={state} layout={HEADQUARTERS_LAYOUT} />
            </View>
          </>
        ) : hq && (showCard || live) ? (
          <View style={[styles.cardDock, size && size.width > 500 ? { left: (size.width - 440) / 2, right: undefined, width: 440 } : null]} pointerEvents="box-none"
            onLayout={e => { const { x, y, width } = e.nativeEvent.layout; setDock(d => d && d.x === x + width / 2 && d.y === y ? d : { x: x + width / 2, y }); }}>
            <HqDevelopmentCard hq={hq} live={live} onOpen={onOpenDevelopment} />
          </View>
        ) : null}

        {toast ? (
          <View style={styles.toast} pointerEvents="none">
            <Text style={styles.toastText}>{toast}</Text>
          </View>
        ) : null}
      </View>

      <BottomNav active="HQ" onSelect={onSelectTab} />
    </SafeAreaView>
  );
}

/** Running output per department up to the shown state, e.g. "+7 AERO this week" (display only). */
function departmentTallies(timeline: WeekTimeline, state: number): Record<string, string> {
  const sums: Record<string, Record<string, number>> = {};
  for (const p of timeline.pieces) if (p.day < state) { sums[p.department] ??= {}; sums[p.department]![p.category] = (sums[p.department]![p.category] ?? 0) + p.points; }
  return Object.fromEntries(Object.entries(sums).map(([d, c]) => [d, Object.entries(c).map(([cat, v]) => `+${v} ${cat.toUpperCase()}`).join(' · ') + ' this week']));
}

const makeStyles = (theme:ReturnType<typeof useTheme>['theme']) => StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: theme.navBackground
  },
  viewport: {
    flex: 1,
    overflow: 'hidden',
    backgroundColor: theme.environment
  },
  statusStrip: {
    position: 'absolute',
    top: 10,
    left: 12,
    right: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  statusPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 7,
    backgroundColor: theme.overlay,
    borderColor: theme.panelBorder,
    borderWidth: 1,
    borderRadius: 14,
    paddingHorizontal: 10,
    paddingVertical: 5
  },
  liveDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: theme.warning
  },
  liveDotOn: {
    backgroundColor: theme.success
  },
  statusText: {
    color: theme.textPrimary,
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 0.6
  },
  restart: {
    backgroundColor: theme.overlay,
    borderColor: theme.panelBorder,
    borderWidth: 1,
    borderRadius: 14,
    paddingHorizontal: 10,
    paddingVertical: 5
  },
  restartText: {
    color: theme.textPrimary,
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 0.6
  },
  cardDock: {
    position: 'absolute',
    left: 14,
    right: 14,
    bottom: 14,
    maxWidth: 440,
    alignSelf: 'center'
  },
  toast: {
    position: 'absolute',
    top: 52,
    alignSelf: 'center',
    backgroundColor: theme.overlay,
    borderColor: theme.panelBorder,
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 8
  },
  toastText: {
    color: theme.text,
    fontSize: 13,
    fontWeight: '800',
    letterSpacing: 0.5
  }
});
