import { pool } from '../db/pool';
import { HttpError } from './errors';

interface PetAccess {
  especie_id: number;
  es_tutor_principal: boolean;
}

export async function requirePetAccess(petId: number, userId: number): Promise<PetAccess> {
  const { rows } = await pool.query<PetAccess>(
    `SELECT m.especie_id, um.es_tutor_principal
     FROM usuarios_mascotas um
     JOIN mascotas m ON m.id = um.mascota_id
     WHERE um.mascota_id = $1 AND um.usuario_id = $2`,
    [petId, userId]
  );

  if (!rows[0]) {
    throw new HttpError(404, 'Mascota no encontrada');
  }
  return rows[0];
}

export async function requirePrincipalTutor(petId: number, userId: number): Promise<PetAccess> {
  const access = await requirePetAccess(petId, userId);
  if (!access.es_tutor_principal) {
    throw new HttpError(403, 'Solo el tutor principal puede realizar esta acción');
  }
  return access;
}
