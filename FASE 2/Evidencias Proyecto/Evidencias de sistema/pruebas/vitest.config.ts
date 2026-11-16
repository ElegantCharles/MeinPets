import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { defineConfig } from 'vitest/config';
import { carpetaSistema, entornoDePrueba } from './setup/conexion';

const aqui = path.dirname(fileURLToPath(import.meta.url));

export default defineConfig({
  resolve: {
    alias: {
      '@api': path.join(carpetaSistema, 'aplicacion', 'api', 'src'),
      '@movil': path.join(carpetaSistema, 'aplicacion', 'movil', 'src'),
      'react-native': path.join(aqui, 'stubs', 'react-native.ts'),
    },
  },
  test: {
    env: entornoDePrueba,
    fileParallelism: false,
    projects: [
      {
        extends: true,
        test: {
          name: 'unitarias',
          include: ['tests/unitarias/**/*.test.ts'],
        },
      },
      {
        extends: true,
        test: {
          name: 'sistema',
          include: ['tests/{integracion,seguridad,rendimiento}/**/*.test.ts'],
          globalSetup: ['setup/baseDeDatos.ts'],
          testTimeout: 60000,
          hookTimeout: 120000,
        },
      },
    ],
  },
});
