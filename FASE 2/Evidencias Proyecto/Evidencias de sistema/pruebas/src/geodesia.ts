export interface Punto {
  lat: number;
  lng: number;
}

const RADIO_MEDIO_M = 6371008.8;
const SEMIEJE_MAYOR = 6378137;
const APLANAMIENTO = 1 / 298.257223563;
const SEMIEJE_MENOR = (1 - APLANAMIENTO) * SEMIEJE_MAYOR;

const aRadianes = (grados: number) => (grados * Math.PI) / 180;
const aGrados = (radianes: number) => (radianes * 180) / Math.PI;

export function haversine(a: Punto, b: Punto): number {
  const dLat = aRadianes(b.lat - a.lat);
  const dLng = aRadianes(b.lng - a.lng);
  const h =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(aRadianes(a.lat)) * Math.cos(aRadianes(b.lat)) * Math.sin(dLng / 2) ** 2;
  return 2 * RADIO_MEDIO_M * Math.asin(Math.sqrt(h));
}

export function vincenty(a: Punto, b: Punto): number {
  const f = APLANAMIENTO;
  const L = aRadianes(b.lng - a.lng);
  const U1 = Math.atan((1 - f) * Math.tan(aRadianes(a.lat)));
  const U2 = Math.atan((1 - f) * Math.tan(aRadianes(b.lat)));
  const sinU1 = Math.sin(U1);
  const cosU1 = Math.cos(U1);
  const sinU2 = Math.sin(U2);
  const cosU2 = Math.cos(U2);

  let lambda = L;
  let anterior = 0;
  let sinSigma = 0;
  let cosSigma = 0;
  let sigma = 0;
  let cosCuadAlfa = 0;
  let cos2SigmaM = 0;
  let iteraciones = 0;

  do {
    const sinLambda = Math.sin(lambda);
    const cosLambda = Math.cos(lambda);
    sinSigma = Math.sqrt(
      (cosU2 * sinLambda) ** 2 + (cosU1 * sinU2 - sinU1 * cosU2 * cosLambda) ** 2
    );
    if (sinSigma === 0) {
      return 0;
    }
    cosSigma = sinU1 * sinU2 + cosU1 * cosU2 * cosLambda;
    sigma = Math.atan2(sinSigma, cosSigma);
    const sinAlfa = (cosU1 * cosU2 * sinLambda) / sinSigma;
    cosCuadAlfa = 1 - sinAlfa ** 2;
    cos2SigmaM = cosCuadAlfa !== 0 ? cosSigma - (2 * sinU1 * sinU2) / cosCuadAlfa : 0;
    const C = (f / 16) * cosCuadAlfa * (4 + f * (4 - 3 * cosCuadAlfa));
    anterior = lambda;
    lambda =
      L +
      (1 - C) *
        f *
        sinAlfa *
        (sigma + C * sinSigma * (cos2SigmaM + C * cosSigma * (-1 + 2 * cos2SigmaM ** 2)));
    iteraciones += 1;
  } while (Math.abs(lambda - anterior) > 1e-12 && iteraciones < 200);

  const uCuad =
    (cosCuadAlfa * (SEMIEJE_MAYOR ** 2 - SEMIEJE_MENOR ** 2)) / SEMIEJE_MENOR ** 2;
  const A = 1 + (uCuad / 16384) * (4096 + uCuad * (-768 + uCuad * (320 - 175 * uCuad)));
  const B = (uCuad / 1024) * (256 + uCuad * (-128 + uCuad * (74 - 47 * uCuad)));
  const deltaSigma =
    B *
    sinSigma *
    (cos2SigmaM +
      (B / 4) *
        (cosSigma * (-1 + 2 * cos2SigmaM ** 2) -
          (B / 6) * cos2SigmaM * (-3 + 4 * sinSigma ** 2) * (-3 + 4 * cos2SigmaM ** 2)));
  return SEMIEJE_MENOR * A * (sigma - deltaSigma);
}

export function destino(origen: Punto, rumboGrados: number, metros: number): Punto {
  const d = metros / RADIO_MEDIO_M;
  const rumbo = aRadianes(rumboGrados);
  const lat1 = aRadianes(origen.lat);
  const lng1 = aRadianes(origen.lng);
  const lat2 = Math.asin(
    Math.sin(lat1) * Math.cos(d) + Math.cos(lat1) * Math.sin(d) * Math.cos(rumbo)
  );
  const lng2 =
    lng1 +
    Math.atan2(
      Math.sin(rumbo) * Math.sin(d) * Math.cos(lat1),
      Math.cos(d) - Math.sin(lat1) * Math.sin(lat2)
    );
  return { lat: aGrados(lat2), lng: aGrados(lng2) };
}
