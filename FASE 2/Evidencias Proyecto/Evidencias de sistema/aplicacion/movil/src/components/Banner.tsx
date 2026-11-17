import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors, radii, status, type as t } from '../theme';
import { IconAlert, IconWifiOff } from './Icons';

export function Banner({
  message,
  actionLabel,
  onAction,
}: {
  message: string;
  actionLabel?: string;
  onAction?: () => void;
}) {
  return (
    <View accessibilityRole="alert" style={styles.inline}>
      <IconAlert size={22} color={status.vencido.fg} />
      <Text style={[t.bodySemi, { color: status.vencido.fg, flex: 1 }]}>{message}</Text>
      {actionLabel && onAction ? (
        <Pressable
          onPress={onAction}
          accessibilityRole="button"
          accessibilityLabel={actionLabel}
          style={({ pressed }) => [styles.action, pressed && { opacity: 0.6 }]}
        >
          <Text style={[t.bodySemi, { color: status.vencido.fg, textDecorationLine: 'underline' }]}>
            {actionLabel}
          </Text>
        </Pressable>
      ) : null}
    </View>
  );
}

export function OfflineBanner() {
  const insets = useSafeAreaInsets();
  return (
    <View
      accessibilityRole="alert"
      accessibilityLiveRegion="polite"
      style={[styles.offline, { paddingTop: insets.top + 10 }]}
    >
      <StatusBar style="light" />
      <View style={styles.offlineRow}>
        <IconWifiOff size={20} color={colors.onTeal} />
        <Text style={[t.label, { color: colors.onTeal, flex: 1 }]}>
          Sin conexión. Algunos datos pueden no estar al día.
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  inline: {
    minHeight: 48,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingVertical: 8,
    paddingLeft: 14,
    paddingRight: 12,
    borderRadius: radii.button,
    backgroundColor: status.vencido.bg,
  },
  action: {
    minHeight: 44,
    justifyContent: 'center',
  },
  offline: {
    backgroundColor: colors.ink,
    paddingBottom: 10,
    paddingHorizontal: 20,
  },
  offlineRow: {
    width: '100%',
    maxWidth: 480,
    alignSelf: 'center',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
});
