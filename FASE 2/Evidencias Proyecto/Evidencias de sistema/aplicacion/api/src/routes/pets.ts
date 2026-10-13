import { Router } from 'express';
import { z } from 'zod';
import { pool } from '../db/pool';
import { requireAuth } from '../middleware/auth';
import { requirePetAccess, requirePrincipalTutor } from '../lib/access';
import { HttpError } from '../lib/errors';
import { isoDate, optionalText, parse, positiveInt, todayIso } from '../lib/validation';

const router = Router();

router.use('/pets', requireAuth);

const petId = positiveInt('Identificador de mascota inválido');

const NAME_REQUIRED = 'El nombre de la mascota es obligatorio';
const BIRTH_REQUIRED = 'La fecha de nacimiento es obligatoria (YYYY-MM-DD)';
const BIRTH_INVALID = 'El formato de la fecha de nacimiento no es válido (YYYY-MM-DD)';
const SEX_INVALID = 'El sexo debe ser macho o hembra';

const petBody = z.object({
  nombre: z
    .string({ error: NAME_REQUIRED })
    .trim()
    .min(1, NAME_REQUIRED)
    .max(100, 'El nombre no puede superar los 100 caracteres'),
  especie_id: positiveInt('Debes seleccionar una especie válida'),
  fecha_nacimiento: isoDate(BIRTH_REQUIRED, BIRTH_INVALID).refine(
    (value) => value <= todayIso(),
    'La fecha de nacimiento no puede ser una fecha futura'
  ),
  sexo: z
    .string({ error: SEX_INVALID })
    .trim()
    .toLowerCase()
    .pipe(z.enum(['macho', 'hembra'], { error: SEX_INVALID })),
  numero_chip: optionalText(50, 'El número de chip no puede superar los 50 caracteres'),
  raza_id: z.preprocess(
    (value) => (value === undefined || value === '' ? null : value),
    positiveInt('La raza seleccionada no es válida').nullable()
  ),
  esterilizado: z.preprocess(
    (value) => value ?? false,
    z.boolean({ error: 'El campo esterilizado debe ser verdadero o falso' })
  ),
  foto_url: optionalText(255, 'La URL de la foto no puede superar los 255 caracteres'),
});

type PetBody = z.output<typeof petBody>;

const PET_COLUMNS = `
  m.id, m.nombre, m.especie_id, e.nombre AS especie_nombre,
  m.raza_id, r.nombre AS raza_nombre, m.fecha_nacimiento, m.sexo,
  m.esterilizado, m.numero_chip, m.foto_url, um.es_tutor_principal,
  m.created_at, m.updated_at`;

const PET_FROM = `
  FROM usuarios_mascotas um
  JOIN mascotas m ON m.id = um.mascota_id
  JOIN especies e ON e.id = m.especie_id
  LEFT JOIN razas r ON r.id = m.raza_id`;

const TUTORS_COLUMN = `
  (SELECT COALESCE(
            json_agg(
              json_build_object(
                'id', u.id,
                'nombre_completo', u.nombre_completo,
                'email', u.email,
                'es_tutor_principal', t.es_tutor_principal
              )
              ORDER BY t.es_tutor_principal DESC, u.nombre_completo
            ),
            '[]'::json
          )
   FROM usuarios_mascotas t
   JOIN usuarios u ON u.id = t.usuario_id
   WHERE t.mascota_id = m.id) AS tutores`;

function petValues(body: PetBody) {
  return [
    body.nombre,
    body.especie_id,
    body.raza_id,
    body.fecha_nacimiento,
    body.sexo,
    body.esterilizado,
    body.numero_chip,
    body.foto_url,
  ];
}

async function findPet(id: number, userId: number) {
  const { rows } = await pool.query(
    `SELECT ${PET_COLUMNS}, ${TUTORS_COLUMN}
     ${PET_FROM}
     WHERE um.mascota_id = $1 AND um.usuario_id = $2`,
    [id, userId]
  );
  return rows[0];
}

async function assertSpeciesAndBreed(especieId: number, razaId: number | null) {
  const { rows } = await pool.query<{ especie_existe: boolean; raza_valida: boolean }>(
    `SELECT EXISTS (SELECT 1 FROM especies WHERE id = $1) AS especie_existe,
            ($2::int IS NULL OR EXISTS (SELECT 1 FROM razas WHERE id = $2 AND especie_id = $1)) AS raza_valida`,
    [especieId, razaId]
  );

  if (!rows[0].especie_existe) {
    throw new HttpError(400, 'La especie seleccionada no existe');
  }
  if (!rows[0].raza_valida) {
    throw new HttpError(400, 'La raza no pertenece a la especie seleccionada');
  }
}

router.get('/pets', async (req, res) => {
  const { rows } = await pool.query(
    `SELECT ${PET_COLUMNS}
     ${PET_FROM}
     WHERE um.usuario_id = $1
     ORDER BY m.created_at DESC`,
    [req.userId]
  );
  res.json({ pets: rows });
});

router.get('/pets/:id', async (req, res) => {
  const pet = await findPet(parse(petId, req.params.id), req.userId);
  if (!pet) {
    throw new HttpError(404, 'Mascota no encontrada');
  }
  res.json({ pet });
});

router.post('/pets', async (req, res) => {
  const body = parse(petBody, req.body);
  await assertSpeciesAndBreed(body.especie_id, body.raza_id);

  const { rows } = await pool.query<{ mascota_id: number }>(
    `WITH nueva AS (
       INSERT INTO mascotas
         (nombre, especie_id, raza_id, fecha_nacimiento, sexo, esterilizado, numero_chip, foto_url)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
       RETURNING id
     )
     INSERT INTO usuarios_mascotas (usuario_id, mascota_id, es_tutor_principal)
     SELECT $9::int, id, TRUE FROM nueva
     RETURNING mascota_id`,
    [...petValues(body), req.userId]
  );

  res.status(201).json({ pet: await findPet(rows[0].mascota_id, req.userId) });
});

router.put('/pets/:id', async (req, res) => {
  const id = parse(petId, req.params.id);
  await requirePetAccess(id, req.userId);

  const body = parse(petBody, req.body);
  await assertSpeciesAndBreed(body.especie_id, body.raza_id);

  await pool.query(
    `UPDATE mascotas
     SET nombre = $1, especie_id = $2, raza_id = $3, fecha_nacimiento = $4, sexo = $5,
         esterilizado = $6, numero_chip = $7, foto_url = $8, updated_at = NOW()
     WHERE id = $9`,
    [...petValues(body), id]
  );

  res.json({ pet: await findPet(id, req.userId) });
});

router.delete('/pets/:id', async (req, res) => {
  const id = parse(petId, req.params.id);
  await requirePrincipalTutor(id, req.userId);

  await pool.query('DELETE FROM mascotas WHERE id = $1', [id]);
  res.json({ message: 'Mascota eliminada correctamente' });
});

const tutorBody = z.object({
  email: z
    .string({ error: 'Debes indicar el correo electrónico del cotutor' })
    .trim()
    .toLowerCase()
    .min(1, 'Debes indicar el correo electrónico del cotutor'),
});

router.post('/pets/:id/tutors', async (req, res) => {
  const id = parse(petId, req.params.id);
  const { email } = parse(tutorBody, req.body);
  await requirePrincipalTutor(id, req.userId);

  const { rows } = await pool.query<{ id: number }>('SELECT id FROM usuarios WHERE email = $1', [email]);
  if (!rows[0]) {
    throw new HttpError(404, 'No existe un usuario registrado con ese correo electrónico');
  }

  await pool.query(
    `INSERT INTO usuarios_mascotas (usuario_id, mascota_id, es_tutor_principal)
     VALUES ($1, $2, FALSE)
     ON CONFLICT (usuario_id, mascota_id) DO NOTHING`,
    [rows[0].id, id]
  );

  res.status(201).json({ pet: await findPet(id, req.userId) });
});

export default router;
