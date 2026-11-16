import { MEINPETS_MAP_STYLE } from './mapStyle';

export const MAP_CONFIG = {
  STYLE: process.env.EXPO_PUBLIC_MAP_STYLE_URL ?? MEINPETS_MAP_STYLE,
  REGION_BOUNDS: [-71.85, -33.96, -69.98, -32.02] as [number, number, number, number],
  DEFAULT_CENTER: { latitude: -33.0472, longitude: -71.6127 },
  DEFAULT_ZOOM: 10,
  PLACE_ZOOM: 15,
  USER_ZOOM: 14,
  MAX_ZOOM: 17,
  FIT_PADDING: 56,
  LOCATION_TIMEOUT_MS: 15000,
  COPYRIGHT_URL: 'https://www.openstreetmap.org/copyright',
  ATTRIBUTION: '© OpenStreetMap contributors · © OpenMapTiles · OpenFreeMap',
};
