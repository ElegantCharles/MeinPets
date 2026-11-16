import { afterEach, describe, expect, it, vi } from 'vitest';
import {
  distanceKm,
  fetchPlaces,
  formatDistance,
  googleMapsDirectionsUrl,
  walkingMinutes,
} from '@movil/services/places';
import { LUGARES_CONOCIDOS, ORIGEN, sinPrefijo } from '../../src/datos';
import { vincenty } from '../../src/geodesia';

afterEach(() => {
  vi.unstubAllGlobals();
});

function simularFetch(cuerpo: unknown, estado = 200) {
  const espia = vi.fn().mockResolvedValue(
    new Response(typeof cuerpo === 'string' ? cuerpo : JSON.stringify(cuerpo), {
      status: estado,
      headers: { 'Content-Type': 'application/json' },
    })
  );
  vi.stubGlobal('fetch', espia);
  return espia;
}

const FILA = {
  id: 1,
  nombre: 'Veterinaria Uno',
  categoria: 'veterinaria',
  direccion: 'Calle 1',
  telefono: '+56 32 111 1111',
  horario: '09:00-19:00',
  latitud: -33.04,
  longitud: -71.62,
};

describe('App: distancia local de respaldo', () => {
  const origen = { latitude: ORIGEN.lat, longitude: ORIGEN.lng };

  it('CP-S12-APP-001 un grado de longitud en el ecuador mide unos 111,19 km', () => {
    expect(distanceKm({ latitude: 0, longitude: 0 }, { latitude: 0, longitude: 1 })).toBeCloseTo(111.19, 1);
  });

  it('CP-S12-APP-002 la distancia entre un punto y él mismo es cero', () => {
    expect(distanceKm(origen, origen)).toBe(0);
  });

  it.each(LUGARES_CONOCIDOS.map((lugar) => ({ nombre: sinPrefijo(lugar.nombre), lugar })))(
    'CP-S12-APP-003 $nombre: coincide con la medición geodésica con menos de 0,5 % de diferencia',
    ({ lugar }) => {
      const metros = distanceKm(origen, { latitude: lugar.lat, longitude: lugar.lng }) * 1000;
      const esperado = vincenty(ORIGEN, lugar);
      expect(Math.abs(metros - esperado)).toBeLessThanOrEqual(esperado * 0.005);
    }
  );
});

describe('App: textos de distancia y minutos a pie', () => {
  it.each([
    [0.004, '10 m'],
    [0.05, '50 m'],
    [0.25, '250 m'],
    [0.994, '990 m'],
    [1, '1,0 km'],
    [1.26, '1,3 km'],
    [12.34, '12,3 km'],
  ])('CP-S12-APP-004 %f km se muestra como %s', (km, texto) => {
    expect(formatDistance(km)).toBe(texto);
  });

  it.each([
    [0, 1],
    [0.075, 1],
    [0.3, 4],
    [1, 13],
    [3, 40],
    [3.001, null],
    [10, null],
  ])('CP-S12-APP-005 %f km a pie: resultado %s', (km, minutos) => {
    expect(walkingMinutes(km)).toBe(minutos);
  });

  it('CP-S12-APP-006 el enlace de Google Maps lleva la ubicación del lugar', () => {
    expect(googleMapsDirectionsUrl({ latitud: -33.04, longitud: -71.62 })).toBe(
      'https://www.google.com/maps/dir/?api=1&destination=-33.04,-71.62'
    );
  });
});

describe('App: servicio de lugares', () => {
  it('CP-S12-APP-007 pide al servidor lat, lng, radio y categoría', async () => {
    const espia = simularFetch({ locations: [] });

    await fetchPlaces({ lat: -33.0393, lng: -71.6273, radio: 1999.6, categoria: 'veterinaria' });

    expect(espia).toHaveBeenCalledOnce();
    const [url, opciones] = espia.mock.calls[0];
    expect(url).toBe(
      'http://api.prueba/api/map/locations?lat=-33.039300&lng=-71.627300&radio=2000&categoria=veterinaria'
    );
    expect(opciones.method).toBe('GET');
    expect(opciones.headers).not.toHaveProperty('Authorization');
  });

  it('CP-S12-APP-008 sin radio ni categoría solo envía el punto', async () => {
    const espia = simularFetch({ locations: [] });

    await fetchPlaces({ lat: -33.0393, lng: -71.6273 });

    expect(espia.mock.calls[0][0]).toBe('http://api.prueba/api/map/locations?lat=-33.039300&lng=-71.627300');
  });

  it('CP-S12-APP-009 sin ubicación pide la lista de siempre, sin parámetros', async () => {
    const espia = simularFetch({ locations: [] });

    await fetchPlaces();

    expect(espia.mock.calls[0][0]).toBe('http://api.prueba/api/map/locations');
  });

  it('CP-S12-APP-010 usa la distancia del servidor y deja en null la que no llega', async () => {
    simularFetch({
      locations: [
        { ...FILA, id: 1, distancia_m: 350 },
        { ...FILA, id: 2, distancia_m: '420' },
        { ...FILA, id: 3 },
        { ...FILA, id: 4, distancia_m: null },
      ],
    });

    const lugares = await fetchPlaces({ lat: -33.04, lng: -71.62 });

    expect(lugares.map((lugar) => lugar.distanciaM)).toEqual([350, 420, null, null]);
  });

  it('CP-S12-APP-011 respeta el orden que entrega el servidor', async () => {
    simularFetch({
      locations: [
        { ...FILA, id: 7, distancia_m: 100 },
        { ...FILA, id: 3, distancia_m: 900 },
        { ...FILA, id: 5, distancia_m: 2500 },
      ],
    });

    const lugares = await fetchPlaces({ lat: -33.04, lng: -71.62 });

    expect(lugares.map((lugar) => lugar.id)).toEqual([7, 3, 5]);
  });

  it('CP-S12-APP-012 descarta lugares con categoría desconocida o coordenadas inválidas', async () => {
    simularFetch({
      locations: [
        { ...FILA, id: 1 },
        { ...FILA, id: 2, categoria: 'laboratorio' },
        { ...FILA, id: 3, latitud: 'abc' },
        { ...FILA, id: 4, longitud: undefined },
        { ...FILA, id: 5, latitud: '-33.05', longitud: '-71.63' },
      ],
    });

    const lugares = await fetchPlaces();

    expect(lugares.map((lugar) => lugar.id)).toEqual([1, 5]);
    expect(lugares[1].latitud).toBe(-33.05);
    expect(lugares[1].longitud).toBe(-71.63);
  });

  it('CP-S12-APP-013 limpia teléfono y horario en blanco', async () => {
    simularFetch({ locations: [{ ...FILA, telefono: '   ', horario: ' 24 h ' }] });

    const [lugar] = await fetchPlaces();

    expect(lugar.telefono).toBeNull();
    expect(lugar.horario).toBe('24 h');
  });

  it('CP-S12-APP-014 muestra el mensaje del servidor cuando responde con error', async () => {
    simularFetch({ error: 'La latitud debe ser un número entre -90 y 90' }, 400);

    await expect(fetchPlaces({ lat: 200, lng: 0 })).rejects.toThrow('La latitud debe ser un número entre -90 y 90');
  });

  it('CP-S12-APP-015 usa el mensaje de respaldo si la respuesta no es JSON', async () => {
    simularFetch('<html>Bad Gateway</html>', 502);

    await expect(fetchPlaces()).rejects.toThrow('No se pudieron cargar los lugares. Intenta de nuevo.');
  });

  it('CP-S12-APP-016 avisa cuando no hay conexión con el servidor', async () => {
    vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new TypeError('Failed to fetch')));

    await expect(fetchPlaces()).rejects.toThrow('No fue posible conectar con el servidor. Revisa tu conexión.');
  });

  it('CP-S12-APP-017 rechaza una respuesta sin lista de lugares', async () => {
    simularFetch({ locations: null });

    await expect(fetchPlaces()).rejects.toThrow('No se pudieron cargar los lugares. Intenta de nuevo.');
  });
});
