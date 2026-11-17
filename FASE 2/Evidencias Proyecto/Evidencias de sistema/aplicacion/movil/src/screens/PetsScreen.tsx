import React, { useCallback, useEffect, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import type { PetsScreenProps } from '../navigation/types';
import { resetTo } from '../navigation/reset';
import { getSession, AuthUser } from '../services/auth';
import { useOnReconnect } from '../services/network';
import { Pet, fetchPets, formatPetAge } from '../services/pets';
import {
  Avatar,
  Banner,
  ErrorState,
  IconChevronRight,
  IconPlus,
  SkeletonList,
  StateView,
  PrimaryButton,
  TextButton,
} from '../components';
import { colors, floatingShadow, fonts, radii, type as t } from '../theme';

export default function PetsScreen({ navigation }: PetsScreenProps) {
  const insets = useSafeAreaInsets();
  const [user, setUser] = useState<AuthUser | null>(null);
  const [pets, setPets] = useState<Pet[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<unknown>(null);

  const loadData = useCallback(async () => {
    setLoading(true);
    setLoadError(null);
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
      setLoadError(error ?? new Error('No se pudieron cargar tus mascotas.'));
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

  useOnReconnect(loadData);

  const firstName = (user?.nombre_completo ?? '').trim().split(/\s+/)[0] ?? '';
  const showSkeleton = loading && pets.length === 0 && !loadError;
  const showError = Boolean(loadError) && pets.length === 0;
  const showEmpty = !loading && !loadError && pets.length === 0;

  return (
    <View style={styles.screen}>
      <StatusBar style="light" />
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.column}>
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

          <View style={[styles.body, (showError || showEmpty) && styles.bodyState]}>
            {loadError && pets.length > 0 ? (
              <Banner message="No pudimos actualizar tus mascotas." actionLabel="Reintentar" onAction={loadData} />
            ) : null}

            {showSkeleton ? (
              <View style={styles.floatCard}>
                <SkeletonList rows={3} label="Cargando tus mascotas" />
              </View>
            ) : showError ? (
              <ErrorState error={loadError} title="No pudimos cargar tus mascotas" onRetry={loadData} />
            ) : showEmpty ? (
              <StateView
                pose="vacio"
                title="Aquí vivirán tus mascotas"
                message="Agrega la primera para guardar su carnet de salud y recibir avisos de sus refuerzos."
                actionLabel="Registrar mascota"
                onAction={() => navigation.navigate('PetForm')}
                actionIcon={<IconPlus color={colors.onTeal} size={20} />}
              />
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
  bodyState: {
    marginTop: 0,
    paddingTop: 32,
  },
  floatCard: {
    backgroundColor: colors.surface,
    borderRadius: radii.card,
    padding: 20,
    gap: 16,
    ...floatingShadow,
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
