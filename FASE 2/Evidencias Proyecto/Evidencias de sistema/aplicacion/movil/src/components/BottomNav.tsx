import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import type { BottomTabBarProps } from '@react-navigation/bottom-tabs';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors, fonts, radii, type as t } from '../theme';
import { IconCalendar, IconMapPin, IconPaw, IconUser } from './Icons';

const TABS: Record<string, { label: string; icon: typeof IconPaw }> = {
  Pets: { label: 'Mascotas', icon: IconPaw },
  Calendar: { label: 'Calendario', icon: IconCalendar },
  Map: { label: 'Mapa', icon: IconMapPin },
  Account: { label: 'Cuenta', icon: IconUser },
};

export function BottomNav({ state, navigation }: BottomTabBarProps) {
  const insets = useSafeAreaInsets();

  return (
    <View style={[styles.bar, { paddingBottom: Math.max(insets.bottom, 12) + 8 }]}>
      <View accessibilityRole="tablist" style={styles.row}>
        {state.routes.map((route, index) => {
          const tab = TABS[route.name];
          if (!tab) return null;
          const focused = state.index === index;
          const color = focused ? colors.teal : colors.inkSoft;
          const Icon = tab.icon;

          const open = () => {
            const event = navigation.emit({ type: 'tabPress', target: route.key, canPreventDefault: true });
            if (!focused && !event.defaultPrevented) {
              navigation.navigate(route.name);
            }
          };

          return (
            <Pressable
              key={route.key}
              onPress={open}
              accessibilityRole="tab"
              accessibilityLabel={tab.label}
              accessibilityState={{ selected: focused }}
              style={styles.item}
            >
              <View style={[styles.pill, focused && { backgroundColor: colors.mint }]}>
                <Icon size={22} color={color} strokeWidth={2.2} />
              </View>
              <Text style={[t.tiny, { fontFamily: fonts.textSemi, color }]}>{tab.label}</Text>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  bar: {
    backgroundColor: colors.surface,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: colors.divider,
    paddingTop: 6,
    paddingHorizontal: 12,
  },
  row: {
    width: '100%',
    maxWidth: 480,
    alignSelf: 'center',
    flexDirection: 'row',
  },
  item: {
    flex: 1,
    minHeight: 52,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
  },
  pill: {
    width: 56,
    height: 30,
    borderRadius: radii.navPill,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
