SET client_encoding = 'UTF8';

INSERT INTO especies (nombre)
VALUES ('Perro'), ('Gato')
ON CONFLICT (nombre) DO NOTHING;

INSERT INTO razas (especie_id, nombre)
SELECT e.id, r.nombre
FROM (VALUES
    ('Mestizo'),
    ('Labrador Retriever'),
    ('Pastor Alemán'),
    ('Golden Retriever'),
    ('Bulldog Francés'),
    ('Poodle'),
    ('Beagle'),
    ('Chihuahua'),
    ('Yorkshire Terrier'),
    ('Boxer'),
    ('Dachshund'),
    ('Pug')
) AS r(nombre)
CROSS JOIN especies e
WHERE e.nombre = 'Perro'
ON CONFLICT (especie_id, nombre) DO NOTHING;

INSERT INTO razas (especie_id, nombre)
SELECT e.id, r.nombre
FROM (VALUES
    ('Mestizo'),
    ('Siamés'),
    ('Persa'),
    ('Maine Coon'),
    ('Bengala'),
    ('Angora'),
    ('Ragdoll'),
    ('Sphynx'),
    ('British Shorthair')
) AS r(nombre)
CROSS JOIN especies e
WHERE e.nombre = 'Gato'
ON CONFLICT (especie_id, nombre) DO NOTHING;

INSERT INTO catalogo_tratamientos (especie_id, tipo, nombre, descripcion, dias_sugeridos_refuerzo, es_obligatoria)
SELECT e.id, t.tipo, t.nombre, t.descripcion, t.dias_sugeridos_refuerzo, t.es_obligatoria
FROM (VALUES
    ('vacuna', 'Puppy DP (Distemper y Parvovirus)', 'Distemper y parvovirus', 21, true),
    ('vacuna', 'Séxtuple Canina', 'Protección múltiple', 21, true),
    ('vacuna', 'Antirrábica Canina', 'Rabia', 365, true),
    ('vacuna', 'KC (Tos de las Perreras)', 'Tos de las perreras', 365, false),
    ('antiparasitario_interno', 'Antiparasitario Interno Canino', 'Gusanos intestinales', 90, true),
    ('antiparasitario_externo', 'Antiparasitario Externo Canino', 'Pulgas y garrapatas', 30, true)
) AS t(tipo, nombre, descripcion, dias_sugeridos_refuerzo, es_obligatoria)
CROSS JOIN especies e
WHERE e.nombre = 'Perro'
ON CONFLICT (especie_id, nombre, tipo) DO UPDATE
SET descripcion = EXCLUDED.descripcion;

INSERT INTO catalogo_tratamientos (especie_id, tipo, nombre, descripcion, dias_sugeridos_refuerzo, es_obligatoria)
SELECT e.id, t.tipo, t.nombre, t.descripcion, t.dias_sugeridos_refuerzo, t.es_obligatoria
FROM (VALUES
    ('vacuna', 'Triple Felina', 'Panleucopenia, calicivirus y rinotraqueítis', 21, true),
    ('vacuna', 'Leucemia Felina (FeLV)', 'Virus de leucemia felina', 21, false),
    ('vacuna', 'Antirrábica Felina', 'Rabia', 365, true),
    ('antiparasitario_interno', 'Antiparasitario Interno Felino', 'Gusanos intestinales', 90, true),
    ('antiparasitario_externo', 'Antiparasitario Externo Felino', 'Pulgas y ácaros', 30, true)
) AS t(tipo, nombre, descripcion, dias_sugeridos_refuerzo, es_obligatoria)
CROSS JOIN especies e
WHERE e.nombre = 'Gato'
ON CONFLICT (especie_id, nombre, tipo) DO UPDATE
SET descripcion = EXCLUDED.descripcion;

INSERT INTO usuarios (email, password_hash, nombre_completo)
VALUES ('demo@meinpets.cl', '$2b$10$3U2E6AYr8qeCO35wtKPohOH/5eyH.fMX22lxYDjVPeea6gafRwjKG', 'Tutor Demo MeinPets')
ON CONFLICT (email) DO UPDATE
SET password_hash = EXCLUDED.password_hash,
    nombre_completo = EXCLUDED.nombre_completo;
