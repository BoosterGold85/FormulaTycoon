import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { HUD_PLACEHOLDERS } from '../../game/hudPlaceholders';
import { theme } from '../theme';

export function GameHud() {
  return (
    <View style={styles.wrap}>
      <Text style={styles.title}>
        FORMULA <Text style={styles.titleAccent}>TYCOON</Text>
      </Text>
      <View style={styles.row}>
        <HudChip label="TEAM" value={HUD_PLACEHOLDERS.teamName} />
        <HudChip label="DAY" value={HUD_PLACEHOLDERS.day} />
        <HudChip label="NEXT EVENT" value={HUD_PLACEHOLDERS.nextEvent} accent />
      </View>
    </View>
  );
}

function HudChip({ label, value, accent }: { label: string; value: string; accent?: boolean }) {
  return (
    <View style={styles.chip}>
      <Text style={styles.chipLabel}>{label}</Text>
      <Text style={[styles.chipValue, accent && styles.chipValueAccent]} numberOfLines={1}>
        {value}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    paddingHorizontal: 16,
    paddingTop: 6,
    paddingBottom: 10
  },
  title: {
    color: theme.text,
    fontSize: 24,
    fontWeight: '900',
    fontStyle: 'italic',
    letterSpacing: 1.4,
    textAlign: 'center'
  },
  titleAccent: {
    color: theme.accent
  },
  row: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 10
  },
  chip: {
    flex: 1,
    backgroundColor: theme.panel,
    borderColor: theme.panelBorder,
    borderWidth: 1,
    borderRadius: 8,
    borderTopColor: '#415267',
    paddingVertical: 9,
    paddingHorizontal: 10
  },
  chipLabel: {
    color: theme.textMuted,
    fontSize: 9,
    fontWeight: '800',
    letterSpacing: 1
  },
  chipValue: {
    color: theme.text,
    fontSize: 13,
    fontWeight: '800',
    marginTop: 2
  },
  chipValueAccent: {
    color: theme.warning
  }
});
