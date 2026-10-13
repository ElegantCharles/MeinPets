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
import type { TreatmentFormScreenProps } from '../navigation/types';
import {
  TreatmentCatalogItem,
  TreatmentCategory,
  fetchTreatmentCatalog,
  fetchPetTreatments,
  createPetTreatment,
  updatePetTreatment,
  computeSuggestedBoosterDate,
} from '../services/treatments';
import {
  Avatar,
  BottomSheet,
  CategoryIcon,
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
import {
  addDaysIso,
  colors,
  daysAgo,
  daysFromToday,
  fonts,
  formatCadence,
  formatDateLong,
  formatRelativeDays,
  parseIso,
  radii,
  todayIso,
  type as t,
} from '../theme';

const FILTERS: { key: TreatmentCategory | 'all'; label: string }[] = [
  { key: 'all', label: 'Todas' },
  { key: 'vacuna', label: 'Vacunas' },
  { key: 'desparasitacion_interna', label: 'Internas' },
  { key: 'desparasitacion_externa', label: 'Externas' },
];

const QUICK_DATES: { label: string; ago: number }[] = [
  { label: 'Hoy', ago: 0 },
  { label: 'Ayer', ago: 1 },
  { label: 'Hace 1 semana', ago: 7 },
];

function categoryShortLabel(categoria: string): string {
  if (categoria === 'vacuna') return 'Vacuna';
  if (categoria === 'desparasitacion_interna') return 'Desparasitante interno';
  return 'Desparasitante externo';
}

/** Línea corta de la fila: qué cubre el tratamiento, sin la frase repetida de la API. */
function aboutText(item: TreatmentCatalogItem): string {
  const cleaned = (item.descripcion ?? '')
    .replace(/vacuna\s+obligatoria\s+recomendada\.?/gi, '')
    .replace(/\s+/g, ' ')
    .trim();
  return cleaned || categoryShortLabel(item.categoria);
}

export default function TreatmentFormScreen({ navigation, route }: TreatmentFormScreenProps) {
  const { petId, petName, especieId, recordId } = route.params;
  const isEditing = Boolean(recordId);
  const insets = useSafeAreaInsets();

  const [catalog, setCatalog] = useState<TreatmentCatalogItem[]>([]);
  const [categoryFilter, setCategoryFilter] = useState<TreatmentCategory | 'all'>('all');
  const [selectedTreatmentId, setSelectedTreatmentId] = useState<number | null>(null);
  const [fechaAplicacion, setFechaAplicacion] = useState<string>(todayIso());
  const [fechaProximoRefuerzo, setFechaProximoRefuerzo] = useState<string>('');
  const [manualBoosterEdited, setManualBoosterEdited] = useState<boolean>(false);
  const [loteProducto, setLoteProducto] = useState<string>('');
  const [veterinariaNombre, setVeterinariaNombre] = useState<string>('');
  const [notas, setNotas] = useState<string>('');

  const [sheetOpen, setSheetOpen] = useState(false);
  const [customDateOpen, setCustomDateOpen] = useState(false);
  const [boosterTextOpen, setBoosterTextOpen] = useState(false);
  const [detailsOpen, setDetailsOpen] = useState(false);

  const [initialLoading, setInitialLoading] = useState<boolean>(true);
  const [saving, setSaving] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;
    async function loadInitial() {
      try {
        const items = await fetchTreatmentCatalog(especieId);
        if (!mounted) return;
        setCatalog(items);

        if (recordId) {
          const records = await fetchPetTreatments(petId);
          if (!mounted) return;
          const existing = records.find((r) => r.id === recordId);
          if (existing) {
            setSelectedTreatmentId(existing.tratamiento_id);
            setFechaAplicacion(existing.fecha_aplicacion);
            setFechaProximoRefuerzo(existing.fecha_proximo_refuerzo || '');
            setManualBoosterEdited(true);
            setLoteProducto(existing.lote_producto || '');
            setVeterinariaNombre(existing.veterinaria_nombre || '');
            setNotas(existing.notas || '');
            if (existing.lote_producto || existing.veterinaria_nombre || existing.notas) {
              setDetailsOpen(true);
            }
          }
        } else if (items.length > 0) {
          const first = items[0];
          setSelectedTreatmentId(first.id);
          setFechaProximoRefuerzo(
            computeSuggestedBoosterDate(todayIso(), first.intervalo_refuerzo_dias)
          );
        }
      } catch (error) {
        if (mounted) {
          setErrorMessage(
            error instanceof Error
              ? error.message
              : 'No se pudo cargar la lista de tratamientos. Revisa tu conexión e intenta de nuevo.'
          );
        }
      } finally {
        if (mounted) {
          setInitialLoading(false);
        }
      }
    }
    loadInitial();
    return () => {
      mounted = false;
    };
  }, [especieId, petId, recordId]);

  const selectedTreatment = catalog.find((item) => item.id === selectedTreatmentId) || null;

  const filteredCatalog =
    categoryFilter === 'all'
      ? catalog
      : catalog.filter((item) => item.categoria === categoryFilter);

  /* ------------------------------------------------------------ acciones */

  const handleSelectTreatment = (item: TreatmentCatalogItem) => {
    setSelectedTreatmentId(item.id);
    setFechaProximoRefuerzo(computeSuggestedBoosterDate(fechaAplicacion, item.intervalo_refuerzo_dias));
    setManualBoosterEdited(false);
    setSheetOpen(false);
  };

  const handleChangeFechaAplicacion = (value: string) => {
    setFechaAplicacion(value);
    if (!manualBoosterEdited && selectedTreatment) {
      const suggested = computeSuggestedBoosterDate(value, selectedTreatment.intervalo_refuerzo_dias);
      if (suggested) {
        setFechaProximoRefuerzo(suggested);
      }
    }
  };

  const handleQuickDate = (ago: number) => {
    setCustomDateOpen(false);
    handleChangeFechaAplicacion(addDaysIso(todayIso(), -ago));
  };

  const handleChangeBoosterManual = (value: string) => {
    setFechaProximoRefuerzo(value);
    setManualBoosterEdited(true);
  };

  const shiftBooster = (days: number) => {
    const base = parseIso(fechaProximoRefuerzo)
      ? fechaProximoRefuerzo
      : parseIso(fechaAplicacion)
      ? fechaAplicacion
      : todayIso();
    setFechaProximoRefuerzo(addDaysIso(base, days));
    setManualBoosterEdited(true);
  };

  const handleRecalculateSuggestion = () => {
    if (!selectedTreatment) return;
    setFechaProximoRefuerzo(
      computeSuggestedBoosterDate(fechaAplicacion, selectedTreatment.intervalo_refuerzo_dias)
    );
    setManualBoosterEdited(false);
    setBoosterTextOpen(false);
  };

  const handleSubmit = async () => {
    setErrorMessage(null);

    if (!selectedTreatmentId) {
      setErrorMessage('Elige una vacuna o desparasitante de la lista.');
      return;
    }

    if (!/^\d{4}-\d{2}-\d{2}$/.test(fechaAplicacion.trim())) {
      setErrorMessage('Escribe la fecha de aplicación como AAAA-MM-DD, por ejemplo 2026-10-08.');
      return;
    }

    if (
      fechaProximoRefuerzo.trim().length > 0 &&
      !/^\d{4}-\d{2}-\d{2}$/.test(fechaProximoRefuerzo.trim())
    ) {
      setErrorMessage('Escribe la fecha del refuerzo como AAAA-MM-DD, por ejemplo 2026-11-07.');
      return;
    }

    setSaving(true);
    try {
      const payload = {
        tratamiento_id: selectedTreatmentId,
        fecha_aplicacion: fechaAplicacion.trim(),
        fecha_proximo_refuerzo:
          fechaProximoRefuerzo.trim().length > 0 ? fechaProximoRefuerzo.trim() : null,
        lote_producto: loteProducto.trim().length > 0 ? loteProducto.trim() : null,
        veterinaria_nombre: veterinariaNombre.trim().length > 0 ? veterinariaNombre.trim() : null,
        notas: notas.trim().length > 0 ? notas.trim() : null,
      };

      if (isEditing && recordId) {
        await updatePetTreatment(petId, recordId, payload);
      } else {
        await createPetTreatment(petId, payload);
      }

      navigation.navigate('PetDetail', { petId });
    } catch (error) {
      setErrorMessage(
        error instanceof Error ? error.message : 'No se pudo guardar la dosis. Intenta de nuevo.'
      );
    } finally {
      setSaving(false);
    }
  };

  const goBack = () => {
    if (navigation.canGoBack()) {
      navigation.goBack();
    } else {
      navigation.navigate('PetDetail', { petId });
    }
  };

  /* ------------------------------------------------------------- derivados */

  const ago = daysAgo(fechaAplicacion);
  const isPresetDate = ago !== null && QUICK_DATES.some((q) => q.ago === ago);
  const showCustomDate = customDateOpen || !isPresetDate;

  const boosterDays = daysFromToday(fechaProximoRefuerzo);
  const boosterValid = parseIso(fechaProximoRefuerzo) !== null;
  const boosterLine = boosterValid
    ? `${boosterDays !== null ? formatRelativeDays(boosterDays) : ''} · aplicada el ${formatDateLong(fechaAplicacion)}`
    : 'Elige una fecha o ajústala con los botones';

  /* --------------------------------------------------------------- estados */

  if (initialLoading) {
    return (
      <View style={styles.center}>
        <StatusBar style="dark" />
        <ActivityIndicator size="large" color={colors.teal} />
        <Text style={[t.body, { color: colors.inkSoft, marginTop: 12 }]}>Cargando tratamientos…</Text>
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
        <TopBar
          title={isEditing ? 'Editar dosis' : 'Registrar dosis'}
          onBack={goBack}
          right={
            <View style={styles.petPill}>
              <Avatar name={petName} size={28} />
              <Text numberOfLines={1} style={[t.label, { color: colors.ink, maxWidth: 90 }]}>
                {petName}
              </Text>
            </View>
          }
        />

        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {errorMessage ? <ErrorBox message={errorMessage} /> : null}

          {/* Tratamiento */}
          <View style={{ gap: 8 }}>
            <Text style={[t.label, { color: colors.inkLabel }]}>Tratamiento</Text>
            <SelectField
              categoria={selectedTreatment?.categoria}
              title={selectedTreatment ? selectedTreatment.nombre : 'Elige un tratamiento'}
              subtitle={
                selectedTreatment
                  ? selectedTreatment.intervalo_refuerzo_dias
                    ? `Refuerzo ${formatCadence(selectedTreatment.intervalo_refuerzo_dias).toLowerCase()}`
                    : 'Sin refuerzo programado'
                  : undefined
              }
              onPress={() => setSheetOpen(true)}
            />
          </View>

          {/* Fecha de aplicación */}
          <View style={{ gap: 8 }}>
            <Text style={[t.label, { color: colors.inkLabel }]}>¿Cuándo se aplicó?</Text>
            <View style={styles.chipRow}>
              {QUICK_DATES.map((q) => (
                <Chip
                  key={q.label}
                  label={q.label}
                  selected={!showCustomDate && ago === q.ago}
                  onPress={() => handleQuickDate(q.ago)}
                />
              ))}
            </View>
            {isPresetDate ? (
              <TextButton
                label={customDateOpen ? 'Usar un atajo' : 'Elegir otra fecha'}
                onPress={() => setCustomDateOpen((v) => !v)}
                style={{ alignSelf: 'flex-start', marginLeft: -8 }}
              />
            ) : null}
            {showCustomDate ? (
              <TextField
                label="Fecha de aplicación (AAAA-MM-DD)"
                placeholder="2026-10-08"
                value={fechaAplicacion}
                onChangeText={handleChangeFechaAplicacion}
                autoCapitalize="none"
                autoCorrect={false}
              />
            ) : null}
          </View>

          {/* Próximo refuerzo (protagonista) */}
          <View style={styles.boosterCard}>
            <Text style={[t.bodySemi, { color: colors.ink }]}>Próximo refuerzo</Text>
            <Text
              accessibilityLabel={`Próximo refuerzo: ${boosterValid ? formatDateLong(fechaProximoRefuerzo) : 'sin fecha'}`}
              style={[t.bigDate, { color: colors.ink }]}
              adjustsFontSizeToFit
              numberOfLines={1}
            >
              {boosterValid ? formatDateLong(fechaProximoRefuerzo) : '—'}
            </Text>
            <Text style={[t.body, { color: colors.ballInk }]}>{boosterLine}</Text>

            <View style={styles.boosterButtons}>
              <Pressable
                onPress={() => shiftBooster(-7)}
                accessibilityRole="button"
                accessibilityLabel="Adelantar el refuerzo una semana"
                style={({ pressed }) => [styles.boosterBtn, pressed && { opacity: 0.7 }]}
              >
                <Text style={[t.label, { color: colors.ink }]}>− 1 semana</Text>
              </Pressable>
              <Pressable
                onPress={() => shiftBooster(7)}
                accessibilityRole="button"
                accessibilityLabel="Atrasar el refuerzo una semana"
                style={({ pressed }) => [styles.boosterBtn, pressed && { opacity: 0.7 }]}
              >
                <Text style={[t.label, { color: colors.ink }]}>+ 1 semana</Text>
              </Pressable>
            </View>

            <View style={styles.boosterLinks}>
              <TextButton
                label={boosterTextOpen ? 'Ocultar fecha escrita' : 'Escribir otra fecha'}
                onPress={() => setBoosterTextOpen((v) => !v)}
                color={colors.ink}
                underline
              />
              {manualBoosterEdited && selectedTreatment?.intervalo_refuerzo_dias ? (
                <TextButton
                  label="Usar la fecha sugerida"
                  onPress={handleRecalculateSuggestion}
                  color={colors.ink}
                  underline
                />
              ) : null}
            </View>

            {boosterTextOpen ? (
              <TextField
                label="Fecha del refuerzo (AAAA-MM-DD)"
                placeholder="2026-11-07"
                value={fechaProximoRefuerzo}
                onChangeText={handleChangeBoosterManual}
                autoCapitalize="none"
                autoCorrect={false}
              />
            ) : null}
          </View>

          {/* Más detalles */}
          {detailsOpen ? (
            <View style={{ gap: 16 }}>
              <TextField
                label="Veterinaria o clínica"
                placeholder="Ej. Clínica Veterinaria Providencia"
                value={veterinariaNombre}
                onChangeText={setVeterinariaNombre}
              />
              <TextField
                label="Lote o marca del producto"
                placeholder="Ej. Nobivac Lote A492"
                value={loteProducto}
                onChangeText={setLoteProducto}
              />
              <TextField
                label="Notas"
                placeholder="Ej. Sin reacciones, peso control 12.4 kg"
                value={notas}
                onChangeText={setNotas}
                multiline
              />
            </View>
          ) : (
            <Pressable
              onPress={() => setDetailsOpen(true)}
              accessibilityRole="button"
              accessibilityLabel="Agregar clínica, lote o notas (opcional)"
              style={({ pressed }) => [styles.optionalRow, pressed && { opacity: 0.8 }]}
            >
              <IconPlus size={20} color={colors.teal} />
              <Text style={[t.body, { color: colors.ink, flex: 1, fontFamily: fonts.textMedium }]}>
                Agregar clínica, lote o notas
              </Text>
              <Text style={[t.small, { color: colors.inkSoft }]}>Opcional</Text>
            </Pressable>
          )}
        </ScrollView>

        <View style={[styles.footer, { paddingBottom: Math.max(insets.bottom, 12) + 8 }]}>
          <PrimaryButton
            label={isEditing ? 'Guardar cambios' : 'Guardar dosis'}
            onPress={handleSubmit}
            loading={saving}
          />
        </View>
      </View>

      {/* Hoja: elegir tratamiento */}
      <BottomSheet
        visible={sheetOpen}
        onClose={() => setSheetOpen(false)}
        title="Elige el tratamiento"
        header={
          <View style={styles.chipRow}>
            {FILTERS.map((f) => (
              <Chip
                key={f.key}
                label={f.label}
                height={40}
                selected={categoryFilter === f.key}
                onPress={() => setCategoryFilter(f.key)}
              />
            ))}
          </View>
        }
      >
        {filteredCatalog.length === 0 ? (
          <Text style={[t.body, { color: colors.inkSoft, padding: 12 }]}>
            No hay tratamientos en esta categoría.
          </Text>
        ) : (
          filteredCatalog.map((item) => {
            const selected = item.id === selectedTreatmentId;
            const cadence = item.intervalo_refuerzo_dias
              ? formatCadence(item.intervalo_refuerzo_dias).toLowerCase()
              : 'sin refuerzo';
            return (
              <Pressable
                key={item.id}
                onPress={() => handleSelectTreatment(item)}
                accessibilityRole="button"
                accessibilityLabel={`${item.nombre}. ${aboutText(item)}. ${cadence}`}
                accessibilityState={{ selected }}
                style={({ pressed }) => [
                  styles.sheetRow,
                  selected && { backgroundColor: colors.mintSelected },
                  pressed && { opacity: 0.85 },
                ]}
              >
                <CategoryIcon categoria={item.categoria} size={40} />
                <View style={{ flex: 1, gap: 1 }}>
                  <Text style={[t.rowTitle, { color: colors.ink }]}>{item.nombre}</Text>
                  <Text numberOfLines={1} style={[t.small, { color: colors.inkSoft }]}>
                    {aboutText(item)} · {cadence}
                  </Text>
                </View>
                {selected ? <IconCheck size={22} color={colors.teal} /> : null}
              </Pressable>
            );
          })
        )}
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
  petPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    height: 36,
    paddingLeft: 4,
    paddingRight: 12,
    borderRadius: 18,
    backgroundColor: colors.surface,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 24,
    gap: 24,
  },
  chipRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  boosterCard: {
    backgroundColor: colors.ball,
    borderRadius: radii.card,
    padding: 20,
    gap: 4,
  },
  boosterButtons: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 14,
  },
  boosterBtn: {
    flex: 1,
    height: 44,
    borderRadius: 22,
    borderWidth: 1.5,
    borderColor: colors.ink,
    alignItems: 'center',
    justifyContent: 'center',
  },
  boosterLinks: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'flex-start',
    marginTop: 4,
    marginLeft: -8,
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
    minHeight: 64,
    borderRadius: radii.tile,
    paddingVertical: 8,
    paddingHorizontal: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
  },
});
