import type { ExpressionSpecification, LayerSpecification } from '@maplibre/maplibre-gl-style-spec';
import { colors, mapTint, pinHalo } from '../../theme';

export interface MapPoint {
  latitude: number;
  longitude: number;
}

export type PinKey = 'veterinaria' | 'urgencia' | 'tienda' | 'farmacia';

export interface MapMarker extends MapPoint {
  id: number;
  pin: PinKey;
  alert: boolean;
}

export type MapCamera =
  | { kind: 'bounds'; bounds: [number, number, number, number]; key: number }
  | { kind: 'center'; center: MapPoint; zoom: number; key: number };

export interface MapInsets {
  top: number;
  bottom: number;
}

export interface MapCanvasProps {
  markers: MapMarker[];
  selectedId: number | null;
  userLocation: MapPoint | null;
  route: [MapPoint, MapPoint] | null;
  camera: MapCamera;
  insets: MapInsets;
  onSelect: (id: number) => void;
  onLoadError: () => void;
}

export const PLACES_SOURCE = 'places';
export const USER_SOURCE = 'user';
export const ROUTE_SOURCE = 'route';
export const PLACES_PIN_LAYER = 'places-pin';

export const PIN_OFFSET_Y = 14;
export const PIN_SELECTED_SCALE = 1.27;
const HALO_SELECTED_RADIUS = 28;
const HALO_ALERT_RADIUS = 30;

const SELECTED: ExpressionSpecification = ['==', ['get', 'selected'], 1];

export const routeLayer: LayerSpecification = {
  id: 'route-line',
  type: 'line',
  source: ROUTE_SOURCE,
  layout: { 'line-cap': 'round', 'line-join': 'round' },
  paint: { 'line-color': colors.teal, 'line-width': 3, 'line-dasharray': [0.4, 2.6] },
};

export const placesHaloLayer: LayerSpecification = {
  id: 'places-halo',
  type: 'circle',
  source: PLACES_SOURCE,
  filter: ['!=', ['get', 'halo'], ''],
  paint: { 'circle-radius': ['get', 'haloRadius'], 'circle-color': ['get', 'halo'] },
};

export const placesPinLayer: LayerSpecification = {
  id: PLACES_PIN_LAYER,
  type: 'symbol',
  source: PLACES_SOURCE,
  layout: {
    'icon-image': ['get', 'image'],
    'icon-size': ['case', SELECTED, PIN_SELECTED_SCALE, 1],
    'icon-anchor': 'bottom',
    'icon-offset': [0, PIN_OFFSET_Y],
    'icon-allow-overlap': true,
    'icon-ignore-placement': true,
    'symbol-sort-key': ['get', 'sort'],
  },
};

export const userHaloLayer: LayerSpecification = {
  id: 'user-halo',
  type: 'circle',
  source: USER_SOURCE,
  paint: { 'circle-radius': 36, 'circle-color': mapTint.accuracy },
};

export const userDotLayer: LayerSpecification = {
  id: 'user-dot',
  type: 'circle',
  source: USER_SOURCE,
  paint: {
    'circle-radius': 7,
    'circle-color': colors.ball,
    'circle-stroke-color': colors.ballInk,
    'circle-stroke-width': 3,
  },
};

export function markersToGeoJson(
  markers: MapMarker[],
  selectedId: number | null
): GeoJSON.FeatureCollection<GeoJSON.Point> {
  return {
    type: 'FeatureCollection',
    features: markers.map((marker) => {
      const selected = marker.id === selectedId;
      const halo = selected ? pinHalo[marker.pin] : marker.alert ? pinHalo.urgenciaIdle : '';
      return {
        type: 'Feature',
        geometry: { type: 'Point', coordinates: [marker.longitude, marker.latitude] },
        properties: {
          id: marker.id,
          image: `pin-${marker.pin}`,
          selected: selected ? 1 : 0,
          sort: selected ? 1 : 0,
          halo,
          haloRadius: selected ? HALO_SELECTED_RADIUS : HALO_ALERT_RADIUS,
        },
      };
    }),
  };
}

export function pointToGeoJson(point: MapPoint | null): GeoJSON.FeatureCollection<GeoJSON.Point> {
  return {
    type: 'FeatureCollection',
    features: point
      ? [
          {
            type: 'Feature',
            geometry: { type: 'Point', coordinates: [point.longitude, point.latitude] },
            properties: {},
          },
        ]
      : [],
  };
}

export function routeToGeoJson(route: [MapPoint, MapPoint] | null): GeoJSON.FeatureCollection<GeoJSON.LineString> {
  return {
    type: 'FeatureCollection',
    features: route
      ? [
          {
            type: 'Feature',
            geometry: {
              type: 'LineString',
              coordinates: route.map((point) => [point.longitude, point.latitude]),
            },
            properties: {},
          },
        ]
      : [],
  };
}

export function cameraPadding(insets: MapInsets, margin = 40) {
  return {
    top: insets.top + margin,
    bottom: insets.bottom + margin,
    left: margin,
    right: margin,
  };
}
