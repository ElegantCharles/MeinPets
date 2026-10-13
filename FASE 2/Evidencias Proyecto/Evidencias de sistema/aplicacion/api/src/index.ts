import { env } from './config/env';
import { pool } from './db/pool';
import { migrate } from './db/migrate';
import { createApp } from './app';

async function main() {
  await migrate();

  const server = createApp().listen(env.port, () => {
    console.log(`API escuchando en el puerto ${env.port}`);
  });

  const shutdown = () => {
    server.close(() => {
      pool.end().finally(() => process.exit(0));
    });
  };

  process.on('SIGTERM', shutdown);
  process.on('SIGINT', shutdown);
}

main().catch((err) => {
  console.error('No se pudo iniciar la API', err);
  process.exit(1);
});
