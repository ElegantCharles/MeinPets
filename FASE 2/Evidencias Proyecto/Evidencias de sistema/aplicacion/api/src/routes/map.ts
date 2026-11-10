import { Router } from 'express';
import { z } from 'zod';
import { pool } from '../db/pool';
import { parse } from '../lib/validation';

const router = Router();

const CATEGORIES = ['veterinaria', 'urgencia_24h', 'pet_shop', 'farmacia_veterinaria'] as const;
const MAX_LOCATIONS = 1000;
const MAX_RADIUS_M = 50000;
const MAP_CACHE = 'public, max-age=60';

const CATEGORY_INVALID = `La categoría debe ser una de: ${CATEGORIES.join(', ')}`;
const BBOX_INVALID = 'La zona visible debe venir como bbox=oeste,sur,este,norte con coordenadas válidas';
const LAT_INVALID = 'La latitud debe ser un número entre -90 y 90';
const LNG_INVALID = 'La longitud debe ser un número entre -180 y 180';
const POINT_INCOMPLETE = 'Para buscar por cercanía envía lat y lng juntas';
const RADIUS_INVALID = `El radio debe ser un número de metros entre 1 y ${MAX_RADIUS_M}`;
const RADIUS_WITHOUT_POINT = 'El radio necesita lat y lng';

function parseBbox(value: string): [number, number, number, number] | null {
  const parts = value.split(',').map((part) => part.trim());
  if (parts.length !== 4 || parts.some((part) => part === '')) {
    return null;
  }
  const [west, south, east, north] = parts.map(Number);
  if (![west, south, east, north].every(Number.isFinite)) {
    return null;
  }
  if (west < -180 || east > 180 || south < -90 || north > 90) {
    return null;
  }
  if (west >= east || south >= north) {
    return null;
  }
  return [west, south, east, north];
}

const blankToUndefined = (value: unknown) => (value === '' ? undefined : value);

const numberParam = (message: string, min: number, max: number) =>
  z.preprocess(
    blankToUndefined,
    z.coerce.number({ error: message }).min(min, message).max(max, message).optional()
  );

const locationsQuery = z
  .object({
    categoria: z.preprocess(blankToUndefined, z.enum(CATEGORIES, { error: CATEGORY_INVALID }).optional()),
    bbox: z.preprocess(
      blankToUndefined,
      z
        .string({ error: BBOX_INVALID })
        .refine((value) => parseBbox(value) !== null, BBOX_INVALID)
        .optional()
    ),
    lat: numberParam(LAT_INVALID, -90, 90),
    lng: numberParam(LNG_INVALID, -180, 180),
    radio: numberParam(RADIUS_INVALID, 1, MAX_RADIUS_M),
  })
  .refine((query) => (query.lat === undefined) === (query.lng === undefined), POINT_INCOMPLETE)
  .refine((query) => query.radio === undefined || query.lat !== undefined, RADIUS_WITHOUT_POINT);

router.get('/map/locations', async (req, res) => {
  const { categoria, bbox, lat, lng, radio } = parse(locationsQuery, req.query);

  const conditions: string[] = [];
  const params: unknown[] = [];

  if (categoria) {
    params.push(categoria);
    conditions.push(`categoria = $${params.length}`);
  }

  const box = bbox ? parseBbox(bbox) : null;
  if (box) {
    const first = params.length + 1;
    params.push(...box);
    conditions.push(
      `ubicacion && ST_MakeEnvelope($${first}::float8, $${first + 1}::float8, $${first + 2}::float8, $${first + 3}::float8, 4326)`
    );
  }

  const nearby = lat !== undefined && lng !== undefined;
  let distanceColumn = '';
  let orderBy = 'nombre, id';

  if (nearby) {
    const first = params.length + 1;
    params.push(lng, lat);
    const origin = `ST_SetSRID(ST_MakePoint($${first}::float8, $${first + 1}::float8), 4326)::geography`;
    distanceColumn = `, ST_Distance(ubicacion::geography, ${origin}) AS distancia_m`;
    orderBy = 'distancia_m, nombre, id';
    if (radio !== undefined) {
      params.push(radio);
      conditions.push(`ST_DWithin(ubicacion::geography, ${origin}, $${params.length}::float8)`);
    }
  }

  params.push(MAX_LOCATIONS);

  const { rows } = await pool.query(
    `SELECT id, nombre, categoria, direccion, telefono,
            horario_atencion AS horario,
            ST_Y(ubicacion) AS latitud, ST_X(ubicacion) AS longitud${distanceColumn}
     FROM establecimientos
     ${conditions.length ? `WHERE ${conditions.join(' AND ')}` : ''}
     ORDER BY ${orderBy}
     LIMIT $${params.length}`,
    params
  );

  const locations = nearby ? rows.map((row) => ({ ...row, distancia_m: Math.round(Number(row.distancia_m)) })) : rows;

  res.set('Cache-Control', MAP_CACHE).json({ locations });
});

export default router;
