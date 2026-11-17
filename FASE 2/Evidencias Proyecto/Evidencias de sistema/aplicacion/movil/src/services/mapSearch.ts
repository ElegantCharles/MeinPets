import { Place, PlaceCategory, openStatus, placeCategoryInfo } from './places';

export const COMUNAS = ['Valparaíso', 'Viña del Mar', 'Concón', 'Quilpué', 'Villa Alemana'];

export const DISTANCE_OPTIONS = [1, 3, 5, 10];

export interface MapFilters {
  category: PlaceCategory | 'all';
  maxKm: number | null;
  onlyOpen: boolean;
}

export const DEFAULT_FILTERS: MapFilters = { category: 'all', maxKm: null, onlyOpen: false };

export function normalizeText(value: string): string {
  return value
    .normalize('NFD')
    .replace(new RegExp(`[${String.fromCharCode(0x300)}-${String.fromCharCode(0x36f)}]`, 'g'), '')
    .toLowerCase()
    .trim();
}

export function matchesQuery(place: Place, query: string): boolean {
  const tokens = normalizeText(query).split(/\s+/).filter(Boolean);
  if (tokens.length === 0) return true;
  const haystack = normalizeText(
    `${place.nombre} ${place.direccion} ${placeCategoryInfo(place.categoria).label}`
  );
  return tokens.every((token) => haystack.includes(token));
}

export function applyFilters<T extends { place: Place; km: number | null }>(
  items: T[],
  filters: MapFilters
): T[] {
  return items.filter(({ place, km }) => {
    if (filters.category !== 'all' && place.categoria !== filters.category) return false;
    if (filters.maxKm !== null && km !== null && km > filters.maxKm) return false;
    if (filters.onlyOpen && openStatus(place.horario)?.open !== true) return false;
    return true;
  });
}

export function extraFilterCount(filters: MapFilters): number {
  return (filters.maxKm !== null ? 1 : 0) + (filters.onlyOpen ? 1 : 0);
}
