import { API_CONFIG } from '../config/api';
import { addDaysIso, daysFromToday } from '../theme';
import { request } from './http';

export type TreatmentCategory =
  | 'vacuna'
  | 'desparasitacion_interna'
  | 'desparasitacion_externa';

export interface TreatmentCatalogItem {
  id: number;
  especie_id: number;
  categoria: TreatmentCategory;
  nombre: string;
  intervalo_refuerzo_dias: number | null;
  descripcion: string | null;
}

export interface PetTreatmentRecord {
  id: number;
  mascota_id: number;
  tratamiento_id: number;
  tratamiento_nombre: string;
  tratamiento_categoria: TreatmentCategory;
  intervalo_refuerzo_dias: number | null;
  fecha_aplicacion: string;
  fecha_proximo_refuerzo: string | null;
  lote_producto: string | null;
  veterinaria_nombre: string | null;
  notas: string | null;
  creado_en: string;
}

export interface CalendarEventItem {
  id: number;
  mascota_id: number;
  mascota_nombre: string;
  especie_nombre: string;
  tratamiento_id: number;
  tratamiento_nombre: string;
  tratamiento_categoria: TreatmentCategory;
  fecha_aplicacion: string;
  fecha_proximo_refuerzo: string;
  veterinaria_nombre: string | null;
  dias_restantes: number;
  estado: 'vencido' | 'proximo' | 'al_dia';
}

export interface TreatmentPayload {
  tratamiento_id: number;
  fecha_aplicacion: string;
  fecha_proximo_refuerzo?: string | null;
  lote_producto?: string | null;
  veterinaria_nombre?: string | null;
  notas?: string | null;
}

interface CatalogRow {
  id: number;
  especie_id: number;
  tipo: string;
  nombre: string;
  descripcion: string | null;
  dias_sugeridos_refuerzo: number | null;
}

interface RecordRow {
  id: number;
  mascota_id: number;
  tratamiento_id: number;
  tratamiento_nombre: string;
  tratamiento_tipo: string;
  dias_sugeridos_refuerzo: number | null;
  fecha_aplicacion: string;
  fecha_proximo_refuerzo: string | null;
  veterinario_nombre: string | null;
  clinica_nombre: string | null;
  observaciones: string | null;
  created_at: string;
}

interface ReminderRow {
  id: number;
  mascota_id: number;
  mascota_nombre: string;
  especie_nombre: string;
  tratamiento_id: number;
  tratamiento_nombre: string;
  tratamiento_tipo: string;
  fecha_aplicacion: string;
  fecha_proximo_refuerzo: string;
  clinica_nombre: string | null;
  estado_refuerzo: 'atrasado' | 'proximo' | 'vigente' | 'sin_refuerzo';
  dias_restantes: number | null;
}

const { CATALOG } = API_CONFIG.ENDPOINTS.TREATMENTS;
const { PETS, CALENDAR } = API_CONFIG.ENDPOINTS;

export function normalizeCategory(raw: string): TreatmentCategory {
  const c = (raw ?? '').toLowerCase();
  if (c.includes('vacuna')) return 'vacuna';
  if (c.includes('intern')) return 'desparasitacion_interna';
  return 'desparasitacion_externa';
}

function mapCatalogRow(row: CatalogRow): TreatmentCatalogItem {
  return {
    id: row.id,
    especie_id: row.especie_id,
    categoria: normalizeCategory(row.tipo),
    nombre: row.nombre,
    intervalo_refuerzo_dias: row.dias_sugeridos_refuerzo,
    descripcion: row.descripcion?.trim() || null,
  };
}

function mapRecordRow(row: RecordRow): PetTreatmentRecord {
  return {
    id: row.id,
    mascota_id: row.mascota_id,
    tratamiento_id: row.tratamiento_id,
    tratamiento_nombre: row.tratamiento_nombre,
    tratamiento_categoria: normalizeCategory(row.tratamiento_tipo),
    intervalo_refuerzo_dias: row.dias_sugeridos_refuerzo,
    fecha_aplicacion: row.fecha_aplicacion,
    fecha_proximo_refuerzo: row.fecha_proximo_refuerzo,
    lote_producto: row.veterinario_nombre,
    veterinaria_nombre: row.clinica_nombre,
    notas: row.observaciones,
    creado_en: row.created_at,
  };
}

function mapReminderRow(row: ReminderRow): CalendarEventItem {
  const estado =
    row.estado_refuerzo === 'atrasado'
      ? 'vencido'
      : row.estado_refuerzo === 'proximo'
      ? 'proximo'
      : 'al_dia';

  return {
    id: row.id,
    mascota_id: row.mascota_id,
    mascota_nombre: row.mascota_nombre,
    especie_nombre: row.especie_nombre,
    tratamiento_id: row.tratamiento_id,
    tratamiento_nombre: row.tratamiento_nombre,
    tratamiento_categoria: normalizeCategory(row.tratamiento_tipo),
    fecha_aplicacion: row.fecha_aplicacion,
    fecha_proximo_refuerzo: row.fecha_proximo_refuerzo,
    veterinaria_nombre: row.clinica_nombre,
    dias_restantes: row.dias_restantes ?? 0,
    estado,
  };
}

function toTreatmentBody(payload: TreatmentPayload) {
  return {
    tratamiento_id: payload.tratamiento_id,
    fecha_aplicacion: payload.fecha_aplicacion,
    fecha_proximo_refuerzo: payload.fecha_proximo_refuerzo ?? null,
    clinica_nombre: payload.veterinaria_nombre ?? null,
    veterinario_nombre: payload.lote_producto ?? null,
    observaciones: payload.notas ?? null,
  };
}

export async function fetchTreatmentCatalog(especieId?: number): Promise<TreatmentCatalogItem[]> {
  const query = especieId ? `?especie_id=${especieId}` : '';
  const { treatments } = await request<{ treatments: CatalogRow[] }>(`${CATALOG}${query}`, {
    auth: false,
    fallbackError: 'Error al obtener catálogo de tratamientos',
  });
  return treatments.map(mapCatalogRow);
}

export async function fetchPetTreatments(petId: number): Promise<PetTreatmentRecord[]> {
  const { treatments } = await request<{ treatments: RecordRow[] }>(PETS.TREATMENTS(petId), {
    fallbackError: 'Error al obtener carnet sanitario',
  });
  return treatments.map(mapRecordRow);
}

export async function createPetTreatment(
  petId: number,
  payload: TreatmentPayload
): Promise<PetTreatmentRecord> {
  const { treatment } = await request<{ treatment: RecordRow }>(PETS.TREATMENTS(petId), {
    method: 'POST',
    body: toTreatmentBody(payload),
    fallbackError: 'Error al registrar aplicación',
  });
  return mapRecordRow(treatment);
}

export async function updatePetTreatment(
  petId: number,
  recordId: number,
  payload: TreatmentPayload
): Promise<PetTreatmentRecord> {
  const { treatment } = await request<{ treatment: RecordRow }>(
    PETS.TREATMENT_DETAIL(petId, recordId),
    {
      method: 'PUT',
      body: toTreatmentBody(payload),
      fallbackError: 'Error al actualizar aplicación',
    }
  );
  return mapRecordRow(treatment);
}

export async function deletePetTreatment(petId: number, recordId: number): Promise<void> {
  await request(PETS.TREATMENT_DETAIL(petId, recordId), {
    method: 'DELETE',
    fallbackError: 'Error al eliminar aplicación',
  });
}

export async function fetchCalendar(): Promise<CalendarEventItem[]> {
  const { reminders } = await request<{ reminders: ReminderRow[] }>(CALENDAR.LIST, {
    fallbackError: 'Error al cargar calendario sanitario',
  });
  return reminders.map(mapReminderRow);
}

export function computeSuggestedBoosterDate(
  fechaAplicacion: string,
  intervaloDias: number | null
): string {
  if (!intervaloDias || intervaloDias <= 0) {
    return '';
  }
  return addDaysIso(fechaAplicacion.trim(), intervaloDias);
}

export function getBoosterStatus(fechaProximoRefuerzo: string | null): {
  status: 'vencido' | 'proximo' | 'al_dia' | 'sin_fecha';
  label: string;
  daysDiff: number | null;
} {
  const diffDays = daysFromToday(fechaProximoRefuerzo?.slice(0, 10));

  if (diffDays === null) {
    return { status: 'sin_fecha', label: 'Sin refuerzo pendiente', daysDiff: null };
  }
  if (diffDays < 0) {
    return {
      status: 'vencido',
      label: `Vencido hace ${Math.abs(diffDays)} d`,
      daysDiff: diffDays,
    };
  }
  if (diffDays <= 30) {
    return {
      status: 'proximo',
      label: diffDays === 0 ? 'Vence hoy' : `Próximo en ${diffDays} d`,
      daysDiff: diffDays,
    };
  }
  return { status: 'al_dia', label: `Al día (${diffDays} d)`, daysDiff: diffDays };
}
