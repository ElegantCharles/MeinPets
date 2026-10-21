import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Linking,
  NativeScrollEvent,
  NativeSyntheticEvent,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
  useWindowDimensions,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import type { MapScreenProps } from '../navigation/types';
import { MAP_CONFIG } from '../config/map';
import {
  PLACE_CATEGORIES,
  Place,
  PlaceCategory,
  distanceKm,
  fetchPlaces,
  formatDistance,
  googleMapsDirectionsUrl,
  isInRegion,
  openStatus,
  placeCategoryInfo,
  walkingMinutes,
} from '../services/places';
import { getUserLocation } from '../services/location';
import {
  BottomSheet,
  Chip,
  DetailLine,
  ErrorBox,
  GhostButton,
  IconBag,
  IconClock,
  IconCross,
  IconGrid,
  IconLocate,
  IconMapPin,
  IconNavigation,
  IconPaw,
  IconPhone,
  MapCamera,
  MapCanvas,
  MapMarker,
  MapPoint,
  PrimaryButton,
  TextButton,
  TopBar,
} from '../components';
import {
  colors,
  fabShadow,
  openNow,
  placeStyle,
  radii,
  sheetShadow,
  type as t,
} from '../theme';

type Filter = PlaceCategory | 'all';
type Bounds = [number, number, number, number];

const NEAR_KM = 3;
const CARD_GAP = 12;
const SIDE = 16;
const SHEET_BODY = 172;

const PIN_BY_CATEGORY: Record<PlaceCategory, MapMarker['pin']> = {
  veterinaria: 'veterinaria',
  urgencia_24h: 'urgencia',
  pet_shop: 'tienda',
  farmacia_veterinaria: 'farmacia',
};

const FILTER_ICONS: Record<PlaceCategory, { icon: (color: string) => React.ReactNode; color: string }> = {
  veterinaria: { icon: (c) => <IconPaw size={18} color={c} />, color: colors.teal },
  urgencia_24h: { icon: (c) => <IconClock size={18} color={c} />, color: colors.danger },
  pet_shop: { icon: (c) => <IconBag size={18} color={c} />, color: colors.inkLabel },
  farmacia_veterinaria: { icon: (c) => <IconCross size={18} color={c} />, color: colors.tealPressed },
};

function boundsOf(points: MapPoint[]): Bounds {
  const lngs = points.map((p) => p.longitude);
  const lats = points.map((p) => p.latitude);
  let west = Math.min(...lngs);
  let east = Math.max(...lngs);
  let south = Math.min(...lats);
  let north = Math.max(...lats);
  if (west === east) {
    west -= 0.01;
    east += 0.01;
  }
  if (south === north) {
    south -= 0.01;
    north += 0.01;
  }
  return [west, south, east, north];
}

function placePoint(place: Place): MapPoint {
  return { latitude: place.latitud, longitude: place.longitud };
}

function PlaceGlyph({ category }: { category: PlaceCategory }) {
  const style = placeStyle[category];
  return (
    <View style={[styles.glyph, { backgroundColor: style.bg }]}>
      {category === 'urgencia_24h' ? (
        <Text style={[t.distance, { color: style.fg }]}>24</Text>
      ) : category === 'pet_shop' ? (
        <IconBag size={26} color={style.fg} />
      ) : category === 'farmacia_veterinaria' ? (
        <IconCross size={28} color={style.fg} />
      ) : (
        <IconPaw size={28} color={style.fg} />
      )}
    </View>
  );
}

function PlaceCard({
  place,
  selected,
  width,
  km,
  showCall,
  onPress,
  onDirections,
  onCall,
}: {
  place: Place;
  selected: boolean;
  width: number;
  km: number | null;
  showCall: boolean;
  onPress: () => void;
  onDirections: () => void;
  onCall: () => void;
}) {
  const accent = placeStyle[place.categoria].bg;
  const status = openStatus(place.horario);
  const minutes = km !== null ? walkingMinutes(km) : null;

  return (
    <View style={[styles.card, { width, borderColor: selected ? accent : 'transparent' }]}>
      <Pressable
        onPress={onPress}
        accessibilityRole="button"
        accessibilityLabel={`${place.nombre}, ${placeCategoryInfo(place.categoria).label}${
          status ? `, ${status.text}` : ''
        }${km !== null ? `, a ${formatDistance(km)}` : ''}. Ver detalle`}
        accessibilityState={{ selected }}
        style={styles.cardTop}
      >
        <PlaceGlyph category={place.categoria} />
        <View style={styles.cardText}>
          <Text numberOfLines={1} style={[t.placeName, { color: colors.ink }]}>
            {place.nombre}
          </Text>
          <View style={styles.statusRow}>
            {status ? (
              <>
                <View
                  style={[styles.dot, { backgroundColor: status.open ? openNow : colors.danger }]}
                />
                <Text numberOfLines={1} style={[t.small, { color: colors.inkSoft }]}>
                  {status.text}
                </Text>
              </>
            ) : (
              <Text numberOfLines={1} style={[t.small, { color: colors.inkSoft }]}>
                {placeCategoryInfo(place.categoria).label}
              </Text>
            )}
          </View>
        </View>
        {km !== null ? (
          <View style={styles.cardDistance}>
            <Text style={[t.distance, { color: accent }]}>{formatDistance(km)}</Text>
            {minutes !== null ? (
              <Text style={[t.small, { color: colors.inkSoft }]}>{minutes} min</Text>
            ) : null}
          </View>
        ) : null}
      </Pressable>
      <View style={styles.cardButtons}>
        <Pressable
          onPress={onDirections}
          accessibilityRole="button"
          accessibilityLabel={`Cómo llegar a ${place.nombre}`}
          style={({ pressed }) => [
            styles.directions,
            { backgroundColor: accent },
            pressed && { opacity: 0.85 },
          ]}
        >
          <IconNavigation size={18} color={colors.onTeal} />
          <Text style={[t.bodySemi, { color: colors.onTeal }]}>Cómo llegar</Text>
        </Pressable>
        {showCall ? (
          <Pressable
            onPress={onCall}
            accessibilityRole="button"
            accessibilityLabel={`Llamar a ${place.nombre}`}
            style={({ pressed }) => [styles.call, pressed && { opacity: 0.7 }]}
          >
            <IconPhone size={20} color={colors.ink} />
          </Pressable>
        ) : null}
      </View>
    </View>
  );
}

export default function MapScreen({ navigation }: MapScreenProps) {
  const insets = useSafeAreaInsets();
  const { width: windowWidth } = useWindowDimensions();
  const isWeb = Platform.OS === 'web';
  const columnWidth = Math.min(windowWidth, 480);
  const cardWidth = Math.min(318, columnWidth - 72);
  const interval = cardWidth + CARD_GAP;
  const sheetBottom = Math.max(insets.bottom, 16) + 24;

  const [places, setPlaces] = useState<Place[]>([]);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [filter, setFilter] = useState<Filter>('all');
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [detailId, setDetailId] = useState<number | null>(null);

  const [userLocation, setUserLocation] = useState<MapPoint | null>(null);
  const [locating, setLocating] = useState(false);
  const [locationNote, setLocationNote] = useState<{ text: string; needsSettings: boolean } | null>(null);

  const [headerHeight, setHeaderHeight] = useState(0);
  const [sheetHeight, setSheetHeight] = useState(0);

  const cameraKey = useRef(0);
  const listRef = useRef<FlatList<{ place: Place; km: number | null; inRegion: boolean }>>(null);
  const [camera, setCamera] = useState<MapCamera>({
    kind: 'bounds',
    bounds: MAP_CONFIG.REGION_BOUNDS,
    key: 0,
  });
  const [mapFailed, setMapFailed] = useState(false);
  const [mapKey, setMapKey] = useState(0);

  const focusPoint = useCallback((center: MapPoint, zoom: number) => {
    cameraKey.current += 1;
    setCamera({ kind: 'center', center, zoom, key: cameraKey.current });
  }, []);

  const focusBounds = useCallback((bounds: Bounds) => {
    cameraKey.current += 1;
    setCamera({ kind: 'bounds', bounds, key: cameraKey.current });
  }, []);

  const loadPlaces = useCallback(async () => {
    setLoading(true);
    setErrorMessage(null);
    try {
      setPlaces(await fetchPlaces());
    } catch (error) {
      setErrorMessage(
        error instanceof Error ? error.message : 'No se pudieron cargar los lugares. Intenta de nuevo.'
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadPlaces();
  }, [loadPlaces]);

  const visible = useMemo(
    () => (filter === 'all' ? places : places.filter((place) => place.categoria === filter)),
    [places, filter]
  );

  const visibleInRegion = useMemo(() => visible.filter(isInRegion), [visible]);

  useEffect(() => {
    if (loading || errorMessage) return;
    if (visibleInRegion.length === 0) {
      focusBounds(MAP_CONFIG.REGION_BOUNDS);
    } else if (visibleInRegion.length === 1) {
      focusPoint(placePoint(visibleInRegion[0]), MAP_CONFIG.PLACE_ZOOM);
    } else {
      focusBounds(boundsOf(visibleInRegion.map(placePoint)));
    }
  }, [visibleInRegion, loading, errorMessage, focusPoint, focusBounds]);

  const carousel = useMemo(() => {
    const withKm = visible.map((place) => ({
      place,
      km: userLocation ? distanceKm(userLocation, placePoint(place)) : null,
      inRegion: isInRegion(place),
    }));
    return withKm.sort((a, b) => {
      if (a.km !== null && b.km !== null) return a.km - b.km;
      if (a.inRegion !== b.inRegion) return a.inRegion ? -1 : 1;
      return a.place.nombre.localeCompare(b.place.nombre);
    });
  }, [visible, userLocation]);

  const markers = useMemo<MapMarker[]>(
    () =>
      visible.map((place) => ({
        id: place.id,
        latitude: place.latitud,
        longitude: place.longitud,
        pin: PIN_BY_CATEGORY[place.categoria],
        alert: place.categoria === 'urgencia_24h',
      })),
    [visible]
  );

  const selectedPlace = useMemo(
    () => places.find((place) => place.id === selectedId) ?? null,
    [places, selectedId]
  );

  const route = useMemo<[MapPoint, MapPoint] | null>(
    () => (userLocation && selectedPlace ? [userLocation, placePoint(selectedPlace)] : null),
    [userLocation, selectedPlace]
  );

  const detailPlace = useMemo(
    () => places.find((place) => place.id === detailId) ?? null,
    [places, detailId]
  );
  const [shownPlace, setShownPlace] = useState<Place | null>(null);

  useEffect(() => {
    if (detailPlace) setShownPlace(detailPlace);
  }, [detailPlace]);

  const shownKm = userLocation && shownPlace ? distanceKm(userLocation, placePoint(shownPlace)) : null;

  const insetsForMap = useMemo(
    () => ({ top: headerHeight, bottom: carousel.length > 0 && !mapFailed ? sheetHeight : 0 }),
    [headerHeight, sheetHeight, carousel.length, mapFailed]
  );

  useEffect(() => {
    if (selectedId === null) return;
    const index = carousel.findIndex((item) => item.place.id === selectedId);
    if (index >= 0) {
      listRef.current?.scrollToOffset({ offset: index * interval, animated: true });
    }
  }, [selectedId, carousel, interval]);

  const goBack = () => {
    if (navigation.canGoBack()) {
      navigation.goBack();
    } else {
      navigation.navigate('Login');
    }
  };

  const selectPlace = useCallback(
    (id: number) => {
      const place = places.find((item) => item.id === id);
      setSelectedId(id);
      if (place) focusPoint(placePoint(place), MAP_CONFIG.PLACE_ZOOM);
    },
    [places, focusPoint]
  );

  const handleCarouselEnd = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    const index = Math.round(event.nativeEvent.contentOffset.x / interval);
    const item = carousel[Math.max(0, Math.min(index, carousel.length - 1))];
    if (item && item.place.id !== selectedId) selectPlace(item.place.id);
  };

  const handleLocate = async () => {
    setLocationNote(null);
    setLocating(true);
    const result = await getUserLocation();
    setLocating(false);

    if (result.status === 'ok') {
      const point = { latitude: result.latitude, longitude: result.longitude };
      setUserLocation(point);
      const closest = visible
        .map((place) => ({ place, km: distanceKm(point, placePoint(place)) }))
        .sort((a, b) => a.km - b.km)[0];
      if (closest) setSelectedId(closest.place.id);
      if (closest && closest.km > NEAR_KM) {
        focusBounds(boundsOf([point, placePoint(closest.place)]));
      } else {
        focusPoint(point, MAP_CONFIG.USER_ZOOM);
      }
      return;
    }

    if (result.status === 'denied') {
      if (isWeb) {
        setLocationNote({
          text: 'Tu navegador bloqueó la ubicación. Permítela desde el candado de la barra de direcciones.',
          needsSettings: false,
        });
      } else if (result.canAskAgain) {
        setLocationNote({
          text: 'Necesitamos tu ubicación para mostrarte lo que tienes cerca. Toca de nuevo y acepta el permiso.',
          needsSettings: false,
        });
      } else {
        setLocationNote({
          text: 'El permiso de ubicación está desactivado. Actívalo en los ajustes de tu teléfono.',
          needsSettings: true,
        });
      }
      return;
    }

    setLocationNote({
      text: 'No pudimos obtener tu ubicación. Revisa que el GPS esté encendido e intenta de nuevo.',
      needsSettings: false,
    });
  };

  const retryMap = () => {
    setMapFailed(false);
    setMapKey((value) => value + 1);
  };

  const callPlace = (place: Place) => {
    if (place.telefono) Linking.openURL(`tel:${place.telefono.replace(/[^\d+]/g, '')}`);
  };

  const noPlaces = !loading && !errorMessage && places.length === 0;
  const noRegionMatches =
    !loading && !errorMessage && places.length > 0 && visibleInRegion.length === 0;
  const hasSheet = carousel.length > 0 && !mapFailed;
  const bottomOffset = hasSheet ? sheetHeight : sheetBottom - 24;

  return (
    <View style={styles.screen}>
      <StatusBar style="dark" />
      <View style={styles.column}>
        <View style={StyleSheet.absoluteFill}>
          {mapFailed ? (
            <View style={styles.mapFailed}>
              <View style={styles.stateCard}>
                <View style={styles.stateIcon}>
                  <IconMapPin size={26} color={colors.teal} />
                </View>
                <Text style={[t.cardTitle, { color: colors.ink, textAlign: 'center' }]}>
                  No se pudo cargar el mapa
                </Text>
                <Text style={[t.small, { color: colors.inkSoft, textAlign: 'center' }]}>
                  Revisa tu conexión a internet e intenta de nuevo.
                </Text>
                <GhostButton label="Reintentar" onPress={retryMap} style={{ alignSelf: 'stretch' }} />
              </View>
            </View>
          ) : (
            <MapCanvas
              key={mapKey}
              markers={markers}
              selectedId={selectedId}
              userLocation={userLocation}
              route={route}
              camera={camera}
              insets={insetsForMap}
              onSelect={selectPlace}
              onLoadError={() => setMapFailed(true)}
            />
          )}
        </View>

        <View style={styles.header} onLayout={(e) => setHeaderHeight(e.nativeEvent.layout.height)}>
          <TopBar title="Mapa veterinario" onBack={goBack} ring />
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.chips}
          >
            <Chip
              label="Todos"
              selected={filter === 'all'}
              onPress={() => setFilter('all')}
              icon={(c) => <IconGrid size={18} color={c} />}
            />
            {PLACE_CATEGORIES.map((item) => (
              <Chip
                key={item.key}
                label={item.chip}
                selected={filter === item.key}
                onPress={() => setFilter(filter === item.key ? 'all' : item.key)}
                icon={FILTER_ICONS[item.key].icon}
                iconColor={FILTER_ICONS[item.key].color}
              />
            ))}
          </ScrollView>
        </View>

        {!mapFailed ? (
          <View style={[styles.overlayTop, { top: headerHeight + 12 }]}>
            {loading && places.length === 0 ? (
              <View style={styles.statusCard}>
                <ActivityIndicator color={colors.teal} />
                <Text style={[t.body, { color: colors.inkSoft }]}>Cargando lugares…</Text>
              </View>
            ) : null}

            {errorMessage ? (
              <View style={styles.statusCard}>
                <View style={{ flex: 1 }}>
                  <ErrorBox message={errorMessage} />
                </View>
                <TextButton label="Reintentar" onPress={loadPlaces} />
              </View>
            ) : null}

            {noPlaces ? (
              <View style={styles.statusCard}>
                <View style={{ flex: 1, gap: 2 }}>
                  <Text style={[t.rowTitle, { color: colors.ink }]}>Aún no hay lugares cargados</Text>
                  <Text style={[t.small, { color: colors.inkSoft }]}>
                    Cuando se agreguen clínicas y tiendas, aparecerán aquí.
                  </Text>
                </View>
                <TextButton label="Actualizar" onPress={loadPlaces} />
              </View>
            ) : null}

            {noRegionMatches ? (
              <View style={styles.statusCard}>
                <View style={{ flex: 1, gap: 2 }}>
                  <Text style={[t.rowTitle, { color: colors.ink }]}>
                    {filter === 'all'
                      ? 'Aún no hay lugares en la región'
                      : 'Sin lugares de este tipo en la región'}
                  </Text>
                  <Text style={[t.small, { color: colors.inkSoft }]}>
                    {filter === 'all'
                      ? 'Estamos cargando los de la Región de Valparaíso.'
                      : 'Prueba con otro tipo o mira todos.'}
                  </Text>
                </View>
                {filter === 'all' ? (
                  <TextButton label="Actualizar" onPress={loadPlaces} />
                ) : (
                  <TextButton label="Ver todos" onPress={() => setFilter('all')} />
                )}
              </View>
            ) : null}

            {locationNote ? (
              <View style={styles.noteCard}>
                <ErrorBox message={locationNote.text} />
                {locationNote.needsSettings ? (
                  <TextButton label="Abrir ajustes" onPress={() => Linking.openSettings()} />
                ) : null}
              </View>
            ) : null}
          </View>
        ) : null}

        {!mapFailed ? (
          <Pressable
            onPress={handleLocate}
            disabled={locating}
            accessibilityRole="button"
            accessibilityLabel="Ver lugares cerca de mí"
            style={({ pressed }) => [
              styles.fab,
              { bottom: bottomOffset + SIDE },
              pressed && { opacity: 0.85 },
            ]}
          >
            {locating ? (
              <ActivityIndicator color={colors.onTeal} />
            ) : (
              <IconLocate size={24} color={colors.onTeal} />
            )}
          </Pressable>
        ) : null}

        {!mapFailed ? (
          <Pressable
            onPress={() => Linking.openURL(MAP_CONFIG.COPYRIGHT_URL)}
            accessibilityRole="link"
            accessibilityLabel="Datos del mapa de OpenStreetMap. Abrir derechos de autor"
            style={[styles.attribution, { bottom: bottomOffset }]}
          >
            <View style={styles.attributionPill}>
              <Text style={[t.tiny, { color: colors.inkLabel }]}>{MAP_CONFIG.ATTRIBUTION}</Text>
            </View>
          </Pressable>
        ) : null}

        {hasSheet ? (
          <View
            style={[styles.sheet, { paddingBottom: sheetBottom }]}
            onLayout={(e) => setSheetHeight(e.nativeEvent.layout.height)}
          >
            <View style={styles.handle} />
            <FlatList
              ref={listRef}
              data={carousel}
              keyExtractor={(item) => String(item.place.id)}
              horizontal
              showsHorizontalScrollIndicator={false}
              snapToInterval={interval}
              snapToAlignment="start"
              decelerationRate="fast"
              contentContainerStyle={styles.carousel}
              ItemSeparatorComponent={() => <View style={{ width: CARD_GAP }} />}
              onMomentumScrollEnd={handleCarouselEnd}
              renderItem={({ item }) => (
                <PlaceCard
                  place={item.place}
                  selected={item.place.id === selectedId}
                  width={cardWidth}
                  km={item.km}
                  showCall={!isWeb && Boolean(item.place.telefono)}
                  onPress={() => {
                    setSelectedId(item.place.id);
                    setDetailId(item.place.id);
                  }}
                  onDirections={() => Linking.openURL(googleMapsDirectionsUrl(item.place))}
                  onCall={() => callPlace(item.place)}
                />
              )}
            />
          </View>
        ) : null}
      </View>

      <BottomSheet
        visible={detailPlace !== null}
        onClose={() => setDetailId(null)}
        title={shownPlace?.nombre}
      >
        {shownPlace ? (
          <View style={{ gap: 14, paddingTop: 4 }}>
            <DetailLine label="Tipo" value={placeCategoryInfo(shownPlace.categoria).label} />
            <DetailLine label="Dirección" value={shownPlace.direccion} />
            {shownPlace.telefono ? <DetailLine label="Teléfono" value={shownPlace.telefono} /> : null}
            {shownPlace.horario ? <DetailLine label="Horario" value={shownPlace.horario} /> : null}
            {shownKm !== null ? (
              <DetailLine label="Distancia" value={`A ${formatDistance(shownKm)} de ti`} />
            ) : null}
            <PrimaryButton
              label="Cómo llegar"
              onPress={() => Linking.openURL(googleMapsDirectionsUrl(shownPlace))}
              icon={<IconNavigation color={colors.onTeal} size={20} />}
              style={{ height: 52, borderRadius: radii.button }}
            />
            {shownPlace.telefono && !isWeb ? (
              <GhostButton
                label="Llamar"
                onPress={() => callPlace(shownPlace)}
                style={{ height: 52, borderRadius: radii.button }}
              />
            ) : null}
          </View>
        ) : null}
      </BottomSheet>
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
    backgroundColor: colors.ground,
    overflow: 'hidden',
  },
  header: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    paddingBottom: 14,
    backgroundColor: colors.ground,
  },
  chips: {
    paddingHorizontal: SIDE,
    paddingTop: 4,
    gap: 8,
  },
  mapFailed: {
    flex: 1,
    justifyContent: 'center',
    padding: 20,
    backgroundColor: colors.mint,
  },
  stateCard: {
    backgroundColor: colors.surface,
    borderRadius: radii.card,
    padding: 24,
    alignItems: 'center',
    gap: 8,
  },
  stateIcon: {
    width: 56,
    height: 56,
    borderRadius: radii.tile,
    backgroundColor: colors.mint,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 4,
  },
  overlayTop: {
    position: 'absolute',
    left: SIDE,
    right: SIDE,
    gap: 8,
    pointerEvents: 'box-none',
  },
  statusCard: {
    backgroundColor: colors.surface,
    borderRadius: radii.row,
    paddingVertical: 12,
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  noteCard: {
    backgroundColor: colors.surface,
    borderRadius: radii.row,
    padding: 12,
    gap: 4,
  },
  fab: {
    position: 'absolute',
    right: SIDE,
    width: 48,
    height: 48,
    borderRadius: radii.round,
    backgroundColor: colors.ink,
    alignItems: 'center',
    justifyContent: 'center',
    ...fabShadow,
  },
  attribution: {
    position: 'absolute',
    left: 0,
    right: 76,
    minHeight: 44,
    paddingHorizontal: 8,
    justifyContent: 'center',
  },
  attributionPill: {
    alignSelf: 'flex-start',
    minHeight: 24,
    paddingHorizontal: 8,
    justifyContent: 'center',
    borderRadius: radii.chip,
    backgroundColor: colors.surface,
  },
  sheet: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    minHeight: SHEET_BODY,
    backgroundColor: colors.surface,
    borderTopLeftRadius: radii.card,
    borderTopRightRadius: radii.card,
    ...sheetShadow,
  },
  handle: {
    width: 40,
    height: 4,
    borderRadius: radii.round,
    backgroundColor: colors.line,
    alignSelf: 'center',
    marginTop: 10,
    marginBottom: 12,
  },
  carousel: {
    paddingHorizontal: SIDE,
  },
  card: {
    borderRadius: radii.field,
    backgroundColor: colors.ground,
    borderWidth: 2,
    padding: 14,
    gap: 14,
  },
  cardTop: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  glyph: {
    width: 52,
    height: 52,
    borderRadius: radii.tile,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardText: {
    flex: 1,
    minWidth: 0,
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 4,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: radii.round,
  },
  cardDistance: {
    alignItems: 'flex-end',
    gap: 2,
  },
  cardButtons: {
    flexDirection: 'row',
    gap: 10,
  },
  directions: {
    flex: 1,
    height: 48,
    borderRadius: radii.round,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  call: {
    width: 48,
    height: 48,
    borderRadius: radii.round,
    borderWidth: 1,
    borderColor: colors.line,
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
