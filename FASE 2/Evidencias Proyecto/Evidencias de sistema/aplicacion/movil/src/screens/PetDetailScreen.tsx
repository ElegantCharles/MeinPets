import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Linking,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import type { PetDetailScreenProps } from '../navigation/types';
import {
  Pet,
  fetchPetById,
  deletePet,
  addPetTutor,
  formatPetAge,
} from '../services/pets';
import {
  PetTreatmentRecord,
  fetchPetTreatments,
  deletePetTreatment,
  getBoosterStatus,
} from '../services/treatments';
import { addBoosterToCalendar, calendarSupported } from '../services/calendar';
import {
  Avatar,
  BottomSheet,
  CategoryIcon,
  ErrorBox,
  GhostButton,
  IconButton,
  IconCalendar,
  IconChevronRight,
  IconMore,
  IconPlus,
  IconSyringe,
  PopoverMenu,
  PrimaryButton,
  StatusPill,
  TextButton,
  Tile,
  TopBar,
} from '../components';
import {
  StatusKey,
  colors,
  daysFromToday,
  floatingShadow,
  fonts,
  formatDateLong,
  formatRelativeDays,
  initials,
  radii,
  type as t,
} from '../theme';

/* ----------------------------------------------------------- helpers de UI */

function toStatusKey(value: string): StatusKey {
  return value === 'vencido' || value === 'proximo' || value === 'al_dia' ? value : 'sin_fecha';
}

function statusLabel(key: StatusKey, days: number | null): string {
  switch (key) {
    case 'vencido':
      return days === null ? 'Vencido' : `Vencido hace ${Math.abs(days)} d`;
    case 'proximo':
      return days === 0 ? 'Vence hoy' : days === null ? 'Próximo' : `En ${days} d`;
    case 'al_dia':
      return 'Al día';
    default:
      return 'Sin refuerzo';
  }
}

export default function PetDetailScreen({ navigation, route }: PetDetailScreenProps) {
  const { petId } = route.params;

  const [pet, setPet] = useState<Pet | null>(null);
  const [treatments, setTreatments] = useState<PetTreatmentRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const [menuOpen, setMenuOpen] = useState(false);
  const [confirmDeletePet, setConfirmDeletePet] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const [selectedRecord, setSelectedRecord] = useState<PetTreatmentRecord | null>(null);
  const [confirmingRecord, setConfirmingRecord] = useState(false);
  const [deletingRecordId, setDeletingRecordId] = useState<number | null>(null);
  const [addingToCalendar, setAddingToCalendar] = useState(false);
  const [calendarFeedback, setCalendarFeedback] = useState<{
    type: 'ok' | 'err';
    text: string;
    detail?: string;
    needsSettings?: boolean;
  } | null>(null);

  const [showInvite, setShowInvite] = useState(false);
  const [coTutorEmail, setCoTutorEmail] = useState('');
  const [addingTutor, setAddingTutor] = useState(false);
  const [tutorFeedback, setTutorFeedback] = useState<{ type: 'ok' | 'err'; text: string } | null>(
    null
  );

  const loadPet = useCallback(async () => {
    setLoading(true);
    setErrorMessage(null);
    try {
      const [data, records] = await Promise.all([fetchPetById(petId), fetchPetTreatments(petId)]);
      setPet(data);
      setTreatments(records);
    } catch (error) {
      setErrorMessage(
        error instanceof Error ? error.message : 'No se pudo cargar la ficha de la mascota.'
      );
    } finally {
      setLoading(false);
    }
  }, [petId]);

  useEffect(() => {
    loadPet();
    const unsubscribe = navigation.addListener('focus', () => {
      loadPet();
    });
    return unsubscribe;
  }, [navigation, loadPet]);

  useEffect(() => {
    setCalendarFeedback(null);
  }, [selectedRecord?.id]);

  const goBack = () => {
    if (navigation.canGoBack()) {
      navigation.goBack();
    } else {
      navigation.navigate('Pets');
    }
  };

  /* Dosis ordenadas de la más reciente a la más antigua, y la última de cada tratamiento. */
  const sortedTreatments = useMemo(
    () =>
      [...treatments].sort((a, b) =>
        a.fecha_aplicacion < b.fecha_aplicacion ? 1 : a.fecha_aplicacion > b.fecha_aplicacion ? -1 : 0
      ),
    [treatments]
  );

  const latestIds = useMemo(() => {
    const seen = new Set<number>();
    const ids = new Set<number>();
    sortedTreatments.forEach((rec) => {
      if (!seen.has(rec.tratamiento_id)) {
        seen.add(rec.tratamiento_id);
        ids.add(rec.id);
      }
    });
    return ids;
  }, [sortedTreatments]);

  /* Protagonista: el refuerzo más urgente (vencido primero) entre las últimas dosis. */
  const next = useMemo(() => {
    const candidates = sortedTreatments
      .filter((rec) => latestIds.has(rec.id) && rec.fecha_proximo_refuerzo)
      .map((rec) => ({ rec, days: daysFromToday(rec.fecha_proximo_refuerzo) }))
      .filter((x): x is { rec: PetTreatmentRecord; days: number } => x.days !== null)
      .sort((a, b) => a.days - b.days);
    return candidates.length > 0 ? candidates[0] : null;
  }, [sortedTreatments, latestIds]);

  const goToNewDose = () => {
    if (!pet) return;
    navigation.navigate('TreatmentForm', {
      petId: pet.id,
      petName: pet.nombre,
      especieId: pet.especie_id,
    });
  };

  const goToEditDose = (rec: PetTreatmentRecord) => {
    if (!pet) return;
    setSelectedRecord(null);
    setConfirmingRecord(false);
    navigation.navigate('TreatmentForm', {
      petId: pet.id,
      petName: pet.nombre,
      especieId: pet.especie_id,
      recordId: rec.id,
    });
  };

  const handleDeleteTreatment = async (rec: PetTreatmentRecord) => {
    setDeletingRecordId(rec.id);
    setErrorMessage(null);
    try {
      await deletePetTreatment(petId, rec.id);
      setTreatments((prev) => prev.filter((item) => item.id !== rec.id));
      setSelectedRecord(null);
      setConfirmingRecord(false);
    } catch (error) {
      setSelectedRecord(null);
      setConfirmingRecord(false);
      setErrorMessage(
        error instanceof Error ? error.message : 'No se pudo eliminar el registro. Intenta de nuevo.'
      );
    } finally {
      setDeletingRecordId(null);
    }
  };

  const handleAddToCalendar = async (rec: PetTreatmentRecord) => {
    if (!pet || !rec.fecha_proximo_refuerzo) return;
    setCalendarFeedback(null);
    setAddingToCalendar(true);
    try {
      const result = await addBoosterToCalendar({
        petName: pet.nombre,
        treatmentName: rec.tratamiento_nombre,
        boosterDate: rec.fecha_proximo_refuerzo.slice(0, 10),
        intervalDays: rec.intervalo_refuerzo_dias,
      });
      if (result.status === 'denied') {
        setCalendarFeedback({
          type: 'err',
          text: result.canAskAgain
            ? 'Necesitamos el permiso de calendario para agregar el recordatorio. Toca de nuevo y acepta.'
            : 'El permiso de calendario está desactivado. Actívalo en los ajustes de tu teléfono.',
          needsSettings: !result.canAskAgain,
        });
      } else {
        setCalendarFeedback({
          type: 'ok',
          text: result.status === 'created' ? 'Listo, quedó en tu calendario.' : 'Ya estaba en tu calendario.',
          detail: result.calendarTitle,
        });
      }
    } catch (error) {
      setCalendarFeedback({
        type: 'err',
        text: error instanceof Error ? error.message : 'No se pudo agregar al calendario. Intenta de nuevo.',
      });
    } finally {
      setAddingToCalendar(false);
    }
  };

  const handleAddTutor = async () => {
    setTutorFeedback(null);
    const trimmed = coTutorEmail.trim().toLowerCase();
    if (!trimmed) {
      setTutorFeedback({ type: 'err', text: 'Escribe el correo de tu familiar registrado.' });
      return;
    }
    setAddingTutor(true);
    try {
      const updated = await addPetTutor(petId, trimmed);
      setPet(updated);
      setCoTutorEmail('');
      setTutorFeedback({ type: 'ok', text: 'Listo, ya comparten la ficha.' });
    } catch (error) {
      setTutorFeedback({
        type: 'err',
        text: error instanceof Error ? error.message : 'No se pudo agregar al familiar.',
      });
    } finally {
      setAddingTutor(false);
    }
  };

  const handleDeletePet = async () => {
    setDeleting(true);
    try {
      await deletePet(petId);
      navigation.replace('Pets');
    } catch (error) {
      setErrorMessage(
        error instanceof Error ? error.message : 'No se pudo eliminar la mascota. Intenta de nuevo.'
      );
      setDeleting(false);
      setConfirmDeletePet(false);
    }
  };

  /* ------------------------------------------------------------- estados */

  if (loading && !pet) {
    return (
      <View style={styles.center}>
        <StatusBar style="dark" />
        <ActivityIndicator size="large" color={colors.teal} />
        <Text style={[t.body, { color: colors.inkSoft, marginTop: 12 }]}>Cargando ficha…</Text>
      </View>
    );
  }

  if (!pet) {
    return (
      <View style={styles.center}>
        <StatusBar style="dark" />
        <View style={styles.errorWrap}>
          <ErrorBox message={errorMessage || 'No encontramos a esta mascota.'} />
          <PrimaryButton label="Volver a mis mascotas" onPress={() => navigation.replace('Pets')} />
        </View>
      </View>
    );
  }

  const sexLabel = pet.sexo === 'macho' ? 'Macho' : 'Hembra';
  const breed = pet.raza_nombre || `${pet.especie_nombre} mestizo`;
  const sterilized = pet.sexo === 'macho' ? 'Esterilizado' : 'Esterilizada';
  const hasDoses = sortedTreatments.length > 0;
  const canAddToCalendar =
    calendarSupported &&
    selectedRecord !== null &&
    latestIds.has(selectedRecord.id) &&
    (daysFromToday(selectedRecord.fecha_proximo_refuerzo) ?? -1) >= 0;

  /* -------------------------------------------------------------- pantalla */

  return (
    <View style={styles.screen}>
      <StatusBar style="light" />
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.column}>
          {/* Cabecera */}
          <View style={styles.hero}>
            <TopBar
              onTeal
              onBack={goBack}
              right={
                <IconButton label="Más opciones" onPress={() => setMenuOpen(true)} onTeal>
                  <IconMore color={colors.onTeal} />
                </IconButton>
              }
            />
            <View style={styles.heroRow}>
              <Avatar name={pet.nombre} size={96} />
              <View style={{ flex: 1, gap: 4 }}>
                <Text accessibilityRole="header" numberOfLines={2} style={[t.petName, { color: colors.onTeal }]}>
                  {pet.nombre}
                </Text>
                <Text style={[t.body, { color: colors.onTealSoft }]}>
                  {breed} · {sexLabel} · {formatPetAge(pet.fecha_nacimiento)}
                </Text>
              </View>
            </View>
          </View>

          <View style={styles.body}>
            {errorMessage ? <ErrorBox message={errorMessage} /> : null}

            {/* Protagonista */}
            {hasDoses && next ? (
              <Pressable
                onPress={() => setSelectedRecord(next.rec)}
                accessibilityRole="button"
                accessibilityLabel={`${next.days < 0 ? 'Refuerzo vencido' : 'Próximo refuerzo'}: ${next.rec.tratamiento_nombre}, ${formatDateLong(next.rec.fecha_proximo_refuerzo)}`}
                style={({ pressed }) => [styles.floatCard, pressed && { opacity: 0.92 }]}
              >
                <View style={styles.nextTop}>
                  <Text style={[t.label, { color: colors.inkSoft, flex: 1 }]}>
                    {next.days < 0 ? 'Refuerzo vencido' : 'Próximo refuerzo'}
                  </Text>
                  <StatusPill
                    status={toStatusKey(getBoosterStatus(next.rec.fecha_proximo_refuerzo).status)}
                    label={statusLabel(
                      toStatusKey(getBoosterStatus(next.rec.fecha_proximo_refuerzo).status),
                      next.days
                    )}
                  />
                </View>
                <Text style={[t.midDate, { color: colors.ink }]}>
                  {formatDateLong(next.rec.fecha_proximo_refuerzo)}
                </Text>
                <View style={styles.nextBottom}>
                  <CategoryIcon categoria={next.rec.tratamiento_categoria} size={36} />
                  <View style={{ flex: 1 }}>
                    <Text numberOfLines={1} style={[t.rowTitle, { color: colors.ink }]}>
                      {next.rec.tratamiento_nombre}
                    </Text>
                    <Text style={[t.small, { color: colors.inkSoft }]}>
                      {formatRelativeDays(next.days)}
                    </Text>
                  </View>
                </View>
              </Pressable>
            ) : (
              <View style={styles.floatCard}>
                <View style={styles.emptyRow}>
                  <View style={{ width: 44, height: 44, borderRadius: 14, backgroundColor: colors.mint, alignItems: 'center', justifyContent: 'center' }}>
                    <IconSyringe size={24} color={colors.teal} />
                  </View>
                  <View style={{ flex: 1, gap: 2 }}>
                    <Text style={[t.cardTitle, { color: colors.ink }]}>
                      {hasDoses ? 'Sin refuerzos pendientes' : 'Sin dosis registradas'}
                    </Text>
                    <Text style={[t.small, { color: colors.inkSoft }]}>
                      {hasDoses
                        ? 'Las dosis registradas no tienen fecha de refuerzo.'
                        : 'Anota la primera y te avisamos cuándo toca la siguiente.'}
                    </Text>
                  </View>
                </View>
                <PrimaryButton
                  label="Registrar dosis"
                  onPress={goToNewDose}
                  icon={<IconPlus color={colors.onTeal} size={20} />}
                  style={{ height: 52, borderRadius: 16 }}
                />
              </View>
            )}

            {/* Carnet con dosis */}
            {hasDoses ? (
              <View style={styles.card}>
                <View style={styles.cardHeader}>
                  <Text style={[t.cardTitle, { color: colors.ink, flex: 1 }]}>Carnet sanitario</Text>
                  <TextButton
                    label="Registrar dosis"
                    onPress={goToNewDose}
                    icon={<IconPlus color={colors.teal} size={18} />}
                  />
                </View>
                {sortedTreatments.map((rec, index) => {
                  const isLatest = latestIds.has(rec.id);
                  const days = rec.fecha_proximo_refuerzo ? daysFromToday(rec.fecha_proximo_refuerzo) : null;
                  const key: StatusKey = isLatest
                    ? toStatusKey(getBoosterStatus(rec.fecha_proximo_refuerzo).status)
                    : 'sin_fecha';
                  const label = isLatest ? statusLabel(key, days) : 'Anterior';
                  return (
                    <Pressable
                      key={rec.id}
                      onPress={() => setSelectedRecord(rec)}
                      accessibilityRole="button"
                      accessibilityLabel={`${rec.tratamiento_nombre}, aplicada ${formatDateLong(rec.fecha_aplicacion)}, ${label}`}
                      style={({ pressed }) => [
                        styles.doseRow,
                        index > 0 && styles.doseRowDivider,
                        pressed && { backgroundColor: colors.mintSelected },
                      ]}
                    >
                      <CategoryIcon categoria={rec.tratamiento_categoria} size={40} />
                      <View style={{ flex: 1, gap: 2 }}>
                        <Text numberOfLines={1} style={[t.rowTitle, { color: colors.ink }]}>
                          {rec.tratamiento_nombre}
                        </Text>
                        <Text style={[t.small, { color: colors.inkSoft }]}>
                          Aplicada {formatDateLong(rec.fecha_aplicacion)}
                        </Text>
                      </View>
                      <StatusPill status={key} label={label} />
                    </Pressable>
                  );
                })}
              </View>
            ) : null}

            {/* Datos */}
            <View style={styles.tiles}>
              <Tile label="Nació" value={formatDateLong(pet.fecha_nacimiento)} />
              <Tile label={sterilized} value={pet.esterilizado ? 'Sí' : 'No'} />
              <Tile label="Microchip" value={pet.numero_chip ? 'Registrado' : 'Sin chip'} />
            </View>
            {pet.numero_chip ? (
              <Text style={[t.small, { color: colors.inkSoft, marginTop: -4, paddingHorizontal: 4 }]}>
                Número de chip: {pet.numero_chip}
              </Text>
            ) : null}

            {/* Calendario */}
            <Pressable
              onPress={() => navigation.navigate('Calendar')}
              accessibilityRole="button"
              accessibilityLabel="Calendario de refuerzos"
              style={({ pressed }) => [styles.linkRow, pressed && { opacity: 0.85 }]}
            >
              <View style={styles.linkIcon}>
                <IconCalendar size={20} color={colors.ink} />
              </View>
              <Text style={[t.rowTitle, { color: colors.ink, flex: 1, fontFamily: fonts.textMedium }]}>
                Calendario de refuerzos
              </Text>
              <IconChevronRight color={colors.inkSoft} size={20} />
            </Pressable>

            {/* Tutores */}
            <View style={styles.card}>
              {pet.tutores && pet.tutores.length > 0 ? (
                pet.tutores.map((tutor, index) => (
                  <View key={tutor.id} style={[styles.tutorRow, index > 0 && styles.tutorDivider]}>
                    <View style={styles.tutorAvatar}>
                      <Text style={{ fontFamily: fonts.display, fontSize: 16, color: colors.teal }}>
                        {initials(tutor.nombre_completo)}
                      </Text>
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text numberOfLines={1} style={[t.rowTitle, { color: colors.ink }]}>
                        {tutor.nombre_completo}
                      </Text>
                      <Text style={[t.small, { color: colors.inkSoft }]}>
                        {tutor.es_tutor_principal ? 'Tutor principal' : 'Cotutor'}
                      </Text>
                    </View>
                  </View>
                ))
              ) : (
                <Text style={[t.body, { color: colors.inkSoft }]}>Tutor registrado.</Text>
              )}

              <View style={styles.inviteDivider} />

              {showInvite ? (
                <View style={{ gap: 10 }}>
                  <View style={styles.inviteRow}>
                    <TextInput
                      style={styles.inviteInput}
                      placeholder="Correo de tu familiar"
                      placeholderTextColor={colors.placeholder}
                      accessibilityLabel="Correo de tu familiar registrado"
                      value={coTutorEmail}
                      onChangeText={setCoTutorEmail}
                      autoCapitalize="none"
                      autoCorrect={false}
                      keyboardType="email-address"
                    />
                    <PrimaryButton
                      label="Asociar"
                      onPress={handleAddTutor}
                      loading={addingTutor}
                      style={{ height: 52, borderRadius: 16, paddingHorizontal: 18 }}
                    />
                  </View>
                  {tutorFeedback ? (
                    <Text
                      style={[
                        t.small,
                        {
                          fontFamily: fonts.textSemi,
                          color: tutorFeedback.type === 'ok' ? colors.teal : colors.danger,
                        },
                      ]}
                    >
                      {tutorFeedback.text}
                    </Text>
                  ) : null}
                </View>
              ) : (
                <TextButton
                  label="Invitar a un familiar"
                  onPress={() => setShowInvite(true)}
                  icon={<IconPlus color={colors.teal} size={18} />}
                />
              )}
            </View>
          </View>
        </View>
      </ScrollView>

      {/* Menú ⋯ */}
      <PopoverMenu
        visible={menuOpen}
        onClose={() => setMenuOpen(false)}
        items={[
          {
            label: 'Editar datos',
            onPress: () => {
              setMenuOpen(false);
              navigation.navigate('PetForm', { petId: pet.id });
            },
          },
          {
            label: 'Eliminar mascota',
            danger: true,
            onPress: () => {
              setMenuOpen(false);
              setTimeout(() => setConfirmDeletePet(true), 300);
            },
          },
        ]}
      />

      {/* Confirmar eliminar mascota */}
      <BottomSheet
        visible={confirmDeletePet}
        onClose={() => (deleting ? undefined : setConfirmDeletePet(false))}
        title={`¿Eliminar a ${pet.nombre}?`}
      >
        <View style={{ gap: 16, paddingTop: 4 }}>
          <Text style={[t.body, { color: colors.inkSoft }]}>
            Se borra su ficha y todo su carnet sanitario. No se puede deshacer.
          </Text>
          <GhostButton
            label={deleting ? 'Eliminando…' : 'Sí, eliminar'}
            tone="danger"
            onPress={handleDeletePet}
            disabled={deleting}
            style={{ height: 52, borderRadius: radii.button }}
          />
          <GhostButton
            label="Cancelar"
            onPress={() => setConfirmDeletePet(false)}
            disabled={deleting}
            style={{ height: 52, borderRadius: radii.button, borderColor: colors.line }}
          />
        </View>
      </BottomSheet>

      {/* Detalle de dosis */}
      <BottomSheet
        visible={selectedRecord !== null}
        onClose={() => {
          setSelectedRecord(null);
          setConfirmingRecord(false);
        }}
        title={
          selectedRecord
            ? confirmingRecord
              ? '¿Eliminar esta dosis?'
              : selectedRecord.tratamiento_nombre
            : undefined
        }
      >
        {selectedRecord ? (
          confirmingRecord ? (
            <View style={{ gap: 16, paddingTop: 4 }}>
              <Text style={[t.body, { color: colors.inkSoft }]}>
                {selectedRecord.tratamiento_nombre}, aplicada el{' '}
                {formatDateLong(selectedRecord.fecha_aplicacion)}. Se quita del carnet de {pet.nombre}.
              </Text>
              <GhostButton
                label={deletingRecordId === selectedRecord.id ? 'Eliminando…' : 'Sí, eliminar'}
                tone="danger"
                onPress={() => handleDeleteTreatment(selectedRecord)}
                disabled={deletingRecordId === selectedRecord.id}
                style={{ height: 52, borderRadius: radii.button }}
              />
              <GhostButton
                label="Cancelar"
                onPress={() => setConfirmingRecord(false)}
                style={{ height: 52, borderRadius: radii.button, borderColor: colors.line }}
              />
            </View>
          ) : (
            <View style={{ gap: 14, paddingTop: 4 }}>
              <DetailLine label="Aplicada" value={formatDateLong(selectedRecord.fecha_aplicacion)} />
              {selectedRecord.fecha_proximo_refuerzo ? (
                <DetailLine
                  label="Próximo refuerzo"
                  value={formatDateLong(selectedRecord.fecha_proximo_refuerzo)}
                />
              ) : null}
              {selectedRecord.veterinaria_nombre ? (
                <DetailLine label="Clínica" value={selectedRecord.veterinaria_nombre} />
              ) : null}
              {selectedRecord.lote_producto ? (
                <DetailLine label="Lote o marca" value={selectedRecord.lote_producto} />
              ) : null}
              {selectedRecord.notas ? <DetailLine label="Notas" value={selectedRecord.notas} /> : null}
              {canAddToCalendar ? (
                <View style={{ gap: 10, paddingTop: 6 }}>
                  <PrimaryButton
                    label="Agregar al calendario"
                    onPress={() => handleAddToCalendar(selectedRecord)}
                    loading={addingToCalendar}
                    icon={<IconCalendar color={colors.onTeal} size={20} />}
                    style={{ height: 52, borderRadius: radii.button }}
                  />
                  {calendarFeedback?.type === 'err' ? (
                    <View style={{ gap: 4 }}>
                      <ErrorBox message={calendarFeedback.text} />
                      {calendarFeedback.needsSettings ? (
                        <TextButton label="Abrir ajustes" onPress={() => Linking.openSettings()} />
                      ) : null}
                    </View>
                  ) : null}
                  {calendarFeedback?.type === 'ok' ? (
                    <View accessibilityRole="alert" style={{ gap: 2 }}>
                      <Text style={[t.small, { fontFamily: fonts.textSemi, color: colors.teal }]}>
                        {calendarFeedback.text}
                      </Text>
                      {calendarFeedback.detail ? (
                        <Text numberOfLines={1} style={[t.tiny, { color: colors.inkSoft }]}>
                          {calendarFeedback.detail}
                        </Text>
                      ) : null}
                    </View>
                  ) : null}
                </View>
              ) : null}
              <View style={{ flexDirection: 'row', gap: 10, paddingTop: 6 }}>
                <GhostButton
                  label="Editar"
                  onPress={() => goToEditDose(selectedRecord)}
                  style={{ flex: 1, height: 52, borderRadius: radii.button }}
                />
                <GhostButton
                  label="Eliminar"
                  tone="danger"
                  onPress={() => setConfirmingRecord(true)}
                  style={{ flex: 1, height: 52, borderRadius: radii.button }}
                />
              </View>
            </View>
          )
        ) : null}
      </BottomSheet>
    </View>
  );
}

function DetailLine({ label, value }: { label: string; value: string }) {
  return (
    <View style={{ gap: 2 }}>
      <Text style={[t.tiny, { color: colors.inkSoft }]}>{label}</Text>
      <Text style={[t.body, { color: colors.ink }]}>{value}</Text>
    </View>
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
  errorWrap: {
    width: '100%',
    maxWidth: 420,
    gap: 16,
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
    paddingBottom: 60,
  },
  heroRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 18,
    paddingHorizontal: 20,
    paddingTop: 4,
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
  emptyRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  nextTop: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  nextBottom: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  card: {
    backgroundColor: colors.surface,
    borderRadius: radii.row,
    paddingVertical: 8,
    paddingHorizontal: 16,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: 8,
    paddingBottom: 4,
  },
  doseRow: {
    minHeight: 64,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 10,
    borderRadius: 14,
  },
  doseRowDivider: {
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: colors.divider,
  },
  tiles: {
    flexDirection: 'row',
    gap: 8,
  },
  linkRow: {
    minHeight: 60,
    backgroundColor: colors.surface,
    borderRadius: radii.row,
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  linkIcon: {
    width: 36,
    height: 36,
    borderRadius: 12,
    backgroundColor: colors.ball,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tutorRow: {
    minHeight: 64,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 10,
  },
  tutorDivider: {
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: colors.divider,
  },
  tutorAvatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.mint,
    alignItems: 'center',
    justifyContent: 'center',
  },
  inviteDivider: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: colors.divider,
    marginBottom: 8,
  },
  inviteRow: {
    flexDirection: 'row',
    gap: 8,
    alignItems: 'center',
    paddingBottom: 4,
  },
  inviteInput: {
    flex: 1,
    minHeight: 52,
    borderRadius: 16,
    borderWidth: 1.5,
    borderColor: colors.line,
    backgroundColor: colors.surface,
    paddingHorizontal: 14,
    fontFamily: fonts.text,
    fontSize: 15,
    color: colors.ink,
  },
});
