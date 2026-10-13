import { Router } from 'express';
import { pool } from '../db/pool';
import { requireAuth } from '../middleware/auth';
import { REMINDER_COLUMNS, REMINDER_JOIN } from '../lib/reminders';

const router = Router();

router.get('/calendar', requireAuth, async (req, res) => {
  const { rows } = await pool.query(
    `SELECT ht.id, ht.mascota_id, m.nombre AS mascota_nombre, e.nombre AS especie_nombre,
            ht.tratamiento_id, ct.nombre AS tratamiento_nombre, ct.tipo AS tratamiento_tipo,
            ct.es_obligatoria, ht.numero_dosis, ht.fecha_aplicacion, ht.fecha_proximo_refuerzo,
            ht.veterinario_nombre, ht.clinica_nombre, ${REMINDER_COLUMNS}
     FROM usuarios_mascotas um
     JOIN mascotas m ON m.id = um.mascota_id
     JOIN especies e ON e.id = m.especie_id
     JOIN historial_tratamientos ht ON ht.mascota_id = m.id
     JOIN catalogo_tratamientos ct ON ct.id = ht.tratamiento_id
     ${REMINDER_JOIN}
     WHERE um.usuario_id = $1 AND ht.fecha_proximo_refuerzo IS NOT NULL
     ORDER BY ht.fecha_proximo_refuerzo, ht.id`,
    [req.userId]
  );

  res.json({ reminders: rows });
});

export default router;
