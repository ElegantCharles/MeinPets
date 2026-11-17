import React from 'react';
import { StyleSheet, View } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import type { SessionExpiredScreenProps } from '../navigation/types';
import { resetTo } from '../navigation/reset';
import { StateView } from '../components';
import { colors } from '../theme';

export default function SessionExpiredScreen({ navigation }: SessionExpiredScreenProps) {
  const insets = useSafeAreaInsets();
  return (
    <View style={[styles.screen, { paddingTop: insets.top, paddingBottom: Math.max(insets.bottom, 12) + 16 }]}>
      <StatusBar style="dark" />
      <View style={styles.column}>
        <StateView
          pose="tranquila"
          title="Tu sesión terminó"
          message="Por seguridad, inicia sesión otra vez para ver tus mascotas."
          actionLabel="Iniciar sesión"
          onAction={() => resetTo(navigation, 'Login')}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.ground,
    justifyContent: 'center',
    paddingHorizontal: 20,
  },
  column: {
    width: '100%',
    maxWidth: 480,
    alignSelf: 'center',
  },
});
