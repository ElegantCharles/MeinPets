import path from 'path';
import dotenv from 'dotenv';
import { z } from 'zod';

dotenv.config();
dotenv.config({ path: path.resolve(__dirname, '../../../../.env') });

const PLACEHOLDER_SECRET = 'change_me_in_env';

const schema = z.object({
  PORT: z.coerce.number().int().positive().default(3000),
  NODE_ENV: z.string().default('development'),
  POSTGRES_HOST: z.string().default('localhost'),
  POSTGRES_PORT: z.coerce.number().int().positive().default(5432),
  POSTGRES_DB: z.string().default('meinpets_db'),
  POSTGRES_USER: z.string().default('meinpets_user'),
  POSTGRES_PASSWORD: z.string().default('meinpets_password'),
  JWT_SECRET: z.string().min(1).default(PLACEHOLDER_SECRET),
  JWT_EXPIRES_IN: z.string().default('7d'),
  CORS_ORIGIN: z.string().default(''),
});

const parsed = schema.safeParse(process.env);

if (!parsed.success) {
  console.error(`Configuración inválida:\n${z.prettifyError(parsed.error)}`);
  process.exit(1);
}

const vars = parsed.data;

if (vars.NODE_ENV === 'production' && vars.JWT_SECRET === PLACEHOLDER_SECRET) {
  console.error('Configuración inválida: define JWT_SECRET con un valor propio en producción.');
  process.exit(1);
}

export const env = {
  port: vars.PORT,
  corsOrigins: vars.CORS_ORIGIN.split(',').map((origin) => origin.trim()).filter(Boolean),
  db: {
    host: vars.POSTGRES_HOST,
    port: vars.POSTGRES_PORT,
    database: vars.POSTGRES_DB,
    user: vars.POSTGRES_USER,
    password: vars.POSTGRES_PASSWORD,
  },
  jwt: {
    secret: vars.JWT_SECRET,
    expiresIn: vars.JWT_EXPIRES_IN,
  },
};
