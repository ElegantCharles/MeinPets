import { Router } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { rateLimit } from 'express-rate-limit';
import { z } from 'zod';
import { pool } from '../db/pool';
import { env } from '../config/env';
import { requireAuth } from '../middleware/auth';
import { HttpError, isUniqueViolation } from '../lib/errors';
import { parse } from '../lib/validation';

const router = Router();

const SALT_ROUNDS = 10;
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const REQUIRED = 'Todos los campos son obligatorios';
const DUMMY_HASH = bcrypt.hashSync('contrasena-inexistente', SALT_ROUNDS);

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 30,
  skipSuccessfulRequests: true,
  standardHeaders: 'draft-8',
  legacyHeaders: false,
  message: { error: 'Demasiados intentos. Intenta de nuevo en unos minutos' },
});

const requiredText = z.string({ error: REQUIRED }).trim().min(1, REQUIRED);

const registerBody = z.object({
  email: requiredText
    .toLowerCase()
    .max(255, 'El formato del correo electrónico no es válido')
    .regex(EMAIL_REGEX, 'El formato del correo electrónico no es válido'),
  nombre_completo: requiredText.max(150, 'El nombre completo no puede superar los 150 caracteres'),
  password: z
    .string({ error: REQUIRED })
    .min(1, REQUIRED)
    .refine(
      (value) => value.length >= 8 && /[a-zA-Z]/.test(value) && /[0-9]/.test(value),
      'La contraseña debe tener al menos 8 caracteres e incluir letras y números'
    )
    .refine(
      (value) => Buffer.byteLength(value) <= 72,
      'La contraseña no puede superar los 72 caracteres'
    ),
});

const loginBody = z.object({
  email: requiredText.toLowerCase(),
  password: z.string().min(1),
});

router.post('/auth/register', authLimiter, async (req, res) => {
  const { email, nombre_completo, password } = parse(registerBody, req.body);
  const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);

  try {
    const { rows } = await pool.query(
      `INSERT INTO usuarios (email, password_hash, nombre_completo)
       VALUES ($1, $2, $3)
       RETURNING id, email, nombre_completo, created_at`,
      [email, passwordHash, nombre_completo]
    );
    res.status(201).json({ user: rows[0] });
  } catch (err) {
    if (isUniqueViolation(err)) {
      throw new HttpError(409, 'El correo electrónico ya está registrado');
    }
    throw err;
  }
});

router.post('/auth/login', authLimiter, async (req, res) => {
  const credentials = loginBody.safeParse(req.body);
  if (!credentials.success) {
    throw new HttpError(401, 'Credenciales inválidas');
  }
  const { email, password } = credentials.data;

  const { rows } = await pool.query(
    `SELECT id, email, password_hash, nombre_completo, created_at
     FROM usuarios
     WHERE email = $1`,
    [email]
  );
  const user = rows[0];

  const passwordMatches = await bcrypt.compare(password, user?.password_hash ?? DUMMY_HASH);
  if (!user || !passwordMatches) {
    throw new HttpError(401, 'Credenciales inválidas');
  }

  const token = jwt.sign({ id: user.id, email: user.email }, env.jwt.secret, {
    algorithm: 'HS256',
    expiresIn: env.jwt.expiresIn as jwt.SignOptions['expiresIn'],
  });

  res.json({
    token,
    user: {
      id: user.id,
      email: user.email,
      nombre_completo: user.nombre_completo,
      created_at: user.created_at,
    },
  });
});

router.get('/auth/me', requireAuth, async (req, res) => {
  const { rows } = await pool.query(
    'SELECT id, email, nombre_completo, created_at FROM usuarios WHERE id = $1',
    [req.userId]
  );

  if (!rows[0]) {
    throw new HttpError(401, 'No autorizado');
  }
  res.json({ user: rows[0] });
});

export default router;
