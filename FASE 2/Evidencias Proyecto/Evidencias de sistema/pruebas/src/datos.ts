import { destino, type Punto } from './geodesia';

export const CATEGORIAS = ['veterinaria', 'urgencia_24h', 'pet_shop', 'farmacia_veterinaria'] as const;
export type Categoria = (typeof CATEGORIAS)[number];

export const PREFIJO = 'PRUEBA S12 - ';

export const sinPrefijo = (nombre: string) => nombre.slice(PREFIJO.length);

export interface LugarDePrueba extends Punto {
  nombre: string;
  categoria: Categoria;
  direccion: string;
  telefono: string | null;
  horario: string | null;
  correo: string | null;
}

export const ORIGEN: Punto = { lat: -33.0393, lng: -71.6273 };

export const ORIGENES: { nombre: string; punto: Punto }[] = [
  { nombre: 'Plaza Sotomayor, Valparaíso', punto: ORIGEN },
  { nombre: 'Muelle Vergara, Viña del Mar', punto: { lat: -33.0187, lng: -71.5503 } },
  { nombre: 'Plaza de Armas de Quilpué', punto: { lat: -33.0475, lng: -71.4428 } },
];

export const ORIGEN_SIN_LUGARES: Punto = { lat: -32.8337, lng: -70.5983 };

function lugar(nombre: string, categoria: Categoria, lat: number, lng: number): LugarDePrueba {
  return {
    nombre: `${PREFIJO}${nombre}`,
    categoria,
    lat,
    lng,
    direccion: `Referencia ${nombre}`,
    telefono: '+56 32 000 0000',
    horario: '09:00-19:00',
    correo: 'contacto@prueba.invalid',
  };
}

export const LUGARES_CONOCIDOS: LugarDePrueba[] = [
  lugar('Muelle Prat', 'urgencia_24h', -33.0378, -71.6262),
  lugar('Plaza Victoria', 'veterinaria', -33.0453, -71.6213),
  lugar('Cerro Alegre', 'pet_shop', -33.0437, -71.6291),
  lugar('Plaza O Higgins', 'farmacia_veterinaria', -33.0449, -71.6142),
  lugar('Playa Ancha', 'pet_shop', -33.0282, -71.6502),
  lugar('Castillo Wulff', 'veterinaria', -33.0194, -71.5586),
  lugar('Muelle Vergara', 'urgencia_24h', -33.0187, -71.5503),
  lugar('Reloj de Flores', 'pet_shop', -33.0233, -71.5518),
  lugar('Plaza Vergara', 'farmacia_veterinaria', -33.0245, -71.5522),
  lugar('Playa Amarilla Concon', 'veterinaria', -32.9298, -71.5232),
  lugar('Plaza de Armas Quilpue', 'urgencia_24h', -33.0475, -71.4428),
  lugar('Plaza de Villa Alemana', 'farmacia_veterinaria', -33.0425, -71.3737),
];

export const CINCO_LUGARES_CONOCIDOS: LugarDePrueba[] = [
  'Plaza Victoria',
  'Castillo Wulff',
  'Muelle Vergara',
  'Playa Amarilla Concon',
  'Plaza de Armas Quilpue',
].map((nombre) => {
  const encontrado = LUGARES_CONOCIDOS.find((l) => l.nombre === `${PREFIJO}${nombre}`);
  if (!encontrado) {
    throw new Error(`Falta el lugar de prueba ${nombre}`);
  }
  return encontrado;
});

export const LUGAR_EN_EL_ORIGEN = lugar('Mismo punto del origen', 'veterinaria', ORIGEN.lat, ORIGEN.lng);

const puntoDeLosGemelos = destino(ORIGEN, 90, 1500);
export const GEMELO_B = lugar('Gemelo B', 'pet_shop', puntoDeLosGemelos.lat, puntoDeLosGemelos.lng);
export const GEMELO_A = lugar('Gemelo A', 'pet_shop', puntoDeLosGemelos.lat, puntoDeLosGemelos.lng);

export const LUGARES: LugarDePrueba[] = [LUGAR_EN_EL_ORIGEN, ...LUGARES_CONOCIDOS, GEMELO_B, GEMELO_A];

export const CAMPOS_PUBLICOS = [
  'categoria',
  'direccion',
  'horario',
  'id',
  'latitud',
  'longitud',
  'nombre',
  'telefono',
];
