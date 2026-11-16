import express from 'express';
import cors from 'cors';
import { env } from './config/env';
import { errorHandler, notFound } from './lib/errors';
import healthRouter from './routes/health';
import authRouter from './routes/auth';
import speciesRouter from './routes/species';
import petsRouter from './routes/pets';
import treatmentsRouter from './routes/treatments';
import calendarRouter from './routes/calendar';
import mapRouter from './routes/map';

export function createApp() {
  const app = express();

  app.disable('x-powered-by');
  app.use(cors(env.corsOrigins.length ? { origin: env.corsOrigins } : undefined));
  app.use(express.json({ limit: '100kb' }));

  app.use(healthRouter);
  app.use(
    '/api',
    healthRouter,
    authRouter,
    speciesRouter,
    petsRouter,
    treatmentsRouter,
    calendarRouter,
    mapRouter
  );

  app.use(notFound);
  app.use(errorHandler);

  return app;
}
