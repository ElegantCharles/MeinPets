import type { ErrorRequestHandler, RequestHandler } from 'express';

export class HttpError extends Error {
  constructor(
    readonly status: number,
    message: string
  ) {
    super(message);
  }
}

export function isUniqueViolation(err: unknown): boolean {
  return typeof err === 'object' && err !== null && 'code' in err && err.code === '23505';
}

function clientErrorStatus(err: unknown): number | null {
  if (typeof err !== 'object' || err === null || !('status' in err)) {
    return null;
  }
  const { status } = err;
  return typeof status === 'number' && status >= 400 && status < 500 ? status : null;
}

export const notFound: RequestHandler = (_req, _res, next) => {
  next(new HttpError(404, 'Ruta no encontrada'));
};

export const errorHandler: ErrorRequestHandler = (err, req, res, _next) => {
  if (err instanceof HttpError) {
    res.status(err.status).json({ error: err.message });
    return;
  }

  const status = clientErrorStatus(err);
  if (status) {
    res.status(status).json({ error: 'Solicitud inválida' });
    return;
  }

  console.error(`${req.method} ${req.originalUrl}`, err);
  res.status(500).json({ error: 'Error interno del servidor' });
};
