import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { useTheme } from '../theme';

export type InfoRow = { label: string; value: string; color?: string };

/** Small card used for worker and department previews. */
export function InfoCard({
  title,
  subtitle,
  rows,
  footnote
}: {
  title: string;
  subtitle: string;
  rows: InfoRow[];
  footnote?: string;
}) {
  const {theme}=useTheme(),styles=makeStyles(theme);
  return (
    <View style={styles.card}>
      <Text style={styles.title}>{title.toUpperCase()}</Text>
      <Text style={styles.subtitle}>{subtitle}</Text>
      <View style={styles.rows}>
        {rows.map(row => (
          <View key={row.label} style={styles.row}>
            <Text style={styles.label}>{row.label}</Text>
            <Text style={[styles.value, row.color ? { color: row.color } : null]}>{row.value}</Text>
          </View>
        ))}
      </View>
      {footnote ? <Text style={styles.footnote}>{footnote}</Text> : null}
    </View>
  );
}

const makeStyles = (theme:ReturnType<typeof useTheme>['theme']) => StyleSheet.create({
  card: {
    backgroundColor: theme.overlay,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: theme.border,
    paddingHorizontal: 18,
    paddingVertical: 14,
    shadowColor: theme.shadow,
    shadowOpacity: 0.15,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 6 },
    elevation: 8
  },
  title: {
    color: theme.text,
    fontSize: 19,
    fontWeight: '900',
    letterSpacing: 0.6
  },
  subtitle: {
    color: theme.textMuted,
    fontSize: 14,
    fontWeight: '700',
    marginTop: 2
  },
  rows: {
    marginTop: 10,
    gap: 6
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  label: {
    color: theme.textMuted,
    fontSize: 12,
    fontWeight: '800',
    letterSpacing: 0.8
  },
  value: {
    color: theme.text,
    fontSize: 15,
    fontWeight: '800'
  },
  footnote: {
    color: theme.textSecondary,
    fontSize: 11,
    marginTop: 10,
    fontStyle: 'italic'
  }
});
