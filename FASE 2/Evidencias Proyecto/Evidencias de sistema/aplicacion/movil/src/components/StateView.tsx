import React from 'react';
import { StyleProp, StyleSheet, Text, View, ViewStyle } from 'react-native';
import { ApiError, isConnectionError } from '../services/http';
import { colors, radii, type as t } from '../theme';
import { Chispa, ChispaPose } from './Chispa';
import { IconRefresh } from './Icons';
import { GhostButton, PrimaryButton } from './Primitives';

export function StateView({
  pose,
  title,
  message,
  actionLabel,
  onAction,
  actionIcon,
  secondaryLabel,
  onSecondary,
  size = 180,
  alert,
  style,
}: {
  pose: ChispaPose;
  title: string;
  message: string;
  alert?: boolean;
  actionLabel?: string;
  onAction?: () => void;
  actionIcon?: React.ReactNode;
  secondaryLabel?: string;
  onSecondary?: () => void;
  size?: number;
  style?: StyleProp<ViewStyle>;
}) {
  return (
    <View style={[styles.wrap, style]}>
      <Chispa pose={pose} size={size} />
      <Text accessibilityRole="header" style={[t.screenTitle, styles.title]}>
        {title}
      </Text>
      <Text accessibilityRole={alert ? 'alert' : undefined} style={[t.body, styles.message]}>
        {message}
      </Text>
      {actionLabel && onAction ? (
        <PrimaryButton label={actionLabel} onPress={onAction} icon={actionIcon} style={styles.action} />
      ) : null}
      {secondaryLabel && onSecondary ? (
        <GhostButton
          label={secondaryLabel}
          onPress={onSecondary}
          style={[styles.action, styles.secondary]}
        />
      ) : null}
    </View>
  );
}

export function ErrorState({
  error,
  title,
  onRetry,
  secondaryLabel,
  onSecondary,
  style,
}: {
  error: unknown;
  title: string;
  onRetry: () => void;
  secondaryLabel?: string;
  onSecondary?: () => void;
  style?: StyleProp<ViewStyle>;
}) {
  const offline = isConnectionError(error);
  const clientMessage =
    error instanceof ApiError && error.status !== null && error.status >= 400 && error.status < 500
      ? error.message
      : null;

  return (
    <StateView
      pose={offline ? 'sinConexion' : 'tranquila'}
      alert
      title={offline ? 'Sin conexión' : title}
      message={
        offline
          ? 'Revisa tu internet e inténtalo de nuevo. Tus datos siguen guardados.'
          : clientMessage ??
            'Algo falló de nuestro lado. Tus datos están guardados. Inténtalo otra vez en un momento.'
      }
      actionLabel="Reintentar"
      onAction={onRetry}
      actionIcon={<IconRefresh color={colors.onTeal} />}
      secondaryLabel={secondaryLabel}
      onSecondary={onSecondary}
      style={style}
    />
  );
}

const styles = StyleSheet.create({
  wrap: {
    alignItems: 'center',
    paddingHorizontal: 12,
  },
  title: {
    color: colors.ink,
    marginTop: 16,
    textAlign: 'center',
  },
  message: {
    color: colors.inkLabel,
    marginTop: 8,
    maxWidth: 310,
    textAlign: 'center',
  },
  action: {
    alignSelf: 'stretch',
    marginTop: 24,
  },
  secondary: {
    marginTop: 10,
    height: 56,
    borderRadius: radii.button,
  },
});
