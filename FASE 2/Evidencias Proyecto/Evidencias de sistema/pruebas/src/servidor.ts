import type { AddressInfo } from 'node:net';
import { createApp } from '@api/app';
import { pool } from '@api/db/pool';

export interface Servidor {
  url: string;
  cerrar: () => Promise<void>;
}

export async function iniciarServidor(): Promise<Servidor> {
  const server = createApp().listen(0, '127.0.0.1');
  await new Promise<void>((resolver, rechazar) => {
    server.once('listening', () => resolver());
    server.once('error', rechazar);
  });
  const { port } = server.address() as AddressInfo;

  return {
    url: `http://127.0.0.1:${port}`,
    cerrar: async () => {
      server.closeAllConnections();
      await new Promise<void>((resolver, rechazar) => {
        server.close((err) => (err ? rechazar(err) : resolver()));
      });
      await pool.end();
    },
  };
}
