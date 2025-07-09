import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    globals: true,        // Nutzung von describe, it, expect ohne Import
    environment: 'node',  // Für Node.js-Backends
    // setupFiles: ['./src/tests/setup.ts'], // Nur falls du später eine Setup-Datei anlegst
  },
});
