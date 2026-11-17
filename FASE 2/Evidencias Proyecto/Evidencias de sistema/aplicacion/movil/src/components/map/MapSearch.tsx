import React, { useMemo, useState } from 'react';
import { FlatList, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { COMUNAS, matchesQuery } from '../../services/mapSearch';
import { Place } from '../../services/places';
import { colors, radii, type as t } from '../../theme';
import { IconBack, IconClose, IconSearch } from '../Icons';
import { IconButton } from '../Primitives';
import { StateView } from '../StateView';
import { PlaceListRow } from './PlaceListRow';

function ComunaChips({ onPick }: { onPick: (comuna: string) => void }) {
  return (
    <View style={styles.comunas}>
      <Text style={[t.label, { color: colors.inkLabel }]}>Busca por comuna</Text>
      <View style={styles.chips}>
        {COMUNAS.map((comuna) => (
          <Pressable
            key={comuna}
            onPress={() => onPick(comuna)}
            accessibilityRole="button"
            accessibilityLabel={comuna}
            style={({ pressed }) => [styles.chip, pressed && { opacity: 0.8 }]}
          >
            <Text style={[t.label, { color: colors.ink }]}>{comuna}</Text>
          </Pressable>
        ))}
      </View>
    </View>
  );
}

export function MapSearch({
  places,
  kmFor,
  onClose,
  onPick,
}: {
  places: Place[];
  kmFor: (place: Place) => number | null;
  onClose: () => void;
  onPick: (place: Place) => void;
}) {
  const insets = useSafeAreaInsets();
  const [query, setQuery] = useState('');
  const typed = query.trim().length > 0;

  const results = useMemo(() => {
    if (!typed) return [];
    return places
      .filter((place) => matchesQuery(place, query))
      .map((place) => ({ place, km: kmFor(place) }))
      .sort((a, b) => {
        if (a.km !== null && b.km !== null) return a.km - b.km;
        return a.place.nombre.localeCompare(b.place.nombre);
      })
      .slice(0, 30);
  }, [places, query, typed, kmFor]);

  return (
    <View style={[styles.root, { paddingTop: insets.top + 8 }]}>
      <View style={styles.header}>
        <IconButton label="Volver al mapa" onPress={onClose} ring>
          <IconBack color={colors.ink} />
        </IconButton>
        <View style={styles.field}>
          <View style={styles.searchIcon} pointerEvents="none">
            <IconSearch size={22} color={colors.inkSoft} />
          </View>
          <TextInput
            autoFocus
            value={query}
            onChangeText={setQuery}
            placeholder="Lugar o comuna"
            placeholderTextColor={colors.placeholder}
            accessibilityLabel="Buscar lugar o comuna"
            returnKeyType="search"
            autoCorrect={false}
            style={styles.input}
          />
          {typed ? (
            <Pressable
              onPress={() => setQuery('')}
              accessibilityRole="button"
              accessibilityLabel="Borrar búsqueda"
              style={styles.clear}
            >
              <IconClose size={20} color={colors.inkSoft} />
            </Pressable>
          ) : null}
        </View>
      </View>

      {!typed ? (
        <View style={styles.content}>
          <ComunaChips onPick={setQuery} />
        </View>
      ) : results.length > 0 ? (
        <FlatList
          data={results}
          keyExtractor={(item) => String(item.place.id)}
          keyboardShouldPersistTaps="handled"
          contentContainerStyle={styles.list}
          ItemSeparatorComponent={() => <View style={{ height: 8 }} />}
          renderItem={({ item }) => (
            <PlaceListRow place={item.place} km={item.km} onPress={() => onPick(item.place)} />
          )}
        />
      ) : (
        <View style={styles.content}>
          <StateView
            pose="buscando"
            size={150}
            title="No encontramos ese lugar"
            message="Revisa cómo está escrito o busca por comuna."
            style={{ paddingTop: 16 }}
          />
          <ComunaChips onPick={setQuery} />
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: colors.ground,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingHorizontal: 16,
    paddingBottom: 12,
  },
  field: {
    flex: 1,
    minWidth: 0,
    justifyContent: 'center',
  },
  searchIcon: {
    position: 'absolute',
    left: 16,
    zIndex: 1,
  },
  input: {
    height: 52,
    borderRadius: radii.field,
    borderWidth: 1.5,
    borderColor: colors.line,
    backgroundColor: colors.surface,
    paddingLeft: 48,
    paddingRight: 48,
    ...t.body,
    color: colors.ink,
  },
  clear: {
    position: 'absolute',
    right: 4,
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
  content: {
    paddingHorizontal: 20,
    paddingTop: 8,
    gap: 20,
  },
  comunas: {
    gap: 8,
  },
  chips: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  chip: {
    height: 44,
    paddingHorizontal: 16,
    borderRadius: radii.chip,
    borderWidth: 1.5,
    borderColor: colors.line,
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  list: {
    paddingHorizontal: 16,
    paddingTop: 4,
    paddingBottom: 32,
  },
});
