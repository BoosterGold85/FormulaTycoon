import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { NAV_TABS, type NavTab } from '../../game/hudPlaceholders';
import { theme } from '../theme';
import {Icon} from '../design/Icon';

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
            style={[styles.item, isActive && styles.itemActive]}
            onPress={() => onSelect(tab.id, tab.available)}
            accessibilityRole="tab"
            accessibilityLabel={tab.label}
            accessibilityState={{ selected: isActive, disabled: !tab.available }}
          >
            <Icon name={tab.id} size={19} color={isActive?'#83BCF0':'#91A7BB'}/>
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
    paddingHorizontal: 8,
    gap: 4,
    paddingBottom: 6
  },
  item: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 7,
    minHeight: 54
  },
  itemActive: {
    backgroundColor: '#192333',
    borderRadius: 8,
    borderTopWidth: 2,
    borderTopColor: theme.accent
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
