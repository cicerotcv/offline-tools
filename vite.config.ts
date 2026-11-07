import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react-swc';
import { createHash } from 'node:crypto';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import type { Plugin } from 'vite';
import { nodePolyfills } from 'vite-plugin-node-polyfills';
import { viteSingleFile } from 'vite-plugin-singlefile';
import wasm from 'vite-plugin-wasm';
import { configDefaults, defineConfig } from 'vitest/config';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const isSingleFile = process.env.VITE_SINGLE_FILE === 'true';
const packageVersion = (
  JSON.parse(readFileSync(path.join(__dirname, 'package.json'), 'utf8')) as {
    version: string;
  }
).version;

/**
 * Content-Security-Policy for the built page. Runs after the single-file
 * plugin so it hashes the final inline scripts. connect-src allows only the
 * page's own origin (the secp256k1 WASM is fetched from it, or inlined as a
 * data: URL in the single-file build), so no request can reach a third
 * party: "the app never sends data anywhere" becomes a browser-enforced rule.
 */
function contentSecurityPolicy(): Plugin {
  return {
    name: 'offline-tools:csp',
    apply: 'build',
    enforce: 'post',
    generateBundle: {
      order: 'post',
      handler(_options, bundle) {
        const html = bundle['index.html'];
        if (!html || html.type !== 'asset') return;
        const source = String(html.source);
        const hashes = [
          ...source.matchAll(
            /<script(?![^>]*\bsrc=)[^>]*>([\s\S]*?)<\/script>/g
          ),
        ]
          .map(([, body]) => createHash('sha256').update(body).digest('base64'))
          .map((hash) => `'sha256-${hash}'`);
        const policy = [
          "default-src 'none'",
          `script-src 'self' 'wasm-unsafe-eval' ${hashes.join(' ')}`,
          "style-src 'self' 'unsafe-inline'",
          "img-src 'self' data: blob:",
          "font-src 'self' data:",
          "media-src 'self' blob: mediastream:",
          "connect-src 'self' data:",
          "object-src 'none'",
          "base-uri 'none'",
          "form-action 'none'",
        ].join('; ');
        html.source = source.replace(
          '<head>',
          `<head>\n    <meta http-equiv="Content-Security-Policy" content="${policy}" />`
        );
      },
    },
  };
}

export default defineConfig({
  plugins: [
    tailwindcss({ optimize: true }),
    react(),
    wasm(),
    nodePolyfills({
      globals: {
        Buffer: true,
        global: true,
        process: true,
      },
    }),
    // Only include single-file plugin if requested
    ...(isSingleFile ? [viteSingleFile()] : []),
    contentSecurityPolicy(),
  ],
  build: {
    cssCodeSplit: false,
    // Only apply single-file build options if requested
    ...(isSingleFile
      ? {
          rollupOptions: {
            output: {
              inlineDynamicImports: true,
            },
          },
        }
      : {}),
  },
  resolve: {
    alias: [
      // Single-file build: load pages eagerly to avoid TDZ errors caused by
      // inlined dynamic imports + WASM top-level await.
      ...(isSingleFile
        ? [
            {
              find: /^@\/modules\/navigation\/lib\/page-loader$/,
              replacement: path.resolve(
                __dirname,
                './src/modules/navigation/lib/page-loader.eager.ts'
              ),
            },
          ]
        : []),
      { find: '@', replacement: path.resolve(__dirname, './src') },
      {
        find: '$',
        replacement: path.resolve(__dirname, './src/shared/presentation'),
      },
    ],
  },
  define: {
    global: 'globalThis',
    // Shown in the footer, so an offline copy says which release it is.
    __APP_VERSION__: JSON.stringify(packageVersion),
  },
  optimizeDeps: {
    esbuildOptions: {
      define: {
        global: 'globalThis',
      },
    },
    include: ['buffer'],
  },
  test: {
    globals: true,
    environment: 'node',
    exclude: [...configDefaults.exclude, 'e2e/**'],
    // BIP38 (scrypt) and PBKDF2 vectors are slow on purpose, more so on CI runners.
    testTimeout: 20_000,
    coverage: {
      provider: 'v8',
      include: ['src/**/*.ts'],
      exclude: ['src/**/*.test.ts', 'src/**/*.d.ts'],
    },
  },
});
