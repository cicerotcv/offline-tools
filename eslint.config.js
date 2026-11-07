import js from '@eslint/js';
import reactHooks from 'eslint-plugin-react-hooks';
import reactRefresh from 'eslint-plugin-react-refresh';
import { defineConfig, globalIgnores } from 'eslint/config';
import globals from 'globals';
import tseslint from 'typescript-eslint';

// Libraries with crypto, encoding or device I/O: only infra/ adapters may import them.
const IO_LIBRARIES = [
  'bitcoinjs-lib',
  'bip32',
  'bip38',
  'bip39',
  'bs58',
  'ecpair',
  'html5-qrcode',
  'md5',
  'openpgp',
  'qrcode',
  'qrcode-svg',
  'tiny-secp256k1',
];

const ioLibraryPaths = IO_LIBRARIES.map((name) => ({
  name,
  message:
    'Use the module facade (lib/ or application/); only infra/ adapters import this library.',
}));

const PRESENTATION_FILES = ['src/**/presentation/**/*.{ts,tsx}'];

export default defineConfig([
  globalIgnores(['dist', 'coverage', 'playwright-report', 'test-results']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      js.configs.recommended,
      tseslint.configs.recommended,
      reactHooks.configs.flat.recommended,
      reactRefresh.configs.vite,
    ],
    languageOptions: {
      ecmaVersion: 2020,
      globals: globals.browser,
    },
    rules: {
      'react-refresh/only-export-components': 'off',
      'react-hooks/set-state-in-effect': 'off',
      'react-hooks/incompatible-library': 'off',
      'no-unused-vars': [
        'off',
        { argsIgnorePattern: '^_', varsIgnorePattern: '^_' },
      ],
    },
  },
  {
    // Presentation never reaches infra or I/O libraries directly.
    files: PRESENTATION_FILES,
    ignores: ['**/*.test.ts'],
    rules: {
      'no-restricted-imports': [
        'error',
        {
          paths: ioLibraryPaths,
          patterns: [
            {
              group: ['**/infra/**', '@noble/hashes/*'],
              message:
                'Presentation must go through lib/ or application/ facades.',
            },
          ],
        },
      ],
    },
  },
  {
    // Domain is pure: no React, no I/O libraries, no infra.
    files: ['src/**/domain/**/*.{ts,tsx}'],
    rules: {
      'no-restricted-imports': [
        'error',
        {
          paths: [
            { name: 'react', message: 'Domain must not depend on React.' },
            ...ioLibraryPaths,
          ],
          patterns: [
            { group: ['**/infra/**', '**/presentation/**', '@noble/hashes/*'] },
          ],
        },
      ],
    },
  },
  {
    // Web Crypto is reached only through shared/infra/crypto adapters.
    files: ['src/**/*.{ts,tsx}'],
    ignores: ['src/shared/infra/crypto/**', '**/*.test.ts'],
    rules: {
      'no-restricted-properties': [
        'error',
        {
          object: 'crypto',
          property: 'getRandomValues',
          message: 'Inject RandomPort (shared/infra/crypto).',
        },
        {
          object: 'crypto',
          property: 'subtle',
          message: 'Use DigestPort (shared/infra/crypto).',
        },
      ],
      'no-restricted-syntax': [
        'error',
        {
          // globalThis.crypto.subtle, window.crypto.getRandomValues, self.crypto...
          selector:
            "MemberExpression[object.type='MemberExpression'][object.property.name='crypto'][property.name=/^(getRandomValues|subtle)$/]",
          message: 'Use RandomPort / DigestPort from shared/infra/crypto.',
        },
      ],
    },
  },
]);
