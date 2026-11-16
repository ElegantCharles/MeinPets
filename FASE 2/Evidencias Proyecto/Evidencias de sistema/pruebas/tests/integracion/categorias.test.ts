import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { lugaresDe, pedir } from '../../src/cliente';
import { CATEGORIAS, LUGARES, ORIGEN } from '../../src/datos';
import { cerrarEscenario, prepararEscenario } from '../../src/escenario';
import { vincenty } from '../../src/geodesia';
import type { Servidor } from '../../src/servidor';

let servidor: Servidor;

const punto = { lat: ORIGEN.lat, lng: ORIGEN.lng };

beforeAll(async () => {
  servidor = await prepararEscenario();
});

afterAll(async () => {
  await cerrarEscenario(servidor);
});

describe('Filtro por categoría', () => {
  it.each(CATEGORIAS)('CP-S12-CAT-001 el filtro %s devuelve solo esa categoría', async (categoria) => {
    const respuesta = await pedir(servidor, { categoria });
    const esperados = LUGARES.filter((lugar) => lugar.categoria === categoria).map((lugar) => lugar.nombre);

    expect(respuesta.estado).toBe(200);
    expect(esperados.length).toBeGreaterThan(0);
    for (const lugar of lugaresDe(respuesta)) {
      expect(lugar.categoria).toBe(categoria);
    }
    expect(lugaresDe(respuesta).map((lugar) => lugar.nombre).sort()).toEqual([...esperados].sort());
  });

  it('CP-S12-CAT-002 sin filtro vuelven todos los lugares de las cuatro categorías', async () => {
    const respuesta = await pedir(servidor);

    expect(lugaresDe(respuesta)).toHaveLength(LUGARES.length);
    expect(new Set(lugaresDe(respuesta).map((lugar) => lugar.categoria))).toEqual(new Set(CATEGORIAS));
  });

  it('CP-S12-CAT-003 una categoría en blanco equivale a no filtrar', async () => {
    const respuesta = await pedir(servidor, 'categoria=');

    expect(respuesta.estado).toBe(200);
    expect(lugaresDe(respuesta)).toHaveLength(LUGARES.length);
  });

  it.each(CATEGORIAS)(
    'CP-S12-CAT-004 %s con cercanía: solo esa categoría, dentro del radio y de más cerca a más lejos',
    async (categoria) => {
      const radio = 10000;
      const respuesta = await pedir(servidor, { ...punto, radio, categoria });
      const esperados = LUGARES.filter(
        (lugar) => lugar.categoria === categoria && vincenty(ORIGEN, lugar) <= radio
      )
        .sort((a, b) => vincenty(ORIGEN, a) - vincenty(ORIGEN, b) || a.nombre.localeCompare(b.nombre))
        .map((lugar) => lugar.nombre);

      expect(esperados.length).toBeGreaterThan(0);
      expect(lugaresDe(respuesta).map((lugar) => lugar.nombre)).toEqual(esperados);
      for (const lugar of lugaresDe(respuesta)) {
        expect(lugar.categoria).toBe(categoria);
        expect(lugar.distancia_m).toBeLessThanOrEqual(radio);
      }
    }
  );

  it('CP-S12-CAT-005 una categoría sin lugares dentro del radio responde 200 con la lista vacía', async () => {
    const radio = 1000;
    const hayDentro = LUGARES.some(
      (lugar) => lugar.categoria === 'farmacia_veterinaria' && vincenty(ORIGEN, lugar) <= radio
    );

    const respuesta = await pedir(servidor, { ...punto, radio, categoria: 'farmacia_veterinaria' });

    expect(hayDentro).toBe(false);
    expect(respuesta.estado).toBe(200);
    expect(respuesta.cuerpo).toEqual({ locations: [] });
  });

  it('CP-S12-CAT-006 al limpiar el filtro la misma búsqueda vuelve a traer todas las categorías', async () => {
    const radio = 10000;
    const filtrada = await pedir(servidor, { ...punto, radio, categoria: 'veterinaria' });
    const limpia = await pedir(servidor, { ...punto, radio });

    expect(new Set(lugaresDe(filtrada).map((lugar) => lugar.categoria)).size).toBe(1);
    expect(new Set(lugaresDe(limpia).map((lugar) => lugar.categoria)).size).toBe(CATEGORIAS.length);
    expect(lugaresDe(limpia).length).toBeGreaterThan(lugaresDe(filtrada).length);
  });
});
