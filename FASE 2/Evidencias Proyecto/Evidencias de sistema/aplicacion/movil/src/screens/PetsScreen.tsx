import React, { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import type { PetsScreenProps } from '../navigation/types';
import { resetTo } from '../navigation/reset';
import { getSession, AuthUser } from '../services/auth';
import { Pet, fetchPets, formatPetAge } from '../services/pets';
import {
  Avatar,
  ErrorBox,
  IconChevronRight,
  IconPaw,
  IconPlus,
  PrimaryButton,
  TextButton,
} from '../components';
import { colors, floatingShadow, fonts, radii, type as t } from '../theme';

export default function PetsScreen({ navigation }: PetsScreenProps) {
  const insets = useSafeAreaInsets();
  const [user, setUser] = useState<AuthUser | null>(null);
  const [pets, setPets] = useState<Pet[]>([]);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const loadData = useCallback(async () => {
    setLoading(true);
    setErrorMessage(null);
    try {
      const session = await getSession();
      if (!session?.token) {
        resetTo(navigation, 'Login');
        return;
      }
      setUser(session.user);
      const list = await fetchPets();
      setPets(list);
    } catch (error) {
      setErrorMessage(
        error instanceof Error ? error.message : 'No se pudieron cargar tus mascotas. Intenta de nuevo.'
      );
    } finally {
      setLoading(false);
    }
  }, [navigation]);

  useEffect(() => {
    loadData();
    const unsubscribe = navigation.addListener('focus', () => {
      loadData();
    });
    return unsubscribe;
  }, [navigation, loadData]);

  const firstName = (user?.nombre_completo ?? '').trim().split(/\s+/)[0] ?? '';

  return (
    <View style={styles.screen}>
      <StatusBar style="light" />
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.column}>
          {/* Cabecera */}
          <View style={[styles.hero, { paddingTop: insets.top + 16 }]}>
            <View style={styles.heroRow}>
              <View style={{ flex: 1, gap: 4 }}>
                <Text accessibilityRole="header" numberOfLines={1} style={[t.petName, { color: colors.onTeal }]}>
                  {firstName ? `Hola, ${firstName}` : 'Mis mascotas'}
                </Text>
                {user ? (
                  <Text numberOfLines={1} style={[t.body, { color: colors.onTealSoft }]}>
                    {user.email}
                  </Text>
                ) : null}
              </View>
            </View>
          </View>

          <View style={styles.body}>
            {errorMessage ? <ErrorBox message={errorMessage} /> : null}

            {loading && pets.length === 0 ? (
              <View style={[styles.floatCard, { alignItems: 'center', paddingVertical: 32 }]}>
                <ActivityIndicator size="large" color={colors.teal} />
                <Text style={[t.body, { color: colors.inkSoft, marginTop: 12 }]}>Cargando tus mascotas…</Text>
              </View>
            ) : pets.length === 0 ? (
              <View style={styles.floatCard}>
                <View style={styles.emptyRow}>
                  <View style={styles.emptyIcon}>
                    <IconPaw size={26} color={colors.teal} />
                  </View>
                  <View style={{ flex: 1, gap: 2 }}>
                    <Text style={[t.cardTitle, { color: colors.ink }]}>Aún no tienes mascotas</Text>
                    <Text style={[t.small, { color: colors.inkSoft }]}>
                      Crea la ficha de tu perro o gato y lleva su carnet de vacunas al día.
                    </Text>
                  </View>
                </View>
                <PrimaryButton
                  label="Registrar mascota"
                  onPress={() => navigation.navigate('PetForm')}
                  icon={<IconPlus color={colors.onTeal} size={20} />}
                  style={{ height: 52, borderRadius: 16 }}
                />
              </View>
            ) : (
              <View style={styles.floatCard}>
                <View style={styles.listHeader}>
                  <Text style={[t.cardTitle, { color: colors.ink, flex: 1 }]}>Tus mascotas</Text>
                  <TextButton
                    label="Agregar"
                    onPress={() => navigation.navigate('PetForm')}
                    icon={<IconPlus color={colors.teal} size={18} />}
                  />
                </View>
                {pets.map((pet, index) => (
                  <Pressable
                    key={pet.id}
                    onPress={() => navigation.navigate('PetDetail', { petId: pet.id })}
                    accessibilityRole="button"
                    accessibilityLabel={`${pet.nombre}, ${pet.raza_nombre || 'Mestizo'}, ${formatPetAge(pet.fecha_nacimiento)}. Ver ficha`}
                    style={({ pressed }) => [
                      styles.petRow,
                      index > 0 && styles.petRowDivider,
                      pressed && { backgroundColor: colors.mintSelected },
                    ]}
                  >
                    <Avatar name={pet.nombre} size={52} />
                    <View style={{ flex: 1, gap: 2 }}>
                      <Text numberOfLines={1} style={{ fontFamily: fonts.displaySemi, fontSize: 19, color: colors.ink }}>
                        {pet.nombre}
                      </Text>
                      <Text numberOfLines={1} style={[t.small, { color: colors.inkSoft }]}>
                        {pet.raza_nombre || 'Mestizo'} · {pet.sexo === 'macho' ? 'Macho' : 'Hembra'} ·{' '}
                        {formatPetAge(pet.fecha_nacimiento)}
                      </Text>
                    </View>
                    <IconChevronRight color={colors.inkSoft} size={20} />
                  </Pressable>
                ))}
              </View>
            )}

          </View>
        </View>
      </ScrollView>

    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.ground,
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
    paddingBottom: 56,
    paddingHorizontal: 20,
  },
  heroRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  body: {
    marginTop: -36,
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
  emptyRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  emptyIcon: {
    width: 56,
    height: 56,
    borderRadius: 18,
    backgroundColor: colors.mint,
    alignItems: 'center',
    justifyContent: 'center',
  },
  listHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: -4,
  },
  petRow: {
    minHeight: 76,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    paddingVertical: 12,
    borderRadius: 14,
  },
  petRowDivider: {
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: colors.divider,
  },
});
