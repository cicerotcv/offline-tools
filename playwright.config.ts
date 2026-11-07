import { defineConfig } from '@playwright/test';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const root = path.dirname(fileURLToPath(import.meta.url));
const PREVIEW_PORT = 4173;
const STATIC_PORT = 4174;

/**
 * Smoke tests for both deliverables:
 * - "preview": the normal build served by `vite preview` (history routing)
 * - "single":  dist/index.html opened from disk (hash routing, file://)
 * Both read dist/, so build first (see the test:e2e scripts).
 */
export default defineConfig({
  testDir: './e2e',
  fullyParallel: true,
  reporter: [['list']],
  use: {
    // Use the locally installed Chrome; no browser download needed.
    channel: 'chrome',
    headless: true,
  },
  projects: [
    {
      name: 'preview',
      testMatch: 'smoke.spec.ts',
      use: { baseURL: `http://localhost:${PREVIEW_PORT}` },
    },
    {
      // dist/ served like Vercel (per-route HTML, real 404, headers).
      name: 'static',
      use: { baseURL: `http://localhost:${STATIC_PORT}` },
    },
    {
      name: 'single',
      testMatch: 'smoke.spec.ts',
      use: {
        baseURL: pathToFileURL(path.join(root, 'dist/index.html')).href,
      },
    },
  ],
  webServer: [
    {
      command: `pnpm exec vite preview --port ${PREVIEW_PORT} --strictPort`,
      url: `http://localhost:${PREVIEW_PORT}`,
      reuseExistingServer: true,
      timeout: 30_000,
    },
    {
      command: `node scripts/serve-static.mjs --port ${STATIC_PORT}`,
      url: `http://localhost:${STATIC_PORT}`,
      reuseExistingServer: true,
      timeout: 30_000,
    },
  ],
});
