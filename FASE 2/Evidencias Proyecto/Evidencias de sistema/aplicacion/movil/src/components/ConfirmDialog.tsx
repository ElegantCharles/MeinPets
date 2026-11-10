import React from 'react';
import { Modal, Pressable, StyleSheet, Text, View } from 'react-native';
import { colors, radii, type as t } from '../theme';
import { PrimaryButton } from './Primitives';

export function ConfirmDialog({
  visible,
  title,
  message,
  confirmLabel,
  cancelLabel = 'Cancelar',
  destructive,
  icon,
  onConfirm,
  onCancel,
}: {
  visible: boolean;
  title: string;
  message: string;
  confirmLabel: string;
  cancelLabel?: string;
  destructive?: boolean;
  icon?: React.ReactNode;
  onConfirm: () => void;
  onCancel: () => void;
}) {
  const mainLabel = destructive ? cancelLabel : confirmLabel;
  const mainAction = destructive ? onCancel : onConfirm;
  const otherLabel = destructive ? confirmLabel : cancelLabel;
  const otherAction = destructive ? onConfirm : onCancel;

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onCancel} statusBarTranslucent>
      <View style={styles.root}>
        <Pressable
          style={StyleSheet.absoluteFill}
          onPress={onCancel}
          accessibilityRole="button"
          accessibilityLabel="Cerrar"
        />
        <View accessibilityRole="alert" style={styles.card}>
          {icon ? (
            <View accessibilityElementsHidden style={styles.icon}>
              {icon}
            </View>
          ) : null}
          <Text
            accessibilityRole="header"
            style={[t.screenTitle, { color: colors.ink, marginTop: icon ? 18 : 0 }]}
          >
            {title}
          </Text>
          <Text style={[t.body, { color: colors.inkLabel, marginTop: 8 }]}>{message}</Text>
          <View style={styles.actions}>
            <PrimaryButton label={mainLabel} onPress={mainAction} />
            <Pressable
              onPress={otherAction}
              accessibilityRole="button"
              accessibilityLabel={otherLabel}
              style={({ pressed }) => [styles.other, pressed && { opacity: 0.7 }]}
            >
              <Text style={[t.buttonLabel, { color: destructive ? colors.danger : colors.ink }]}>
                {otherLabel}
              </Text>
            </Pressable>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: colors.scrimStrong,
    justifyContent: 'center',
    paddingHorizontal: 24,
  },
  card: {
    width: '100%',
    maxWidth: 432,
    alignSelf: 'center',
    backgroundColor: colors.surface,
    borderRadius: radii.card,
    paddingTop: 28,
    paddingHorizontal: 24,
    paddingBottom: 24,
  },
  icon: {
    width: 56,
    height: 56,
    borderRadius: radii.tile,
    backgroundColor: colors.mint,
    alignItems: 'center',
    justifyContent: 'center',
  },
  actions: {
    gap: 10,
    marginTop: 24,
  },
  other: {
    height: 56,
    borderRadius: radii.button,
    borderWidth: 1.5,
    borderColor: colors.line,
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
