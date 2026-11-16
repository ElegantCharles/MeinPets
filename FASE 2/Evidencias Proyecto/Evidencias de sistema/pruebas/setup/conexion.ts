import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import dotenv from 'dotenv';

const aqui = path.dirname(fileURLToPath(import.meta.url));

export const carpetaSistema = path.resolve(aqui, '..', '..');
export const carpetaScripts = path.join(carpetaSistema, 'base-de-datos', 'scripts');
export const NOMBRE_BD = 'meinpets_test';

const archivoEnv = path.join(carpetaSistema, '.env');
const delArchivo = fs.existsSync(archivoEnv) ? dotenv.parse(fs.readFileSync(archivoEnv)) : {};

function variable(nombre: string, porDefecto: string): string {
  return process.env[nombre] ?? delArchivo[nombre] ?? porDefecto;
}

export const conexion = {
  host: process.env.POSTGRES_HOST ?? 'localhost',
  port: Number(variable('POSTGRES_PORT', '5432')),
  user: variable('POSTGRES_USER', 'meinpets_user'),
  password: variable('POSTGRES_PASSWORD', 'meinpets_password'),
};

export const entornoDePrueba: Record<string, string> = {
  NODE_ENV: 'test',
  POSTGRES_HOST: conexion.host,
  POSTGRES_PORT: String(conexion.port),
  POSTGRES_USER: conexion.user,
  POSTGRES_PASSWORD: conexion.password,
  POSTGRES_DB: NOMBRE_BD,
  JWT_SECRET: 'secreto-solo-para-pruebas',
  CORS_ORIGIN: '',
  EXPO_PUBLIC_API_URL: 'http://api.prueba/api',
};

const HOSTS_LOCALES = ['localhost', '127.0.0.1', '::1'];

export function exigirBaseLocal(): void {
  if (!HOSTS_LOCALES.includes(conexion.host)) {
    throw new Error(
      `Las pruebas borran y recrean la base ${NOMBRE_BD}: solo corren contra una base local (POSTGRES_HOST=${conexion.host} no lo es).`
    );
  }
}
