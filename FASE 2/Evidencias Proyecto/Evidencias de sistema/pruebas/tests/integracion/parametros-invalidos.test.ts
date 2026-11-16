import { afterAll, afterEach, beforeAll, describe, expect, it, vi } from 'vitest';
import { pool } from '@api/db/pool';
import { pedir, type Consulta } from '../../src/cliente';
import { cerrarEscenario, prepararEscenario } from '../../src/escenario';
import type { Servidor } from '../../src/servidor';

let servidor: Servidor;

const LATITUD = 'La latitud debe ser un número entre -90 y 90';
const LONGITUD = 'La longitud debe ser un número entre -180 y 180';
const RADIO = 'El radio debe ser un número de metros entre 1 y 50000';
const CATEGORIA = 'La categoría debe ser una de: veterinaria, urgencia_24h, pet_shop, farmacia_veterinaria';
const ZONA = 'La zona visible debe venir como bbox=oeste,sur,este,norte con coordenadas válidas';
const JUNTAS = 'Para buscar por cercanía envía lat y lng juntas';
const SIN_PUNTO = 'El radio necesita lat y lng';

interface CasoInvalido {
  id: string;
  descripcion: string;
  consulta: Consulta;
  mensaje: string;
}

const CASOS: CasoInvalido[] = [
  { id: '001', descripcion: 'lat sin lng', consulta: { lat: -33.04 }, mensaje: JUNTAS },
  { id: '002', descripcion: 'lng sin lat', consulta: { lng: -71.6 }, mensaje: JUNTAS },
  { id: '003', descripcion: 'radio sin lat ni lng', consulta: { radio: 1000 }, mensaje: SIN_PUNTO },
  { id: '004', descripcion: 'latitud 91', consulta: { lat: 91, lng: 0 }, mensaje: LATITUD },
  { id: '005', descripcion: 'latitud -91', consulta: { lat: -91, lng: 0 }, mensaje: LATITUD },
  { id: '006', descripcion: 'latitud con letras', consulta: { lat: 'abc', lng: 0 }, mensaje: LATITUD },
  { id: '007', descripcion: 'latitud NaN', consulta: { lat: 'NaN', lng: 0 }, mensaje: LATITUD },
  { id: '008', descripcion: 'longitud 181', consulta: { lat: 0, lng: 181 }, mensaje: LONGITUD },
  { id: '009', descripcion: 'longitud -181', consulta: { lat: 0, lng: -181 }, mensaje: LONGITUD },
  { id: '010', descripcion: 'longitud con letras', consulta: { lat: 0, lng: 'abc' }, mensaje: LONGITUD },
  { id: '011', descripcion: 'radio 0', consulta: { lat: 0, lng: 0, radio: 0 }, mensaje: RADIO },
  { id: '012', descripcion: 'radio negativo', consulta: { lat: 0, lng: 0, radio: -5 }, mensaje: RADIO },
  { id: '013', descripcion: 'radio menor a 1 m', consulta: { lat: 0, lng: 0, radio: 0.5 }, mensaje: RADIO },
  { id: '014', descripcion: 'radio 50 001', consulta: { lat: 0, lng: 0, radio: 50001 }, mensaje: RADIO },
  { id: '015', descripcion: 'radio con letras', consulta: { lat: 0, lng: 0, radio: 'abc' }, mensaje: RADIO },
  { id: '016', descripcion: 'categoría desconocida', consulta: { categoria: 'laboratorio' }, mensaje: CATEGORIA },
  { id: '017', descripcion: 'zona visible con 3 valores', consulta: { bbox: '1,2,3' }, mensaje: ZONA },
  { id: '018', descripcion: 'zona visible con letras', consulta: { bbox: 'a,b,c,d' }, mensaje: ZONA },
  { id: '019', descripcion: 'zona visible con oeste mayor que este', consulta: { bbox: '-71.5,-33.1,-71.7,-32.9' }, mensaje: ZONA },
  { id: '020', descripcion: 'zona visible con latitud fuera de rango', consulta: { bbox: '-71.7,-95,-71.5,-32.9' }, mensaje: ZONA },
  { id: '021', descripcion: 'zona visible con longitud fuera de rango', consulta: { bbox: '-190,-33.1,-71.5,-32.9' }, mensaje: ZONA },
  { id: '022', descripcion: 'zona visible con un valor vacío', consulta: { bbox: '-71.7,,-71.5,-32.9' }, mensaje: ZONA },
];

const VALIDOS: { descripcion: string; consulta: Consulta }[] = [
  { descripcion: 'latitud y longitud máximas', consulta: { lat: 90, lng: 180 } },
  { descripcion: 'latitud y longitud mínimas', consulta: { lat: -90, lng: -180 } },
  { descripcion: 'radio mínimo de 1 m', consulta: { lat: -33.04, lng: -71.62, radio: 1 } },
  { descripcion: 'radio máximo de 50 000 m', consulta: { lat: -33.04, lng: -71.62, radio: 50000 } },
  { descripcion: 'radio con decimales', consulta: { lat: -33.04, lng: -71.62, radio: 1500.5 } },
  { descripcion: 'todos los parámetros a la vez', consulta: { lat: -33.04, lng: -71.62, radio: 3000, categoria: 'veterinaria', bbox: '-71.7,-33.1,-71.5,-32.9' } },
];

beforeAll(async () => {
  servidor = await prepararEscenario();
});

afterAll(async () => {
  await cerrarEscenario(servidor);
});

afterEach(() => {
  vi.restoreAllMocks();
});

describe('Parámetros inválidos contra la API', () => {
  it.each(CASOS)(
    'CP-S12-PAR-$id $descripcion responde 400 con un mensaje claro y no consulta la base',
    async ({ consulta, mensaje }) => {
      const espia = vi.spyOn(pool, 'query');

      const respuesta = await pedir(servidor, consulta);

      console.info(`${JSON.stringify(consulta)} -> ${respuesta.estado} ${JSON.stringify(respuesta.cuerpo)}`);
      expect(respuesta.estado).toBe(400);
      expect(respuesta.cuerpo).toEqual({ error: mensaje });
      expect(espia).not.toHaveBeenCalled();
    }
  );
});

describe('Parámetros válidos en los límites', () => {
  it.each(VALIDOS)('CP-S12-PAR-100 acepta $descripcion', async ({ consulta }) => {
    const respuesta = await pedir(servidor, consulta);

    expect(respuesta.estado).toBe(200);
    expect(Array.isArray(respuesta.cuerpo.locations)).toBe(true);
  });
});
