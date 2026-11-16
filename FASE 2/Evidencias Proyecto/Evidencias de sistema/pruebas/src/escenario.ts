import { cerrarBd, insertarLugares, vaciarLugares } from './baseDeDatos';
import { LUGARES, type LugarDePrueba } from './datos';
import { iniciarServidor, type Servidor } from './servidor';

export async function prepararEscenario(lugares: LugarDePrueba[] = LUGARES): Promise<Servidor> {
  await vaciarLugares();
  await insertarLugares(lugares);
  return iniciarServidor();
}

export async function cerrarEscenario(servidor: Servidor): Promise<void> {
  await servidor.cerrar();
  await cerrarBd();
}
