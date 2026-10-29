import type {CampaignDate} from '../simulation/campaignTime';
import React, { useCallback, useEffect, useState } from 'react';
import { Pressable, SafeAreaView, StyleSheet, Text, View, type LayoutChangeEvent } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { HEADQUARTERS_LAYOUT } from '../game/headquartersData';
import type { NavTab } from '../game/hudPlaceholders';
import { countWorkersByState } from '../simulation/headquarters';
import { BottomNav } from './components/BottomNav';
import { GameHud } from './components/GameHud';
import { SelectionCard } from './components/SelectionCard';
import type { HeadquartersState } from '../simulation/headquarters';
import { HeadquartersScene, type Selection } from './scene/HeadquartersScene';
import { theme } from './theme';

export function HeadquartersScreen({ state, restartDay, onNavigate,currentDate }: { currentDate:CampaignDate;state: HeadquartersState; restartDay: () => void; onNavigate: (tab:NavTab)=>void }) {
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

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar style="light" />
      <GameHud currentDate={currentDate} />

      <View style={styles.viewport} onLayout={onLayout}>
        {size ? (
          <HeadquartersScene
            layout={HEADQUARTERS_LAYOUT}
            state={state}
            width={size.width}
            height={size.height}
            selection={selection}
            onSelect={setSelection}
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

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: theme.background
  },
  viewport: {
    flex: 1,
    overflow: 'hidden',
    backgroundColor: '#0E1621'
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
    backgroundColor: 'rgba(18,28,41,0.9)',
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
    color: '#C9D4E1',
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 0.6
  },
  restart: {
    backgroundColor: 'rgba(18,28,41,0.9)',
    borderColor: theme.panelBorder,
    borderWidth: 1,
    borderRadius: 14,
    paddingHorizontal: 10,
    paddingVertical: 5
  },
  restartText: {
    color: '#C9D4E1',
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 0.6
  },
  cardDock: {
    position: 'absolute',
    left: 14,
    right: 14,
    bottom: 14
  },
  toast: {
    position: 'absolute',
    top: 52,
    alignSelf: 'center',
    backgroundColor: 'rgba(18,28,41,0.95)',
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
