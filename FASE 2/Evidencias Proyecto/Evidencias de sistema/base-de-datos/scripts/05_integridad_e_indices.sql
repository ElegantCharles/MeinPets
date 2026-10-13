SET client_encoding = 'UTF8';

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1
        FROM historial_tratamientos
        GROUP BY mascota_id, tratamiento_id, numero_dosis, fecha_aplicacion
        HAVING COUNT(*) > 1
    ) THEN
        CREATE UNIQUE INDEX IF NOT EXISTS uq_historial_dosis
            ON historial_tratamientos (mascota_id, tratamiento_id, numero_dosis, fecha_aplicacion);
    END IF;
END $$;

DROP INDEX IF EXISTS idx_usuarios_email;
DROP INDEX IF EXISTS idx_razas_especie_id;
DROP INDEX IF EXISTS idx_usuarios_mascotas_usuario;
DROP INDEX IF EXISTS idx_catalogo_tratamientos_especie;
