import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { lugaresDe, pedir } from '../../src/cliente';
import { CINCO_LUGARES_CONOCIDOS, LUGAR_EN_EL_ORIGEN, LUGARES, ORIGEN, ORIGENES, sinPrefijo } from '../../src/datos';
import { cerrarEscenario, prepararEscenario } from '../../src/escenario';
import { haversine, vincenty } from '../../src/geodesia';
import type { Servidor } from '../../src/servidor';

let servidor: Servidor;

beforeAll(async () => {
  servidor = await prepararEscenario();
});

afterAll(async () => {
  await cerrarEscenario(servidor);
});

describe('Precisión de la distancia que calcula el servidor', () => {
  it.each(CINCO_LUGARES_CONOCIDOS.map((lugar) => ({ nombre: sinPrefijo(lugar.nombre), lugar })))(
    'CP-S12-DIST-001 $nombre: la distancia coincide con la medición en línea recta',
    async ({ lugar }) => {
      const respuesta = await pedir(servidor, { lat: ORIGEN.lat, lng: ORIGEN.lng });
      const obtenido = lugaresDe(respuesta).find((candidato) => candidato.nombre === lugar.nombre);
      const geodesica = vincenty(ORIGEN, lugar);
      const recta = haversine(ORIGEN, lugar);

      expect(obtenido).toBeDefined();
      console.info(
        `${sinPrefijo(lugar.nombre)}: obtenido ${obtenido?.distancia_m} m | esperado ${Math.round(geodesica)} m (geodésica) | recta esférica ${Math.round(recta)} m`
      );
      expect(Math.abs((obtenido?.distancia_m ?? Infinity) - geodesica)).toBeLessThanOrEqual(1);
      expect(Math.abs((obtenido?.distancia_m ?? Infinity) - recta)).toBeLessThanOrEqual(Math.max(1, recta * 0.005));
    }
  );

  it.each(ORIGENES.map((origen) => ({ nombre: origen.nombre, punto: origen.punto })))(
    'CP-S12-DIST-002 desde $nombre toda distancia coincide con la geodésica con 1 m de tolerancia',
    async ({ punto }) => {
      const respuesta = await pedir(servidor, { lat: punto.lat, lng: punto.lng });
      const lugares = lugaresDe(respuesta);

      expect(lugares).toHaveLength(LUGARES.length);
      for (const obtenido of lugares) {
        const lugar = LUGARES.find((candidato) => candidato.nombre === obtenido.nombre);
        expect(lugar).toBeDefined();
        expect(Math.abs((obtenido.distancia_m ?? Infinity) - vincenty(punto, lugar!))).toBeLessThanOrEqual(1);
      }
    }
  );

  it('CP-S12-DIST-003 el lugar que está en el mismo punto del origen queda a 0 m', async () => {
    const respuesta = await pedir(servidor, { lat: ORIGEN.lat, lng: ORIGEN.lng });
    const lugar = lugaresDe(respuesta).find((candidato) => candidato.nombre === LUGAR_EN_EL_ORIGEN.nombre);

    expect(lugar?.distancia_m).toBe(0);
  });

  it('CP-S12-DIST-004 toda distancia es un número entero de metros', async () => {
    const respuesta = await pedir(servidor, { lat: ORIGEN.lat, lng: ORIGEN.lng });

    for (const lugar of lugaresDe(respuesta)) {
      expect(Number.isInteger(lugar.distancia_m)).toBe(true);
    }
  });

  it('CP-S12-DIST-005 la latitud y la longitud del lugar llegan sin alteración', async () => {
    const respuesta = await pedir(servidor, { lat: ORIGEN.lat, lng: ORIGEN.lng });

    for (const obtenido of lugaresDe(respuesta)) {
      const lugar = LUGARES.find((candidato) => candidato.nombre === obtenido.nombre);
      expect(obtenido.latitud).toBeCloseTo(lugar!.lat, 9);
      expect(obtenido.longitud).toBeCloseTo(lugar!.lng, 9);
    }
  });
});

describe('Orden por distancia', () => {
  it.each(ORIGENES.map((origen) => ({ nombre: origen.nombre, punto: origen.punto })))(
    'CP-S12-ORD-001 desde $nombre los lugares van de más cerca a más lejos',
    async ({ punto }) => {
      const respuesta = await pedir(servidor, { lat: punto.lat, lng: punto.lng });
      const esperado = [...LUGARES]
        .sort((a, b) => vincenty(punto, a) - vincenty(punto, b) || a.nombre.localeCompare(b.nombre))
        .map((lugar) => lugar.nombre);

      expect(lugaresDe(respuesta).map((lugar) => lugar.nombre)).toEqual(esperado);
    }
  );

  it('CP-S12-ORD-002 la distancia nunca baja de un lugar al siguiente', async () => {
    const respuesta = await pedir(servidor, { lat: ORIGEN.lat, lng: ORIGEN.lng });
    const distancias = lugaresDe(respuesta).map((lugar) => lugar.distancia_m ?? NaN);

    for (let i = 1; i < distancias.length; i += 1) {
      expect(distancias[i]).toBeGreaterThanOrEqual(distancias[i - 1]);
    }
  });

  it('CP-S12-ORD-003 con la misma distancia desempata por nombre y no por orden de carga', async () => {
    const respuesta = await pedir(servidor, { lat: ORIGEN.lat, lng: ORIGEN.lng });
    const nombres = lugaresDe(respuesta).map((lugar) => lugar.nombre);
    const posicionA = nombres.findIndex((nombre) => nombre.endsWith('Gemelo A'));
    const posicionB = nombres.findIndex((nombre) => nombre.endsWith('Gemelo B'));

    expect(posicionA).toBeGreaterThanOrEqual(0);
    expect(posicionB).toBe(posicionA + 1);
    expect(lugaresDe(respuesta)[posicionA].distancia_m).toBe(lugaresDe(respuesta)[posicionB].distancia_m);
  });
});
