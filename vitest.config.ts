import { defineConfig } from 'vitest/config';
import dotenv from 'dotenv'

dotenv.config({ path: '.env.test' })

export default defineConfig({
  test: {
    globals: true,
    environment: 'node',
    setupFiles: ['./src/__tests__/setup.ts'], // Setup-Datei aktivieren
    testTimeout: 10000, // 10 Sekunden Timeout
  },
});
