import { afterAll, afterEach, beforeAll, describe, expect, it, vi } from 'vitest';
import { pool } from '@api/db/pool';
import { bd, cerrarBd, vaciarLugares } from '../../src/baseDeDatos';
import { lugaresDe, pedir } from '../../src/cliente';
import { percentil, resumen } from '../../src/estadistica';
import { iniciarServidor, type Servidor } from '../../src/servidor';

let servidor: Servidor;

const TOTAL_DE_LUGARES = 30000;

const ORIGENES = Array.from({ length: 100 }, (_, i) => ({
  lat: -33.25 + (0.75 * ((i * 37) % 100)) / 100,
  lng: -71.75 + (0.9 * ((i * 53) % 100)) / 100,
}));

async function medir(consulta: (origen: { lat: number; lng: number }) => Record<string, string | number>) {
  const tiempos: number[] = [];
  const respuestas = [];
  for (const origen of ORIGENES) {
    const respuesta = await pedir(servidor, consulta(origen));
    tiempos.push(respuesta.milisegundos);
    respuestas.push(respuesta);
  }
  return { tiempos, respuestas };
}

beforeAll(async () => {
  await vaciarLugares();
  const cliente = await bd.connect();
  try {
    await cliente.query('SELECT setseed(0.42)');
    await cliente.query(
      `INSERT INTO establecimientos (nombre, categoria, direccion, ubicacion)
       SELECT 'PRUEBA S12 - rendimiento ' || n,
              (ARRAY['veterinaria', 'urgencia_24h', 'pet_shop', 'farmacia_veterinaria'])[1 + n % 4],
              'Referencia ' || n,
              ST_SetSRID(ST_MakePoint(-71.75 + random() * 0.9, -33.25 + random() * 0.75), 4326)
       FROM generate_series(1, $1::int) AS n`,
      [TOTAL_DE_LUGARES]
    );
    await cliente.query('ANALYZE establecimientos');
  } finally {
    cliente.release();
  }
  servidor = await iniciarServidor();
  for (const origen of ORIGENES.slice(0, 5)) {
    await pedir(servidor, { ...origen, radio: 2000 });
  }
});

afterAll(async () => {
  await servidor.cerrar();
  await cerrarBd();
});

afterEach(() => {
  vi.restoreAllMocks();
});

describe('Rendimiento con 30 000 lugares', () => {
  it('CP-S12-RND-001 la búsqueda por cercanía de 2 km responde con p95 bajo 300 ms', async () => {
    const { tiempos, respuestas } = await medir((origen) => ({ ...origen, radio: 2000 }));

    console.info(`búsqueda de 2 km: ${resumen(tiempos)}`);
    expect(respuestas.every((respuesta) => respuesta.estado === 200)).toBe(true);
    expect(percentil(tiempos, 95)).toBeLessThan(300);
  });

  it('CP-S12-RND-002 la búsqueda con el radio máximo de 50 km devuelve hasta 1000 lugares con p95 bajo 1 s', async () => {
    const { tiempos, respuestas } = await medir((origen) => ({ ...origen, radio: 50000 }));

    console.info(`búsqueda de 50 km: ${resumen(tiempos)}`);
    for (const respuesta of respuestas) {
      expect(respuesta.estado).toBe(200);
      expect(lugaresDe(respuesta).length).toBeLessThanOrEqual(1000);
    }
    expect(percentil(tiempos, 95)).toBeLessThan(1000);
  });

  it('CP-S12-RND-003 la lista sin filtros devuelve 1000 lugares con p95 bajo 1 s', async () => {
    const tiempos: number[] = [];
    for (let i = 0; i < 30; i += 1) {
      const respuesta = await pedir(servidor);
      expect(lugaresDe(respuesta)).toHaveLength(1000);
      tiempos.push(respuesta.milisegundos);
    }

    console.info(`lista sin filtros: ${resumen(tiempos)}`);
    expect(percentil(tiempos, 95)).toBeLessThan(1000);
  });

  it('CP-S12-RND-004 la búsqueda por cercanía con categoría responde con p95 bajo 300 ms', async () => {
    const { tiempos, respuestas } = await medir((origen) => ({ ...origen, radio: 3000, categoria: 'veterinaria' }));

    console.info(`búsqueda de 3 km con categoría: ${resumen(tiempos)}`);
    for (const respuesta of respuestas) {
      expect(respuesta.estado).toBe(200);
      for (const lugar of lugaresDe(respuesta)) {
        expect(lugar.categoria).toBe('veterinaria');
      }
    }
    expect(percentil(tiempos, 95)).toBeLessThan(300);
  });

  it('CP-S12-RND-005 50 solicitudes simultáneas responden 200 en menos de 5 s en total', async () => {
    const inicio = performance.now();
    const respuestas = await Promise.all(
      ORIGENES.slice(0, 50).map((origen) => pedir(servidor, { ...origen, radio: 2000 }))
    );
    const total = performance.now() - inicio;

    console.info(`50 solicitudes simultáneas: ${Math.round(total)} ms en total, ${resumen(respuestas.map((r) => r.milisegundos))}`);
    expect(respuestas.every((respuesta) => respuesta.estado === 200)).toBe(true);
    expect(total).toBeLessThan(5000);
  });
});

describe('Índice espacial de la búsqueda por radio', () => {
  it('CP-S12-RND-006 la migración deja un índice espacial sobre la ubicación como geography', async () => {
    const { rows } = await bd.query<{ indexdef: string }>(
      "SELECT indexdef FROM pg_indexes WHERE tablename = 'establecimientos' AND indexname = 'idx_establecimientos_ubicacion_geog'"
    );

    expect(rows).toHaveLength(1);
    expect(rows[0].indexdef).toMatch(/USING gist/i);
  });

  it('CP-S12-RND-007 EXPLAIN ANALYZE muestra que la búsqueda por radio usa el índice y tarda menos de 100 ms', async () => {
    const espia = vi.spyOn(pool, 'query');
    await pedir(servidor, { lat: -32.9, lng: -71.3, radio: 2000 });
    const [texto, parametros] = espia.mock.calls[0] as unknown as [string, unknown[]];
    espia.mockRestore();

    const { rows } = await bd.query(`EXPLAIN (ANALYZE, FORMAT JSON) ${texto}`, parametros);
    const plan = rows[0]['QUERY PLAN'];
    const texto_del_plan = JSON.stringify(plan);

    console.info(`plan: ${texto_del_plan.match(/"Node Type":"[^"]+"/g)?.join(' > ')} | ${plan[0]['Execution Time']} ms`);
    expect(texto_del_plan).toContain('idx_establecimientos_ubicacion_geog');
    expect(texto_del_plan).not.toContain('"Node Type":"Seq Scan"');
    expect(plan[0]['Execution Time']).toBeLessThan(100);
  });
});
