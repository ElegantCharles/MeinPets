import { Router } from 'express';
import { pool } from '../db/pool';
import { parse, positiveInt } from '../lib/validation';

const router = Router();

const CATALOG_CACHE = 'public, max-age=300';

router.get('/species', async (_req, res) => {
  const { rows } = await pool.query(`
    SELECT e.id,
           e.nombre,
           COALESCE(
             json_agg(
               json_build_object('id', r.id, 'especie_id', r.especie_id, 'nombre', r.nombre)
               ORDER BY r.nombre
             ) FILTER (WHERE r.id IS NOT NULL),
             '[]'::json
           ) AS razas
    FROM especies e
    LEFT JOIN razas r ON r.especie_id = e.id
    GROUP BY e.id
    ORDER BY e.id`);

  res.set('Cache-Control', CATALOG_CACHE).json({ species: rows });
});

router.get('/species/:id/breeds', async (req, res) => {
  const especieId = parse(positiveInt('Identificador de especie inválido'), req.params.id);

  const { rows } = await pool.query(
    'SELECT id, especie_id, nombre FROM razas WHERE especie_id = $1 ORDER BY nombre',
    [especieId]
  );

  res.set('Cache-Control', CATALOG_CACHE).json({ breeds: rows });
});

export default router;
