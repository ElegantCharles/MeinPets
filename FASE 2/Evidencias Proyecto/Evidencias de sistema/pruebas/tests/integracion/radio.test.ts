import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { lugaresDe, pedir } from '../../src/cliente';
import {
  CINCO_LUGARES_CONOCIDOS,
  LUGAR_EN_EL_ORIGEN,
  LUGARES,
  ORIGEN,
  ORIGEN_SIN_LUGARES,
  sinPrefijo,
} from '../../src/datos';
import { cerrarEscenario, prepararEscenario } from '../../src/escenario';
import { vincenty } from '../../src/geodesia';
import type { Servidor } from '../../src/servidor';

let servidor: Servidor;

const RADIOS = [500, 1000, 2000, 5000, 10000, 20000, 50000];
const punto = { lat: ORIGEN.lat, lng: ORIGEN.lng };

beforeAll(async () => {
  servidor = await prepararEscenario();
});

afterAll(async () => {
  await cerrarEscenario(servidor);
});

describe('Búsqueda por radio', () => {
  it.each(RADIOS)('CP-S12-RAD-001 radio de %i m: devuelve exactamente los lugares que están dentro', async (radio) => {
    const respuesta = await pedir(servidor, { ...punto, radio });
    const obtenidos = lugaresDe(respuesta).map((lugar) => lugar.nombre);
    const esperados = LUGARES.filter((lugar) => vincenty(ORIGEN, lugar) <= radio).map((lugar) => lugar.nombre);

    expect(respuesta.estado).toBe(200);
    console.info(`radio ${radio} m: esperados ${esperados.length} | obtenidos ${obtenidos.length}`);
    expect([...obtenidos].sort()).toEqual([...esperados].sort());
  });

  it.each(RADIOS)('CP-S12-RAD-002 radio de %i m: ningún lugar aparece más lejos que el radio', async (radio) => {
    const respuesta = await pedir(servidor, { ...punto, radio });

    for (const lugar of lugaresDe(respuesta)) {
      expect(lugar.distancia_m).toBeLessThanOrEqual(radio);
    }
  });

  it.each(CINCO_LUGARES_CONOCIDOS.map((lugar) => ({ nombre: sinPrefijo(lugar.nombre), lugar })))(
    'CP-S12-RAD-003 $nombre: con el radio 5 m más corto que su distancia no aparece y con 5 m más largo sí',
    async ({ lugar }) => {
      const distancia = vincenty(ORIGEN, lugar);

      const corto = await pedir(servidor, { ...punto, radio: distancia - 5 });
      const largo = await pedir(servidor, { ...punto, radio: distancia + 5 });

      expect(lugaresDe(corto).map((candidato) => candidato.nombre)).not.toContain(lugar.nombre);
      expect(lugaresDe(largo).map((candidato) => candidato.nombre)).toContain(lugar.nombre);
    }
  );

  it('CP-S12-RAD-004 un radio de 1 m devuelve solo el lugar que está en el origen', async () => {
    const respuesta = await pedir(servidor, { ...punto, radio: 1 });

    expect(lugaresDe(respuesta).map((lugar) => lugar.nombre)).toEqual([LUGAR_EN_EL_ORIGEN.nombre]);
  });

  it('CP-S12-RAD-005 el radio máximo de 50 000 m incluye todos los lugares cargados', async () => {
    const respuesta = await pedir(servidor, { ...punto, radio: 50000 });

    expect(lugaresDe(respuesta)).toHaveLength(LUGARES.length);
  });

  it('CP-S12-RAD-006 sin lugares dentro del radio responde 200 con la lista vacía', async () => {
    const respuesta = await pedir(servidor, { ...ORIGEN_SIN_LUGARES, radio: 1000 });

    expect(respuesta.estado).toBe(200);
    expect(respuesta.cuerpo).toEqual({ locations: [] });
  });

  it('CP-S12-RAD-007 el radio se combina con la zona visible', async () => {
    const [oeste, sur, este, norte] = [-71.65, -33.06, -71.6, -33.03];
    const respuesta = await pedir(servidor, { ...punto, radio: 5000, bbox: `${oeste},${sur},${este},${norte}` });
    const esperados = LUGARES.filter(
      (lugar) =>
        lugar.lng >= oeste &&
        lugar.lng <= este &&
        lugar.lat >= sur &&
        lugar.lat <= norte &&
        vincenty(ORIGEN, lugar) <= 5000
    ).map((lugar) => lugar.nombre);

    expect(esperados.length).toBeGreaterThan(0);
    expect(esperados.length).toBeLessThan(LUGARES.length);
    expect(lugaresDe(respuesta).map((lugar) => lugar.nombre).sort()).toEqual([...esperados].sort());
  });
});
