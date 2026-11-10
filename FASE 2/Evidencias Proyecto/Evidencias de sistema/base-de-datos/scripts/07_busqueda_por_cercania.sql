SET client_encoding = 'UTF8';

CREATE INDEX IF NOT EXISTS idx_establecimientos_ubicacion_geog
    ON establecimientos USING GIST ((ubicacion::geography));
