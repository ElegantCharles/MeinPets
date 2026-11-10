import React from 'react';
import {
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
  useWindowDimensions,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors, menuShadow, radii, type as t } from '../theme';
import { IconClose } from './Icons';

/**
 * Hoja inferior. Usa Modal de React Native, así funciona igual en móvil y en web.
 * `header` queda fijo arriba (por ejemplo, filtros); `children` hace scroll.
 */
export function BottomSheet({
  visible,
  onClose,
  title,
  header,
  children,
}: {
  visible: boolean;
  onClose: () => void;
  title?: string;
  header?: React.ReactNode;
  children: React.ReactNode;
}) {
  const insets = useSafeAreaInsets();
  const { height } = useWindowDimensions();

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
      statusBarTranslucent
    >
      <View style={styles.root}>
        <Pressable
          style={StyleSheet.absoluteFill}
          onPress={onClose}
          accessibilityRole="button"
          accessibilityLabel="Cerrar"
        />
        <View
          style={[
            styles.sheet,
            { maxHeight: height * 0.85, paddingBottom: Math.max(insets.bottom, 12) + 12 },
          ]}
        >
          <View style={styles.handle} />
          {title ? (
            <View style={styles.titleRow}>
              <Text accessibilityRole="header" style={[t.screenTitle, { flex: 1, color: colors.ink }]}>
                {title}
              </Text>
              <Pressable
                onPress={onClose}
                accessibilityRole="button"
                accessibilityLabel="Cerrar"
                style={styles.close}
              >
                <IconClose size={20} color={colors.ink} />
              </Pressable>
            </View>
          ) : null}
          {header ? <View style={styles.header}>{header}</View> : null}
          <ScrollView
            bounces={false}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
            contentContainerStyle={{ gap: 4 }}
          >
            {children}
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}

export type MenuItem = { label: string; onPress: () => void; danger?: boolean };

/** Menú "⋯" que aparece arriba a la derecha. */
export function PopoverMenu({
  visible,
  onClose,
  items,
  top = 60,
}: {
  visible: boolean;
  onClose: () => void;
  items: MenuItem[];
  top?: number;
}) {
  const insets = useSafeAreaInsets();
  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View style={styles.menuRoot}>
        <Pressable
          style={StyleSheet.absoluteFill}
          onPress={onClose}
          accessibilityRole="button"
          accessibilityLabel="Cerrar menú"
        />
        <View style={[styles.menu, { top: top + insets.top }]}>
          {items.map((item) => (
            <Pressable
              key={item.label}
              onPress={item.onPress}
              accessibilityRole="menuitem"
              accessibilityLabel={item.label}
              style={({ pressed }) => [styles.menuItem, pressed && { backgroundColor: colors.mintSelected }]}
            >
              <Text style={[t.rowTitle, { color: item.danger ? colors.danger : colors.ink }]}>
                {item.label}
              </Text>
            </Pressable>
          ))}
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: colors.scrim,
    justifyContent: 'flex-end',
  },
  sheet: {
    width: '100%',
    maxWidth: 480,
    alignSelf: 'center',
    backgroundColor: colors.surface,
    borderTopLeftRadius: radii.card,
    borderTopRightRadius: radii.card,
    paddingTop: 10,
    paddingHorizontal: 16,
    gap: 12,
  },
  handle: {
    alignSelf: 'center',
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: colors.line,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 4,
  },
  close: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.ground,
    alignItems: 'center',
    justifyContent: 'center',
  },
  header: {
    paddingHorizontal: 4,
  },
  menuRoot: {
    flex: 1,
    backgroundColor: colors.scrimSoft,
  },
  menu: {
    position: 'absolute',
    right: 12,
    width: 220,
    backgroundColor: colors.surface,
    borderRadius: radii.row,
    padding: 6,
    ...menuShadow,
  },
  menuItem: {
    height: 48,
    borderRadius: radii.item,
    paddingHorizontal: 14,
    justifyContent: 'center',
  },
});
