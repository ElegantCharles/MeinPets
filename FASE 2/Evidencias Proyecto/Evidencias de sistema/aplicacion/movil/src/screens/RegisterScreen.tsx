import React, { useState } from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, StyleSheet, View } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import type { RegisterScreenProps } from '../navigation/types';
import { registerRequest, loginRequest } from '../services/auth';
import { ErrorBox, PrimaryButton, TextButton, TextField, TopBar } from '../components';
import { colors } from '../theme';

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function RegisterScreen({ navigation }: RegisterScreenProps) {
  const insets = useSafeAreaInsets();
  const [nombreCompleto, setNombreCompleto] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleRegister = async () => {
    setErrorMessage(null);

    const trimmedName = nombreCompleto.trim();
    const trimmedEmail = email.trim().toLowerCase();

    if (!trimmedName || !trimmedEmail || !password || !confirmPassword) {
      setErrorMessage('Completa todos los campos para continuar.');
      return;
    }

    if (!EMAIL_REGEX.test(trimmedEmail)) {
      setErrorMessage('El correo no parece válido. Revisa que tenga @ y un dominio.');
      return;
    }

    if (password.length < 8 || !/[a-zA-Z]/.test(password) || !/[0-9]/.test(password)) {
      setErrorMessage('La contraseña necesita al menos 8 caracteres, con letras y números.');
      return;
    }

    if (password !== confirmPassword) {
      setErrorMessage('Las contraseñas no coinciden. Escríbelas de nuevo.');
      return;
    }

    setLoading(true);
    try {
      await registerRequest(trimmedName, trimmedEmail, password);
      await loginRequest(trimmedEmail, password);
      navigation.replace('Tabs');
    } catch (error) {
      setErrorMessage(
        error instanceof Error ? error.message : 'No se pudo crear la cuenta. Intenta de nuevo.'
      );
    } finally {
      setLoading(false);
    }
  };

  const goBack = () => {
    if (navigation.canGoBack()) {
      navigation.goBack();
    } else {
      navigation.navigate('Login');
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.screen}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <StatusBar style="dark" />
      <View style={styles.column}>
        <TopBar title="Crear cuenta" onBack={goBack} />

        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {errorMessage ? <ErrorBox message={errorMessage} /> : null}

          <TextField
            label="Nombre completo"
            placeholder="Ej. Carlos Echeverría"
            value={nombreCompleto}
            onChangeText={setNombreCompleto}
            editable={!loading}
            autoCapitalize="words"
          />
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
            label="Contraseña (8 o más, con letras y números)"
            placeholder="Tu contraseña"
            secureTextEntry
            value={password}
            onChangeText={setPassword}
            editable={!loading}
          />
          <TextField
            label="Repite la contraseña"
            placeholder="Tu contraseña otra vez"
            secureTextEntry
            value={confirmPassword}
            onChangeText={setConfirmPassword}
            editable={!loading}
            returnKeyType="go"
            onSubmitEditing={handleRegister}
          />
        </ScrollView>

        <View style={[styles.footer, { paddingBottom: Math.max(insets.bottom, 12) + 8 }]}>
          <PrimaryButton label="Crear cuenta" onPress={handleRegister} loading={loading} />
          <TextButton
            label="¿Ya tienes cuenta? Inicia sesión"
            onPress={() => navigation.navigate('Login')}
            disabled={loading}
            style={{ alignSelf: 'center' }}
          />
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.ground,
  },
  column: {
    flex: 1,
    width: '100%',
    maxWidth: 480,
    alignSelf: 'center',
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 24,
    gap: 20,
  },
  footer: {
    paddingHorizontal: 20,
    paddingTop: 12,
    gap: 4,
    backgroundColor: colors.ground,
  },
});
