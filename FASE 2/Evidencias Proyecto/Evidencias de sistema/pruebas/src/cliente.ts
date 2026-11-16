import type { Servidor } from './servidor';

export interface LugarApi {
  id: number;
  nombre: string;
  categoria: string;
  direccion: string;
  telefono: string | null;
  horario: string | null;
  latitud: number;
  longitud: number;
  distancia_m?: number;
}

export interface Respuesta {
  estado: number;
  encabezados: Headers;
  cuerpo: any;
  milisegundos: number;
}

export type Consulta = Record<string, string | number>;

export async function pedir(
  servidor: Servidor,
  consulta: Consulta | string = {},
  ruta = '/api/map/locations'
): Promise<Respuesta> {
  const texto =
    typeof consulta === 'string'
      ? consulta
      : new URLSearchParams(Object.entries(consulta).map(([clave, valor]) => [clave, String(valor)])).toString();
  const inicio = performance.now();
  const respuesta = await fetch(`${servidor.url}${ruta}${texto ? `?${texto}` : ''}`);
  const cuerpo = await respuesta.json().catch(() => null);
  return {
    estado: respuesta.status,
    encabezados: respuesta.headers,
    cuerpo,
    milisegundos: performance.now() - inicio,
  };
}

export function lugaresDe(respuesta: Respuesta): LugarApi[] {
  return respuesta.cuerpo.locations as LugarApi[];
}
