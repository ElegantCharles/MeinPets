import React, { useCallback, useEffect, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import type { CalendarScreenProps } from '../navigation/types';
import { CalendarEventItem, fetchCalendar } from '../services/treatments';
import { useOnReconnect } from '../services/network';
import {
  Banner,
  CategoryIcon,
  ErrorState,
  IconCalendar,
  Skeleton,
  SkeletonGroup,
  SkeletonList,
  StateView,
  StatusPill,
  TextButton,
  TopBar,
} from '../components';
import {
  StatusKey,
  colors,
  fonts,
  formatDateLong,
  radii,
  status as statusColors,
  type as t,
} from '../theme';

type Filter = 'all' | 'vencido' | 'proximo' | 'al_dia';

function toKey(estado: string): StatusKey {
  return estado === 'vencido' || estado === 'proximo' || estado === 'al_dia' ? estado : 'sin_fecha';
}

function eventLabel(ev: CalendarEventItem): string {
  const key = toKey(ev.estado);
  if (key === 'vencido') return `Vencido hace ${Math.abs(ev.dias_restantes)} d`;
  if (key === 'proximo') return ev.dias_restantes === 0 ? 'Vence hoy' : `En ${ev.dias_restantes} d`;
  return 'Al día';
}

export default function CalendarScreen({ navigation }: CalendarScreenProps) {
  const [events, setEvents] = useState<CalendarEventItem[]>([]);
  const [statusFilter, setStatusFilter] = useState<Filter>('all');
  const [loading, setLoading] = useState<boolean>(true);
  const [loadError, setLoadError] = useState<unknown>(null);

  const loadCalendar = useCallback(async () => {
    setLoading(true);
    setLoadError(null);
    try {
      const list = await fetchCalendar();
      setEvents(list);
    } catch (error) {
      setLoadError(error ?? new Error('No se pudo cargar el calendario.'));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadCalendar();
    const unsubscribe = navigation.addListener('focus', () => {
      loadCalendar();
    });
    return unsubscribe;
  }, [navigation, loadCalendar]);

  useOnReconnect(loadCalendar);

  const showSkeleton = loading && events.length === 0 && !loadError;
  const showError = Boolean(loadError) && events.length === 0;
  const showEmpty = !loading && !loadError && events.length === 0;

  const countVencidos = events.filter((e) => e.estado === 'vencido').length;
  const countProximos = events.filter((e) => e.estado === 'proximo').length;
  const countAlDia = events.filter((e) => e.estado === 'al_dia').length;

  const filteredEvents =
    statusFilter === 'all' ? events : events.filter((e) => e.estado === statusFilter);

  const summary: { key: Exclude<Filter, 'all'>; label: string; count: number }[] = [
    { key: 'vencido', label: 'Vencidos', count: countVencidos },
    { key: 'proximo', label: 'Próximos', count: countProximos },
    { key: 'al_dia', label: 'Al día', count: countAlDia },
  ];

  return (
    <View style={styles.screen}>
      <StatusBar style="dark" />
      <View style={styles.column}>
        <TopBar title="Calendario" />

        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {loadError && events.length > 0 ? (
            <Banner message="No pudimos actualizar el calendario." actionLabel="Reintentar" onAction={loadCalendar} />
          ) : null}

          {showSkeleton ? (
            <>
              <SkeletonGroup label="Cargando el calendario" style={styles.summaryRow}>
                {[0, 1, 2].map((index) => (
                  <Skeleton key={index} height={76} radius={radii.tile} style={{ flex: 1 }} />
                ))}
              </SkeletonGroup>
              <SkeletonList rows={4} label="Cargando refuerzos" boxed />
            </>
          ) : showError ? (
            <ErrorState
              error={loadError}
              title="No pudimos cargar el calendario"
              onRetry={loadCalendar}
              style={styles.stateTop}
            />
          ) : showEmpty ? (
            <StateView
              pose="calendario"
              title="Aún no hay refuerzos"
              message="Cuando registres una dosis, su próximo refuerzo aparecerá aquí."
              style={styles.stateTop}
            />
          ) : (
            <>
          <View style={styles.summaryRow}>
            {summary.map((s) => {
              const c = statusColors[s.key];
              const active = statusFilter === s.key;
              return (
                <Pressable
                  key={s.key}
                  onPress={() => setStatusFilter(active ? 'all' : s.key)}
                  accessibilityRole="button"
                  accessibilityLabel={`${s.label}: ${s.count}. ${active ? 'Quitar filtro' : 'Filtrar'}`}
                  accessibilityState={{ selected: active }}
                  style={({ pressed }) => [
                    styles.summaryTile,
                    { backgroundColor: c.bg, borderColor: active ? colors.ink : 'transparent' },
                    pressed && { opacity: 0.85 },
                  ]}
                >
                  <Text style={{ fontFamily: fonts.display, fontSize: 30, lineHeight: 34, color: c.fg }}>
                    {s.count}
                  </Text>
                  <Text style={{ fontFamily: fonts.textSemi, fontSize: 13, color: c.fg }}>{s.label}</Text>
                </Pressable>
              );
            })}
          </View>

          {statusFilter !== 'all' ? (
            <TextButton
              label={`Mostrar todos (${events.length})`}
              onPress={() => setStatusFilter('all')}
              style={{ alignSelf: 'flex-start', marginLeft: -8, marginTop: -8 }}
            />
          ) : null}

          {filteredEvents.length === 0 ? (
            <View style={styles.emptyBox}>
              <View style={styles.emptyIcon}>
                <IconCalendar size={26} color={colors.teal} />
              </View>
              <Text style={[t.cardTitle, { color: colors.ink, textAlign: 'center' }]}>
                Nada con este estado
              </Text>
              <Text style={[t.small, { color: colors.inkSoft, textAlign: 'center' }]}>
                Quita el filtro para ver el resto de tus recordatorios.
              </Text>
            </View>
          ) : (
            <View style={styles.listCard}>
              {filteredEvents.map((ev, index) => {
                const key = toKey(ev.estado);
                const label = eventLabel(ev);
                return (
                  <Pressable
                    key={ev.id}
                    onPress={() => navigation.navigate('PetDetail', { petId: ev.mascota_id })}
                    accessibilityRole="button"
                    accessibilityLabel={`${ev.tratamiento_nombre} de ${ev.mascota_nombre}, refuerzo ${formatDateLong(ev.fecha_proximo_refuerzo)}, ${label}. Ver ficha`}
                    style={({ pressed }) => [
                      styles.eventRow,
                      index > 0 && styles.eventDivider,
                      pressed && { backgroundColor: colors.mintSelected },
                    ]}
                  >
                    <CategoryIcon categoria={ev.tratamiento_categoria} size={40} />
                    <View style={{ flex: 1, gap: 2 }}>
                      <Text numberOfLines={1} style={[t.rowTitle, { color: colors.ink }]}>
                        {ev.tratamiento_nombre}
                      </Text>
                      <Text numberOfLines={1} style={[t.small, { color: colors.inkSoft }]}>
                        {ev.mascota_nombre} · {formatDateLong(ev.fecha_proximo_refuerzo)}
                      </Text>
                    </View>
                    <StatusPill status={key} label={label} />
                  </Pressable>
                );
              })}
            </View>
          )}
            </>
          )}
        </ScrollView>
      </View>
    </View>
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
    paddingBottom: 40,
    gap: 16,
  },
  summaryRow: {
    flexDirection: 'row',
    gap: 8,
  },
  stateTop: {
    paddingTop: 24,
  },
  summaryTile: {
    flex: 1,
    minHeight: 76,
    borderRadius: radii.tile,
    borderWidth: 2,
    paddingVertical: 10,
    paddingHorizontal: 12,
    justifyContent: 'center',
    gap: 2,
  },
  listCard: {
    backgroundColor: colors.surface,
    borderRadius: radii.row,
    paddingVertical: 4,
    paddingHorizontal: 16,
  },
  eventRow: {
    minHeight: 68,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 10,
    borderRadius: 14,
  },
  eventDivider: {
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: colors.divider,
  },
  emptyBox: {
    backgroundColor: colors.surface,
    borderRadius: radii.card,
    padding: 24,
    alignItems: 'center',
    gap: 8,
  },
  emptyIcon: {
    width: 56,
    height: 56,
    borderRadius: 18,
    backgroundColor: colors.mint,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 4,
  },
});
