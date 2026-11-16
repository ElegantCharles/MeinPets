import { afterAll, afterEach, beforeAll, describe, expect, it, vi } from 'vitest';
import { pool } from '@api/db/pool';
import { pedir } from '../../src/cliente';
import { iniciarServidor, type Servidor } from '../../src/servidor';

let servidor: Servidor;

beforeAll(async () => {
  servidor = await iniciarServidor();
});

afterAll(async () => {
  await servidor.cerrar();
});

afterEach(() => {
  vi.restoreAllMocks();
});

type Espia = ReturnType<typeof simularBase>;

function simularBase(filas: unknown[] = []) {
  return vi.spyOn(pool, 'query').mockResolvedValue({ rows: filas } as never);
}

function consultaEjecutada(espia: Espia): { texto: string; parametros: unknown[] } {
  const [texto, parametros] = espia.mock.calls[0] as unknown as [string, unknown[]];
  return { texto, parametros };
}

function numerosDeParametros(texto: string): number[] {
  return [...new Set([...texto.matchAll(/\$(\d+)/g)].map((coincidencia) => Number(coincidencia[1])))].sort(
    (a, b) => a - b
  );
}

const FILA = {
  id: 1,
  nombre: 'Veterinaria Uno',
  categoria: 'veterinaria',
  direccion: 'Calle 1',
  telefono: null,
  horario: null,
  latitud: -33.04,
  longitud: -71.62,
};

describe('GET /api/map/locations: armado de la consulta', () => {
  it('CP-S12-API-001 sin parámetros nuevos no calcula distancia, ordena por nombre y limita a 1000', async () => {
    const espia = simularBase([FILA]);

    const respuesta = await pedir(servidor);

    expect(respuesta.estado).toBe(200);
    expect(respuesta.cuerpo).toEqual({ locations: [FILA] });
    expect(respuesta.encabezados.get('cache-control')).toBe('public, max-age=60');
    const { texto, parametros } = consultaEjecutada(espia);
    expect(texto).not.toContain('ST_Distance');
    expect(texto).not.toContain('ST_DWithin');
    expect(texto).toContain('ORDER BY nombre, id');
    expect(parametros).toEqual([1000]);
  });

  it('CP-S12-API-002 con lat y lng calcula la distancia y ordena por ella', async () => {
    const espia = simularBase();

    await pedir(servidor, { lat: -33.0393, lng: -71.6273 });

    const { texto, parametros } = consultaEjecutada(espia);
    expect(texto).toContain('ST_Distance(ubicacion::geography');
    expect(texto).toContain('AS distancia_m');
    expect(texto).toContain('ORDER BY distancia_m, nombre, id');
    expect(texto).not.toContain('ST_DWithin');
    expect(parametros).toEqual([-71.6273, -33.0393, 1000]);
  });

  it('CP-S12-API-003 con radio agrega el filtro por distancia con el radio como parámetro', async () => {
    const espia = simularBase();

    await pedir(servidor, { lat: -33.0393, lng: -71.6273, radio: 2500 });

    const { texto, parametros } = consultaEjecutada(espia);
    expect(texto).toContain('ST_DWithin(ubicacion::geography');
    expect(parametros).toEqual([-71.6273, -33.0393, 2500, 1000]);
  });

  it('CP-S12-API-004 redondea la distancia a metros enteros', async () => {
    simularBase([
      { ...FILA, id: 1, distancia_m: 1234.5 },
      { ...FILA, id: 2, distancia_m: 0.49 },
      { ...FILA, id: 3, distancia_m: '987.4' },
      { ...FILA, id: 4, distancia_m: 999.5 },
    ]);

    const respuesta = await pedir(servidor, { lat: -33.04, lng: -71.62 });

    expect(respuesta.cuerpo.locations.map((lugar: { distancia_m: number }) => lugar.distancia_m)).toEqual([
      1235, 0, 987, 1000,
    ]);
  });

  it('CP-S12-API-005 categoría, zona visible, punto y radio juntos numeran bien los parámetros', async () => {
    const espia = simularBase();

    await pedir(servidor, {
      categoria: 'urgencia_24h',
      bbox: '-71.7,-33.1,-71.5,-32.9',
      lat: -33.04,
      lng: -71.62,
      radio: 1500,
    });

    const { texto, parametros } = consultaEjecutada(espia);
    expect(parametros).toEqual(['urgencia_24h', -71.7, -33.1, -71.5, -32.9, -71.62, -33.04, 1500, 1000]);
    expect(numerosDeParametros(texto)).toEqual(parametros.map((_, indice) => indice + 1));
  });

  it('CP-S12-API-006 la categoría sola filtra sin agregar distancia', async () => {
    const espia = simularBase([FILA]);

    const respuesta = await pedir(servidor, { categoria: 'pet_shop' });

    const { texto, parametros } = consultaEjecutada(espia);
    expect(texto).toContain('categoria = $1');
    expect(texto).toContain('ORDER BY nombre, id');
    expect(parametros).toEqual(['pet_shop', 1000]);
    expect(respuesta.cuerpo.locations[0]).not.toHaveProperty('distancia_m');
  });

  it('CP-S12-API-007 los valores en blanco se ignoran como si no vinieran', async () => {
    const espia = simularBase();

    const respuesta = await pedir(servidor, 'lat=&lng=&radio=&categoria=&bbox=');

    expect(respuesta.estado).toBe(200);
    const { texto, parametros } = consultaEjecutada(espia);
    expect(texto).not.toContain('ST_Distance');
    expect(parametros).toEqual([1000]);
  });

  it.each([
    ['latitud y longitud máximas', { lat: 90, lng: 180 }],
    ['latitud y longitud mínimas', { lat: -90, lng: -180 }],
    ['radio mínimo de 1 m', { lat: 0, lng: 0, radio: 1 }],
    ['radio máximo de 50 000 m', { lat: 0, lng: 0, radio: 50000 }],
  ])('CP-S12-API-008 acepta %s', async (_nombre, consulta) => {
    const espia = simularBase();

    const respuesta = await pedir(servidor, consulta);

    expect(respuesta.estado).toBe(200);
    expect(espia).toHaveBeenCalledOnce();
  });

  it.each([
    ['sin lat', { lng: -71.6 }],
    ['sin lng', { lat: -33 }],
    ['latitud fuera de rango', { lat: 90.0001, lng: 0 }],
    ['longitud fuera de rango', { lat: 0, lng: -180.0001 }],
    ['radio en cero', { lat: 0, lng: 0, radio: 0 }],
    ['radio sobre el máximo', { lat: 0, lng: 0, radio: 50001 }],
    ['radio sin punto', { radio: 1000 }],
    ['categoría desconocida', { categoria: 'laboratorio' }],
    ['zona visible incompleta', { bbox: '1,2,3' }],
  ])('CP-S12-API-009 rechaza %s sin consultar la base', async (_nombre, consulta) => {
    const espia = simularBase();

    const respuesta = await pedir(servidor, consulta);

    expect(respuesta.estado).toBe(400);
    expect(typeof respuesta.cuerpo.error).toBe('string');
    expect(espia).not.toHaveBeenCalled();
  });
});
