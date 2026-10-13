import { Router } from 'express';
import { z } from 'zod';
import { pool } from '../db/pool';
import { requireAuth } from '../middleware/auth';
import { requirePetAccess } from '../lib/access';
import { HttpError, isUniqueViolation } from '../lib/errors';
import { REMINDER_COLUMNS, REMINDER_JOIN } from '../lib/reminders';
import { addDays, isoDate, optionalIsoDate, optionalText, parse, positiveInt } from '../lib/validation';

const router = Router();

router.use('/pets', requireAuth);

const petId = positiveInt('Identificador de mascota inválido');
const recordId = positiveInt('Identificador inválido');

const DOSE_INVALID = 'El número de dosis debe ser un entero mayor o igual a 1';
const APPLIED_INVALID = 'La fecha de aplicación es obligatoria en formato AAAA-MM-DD';
const BOOSTER_INVALID = 'El formato de la fecha de próximo refuerzo no es válido (AAAA-MM-DD)';
const BOOSTER_BEFORE = 'La fecha del próximo refuerzo no puede ser anterior a la fecha de aplicación';
const DUPLICATE = 'Ya existe un registro para esta misma dosis y tratamiento en la fecha indicada';

const doseFields = {
  numero_dosis: z.coerce.number({ error: DOSE_INVALID }).int(DOSE_INVALID).min(1, DOSE_INVALID).default(1),
  fecha_aplicacion: isoDate(APPLIED_INVALID),
  fecha_proximo_refuerzo: optionalIsoDate(BOOSTER_INVALID),
  veterinario_nombre: optionalText(100, 'El nombre del veterinario no puede superar los 100 caracteres'),
  clinica_nombre: optionalText(150, 'El nombre de la clínica no puede superar los 150 caracteres'),
  observaciones: optionalText(2000, 'Las observaciones no pueden superar los 2000 caracteres'),
};

function boosterNotBeforeApplied(body: { fecha_aplicacion: string; fecha_proximo_refuerzo?: string }) {
  return !body.fecha_proximo_refuerzo || body.fecha_proximo_refuerzo >= body.fecha_aplicacion;
}

const boosterOrder = { message: BOOSTER_BEFORE, path: ['fecha_proximo_refuerzo'] };

const createBody = z
  .object({
    tratamiento_id: positiveInt('Debes seleccionar una vacuna o tratamiento válido'),
    ...doseFields,
  })
  .refine(boosterNotBeforeApplied, boosterOrder);

const updateBody = z.object(doseFields).refine(boosterNotBeforeApplied, boosterOrder);

const catalogQuery = z.object({
  especie_id: z.preprocess(
    (value) => (value === '' ? undefined : value),
    positiveInt('Identificador de especie inválido').optional()
  ),
});

const RECORD_SELECT = `
  SELECT ht.id, ht.mascota_id, m.nombre AS mascota_nombre, ht.tratamiento_id,
         ct.nombre AS tratamiento_nombre, ct.tipo AS tratamiento_tipo,
         ct.dias_sugeridos_refuerzo, ct.es_obligatoria, ht.numero_dosis,
         ht.fecha_aplicacion, ht.fecha_proximo_refuerzo,
         ht.veterinario_nombre, ht.clinica_nombre, ht.observaciones,
         ht.created_at, ht.updated_at, ${REMINDER_COLUMNS}
  FROM historial_tratamientos ht
  JOIN catalogo_tratamientos ct ON ct.id = ht.tratamiento_id
  JOIN mascotas m ON m.id = ht.mascota_id
  ${REMINDER_JOIN}`;

async function findRecord(id: number) {
  const { rows } = await pool.query(`${RECORD_SELECT} WHERE ht.id = $1`, [id]);
  return rows[0];
}

router.get('/treatments', async (req, res) => {
  const { especie_id } = parse(catalogQuery, req.query);

  const { rows } = await pool.query(
    `SELECT id, especie_id, tipo, nombre, descripcion, dias_sugeridos_refuerzo, es_obligatoria
     FROM catalogo_tratamientos
     WHERE ($1::int IS NULL OR especie_id = $1)
     ORDER BY especie_id, es_obligatoria DESC, tipo, nombre`,
    [especie_id ?? null]
  );

  res.set('Cache-Control', 'public, max-age=300').json({ treatments: rows });
});

router.get('/pets/:id/treatments', async (req, res) => {
  const id = parse(petId, req.params.id);
  await requirePetAccess(id, req.userId);

  const { rows } = await pool.query(
    `${RECORD_SELECT}
     WHERE ht.mascota_id = $1
     ORDER BY ht.fecha_aplicacion DESC, ht.id DESC`,
    [id]
  );

  res.json({ treatments: rows });
});

router.post('/pets/:id/treatments', async (req, res) => {
  const id = parse(petId, req.params.id);
  const pet = await requirePetAccess(id, req.userId);
  const body = parse(createBody, req.body);

  const { rows: catalog } = await pool.query<{ especie_id: number; dias_sugeridos_refuerzo: number | null }>(
    'SELECT especie_id, dias_sugeridos_refuerzo FROM catalogo_tratamientos WHERE id = $1',
    [body.tratamiento_id]
  );

  if (!catalog[0]) {
    throw new HttpError(400, 'El tratamiento seleccionado no existe en el catálogo');
  }
  if (catalog[0].especie_id !== pet.especie_id) {
    throw new HttpError(400, 'El tratamiento seleccionado no corresponde a la especie de la mascota');
  }

  const suggestedDays = catalog[0].dias_sugeridos_refuerzo;
  const booster =
    body.fecha_proximo_refuerzo ??
    (suggestedDays && suggestedDays > 0 ? addDays(body.fecha_aplicacion, suggestedDays) : null);

  try {
    const { rows } = await pool.query<{ id: number }>(
      `INSERT INTO historial_tratamientos
         (mascota_id, tratamiento_id, numero_dosis, fecha_aplicacion, fecha_proximo_refuerzo,
          veterinario_nombre, clinica_nombre, observaciones)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
       RETURNING id`,
      [
        id,
        body.tratamiento_id,
        body.numero_dosis,
        body.fecha_aplicacion,
        booster,
        body.veterinario_nombre,
        body.clinica_nombre,
        body.observaciones,
      ]
    );
    res.status(201).json({ treatment: await findRecord(rows[0].id) });
  } catch (err) {
    if (isUniqueViolation(err)) {
      throw new HttpError(409, DUPLICATE);
    }
    throw err;
  }
});

router.put('/pets/:id/treatments/:recordId', async (req, res) => {
  const id = parse(petId, req.params.id);
  const record = parse(recordId, req.params.recordId);
  await requirePetAccess(id, req.userId);
  const body = parse(updateBody, req.body);

  try {
    const { rowCount } = await pool.query(
      `UPDATE historial_tratamientos
       SET numero_dosis = $1, fecha_aplicacion = $2, fecha_proximo_refuerzo = $3,
           veterinario_nombre = $4, clinica_nombre = $5, observaciones = $6, updated_at = NOW()
       WHERE id = $7 AND mascota_id = $8`,
      [
        body.numero_dosis,
        body.fecha_aplicacion,
        body.fecha_proximo_refuerzo ?? null,
        body.veterinario_nombre,
        body.clinica_nombre,
        body.observaciones,
        record,
        id,
      ]
    );

    if (!rowCount) {
      throw new HttpError(404, 'Registro sanitario no encontrado');
    }
  } catch (err) {
    if (isUniqueViolation(err)) {
      throw new HttpError(409, DUPLICATE);
    }
    throw err;
  }

  res.json({ treatment: await findRecord(record) });
});

router.delete('/pets/:id/treatments/:recordId', async (req, res) => {
  const id = parse(petId, req.params.id);
  const record = parse(recordId, req.params.recordId);
  await requirePetAccess(id, req.userId);

  const { rowCount } = await pool.query(
    'DELETE FROM historial_tratamientos WHERE id = $1 AND mascota_id = $2',
    [record, id]
  );

  if (!rowCount) {
    throw new HttpError(404, 'Registro sanitario no encontrado');
  }
  res.json({ message: 'Registro sanitario eliminado correctamente' });
});

export default router;
