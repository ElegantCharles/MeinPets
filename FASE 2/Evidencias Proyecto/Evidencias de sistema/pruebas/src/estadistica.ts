export function percentil(valores: number[], p: number): number {
  const ordenados = [...valores].sort((a, b) => a - b);
  const posicion = Math.min(ordenados.length - 1, Math.ceil((p / 100) * ordenados.length) - 1);
  return ordenados[Math.max(0, posicion)];
}

export function resumen(valores: number[]): string {
  const redondear = (n: number) => Math.round(n * 10) / 10;
  return `n=${valores.length} p50=${redondear(percentil(valores, 50))} ms p95=${redondear(percentil(valores, 95))} ms max=${redondear(Math.max(...valores))} ms`;
}
