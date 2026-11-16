import { describe, expect, it } from 'vitest';
import { destino, haversine, vincenty } from '../../src/geodesia';
import { LUGARES_CONOCIDOS, ORIGEN } from '../../src/datos';

describe('Referencia geodésica que usan las pruebas', () => {
  it('CP-S12-GEO-001 Vincenty reproduce la distancia publicada entre Flinders Peak y Buninyong', () => {
    const flinders = { lat: -(37 + 57 / 60 + 3.7203 / 3600), lng: 144 + 25 / 60 + 29.5244 / 3600 };
    const buninyong = { lat: -(37 + 39 / 60 + 10.1561 / 3600), lng: 143 + 55 / 60 + 35.3839 / 3600 };
    expect(vincenty(flinders, buninyong)).toBeCloseTo(54972.271, 2);
  });

  it('CP-S12-GEO-002 un grado de longitud en el ecuador mide unos 111,19 km en línea recta', () => {
    expect(haversine({ lat: 0, lng: 0 }, { lat: 0, lng: 1 })).toBeCloseTo(111195.08, 0);
  });

  it('CP-S12-GEO-003 la distancia entre un punto y él mismo es cero', () => {
    expect(haversine(ORIGEN, ORIGEN)).toBe(0);
    expect(vincenty(ORIGEN, ORIGEN)).toBe(0);
  });

  it('CP-S12-GEO-004 la distancia es la misma en los dos sentidos', () => {
    const lejano = LUGARES_CONOCIDOS[LUGARES_CONOCIDOS.length - 1];
    expect(vincenty(ORIGEN, lejano)).toBeCloseTo(vincenty(lejano, ORIGEN), 6);
    expect(haversine(ORIGEN, lejano)).toBeCloseTo(haversine(lejano, ORIGEN), 6);
  });

  it('CP-S12-GEO-005 en la región la recta esférica y la geodésica difieren menos de 0,5 %', () => {
    for (const lugar of LUGARES_CONOCIDOS) {
      const geodesica = vincenty(ORIGEN, lugar);
      expect(Math.abs(haversine(ORIGEN, lugar) - geodesica)).toBeLessThanOrEqual(geodesica * 0.005);
    }
  });

  it.each([90, 0, 225])('CP-S12-GEO-006 un punto a 1500 m con rumbo %i grados queda a 1500 m', (rumbo) => {
    expect(haversine(ORIGEN, destino(ORIGEN, rumbo, 1500))).toBeCloseTo(1500, 3);
  });
});
