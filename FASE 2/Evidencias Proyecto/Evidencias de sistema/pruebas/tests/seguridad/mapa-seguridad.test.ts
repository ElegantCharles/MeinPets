import { afterAll, afterEach, beforeAll, describe, expect, it, vi } from 'vitest';
import { pool } from '@api/db/pool';
import { contarLugares } from '../../src/baseDeDatos';
import { lugaresDe, pedir, type Consulta } from '../../src/cliente';
import { CAMPOS_PUBLICOS, LUGARES, ORIGEN } from '../../src/datos';
import { cerrarEscenario, prepararEscenario } from '../../src/escenario';
import type { Servidor } from '../../src/servidor';

let servidor: Servidor;

const CARGAS = [
  "' OR '1'='1",
  "'; DROP TABLE establecimientos; --",
  '1; SELECT pg_sleep(5)',
  '1 UNION SELECT contrasena FROM usuarios',
  '" OR 1=1 --',
];

const OBJETIVOS: { parametro: string; armar: (valor: string) => Consulta }[] = [
  { parametro: 'categoria', armar: (valor) => ({ categoria: valor }) },
  { parametro: 'bbox', armar: (valor) => ({ bbox: valor }) },
  { parametro: 'lat', armar: (valor) => ({ lat: valor, lng: 0 }) },
  { parametro: 'lng', armar: (valor) => ({ lat: 0, lng: valor }) },
  { parametro: 'radio', armar: (valor) => ({ lat: 0, lng: 0, radio: valor }) },
];

const CASOS_DE_INYECCION = OBJETIVOS.flatMap((objetivo) =>
  CARGAS.map((carga, indice) => ({
    parametro: objetivo.parametro,
    carga: indice + 1,
    consulta: objetivo.armar(carga),
  }))
);

beforeAll(async () => {
  servidor = await prepararEscenario();
});

afterAll(async () => {
  await cerrarEscenario(servidor);
});

afterEach(() => {
  vi.restoreAllMocks();
});

describe('Inyección SQL', () => {
  it.each(CASOS_DE_INYECCION)(
    'CP-S12-SEG-001 carga $carga en $parametro: se rechaza con 400 y la base queda intacta',
    async ({ consulta }) => {
      const antes = await contarLugares();
      const espia = vi.spyOn(pool, 'query');

      const respuesta = await pedir(servidor, consulta);

      expect(respuesta.estado).toBe(400);
      expect(respuesta.milisegundos).toBeLessThan(2000);
      expect(JSON.stringify(respuesta.cuerpo)).not.toMatch(/syntax|pg_sleep|DROP|UNION|relation/i);
      expect(espia).not.toHaveBeenCalled();
      expect(await contarLugares()).toBe(antes);
    }
  );

  it('CP-S12-SEG-002 los valores viajan como parámetros y nunca dentro del texto de la consulta', async () => {
    const espia = vi.spyOn(pool, 'query');

    await pedir(servidor, {
      categoria: 'veterinaria',
      lat: -33.1234,
      lng: -71.5678,
      radio: 2345,
      bbox: '-71.9,-33.9,-71.1,-33.1',
    });
    await pedir(servidor, {
      categoria: 'pet_shop',
      lat: -32.9876,
      lng: -71.4321,
      radio: 4321,
      bbox: '-71.8,-33.8,-71.2,-33.2',
    });

    const [[textoA, parametrosA], [textoB, parametrosB]] = espia.mock.calls as unknown as [string, unknown[]][];
    expect(textoA).toBe(textoB);
    for (const valor of ['veterinaria', '-33.1234', '-71.5678', '2345', '-71.9']) {
      expect(textoA).not.toContain(valor);
    }
    expect(parametrosA).not.toEqual(parametrosB);
  });
});

describe('Parámetros repetidos, extremos y de gran tamaño', () => {
  it.each([
    'lat=1&lat=2&lng=3',
    'lat=0&lng=0&radio=1&radio=2',
    'categoria=veterinaria&categoria=pet_shop',
    'bbox=-71.7,-33.1,-71.5,-32.9&bbox=-71.7,-33.1,-71.5,-32.9',
    'lat[]=1&lng=0',
  ])('CP-S12-SEG-003 parámetros repetidos o con corchetes (%s) responden 400 y no 500', async (consulta) => {
    const respuesta = await pedir(servidor, consulta);

    expect(respuesta.estado).toBe(400);
  });

  it.each([
    'lat=Infinity&lng=0',
    'lat=-Infinity&lng=0',
    'lat=1e999&lng=0',
    'lat=0&lng=Infinity',
    'lat=0&lng=0&radio=Infinity',
    'lat=0&lng=0&radio=1e999',
  ])('CP-S12-SEG-004 el valor extremo %s responde 400', async (consulta) => {
    const respuesta = await pedir(servidor, consulta);

    expect(respuesta.estado).toBe(400);
  });

  it('CP-S12-SEG-005 un valor de 5000 caracteres responde 400 sin repetirlo en el mensaje', async () => {
    const respuesta = await pedir(servidor, `categoria=${'a'.repeat(5000)}`);

    expect(respuesta.estado).toBe(400);
    expect(JSON.stringify(respuesta.cuerpo)).not.toContain('aaaaaaaaaa');
  });

  it('CP-S12-SEG-006 una dirección de más de 16 KB se rechaza y el servidor sigue respondiendo', async () => {
    const resultado = await fetch(`${servidor.url}/api/map/locations?categoria=${'a'.repeat(20000)}`).then(
      (respuesta) => respuesta.status,
      () => 'conexión cerrada'
    );
    const despues = await pedir(servidor);

    expect([414, 431, 'conexión cerrada']).toContain(resultado);
    expect(despues.estado).toBe(200);
  });
});

describe('Fuga de información y superficie expuesta', () => {
  it('CP-S12-SEG-007 un fallo de la base responde 500 sin detalles internos', async () => {
    const consola = vi.spyOn(console, 'error').mockImplementation(() => undefined);
    vi.spyOn(pool, 'query').mockRejectedValueOnce(
      new Error('password authentication failed for user "meinpets_user" at 172.18.0.2')
    );

    const respuesta = await pedir(servidor, { lat: ORIGEN.lat, lng: ORIGEN.lng });

    expect(respuesta.estado).toBe(500);
    expect(respuesta.cuerpo).toEqual({ error: 'Error interno del servidor' });
    expect(JSON.stringify(respuesta.cuerpo)).not.toMatch(/password|meinpets_user|172\.18|node_modules|\.ts:/);
    expect(consola).toHaveBeenCalled();
  });

  it('CP-S12-SEG-008 la respuesta no revela la tecnología del servidor', async () => {
    const respuesta = await pedir(servidor);

    expect(respuesta.encabezados.has('x-powered-by')).toBe(false);
  });

  it('CP-S12-SEG-009 la ruta pública solo entrega los campos del mapa y no el correo ni las fechas internas', async () => {
    const respuesta = await pedir(servidor, { lat: ORIGEN.lat, lng: ORIGEN.lng });

    expect(lugaresDe(respuesta)).toHaveLength(LUGARES.length);
    for (const lugar of lugaresDe(respuesta)) {
      expect(Object.keys(lugar).sort()).toEqual([...CAMPOS_PUBLICOS, 'distancia_m'].sort());
    }
    expect(JSON.stringify(respuesta.cuerpo)).not.toMatch(/prueba\.invalid|contacto_email|created_at|updated_at|ubicacion/);
  });

  it.each(['POST', 'PUT', 'PATCH', 'DELETE'])(
    'CP-S12-SEG-010 el método %s no está disponible en la ruta y no modifica datos',
    async (metodo) => {
      const antes = await contarLugares();

      const respuesta = await fetch(`${servidor.url}/api/map/locations`, {
        method: metodo,
        headers: { 'Content-Type': 'application/json' },
        body: metodo === 'DELETE' ? undefined : '{}',
      });

      expect(respuesta.status).toBe(404);
      expect(await respuesta.json()).toEqual({ error: 'Ruta no encontrada' });
      expect(await contarLugares()).toBe(antes);
    }
  );
});
