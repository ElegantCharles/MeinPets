import fs from 'fs';
import path from 'path';
import { pool } from './pool';

const SQL_DIRS = ['/app/sql', path.resolve(__dirname, '../../../../base-de-datos/scripts')];

export async function migrate(): Promise<void> {
  const dir = SQL_DIRS.find((candidate) => fs.existsSync(candidate));
  if (!dir) {
    return;
  }

  await pool.query(`
    CREATE TABLE IF NOT EXISTS schema_migrations (
      nombre TEXT PRIMARY KEY,
      aplicada_en TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `);

  const applied = await pool.query<{ nombre: string }>('SELECT nombre FROM schema_migrations');
  const done = new Set(applied.rows.map((row) => row.nombre));

  const pending = fs
    .readdirSync(dir)
    .filter((file) => file.endsWith('.sql') && !done.has(file))
    .sort();

  for (const file of pending) {
    const sql = fs.readFileSync(path.join(dir, file), 'utf8').replace(/^﻿/, '');
    const client = await pool.connect();
    try {
      await client.query('BEGIN');
      await client.query(sql);
      await client.query('INSERT INTO schema_migrations (nombre) VALUES ($1)', [file]);
      await client.query('COMMIT');
      console.log(`Migración aplicada: ${file}`);
    } catch (err) {
      await client.query('ROLLBACK').catch(() => undefined);
      throw err;
    } finally {
      client.release();
    }
  }
}
