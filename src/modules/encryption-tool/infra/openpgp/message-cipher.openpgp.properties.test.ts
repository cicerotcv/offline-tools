import fc from 'fast-check';
import { describe, expect, it } from 'vitest';

import { EncryptionTool } from './message-cipher.openpgp';

// OpenPGP password encryption runs a KDF per message; keep runs small.
const TIMEOUT = 120_000;

describe('EncryptionTool properties', () => {
  it(
    'decrypt(encrypt(text)) returns the original text',
    async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.string({ minLength: 0, maxLength: 200 }),
          fc.string({ minLength: 1, maxLength: 40 }),
          async (text, password) => {
            const armored = await EncryptionTool.encrypt(text, password);
            const { data } = await EncryptionTool.decrypt(armored, password);
            const decoded =
              typeof data === 'string' ? data : new TextDecoder().decode(data);
            expect(decoded).toBe(text);
          }
        ),
        { numRuns: 8 }
      );
    },
    TIMEOUT
  );

  it(
    'decrypt(encrypt(bytes)) returns the original bytes',
    async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.uint8Array({ minLength: 1, maxLength: 512 }),
          async (bytes) => {
            const armored = await EncryptionTool.encrypt(bytes, 'pw');
            const { data } = await EncryptionTool.decrypt(armored, 'pw');
            const out =
              typeof data === 'string' ? new TextEncoder().encode(data) : data;
            expect(Array.from(out)).toEqual(Array.from(bytes));
          }
        ),
        { numRuns: 6 }
      );
    },
    TIMEOUT
  );

  it(
    'rejects a tampered ciphertext instead of returning altered plaintext',
    async () => {
      const armored = await EncryptionTool.encrypt(
        'secret seed backup',
        'correct horse'
      );
      const lines = armored.split('\n');
      // Flip one base64 character in the body (skip header, blank line, CRC).
      const bodyIndex = lines.findIndex(
        (line, i) => i > 1 && line.length > 20 && !line.startsWith('=')
      );
      const line = lines[bodyIndex];
      const pos = Math.floor(line.length / 2);
      const flipped = line[pos] === 'A' ? 'B' : 'A';
      lines[bodyIndex] = line.slice(0, pos) + flipped + line.slice(pos + 1);

      await expect(
        EncryptionTool.decrypt(lines.join('\n'), 'correct horse')
      ).rejects.toThrow();
    },
    TIMEOUT
  );
});
