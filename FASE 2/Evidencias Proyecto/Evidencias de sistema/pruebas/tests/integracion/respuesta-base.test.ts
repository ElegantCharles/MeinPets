import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { bd, vaciarLugares } from '../../src/baseDeDatos';
import { lugaresDe, pedir } from '../../src/cliente';
import { CAMPOS_PUBLICOS, LUGARES } from '../../src/datos';
import { cerrarEscenario, prepararEscenario } from '../../src/escenario';
import type { Servidor } from '../../src/servidor';

let servidor: Servidor;

beforeAll(async () => {
  servidor = await prepararEscenario();
});

afterAll(async () => {
  await cerrarEscenario(servidor);
});

describe('La respuesta de siempre se mantiene cuando no llegan lat y lng', () => {
  it('CP-S12-BASE-001 devuelve todos los lugares ordenados por nombre y sin distancia', async () => {
    const respuesta = await pedir(servidor);
    const { rows } = await bd.query<{ nombre: string }>('SELECT nombre FROM establecimientos ORDER BY nombre, id');

    expect(respuesta.estado).toBe(200);
    expect(lugaresDe(respuesta).map((lugar) => lugar.nombre)).toEqual(rows.map((fila) => fila.nombre));
    for (const lugar of lugaresDe(respuesta)) {
      expect(lugar).not.toHaveProperty('distancia_m');
    }
  });

  it('CP-S12-BASE-002 cada lugar trae solo los campos públicos de siempre', async () => {
    const respuesta = await pedir(servidor);

    for (const lugar of lugaresDe(respuesta)) {
      expect(Object.keys(lugar).sort()).toEqual(CAMPOS_PUBLICOS);
    }
  });

  it('CP-S12-BASE-003 con categoría y zona visible, sin lat y lng, tampoco agrega distancia', async () => {
    const respuesta = await pedir(servidor, { categoria: 'pet_shop', bbox: '-71.65,-33.06,-71.60,-33.03' });

    expect(respuesta.estado).toBe(200);
    expect(lugaresDe(respuesta).length).toBeGreaterThan(0);
    for (const lugar of lugaresDe(respuesta)) {
      expect(lugar.categoria).toBe('pet_shop');
      expect(lugar).not.toHaveProperty('distancia_m');
    }
  });

  it('CP-S12-BASE-004 teléfono, horario y dirección llegan tal como se guardaron', async () => {
    const respuesta = await pedir(servidor);
    const lugar = lugaresDe(respuesta).find((candidato) => candidato.nombre === LUGARES[0].nombre);

    expect(lugar).toMatchObject({
      direccion: LUGARES[0].direccion,
      telefono: LUGARES[0].telefono,
      horario: LUGARES[0].horario,
      categoria: LUGARES[0].categoria,
    });
  });

  it('CP-S12-BASE-005 la respuesta indica que se puede guardar 60 segundos', async () => {
    const respuesta = await pedir(servidor);

    expect(respuesta.encabezados.get('cache-control')).toBe('public, max-age=60');
  });

  it('CP-S12-BASE-006 sin lugares cargados responde 200 con la lista vacía', async () => {
    await vaciarLugares();

    const respuesta = await pedir(servidor);
    const cercania = await pedir(servidor, { lat: -33.04, lng: -71.62, radio: 5000 });

    expect(respuesta.estado).toBe(200);
    expect(respuesta.cuerpo).toEqual({ locations: [] });
    expect(cercania.cuerpo).toEqual({ locations: [] });
  });
});
