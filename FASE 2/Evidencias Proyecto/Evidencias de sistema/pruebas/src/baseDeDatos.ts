import { Pool } from 'pg';
import { conexion, NOMBRE_BD } from '../setup/conexion';
import type { LugarDePrueba } from './datos';

export const bd = new Pool({ ...conexion, database: NOMBRE_BD, max: 2 });

export async function vaciarLugares(): Promise<void> {
  await bd.query('TRUNCATE establecimientos RESTART IDENTITY');
}

export async function insertarLugares(lugares: LugarDePrueba[]): Promise<void> {
  for (const lugar of lugares) {
    await bd.query(
      `INSERT INTO establecimientos
         (nombre, categoria, direccion, telefono, horario_atencion, ubicacion, contacto_email)
       VALUES ($1, $2, $3, $4, $5, ST_SetSRID(ST_MakePoint($6::float8, $7::float8), 4326), $8)`,
      [
        lugar.nombre,
        lugar.categoria,
        lugar.direccion,
        lugar.telefono,
        lugar.horario,
        lugar.lng,
        lugar.lat,
        lugar.correo,
      ]
    );
  }
}

export async function contarLugares(): Promise<number> {
  const { rows } = await bd.query<{ total: string }>('SELECT COUNT(*) AS total FROM establecimientos');
  return Number(rows[0].total);
}

export async function cerrarBd(): Promise<void> {
  await bd.end();
}
