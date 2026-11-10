import React, { useCallback, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { useFocusEffect } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import type { AccountScreenProps } from '../navigation/types';
import { resetTo } from '../navigation/reset';
import { AuthUser, clearSession, getSession } from '../services/auth';
import { ConfirmDialog, IconLogout } from '../components';
import { colors, radii, type as t } from '../theme';

const AVATAR = 64;

export default function AccountScreen({ navigation }: AccountScreenProps) {
  const insets = useSafeAreaInsets();
  const [user, setUser] = useState<AuthUser | null>(null);
  const [confirmOpen, setConfirmOpen] = useState(false);

  useFocusEffect(
    useCallback(() => {
      let active = true;
      getSession().then((session) => {
        if (!active) return;
        if (!session?.token) {
          resetTo(navigation, 'Login');
          return;
        }
        setUser(session.user);
      });
      return () => {
        active = false;
      };
    }, [navigation])
  );

  const logout = async () => {
    setConfirmOpen(false);
    await clearSession();
    resetTo(navigation, 'Login');
  };

  const name = (user?.nombre_completo ?? '').trim();
  const initial = (name || user?.email || '?').charAt(0).toUpperCase();

  return (
    <View style={styles.screen}>
      <StatusBar style="light" />
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <View style={styles.column}>
          <View style={[styles.hero, { paddingTop: insets.top + 8 }]}>
            <View style={styles.titleRow}>
              <Text accessibilityRole="header" style={[t.screenTitle, { color: colors.onTeal }]}>
                Cuenta
              </Text>
            </View>
            <View style={styles.identity}>
              <View accessibilityElementsHidden style={styles.avatar}>
                <Text style={[t.avatarInitial, { color: colors.ballInk }]}>{initial}</Text>
              </View>
              <View style={{ flex: 1 }}>
                <Text numberOfLines={1} style={[t.cardTitle, { color: colors.onTeal }]}>
                  {name || 'Tu cuenta'}
                </Text>
                <Text numberOfLines={1} style={[t.body, { color: colors.onTealSoft }]}>
                  {user?.email ?? ''}
                </Text>
              </View>
            </View>
          </View>

          <View style={styles.body}>
            <Pressable
              onPress={() => setConfirmOpen(true)}
              accessibilityRole="button"
              accessibilityLabel="Cerrar sesión"
              style={({ pressed }) => [styles.logout, pressed && { backgroundColor: colors.mintSelected }]}
            >
              <IconLogout size={22} color={colors.ink} />
              <Text style={[t.buttonLabel, { color: colors.ink }]}>Cerrar sesión</Text>
            </Pressable>
          </View>
        </View>
      </ScrollView>

      <ConfirmDialog
        visible={confirmOpen}
        title="¿Cerrar sesión?"
        message="Tus mascotas quedan guardadas. Tendrás que iniciar sesión otra vez para verlas."
        confirmLabel="Cerrar sesión"
        icon={<IconLogout size={26} color={colors.teal} />}
        onConfirm={logout}
        onCancel={() => setConfirmOpen(false)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.ground,
  },
  scroll: {
    flexGrow: 1,
    backgroundColor: colors.ground,
  },
  column: {
    width: '100%',
    maxWidth: 480,
    alignSelf: 'center',
  },
  hero: {
    backgroundColor: colors.teal,
    borderBottomLeftRadius: radii.hero,
    borderBottomRightRadius: radii.hero,
    paddingBottom: 20,
    paddingHorizontal: 20,
  },
  titleRow: {
    height: 44,
    justifyContent: 'center',
  },
  identity: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    marginTop: 16,
  },
  avatar: {
    width: AVATAR,
    height: AVATAR,
    borderRadius: AVATAR / 2,
    backgroundColor: colors.ball,
    alignItems: 'center',
    justifyContent: 'center',
  },
  body: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 24,
    gap: 4,
  },
  logout: {
    height: 56,
    borderRadius: radii.button,
    borderWidth: 1.5,
    borderColor: colors.line,
    backgroundColor: colors.surface,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
});
