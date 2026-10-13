import type { RequestHandler } from 'express';
import jwt from 'jsonwebtoken';
import { env } from '../config/env';
import { HttpError } from '../lib/errors';

export const requireAuth: RequestHandler = (req, _res, next) => {
  const header = req.headers.authorization;
  if (!header?.startsWith('Bearer ')) {
    throw new HttpError(401, 'No autorizado');
  }

  try {
    const payload = jwt.verify(header.slice(7).trim(), env.jwt.secret, { algorithms: ['HS256'] });
    if (typeof payload === 'string' || typeof payload.id !== 'number') {
      throw new Error('Token sin identificador');
    }
    req.userId = payload.id;
  } catch {
    throw new HttpError(401, 'Token inválido o expirado');
  }

  next();
};
