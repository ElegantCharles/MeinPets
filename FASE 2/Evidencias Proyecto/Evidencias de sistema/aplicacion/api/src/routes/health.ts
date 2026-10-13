import { Router } from 'express';
import { pool } from '../db/pool';

const router = Router();

router.get('/health', async (_req, res) => {
  const timestamp = new Date().toISOString();

  try {
    const { rows } = await pool.query<{ postgis: string }>('SELECT PostGIS_Version() AS postgis');
    res.json({
      status: 'ok',
      timestamp,
      database: { connected: true, postgis: rows[0].postgis },
    });
  } catch (err) {
    console.error('Health check fallido', err);
    res.status(503).json({
      status: 'degraded',
      timestamp,
      database: { connected: false },
    });
  }
});

export default router;
