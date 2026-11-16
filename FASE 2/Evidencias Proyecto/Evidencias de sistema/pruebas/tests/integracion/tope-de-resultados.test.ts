import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { bd } from '../../src/baseDeDatos';
import { lugaresDe, pedir } from '../../src/cliente';
import { LUGARES, ORIGEN } from '../../src/datos';
import { cerrarEscenario, prepararEscenario } from '../../src/escenario';
import { vincenty } from '../../src/geodesia';
import type { Servidor } from '../../src/servidor';

let servidor: Servidor;

const TOTAL = LUGARES.length + 1100;

beforeAll(async () => {
  servidor = await prepararEscenario();
  await bd.query(
    `INSERT INTO establecimientos (nombre, categoria, direccion, ubicacion)
     SELECT 'PRUEBA S12 - masa ' || lpad(n::text, 4, '0'),
            'veterinaria',
            'Referencia masa',
            ST_SetSRID(ST_MakePoint($1::float8, $2::float8 + n * 0.0001), 4326)
     FROM generate_series(1, 1100) AS n`,
    [ORIGEN.lng, ORIGEN.lat]
  );
});

afterAll(async () => {
  await cerrarEscenario(servidor);
});

describe('Tope de 1000 lugares por respuesta', () => {
  it('CP-S12-TOPE-001 sin filtros devuelve como máximo 1000 lugares', async () => {
    const respuesta = await pedir(servidor);

    expect(respuesta.estado).toBe(200);
    expect(lugaresDe(respuesta)).toHaveLength(1000);
  });

  it('CP-S12-TOPE-002 con cercanía devuelve los 1000 lugares más cercanos y en orden', async () => {
    const { rows } = await bd.query<{ nombre: string; lat: number; lng: number }>(
      'SELECT nombre, ST_Y(ubicacion) AS lat, ST_X(ubicacion) AS lng FROM establecimientos'
    );
    const esperados = rows
      .map((fila) => ({ nombre: fila.nombre, distancia: vincenty(ORIGEN, { lat: fila.lat, lng: fila.lng }) }))
      .sort((a, b) => a.distancia - b.distancia || a.nombre.localeCompare(b.nombre))
      .slice(0, 1000)
      .map((fila) => fila.nombre);

    const respuesta = await pedir(servidor, { lat: ORIGEN.lat, lng: ORIGEN.lng });

    expect(rows).toHaveLength(TOTAL);
    expect(lugaresDe(respuesta).map((lugar) => lugar.nombre)).toEqual(esperados);
  });

  it('CP-S12-TOPE-003 con un radio que incluye más de 1000 lugares también devuelve 1000', async () => {
    const respuesta = await pedir(servidor, { lat: ORIGEN.lat, lng: ORIGEN.lng, radio: 50000 });

    expect(lugaresDe(respuesta)).toHaveLength(1000);
  });

  it('CP-S12-TOPE-004 con un radio que incluye menos de 1000 lugares devuelve solo los que están dentro', async () => {
    const respuesta = await pedir(servidor, { lat: ORIGEN.lat, lng: ORIGEN.lng, radio: 600 });
    const lugares = lugaresDe(respuesta);

    expect(lugares.length).toBeGreaterThan(0);
    expect(lugares.length).toBeLessThan(1000);
    for (const lugar of lugares) {
      expect(lugar.distancia_m).toBeLessThanOrEqual(600);
    }
  });
});
