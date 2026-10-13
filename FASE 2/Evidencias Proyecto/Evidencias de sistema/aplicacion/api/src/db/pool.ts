import { Pool, types } from 'pg';
import { env } from '../config/env';

types.setTypeParser(types.builtins.DATE, (value) => value);

export const pool = new Pool({
  host: env.db.host,
  port: env.db.port,
  database: env.db.database,
  user: env.db.user,
  password: env.db.password,
});

pool.on('error', (err) => {
  console.error('Error inesperado en una conexión inactiva de la base de datos', err);
});
