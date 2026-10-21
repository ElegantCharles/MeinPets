SET client_encoding = 'UTF8';

DELETE FROM establecimientos
WHERE (nombre, contacto_email) IN (
    ('Clínica Veterinaria Central', 'contacto@vetcentral.cl'),
    ('Hospital Veterinario Urgencias 24h', 'urgencias@vet24h.cl'),
    ('Pet Shop y Farmacia Mascotas', 'tienda@petfarmacia.cl')
);
