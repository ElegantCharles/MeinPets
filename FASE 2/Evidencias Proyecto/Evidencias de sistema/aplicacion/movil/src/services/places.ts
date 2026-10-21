import { API_CONFIG } from '../config/api';
import { MAP_CONFIG } from '../config/map';
import { REGION_VALPARAISO_RING } from '../config/region';
import type { PlaceCategoryKey } from '../theme';
import { request } from './http';

export type PlaceCategory = PlaceCategoryKey;

export interface Place {
  id: number;
  nombre: string;
  categoria: PlaceCategory;
  direccion: string;
  telefono: string | null;
  horario: string | null;
  latitud: number;
  longitud: number;
}

export interface PlaceCategoryInfo {
  key: PlaceCategory;
  chip: string;
  label: string;
  glyph: string;
}

export const PLACE_CATEGORIES: PlaceCategoryInfo[] = [
  { key: 'veterinaria', chip: 'Veterinarias', label: 'Veterinaria', glyph: 'V' },
  { key: 'urgencia_24h', chip: '24 h', label: 'Urgencia 24 h', glyph: '24' },
  { key: 'pet_shop', chip: 'Tiendas', label: 'Tienda de mascotas', glyph: 'T' },
  { key: 'farmacia_veterinaria', chip: 'Farmacias', label: 'Farmacia veterinaria', glyph: 'F' },
];

interface PlaceRow {
  id: number;
  nombre: string;
  categoria: string;
  direccion: string;
  telefono: string | null;
  horario: string | null;
  latitud: number | string;
  longitud: number | string;
}

const { LOCATIONS } = API_CONFIG.ENDPOINTS.MAP;

export function normalizePlaceCategory(raw: string): PlaceCategory | null {
  const value = (raw ?? '').toLowerCase();
  const found = PLACE_CATEGORIES.find((item) => item.key === value);
  return found ? found.key : null;
}

export function placeCategoryInfo(key: PlaceCategory): PlaceCategoryInfo {
  return PLACE_CATEGORIES.find((item) => item.key === key) ?? PLACE_CATEGORIES[0];
}

function mapPlaceRow(row: PlaceRow): Place | null {
  const categoria = normalizePlaceCategory(row.categoria);
  const latitud = Number(row.latitud);
  const longitud = Number(row.longitud);
  if (!categoria || !Number.isFinite(latitud) || !Number.isFinite(longitud)) {
    return null;
  }
  return {
    id: row.id,
    nombre: row.nombre,
    categoria,
    direccion: row.direccion,
    telefono: row.telefono?.trim() || null,
    horario: row.horario?.trim() || null,
    latitud,
    longitud,
  };
}

export async function fetchPlaces(): Promise<Place[]> {
  const { locations } = await request<{ locations: PlaceRow[] }>(LOCATIONS, {
    auth: false,
    fallbackError: 'No se pudieron cargar los lugares. Intenta de nuevo.',
  });
  if (!Array.isArray(locations)) {
    throw new Error('No se pudieron cargar los lugares. Intenta de nuevo.');
  }
  return locations.map(mapPlaceRow).filter((place): place is Place => place !== null);
}

export function isInRegion(place: { latitud: number; longitud: number }): boolean {
  const [west, south, east, north] = MAP_CONFIG.REGION_BOUNDS;
  if (place.longitud < west || place.longitud > east || place.latitud < south || place.latitud > north) {
    return false;
  }
  let inside = false;
  for (let i = 0, j = REGION_VALPARAISO_RING.length - 1; i < REGION_VALPARAISO_RING.length; j = i, i += 1) {
    const [xi, yi] = REGION_VALPARAISO_RING[i];
    const [xj, yj] = REGION_VALPARAISO_RING[j];
    if (yi > place.latitud !== yj > place.latitud) {
      const crossing = ((xj - xi) * (place.latitud - yi)) / (yj - yi) + xi;
      if (place.longitud < crossing) inside = !inside;
    }
  }
  return inside;
}

export function googleMapsDirectionsUrl(place: { latitud: number; longitud: number }): string {
  return `https://www.google.com/maps/dir/?api=1&destination=${place.latitud},${place.longitud}`;
}

export interface OpenStatus {
  open: boolean;
  text: string;
}

function clock(minutes: number): string {
  const hh = String(Math.floor(minutes / 60) % 24).padStart(2, '0');
  const mm = String(minutes % 60).padStart(2, '0');
  return `${hh}:${mm}`;
}

export function openStatus(horario: string | null, now: Date = new Date()): OpenStatus | null {
  if (!horario) return null;
  const raw = horario.trim().toLowerCase();
  if (/^24\s*(h|horas?)/.test(raw)) return { open: true, text: 'Abierto 24 h' };
  const match = raw.match(/^(\d{1,2}):(\d{2})\s*[-–]\s*(\d{1,2}):(\d{2})$/);
  if (!match) return null;
  const opens = Number(match[1]) * 60 + Number(match[2]);
  const closes = Number(match[3]) * 60 + Number(match[4]);
  const minutes = now.getHours() * 60 + now.getMinutes();
  const isOpen =
    closes > opens ? minutes >= opens && minutes < closes : minutes >= opens || minutes < closes;
  return isOpen
    ? { open: true, text: `Abierto · ${clock(closes)}` }
    : { open: false, text: `Cerrado · abre ${clock(opens)}` };
}

export function walkingMinutes(km: number): number | null {
  if (km > 3) return null;
  return Math.max(1, Math.round((km * 1000) / 75));
}

export function distanceKm(
  a: { latitude: number; longitude: number },
  b: { latitude: number; longitude: number }
): number {
  const toRad = (deg: number) => (deg * Math.PI) / 180;
  const earthKm = 6371;
  const dLat = toRad(b.latitude - a.latitude);
  const dLng = toRad(b.longitude - a.longitude);
  const h =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(a.latitude)) * Math.cos(toRad(b.latitude)) * Math.sin(dLng / 2) ** 2;
  return 2 * earthKm * Math.asin(Math.sqrt(h));
}

export function formatDistance(km: number): string {
  if (km < 1) {
    return `${Math.max(10, Math.round((km * 1000) / 10) * 10)} m`;
  }
  return `${km.toFixed(1).replace('.', ',')} km`;
}
