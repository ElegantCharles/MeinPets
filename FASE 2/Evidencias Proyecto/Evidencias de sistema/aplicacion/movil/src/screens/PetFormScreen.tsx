import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import type { PetFormScreenProps } from '../navigation/types';
import {
  Species,
  fetchSpeciesCatalog,
  fetchPetById,
  createPet,
  updatePet,
} from '../services/pets';
import {
  BottomSheet,
  Chip,
  ErrorBox,
  IconCheck,
  IconPlus,
  PrimaryButton,
  SelectField,
  TextButton,
  TextField,
  TopBar,
} from '../components';
import { colors, fonts, formatDateLong, parseIso, radii, toIso, type as t } from '../theme';

const BIRTH_PRESETS: { label: string; years: number; months: number }[] = [
  { label: 'Hace 3 meses', years: 0, months: 3 },
  { label: 'Hace 1 año', years: 1, months: 0 },
  { label: 'Hace 3 años', years: 3, months: 0 },
];

function presetIso(years: number, months: number): string {
  const d = new Date();
  d.setFullYear(d.getFullYear() - years);
  d.setMonth(d.getMonth() - months);
  return toIso(d);
}

export default function PetFormScreen({ navigation, route }: PetFormScreenProps) {
  const petId = route.params?.petId;
  const isEditing = typeof petId === 'number';
  const insets = useSafeAreaInsets();

  const [catalog, setCatalog] = useState<Species[]>([]);
  const [nombre, setNombre] = useState('');
  const [especieId, setEspecieId] = useState<number | null>(null);
  const [razaId, setRazaId] = useState<number | null>(null);
  const [fechaNacimiento, setFechaNacimiento] = useState('');
  const [sexo, setSexo] = useState<'macho' | 'hembra'>('macho');
  const [esterilizado, setEsterilizado] = useState(false);
  const [numeroChip, setNumeroChip] = useState('');
  const [fotoUrl, setFotoUrl] = useState('');

  const [breedSheetOpen, setBreedSheetOpen] = useState(false);
  const [customBirthOpen, setCustomBirthOpen] = useState(false);
  const [moreOpen, setMoreOpen] = useState(false);

  const [loadingInitial, setLoadingInitial] = useState(true);
  const [saving, setSaving] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;
    async function loadForm() {
      try {
        const speciesData = await fetchSpeciesCatalog();
        if (!mounted) return;
        setCatalog(speciesData);

        if (isEditing && petId) {
          const pet = await fetchPetById(petId);
          if (!mounted) return;
          setNombre(pet.nombre);
          setEspecieId(pet.especie_id);
          setRazaId(pet.raza_id);
          setFechaNacimiento(pet.fecha_nacimiento);
          setSexo(pet.sexo);
          setEsterilizado(Boolean(pet.esterilizado));
          setNumeroChip(pet.numero_chip || '');
          setFotoUrl(pet.foto_url || '');
          if (pet.numero_chip) {
            setMoreOpen(true);
          }
        } else if (speciesData.length > 0) {
          const firstSpecies = speciesData[0];
          setEspecieId(firstSpecies.id);
          if (firstSpecies.razas.length > 0) {
            setRazaId(firstSpecies.razas[0].id);
          }
        }
      } catch (error) {
        if (mounted) {
          setErrorMessage(
            error instanceof Error
              ? error.message
              : 'No se pudo cargar el formulario. Revisa tu conexión e intenta de nuevo.'
          );
        }
      } finally {
        if (mounted) {
          setLoadingInitial(false);
        }
      }
    }
    loadForm();
    return () => {
      mounted = false;
    };
  }, [isEditing, petId]);

  const selectedSpecies = catalog.find((sp) => sp.id === especieId) || null;
  const availableBreeds = selectedSpecies ? selectedSpecies.razas : [];
  const selectedBreed = availableBreeds.find((br) => br.id === razaId) || null;

  const handleSelectSpecies = (newSpeciesId: number) => {
    setEspecieId(newSpeciesId);
    const sp = catalog.find((item) => item.id === newSpeciesId);
    if (sp && sp.razas.length > 0) {
      setRazaId(sp.razas[0].id);
    } else {
      setRazaId(null);
    }
  };

  const handlePresetBirth = (years: number, months: number) => {
    setCustomBirthOpen(false);
    setFechaNacimiento(presetIso(years, months));
  };

  const handleSave = async () => {
    setErrorMessage(null);

    const trimmedNombre = nombre.trim();
    const trimmedDate = fechaNacimiento.trim();

    if (!trimmedNombre) {
      setErrorMessage('Escribe el nombre de tu mascota.');
      return;
    }

    if (!especieId) {
      setErrorMessage('Elige si tu mascota es perro o gato.');
      return;
    }

    if (!trimmedDate || !/^\d{4}-\d{2}-\d{2}$/.test(trimmedDate)) {
      setErrorMessage('Escribe la fecha de nacimiento como AAAA-MM-DD, por ejemplo 2023-05-14.');
      return;
    }

    const [y, m, d] = trimmedDate.split('-').map(Number);
    const parsedDate = new Date(Date.UTC(y, m - 1, d));
    const now = new Date();
    const todayUtc = Date.UTC(now.getFullYear(), now.getMonth(), now.getDate());

    if (
      parsedDate.getUTCFullYear() !== y ||
      parsedDate.getUTCMonth() !== m - 1 ||
      parsedDate.getUTCDate() !== d
    ) {
      setErrorMessage('Esa fecha de nacimiento no existe en el calendario. Revísala.');
      return;
    }

    if (parsedDate.getTime() > todayUtc) {
      setErrorMessage('La fecha de nacimiento no puede ser futura.');
      return;
    }

    setSaving(true);
    try {
      const payload = {
        nombre: trimmedNombre,
        especie_id: especieId,
        raza_id: razaId,
        fecha_nacimiento: trimmedDate,
        sexo,
        esterilizado,
        numero_chip: numeroChip.trim() ? numeroChip.trim() : null,
        foto_url: fotoUrl.trim() ? fotoUrl.trim() : null,
      };

      if (isEditing && petId) {
        await updatePet(petId, payload);
        navigation.replace('PetDetail', { petId });
      } else {
        const created = await createPet(payload);
        navigation.replace('PetDetail', { petId: created.id });
      }
    } catch (error) {
      setErrorMessage(
        error instanceof Error ? error.message : 'No se pudo guardar la mascota. Intenta de nuevo.'
      );
    } finally {
      setSaving(false);
    }
  };

  const goBack = () => {
    if (navigation.canGoBack()) {
      navigation.goBack();
    } else {
      navigation.navigate('Tabs', { screen: 'Pets' });
    }
  };

  /* ------------------------------------------------------------- derivados */

  const isPresetBirth = BIRTH_PRESETS.some((p) => presetIso(p.years, p.months) === fechaNacimiento);
  const hasOtherBirth = fechaNacimiento !== '' && !isPresetBirth;
  const showCustomBirth = customBirthOpen || hasOtherBirth;
  const birthValid = parseIso(fechaNacimiento) !== null;

  /* --------------------------------------------------------------- estados */

  if (loadingInitial) {
    return (
      <View style={styles.center}>
        <StatusBar style="dark" />
        <ActivityIndicator size="large" color={colors.teal} />
        <Text style={[t.body, { color: colors.inkSoft, marginTop: 12 }]}>Cargando…</Text>
      </View>
    );
  }

  /* ---------------------------------------------------------------- pantalla */

  return (
    <KeyboardAvoidingView
      style={styles.screen}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <StatusBar style="dark" />
      <View style={styles.column}>
        <TopBar title={isEditing ? 'Editar mascota' : 'Registrar mascota'} onBack={goBack} />

        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {errorMessage ? <ErrorBox message={errorMessage} /> : null}

          <TextField
            label="Nombre"
            placeholder="Ej. Pelusa, Max, Luna"
            value={nombre}
            onChangeText={setNombre}
            editable={!saving}
            autoCapitalize="words"
          />

          {/* Especie */}
          <View style={{ gap: 8 }}>
            <Text style={[t.label, { color: colors.inkLabel }]}>¿Qué es?</Text>
            <View style={styles.segment}>
              {catalog.map((sp) => (
                <View key={sp.id} style={{ flex: 1 }}>
                  <Chip
                    label={sp.nombre}
                    height={52}
                    selected={sp.id === especieId}
                    onPress={() => handleSelectSpecies(sp.id)}
                  />
                </View>
              ))}
            </View>
          </View>

          {/* Raza */}
          {availableBreeds.length > 0 ? (
            <View style={{ gap: 8 }}>
              <Text style={[t.label, { color: colors.inkLabel }]}>Raza</Text>
              <SelectField
                label="Raza"
                title={selectedBreed ? selectedBreed.nombre : 'Elige una raza'}
                onPress={() => setBreedSheetOpen(true)}
              />
            </View>
          ) : null}

          {/* Nacimiento */}
          <View style={{ gap: 8 }}>
            <Text style={[t.label, { color: colors.inkLabel }]}>¿Cuándo nació?</Text>
            <View style={styles.chipRow}>
              {BIRTH_PRESETS.map((p) => (
                <Chip
                  key={p.label}
                  label={p.label}
                  selected={!showCustomBirth && presetIso(p.years, p.months) === fechaNacimiento}
                  onPress={() => handlePresetBirth(p.years, p.months)}
                />
              ))}
            </View>
            {!hasOtherBirth ? (
              <TextButton
                label={customBirthOpen ? 'Usar un atajo' : 'Elegir otra fecha'}
                onPress={() => setCustomBirthOpen((v) => !v)}
                style={{ alignSelf: 'flex-start', marginLeft: -8 }}
              />
            ) : null}
            {showCustomBirth ? (
              <TextField
                label="Fecha de nacimiento (AAAA-MM-DD)"
                placeholder="2023-08-15"
                value={fechaNacimiento}
                onChangeText={setFechaNacimiento}
                editable={!saving}
                autoCapitalize="none"
                autoCorrect={false}
              />
            ) : null}
            {birthValid ? (
              <Text style={[t.small, { color: colors.inkSoft }]}>
                Nació el {formatDateLong(fechaNacimiento)}
              </Text>
            ) : null}
          </View>

          {/* Sexo */}
          <View style={{ gap: 8 }}>
            <Text style={[t.label, { color: colors.inkLabel }]}>Sexo</Text>
            <View style={styles.segment}>
              <View style={{ flex: 1 }}>
                <Chip label="Macho" height={52} selected={sexo === 'macho'} onPress={() => setSexo('macho')} />
              </View>
              <View style={{ flex: 1 }}>
                <Chip label="Hembra" height={52} selected={sexo === 'hembra'} onPress={() => setSexo('hembra')} />
              </View>
            </View>
          </View>

          {/* Esterilización */}
          <View style={{ gap: 8 }}>
            <Text style={[t.label, { color: colors.inkLabel }]}>
              {sexo === 'macho' ? '¿Está esterilizado?' : '¿Está esterilizada?'}
            </Text>
            <View style={styles.segment}>
              <View style={{ flex: 1 }}>
                <Chip label="Sí" height={52} selected={esterilizado} onPress={() => setEsterilizado(true)} />
              </View>
              <View style={{ flex: 1 }}>
                <Chip label="No" height={52} selected={!esterilizado} onPress={() => setEsterilizado(false)} />
              </View>
            </View>
          </View>

          {/* Microchip */}
          {moreOpen ? (
            <TextField
              label="Número de microchip"
              placeholder="Ej. 900118000123456"
              value={numeroChip}
              onChangeText={setNumeroChip}
              editable={!saving}
              keyboardType="number-pad"
            />
          ) : (
            <Pressable
              onPress={() => setMoreOpen(true)}
              accessibilityRole="button"
              accessibilityLabel="Agregar número de microchip (opcional)"
              style={({ pressed }) => [styles.optionalRow, pressed && { opacity: 0.8 }]}
            >
              <IconPlus size={20} color={colors.teal} />
              <Text style={[t.body, { color: colors.ink, flex: 1, fontFamily: fonts.textMedium }]}>
                Agregar número de microchip
              </Text>
              <Text style={[t.small, { color: colors.inkSoft }]}>Opcional</Text>
            </Pressable>
          )}
        </ScrollView>

        <View style={[styles.footer, { paddingBottom: Math.max(insets.bottom, 12) + 8 }]}>
          <PrimaryButton
            label={isEditing ? 'Guardar cambios' : 'Registrar mascota'}
            onPress={handleSave}
            loading={saving}
          />
        </View>
      </View>

      {/* Hoja: elegir raza */}
      <BottomSheet
        visible={breedSheetOpen}
        onClose={() => setBreedSheetOpen(false)}
        title="Elige la raza"
      >
        {availableBreeds.map((br) => {
          const selected = br.id === razaId;
          return (
            <Pressable
              key={br.id}
              onPress={() => {
                setRazaId(br.id);
                setBreedSheetOpen(false);
              }}
              accessibilityRole="button"
              accessibilityLabel={br.nombre}
              accessibilityState={{ selected }}
              style={({ pressed }) => [
                styles.sheetRow,
                selected && { backgroundColor: colors.mintSelected },
                pressed && { opacity: 0.85 },
              ]}
            >
              <Text style={[t.rowTitle, { color: colors.ink, flex: 1 }]}>{br.nombre}</Text>
              {selected ? <IconCheck size={22} color={colors.teal} /> : null}
            </Pressable>
          );
        })}
      </BottomSheet>
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
    gap: 24,
  },
  segment: {
    flexDirection: 'row',
    gap: 8,
  },
  chipRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  optionalRow: {
    minHeight: 56,
    borderRadius: radii.row,
    borderWidth: 1.5,
    borderStyle: 'dashed',
    borderColor: colors.line,
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  footer: {
    paddingHorizontal: 20,
    paddingTop: 12,
    backgroundColor: colors.ground,
  },
  sheetRow: {
    minHeight: 56,
    borderRadius: radii.tile,
    paddingVertical: 8,
    paddingHorizontal: 14,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
  },
});
