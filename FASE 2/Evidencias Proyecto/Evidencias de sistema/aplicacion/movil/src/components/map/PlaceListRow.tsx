import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Place, formatDistance, openStatus, placeCategoryInfo } from '../../services/places';
import { colors, openNow, placeStyle, radii, type as t } from '../../theme';
import { IconChevronRight } from '../Icons';

export function PlaceListRow({
  place,
  km,
  onPress,
}: {
  place: Place;
  km: number | null;
  onPress: () => void;
}) {
  const info = placeCategoryInfo(place.categoria);
  const status = openStatus(place.horario);
  const accent = placeStyle[place.categoria];
  const [value, unit] = km !== null ? formatDistance(km).split(' ') : ['', ''];

  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={`${place.nombre}, ${info.label}${status ? `, ${status.text}` : ''}${
        km !== null ? `, a ${formatDistance(km)}` : ''
      }. Ver detalle`}
      style={({ pressed }) => [styles.row, pressed && { backgroundColor: colors.mintSelected }]}
    >
      {km !== null ? (
        <View style={styles.distance}>
          <Text style={[t.distance, { color: accent.bg }]}>{value}</Text>
          <Text style={[t.small, { color: colors.inkSoft }]}>{unit}</Text>
        </View>
      ) : (
        <View style={[styles.glyph, { backgroundColor: accent.bg }]}>
          <Text style={[t.label, { color: accent.fg }]}>{info.glyph}</Text>
        </View>
      )}
      <View style={styles.text}>
        <Text numberOfLines={1} style={[t.placeName, { color: colors.ink }]}>
          {place.nombre}
        </Text>
        <View style={styles.statusRow}>
          {status ? (
            <View style={[styles.dot, { backgroundColor: status.open ? openNow : colors.danger }]} />
          ) : null}
          <Text numberOfLines={1} style={[t.small, { color: colors.inkSoft, flexShrink: 1 }]}>
            {status ? status.text : info.label}
          </Text>
        </View>
      </View>
      <IconChevronRight size={22} color={colors.inkSoft} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  row: {
    minHeight: 72,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: radii.row,
    backgroundColor: colors.surface,
  },
  distance: {
    width: 56,
    alignItems: 'flex-start',
  },
  glyph: {
    width: 44,
    height: 44,
    borderRadius: radii.item,
    alignItems: 'center',
    justifyContent: 'center',
  },
  text: {
    flex: 1,
    minWidth: 0,
    gap: 2,
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: radii.round,
  },
});
