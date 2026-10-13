export const REMINDER_JOIN = `
  CROSS JOIN LATERAL (
    SELECT ht.fecha_proximo_refuerzo - (NOW() AT TIME ZONE 'America/Santiago')::date AS dias
  ) rem`;

export const REMINDER_COLUMNS = `
  CASE
    WHEN rem.dias IS NULL THEN 'sin_refuerzo'
    WHEN rem.dias < 0 THEN 'atrasado'
    WHEN rem.dias <= 30 THEN 'proximo'
    ELSE 'vigente'
  END AS estado_refuerzo,
  rem.dias AS dias_restantes`;
