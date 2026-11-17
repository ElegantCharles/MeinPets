import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { DEFAULT_FILTERS, DISTANCE_OPTIONS, MapFilters } from '../../services/mapSearch';
import { colors, radii, type as t } from '../../theme';
import { BottomSheet } from '../BottomSheet';
import { PrimaryButton, TextButton } from '../Primitives';

export function MapFilterSheet({
  visible,
  onClose,
  filters,
  onChange,
  count,
  hasLocation,
}: {
  visible: boolean;
  onClose: () => void;
  filters: MapFilters;
  onChange: (next: MapFilters) => void;
  count: number;
  hasLocation: boolean;
}) {
  return (
    <BottomSheet visible={visible} onClose={onClose} title="Filtros">
      <View style={styles.body}>
        <View style={styles.section}>
          <Text style={[t.label, { color: colors.inkLabel }]}>Distancia máxima</Text>
          <View style={styles.chips}>
            {DISTANCE_OPTIONS.map((km) => {
              const selected = filters.maxKm === km;
              return (
                <Pressable
                  key={km}
                  disabled={!hasLocation}
                  onPress={() => onChange({ ...filters, maxKm: selected ? null : km })}
                  accessibilityRole="button"
                  accessibilityLabel={km === 1 ? '1 kilómetro' : `${km} kilómetros`}
                  accessibilityState={{ selected, disabled: !hasLocation }}
                  style={[
                    styles.chip,
                    selected && { backgroundColor: colors.ink, borderColor: colors.ink },
                    !hasLocation && { opacity: 0.5 },
                  ]}
                >
                  <Text style={[t.label, { color: selected ? colors.onTeal : colors.ink }]}>{km} km</Text>
                </Pressable>
              );
            })}
          </View>
          {!hasLocation ? (
            <Text style={[t.small, { color: colors.inkSoft }]}>
              Toca el botón de ubicación del mapa para filtrar por distancia.
            </Text>
          ) : null}
        </View>

        <Pressable
          onPress={() => onChange({ ...filters, onlyOpen: !filters.onlyOpen })}
          accessibilityRole="switch"
          accessibilityLabel="Solo abiertos ahora"
          accessibilityState={{ checked: filters.onlyOpen }}
          aria-checked={filters.onlyOpen}
          style={styles.switchRow}
        >
          <View style={{ flex: 1, gap: 2 }}>
            <Text style={[t.rowTitle, { color: colors.ink }]}>Solo abiertos ahora</Text>
            <Text style={[t.small, { color: colors.inkSoft }]}>
              Los lugares sin horario informado no aparecen.
            </Text>
          </View>
          <View
            style={[styles.track, { backgroundColor: filters.onlyOpen ? colors.teal : colors.inkSoft }]}
          >
            <View style={[styles.knob, filters.onlyOpen ? styles.knobOn : styles.knobOff]} />
          </View>
        </Pressable>

        <PrimaryButton
          label={count === 0 ? 'Sin lugares con estos filtros' : count === 1 ? 'Ver 1 lugar' : `Ver ${count} lugares`}
          onPress={onClose}
          disabled={count === 0}
        />
        <TextButton
          label="Limpiar filtros"
          onPress={() => onChange({ ...DEFAULT_FILTERS })}
          style={{ alignSelf: 'center' }}
        />
      </View>
    </BottomSheet>
  );
}

const styles = StyleSheet.create({
  body: {
    gap: 20,
    paddingTop: 8,
  },
  section: {
    gap: 10,
  },
  chips: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  chip: {
    height: 44,
    paddingHorizontal: 18,
    borderRadius: radii.chip,
    borderWidth: 1.5,
    borderColor: colors.line,
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  switchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    minHeight: 56,
  },
  track: {
    width: 52,
    height: 32,
    borderRadius: radii.round,
    justifyContent: 'center',
    paddingHorizontal: 4,
  },
  knob: {
    width: 24,
    height: 24,
    borderRadius: radii.round,
    backgroundColor: colors.surface,
  },
  knobOn: {
    alignSelf: 'flex-end',
  },
  knobOff: {
    alignSelf: 'flex-start',
  },
});
