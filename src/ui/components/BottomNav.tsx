import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { NAV_TABS, type NavTab } from '../../game/hudPlaceholders';
import { theme } from '../theme';

type Props = {
  active: NavTab;
  onSelect: (tab: NavTab, available: boolean) => void;
};

export function BottomNav({ active, onSelect }: Props) {
  return (
    <View style={styles.nav}>
      {NAV_TABS.map(tab => {
        const isActive = tab.id === active;
        return (
          <Pressable
            key={tab.id}
            style={styles.item}
            onPress={() => onSelect(tab.id, tab.available)}
            accessibilityRole="tab"
            accessibilityState={{ selected: isActive, disabled: !tab.available }}
          >
            <View style={[styles.icon, isActive && styles.iconActive, !tab.available && styles.iconLocked]} />
            <Text style={[styles.label, isActive && styles.labelActive, !tab.available && styles.labelLocked]}>
              {tab.label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  nav: {
    flexDirection: 'row',
    borderTopWidth: 1,
    borderTopColor: '#1C293A',
    backgroundColor: theme.background,
    paddingTop: 8,
    paddingBottom: 6
  },
  item: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 4
  },
  icon: {
    width: 22,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#3A4A5E',
    marginBottom: 6
  },
  iconActive: {
    backgroundColor: theme.accent
  },
  iconLocked: {
    backgroundColor: '#243142'
  },
  label: {
    color: theme.textMuted,
    fontSize: 11,
    fontWeight: '900',
    letterSpacing: 0.6
  },
  labelActive: {
    color: theme.text
  },
  labelLocked: {
    color: '#4E5E72'
  }
});
