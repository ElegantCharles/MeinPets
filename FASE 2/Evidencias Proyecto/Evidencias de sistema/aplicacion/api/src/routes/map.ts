import { Router } from 'express';
import { z } from 'zod';
import { pool } from '../db/pool';
import { parse } from '../lib/validation';

const router = Router();

const CATEGORIES = ['veterinaria', 'urgencia_24h', 'pet_shop', 'farmacia_veterinaria'] as const;
const MAX_LOCATIONS = 1000;
const MAP_CACHE = 'public, max-age=60';

const CATEGORY_INVALID = `La categoría debe ser una de: ${CATEGORIES.join(', ')}`;
const BBOX_INVALID = 'La zona visible debe venir como bbox=oeste,sur,este,norte con coordenadas válidas';

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

const locationsQuery = z.object({
  categoria: z.preprocess(blankToUndefined, z.enum(CATEGORIES, { error: CATEGORY_INVALID }).optional()),
  bbox: z.preprocess(
    blankToUndefined,
    z
      .string({ error: BBOX_INVALID })
      .refine((value) => parseBbox(value) !== null, BBOX_INVALID)
      .optional()
  ),
});

router.get('/map/locations', async (req, res) => {
  const { categoria, bbox } = parse(locationsQuery, req.query);

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

  params.push(MAX_LOCATIONS);

  const { rows } = await pool.query(
    `SELECT id, nombre, categoria, direccion, telefono,
            horario_atencion AS horario,
            ST_Y(ubicacion) AS latitud, ST_X(ubicacion) AS longitud
     FROM establecimientos
     ${conditions.length ? `WHERE ${conditions.join(' AND ')}` : ''}
     ORDER BY nombre, id
     LIMIT $${params.length}`,
    params
  );

  res.set('Cache-Control', MAP_CACHE).json({ locations: rows });
});

export default router;
