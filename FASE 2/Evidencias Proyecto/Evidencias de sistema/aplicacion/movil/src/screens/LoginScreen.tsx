import React, { useState, useEffect } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import type { LoginScreenProps } from '../navigation/types';
import { loginRequest, getSession, fetchProfileRequest, clearSession } from '../services/auth';
import { isAuthError } from '../services/http';
import {
  Chispa,
  ErrorBox,
  IconMapPin,
  IconPaw,
  LinkRow,
  PrimaryButton,
  TextButton,
  TextField,
} from '../components';
import { colors, floatingShadow, radii, type as t } from '../theme';

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function LoginScreen({ navigation }: LoginScreenProps) {
  const insets = useSafeAreaInsets();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [checkingSession, setCheckingSession] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;
    async function restoreSession() {
      try {
        const stored = await getSession();
        if (stored?.token) {
          try {
            await fetchProfileRequest(stored.token);
          } catch (error) {
            if (isAuthError(error)) {
              throw error;
            }
          }
          if (mounted) {
            navigation.replace('Tabs');
            return;
          }
        }
      } catch {
        await clearSession();
      } finally {
        if (mounted) {
          setCheckingSession(false);
        }
      }
    }
    restoreSession();
    return () => {
      mounted = false;
    };
  }, [navigation]);

  const handleLogin = async () => {
    setErrorMessage(null);

    const trimmedEmail = email.trim().toLowerCase();

    if (!trimmedEmail || !password) {
      setErrorMessage('Escribe tu correo y tu contraseña.');
      return;
    }

    if (!EMAIL_REGEX.test(trimmedEmail)) {
      setErrorMessage('El correo no parece válido. Revisa que tenga @ y un dominio.');
      return;
    }

    setLoading(true);
    try {
      await loginRequest(trimmedEmail, password);
      navigation.replace('Tabs');
    } catch (error) {
      setErrorMessage(
        error instanceof Error ? error.message : 'No se pudo conectar con el servidor. Intenta de nuevo.'
      );
    } finally {
      setLoading(false);
    }
  };

  if (checkingSession) {
    return (
      <View style={styles.center}>
        <StatusBar style="dark" />
        <Chispa pose="cargando" size={160} />
        <Text style={[t.body, { color: colors.inkSoft, marginTop: 12 }]}>Revisando tu sesión…</Text>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      style={styles.screen}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <StatusBar style="light" />
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.column}>
          <View style={[styles.hero, { paddingTop: insets.top + 40 }]}>
            <View
              accessibilityElementsHidden
              importantForAccessibility="no-hide-descendants"
              style={styles.brandMark}
            >
              <IconPaw size={38} color={colors.ink} />
            </View>
            <Text accessibilityRole="header" style={[t.petName, { color: colors.onTeal }]}>
              MeinPets
            </Text>
            <Text style={[t.body, { color: colors.onTealSoft }]}>
              El carnet de salud de tu mascota, siempre a mano.
            </Text>
          </View>

          <View style={styles.body}>
            <View style={styles.floatCard}>
              {errorMessage ? <ErrorBox message={errorMessage} /> : null}

              <TextField
                label="Correo"
                placeholder="correo@ejemplo.cl"
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
                value={email}
                onChangeText={setEmail}
                editable={!loading}
              />
              <TextField
                label="Contraseña"
                placeholder="Tu contraseña"
                secureTextEntry
                value={password}
                onChangeText={setPassword}
                editable={!loading}
                returnKeyType="go"
                onSubmitEditing={handleLogin}
              />

              <PrimaryButton label="Iniciar sesión" onPress={handleLogin} loading={loading} />
            </View>

            <TextButton
              label="Crear cuenta nueva"
              onPress={() => navigation.navigate('Register')}
              disabled={loading}
              style={{ alignSelf: 'center' }}
            />

            <LinkRow
              icon={<IconMapPin size={20} color={colors.teal} />}
              label="Explorar mapa veterinario"
              onPress={() => navigation.navigate('Tabs', { screen: 'Map' })}
            />
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.ground,
  },
  center: {
    flex: 1,
    backgroundColor: colors.ground,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  scrollContent: {
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
    paddingHorizontal: 20,
    paddingBottom: 72,
    gap: 6,
  },
  brandMark: {
    width: 72,
    height: 72,
    marginBottom: 12,
    backgroundColor: colors.ball,
    alignItems: 'center',
    justifyContent: 'center',
    borderTopLeftRadius: 36,
    borderTopRightRadius: 32,
    borderBottomRightRadius: 36,
    borderBottomLeftRadius: 33,
  },
  body: {
    marginTop: -40,
    paddingHorizontal: 20,
    paddingBottom: 40,
    gap: 12,
  },
  floatCard: {
    backgroundColor: colors.surface,
    borderRadius: radii.card,
    padding: 20,
    gap: 16,
    ...floatingShadow,
  },
});
