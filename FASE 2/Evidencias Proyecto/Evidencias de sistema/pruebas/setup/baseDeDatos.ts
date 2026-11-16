import fs from 'node:fs';
import path from 'node:path';
import { Client } from 'pg';
import { carpetaScripts, conexion, exigirBaseLocal, NOMBRE_BD } from './conexion';

async function conectar(base: string): Promise<Client> {
  const cliente = new Client({ ...conexion, database: base });
  try {
    await cliente.connect();
  } catch (err) {
    const motivo = err instanceof Error ? err.message : String(err);
    throw new Error(
      `No se pudo conectar a PostgreSQL en ${conexion.host}:${conexion.port}. Levanta la base con "docker compose up -d db" (${motivo})`
    );
  }
  return cliente;
}

async function borrarBase(): Promise<void> {
  const admin = await conectar('postgres');
  try {
    await admin.query(`DROP DATABASE IF EXISTS ${NOMBRE_BD} WITH (FORCE)`);
  } finally {
    await admin.end();
  }
}

export async function setup(): Promise<void> {
  exigirBaseLocal();
  await borrarBase();

  const admin = await conectar('postgres');
  try {
    await admin.query(`CREATE DATABASE ${NOMBRE_BD}`);
  } finally {
    await admin.end();
  }

  const cliente = await conectar(NOMBRE_BD);
  try {
    const scripts = fs
      .readdirSync(carpetaScripts)
      .filter((archivo) => archivo.endsWith('.sql'))
      .sort();
    for (const archivo of scripts) {
      const sql = fs.readFileSync(path.join(carpetaScripts, archivo), 'utf8').replace(/^﻿/, '');
      await cliente.query(sql);
    }
  } finally {
    await cliente.end();
  }
}

export async function teardown(): Promise<void> {
  await borrarBase();
}
