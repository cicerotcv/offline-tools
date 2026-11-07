import fc from 'fast-check';
import { describe, expect, it } from 'vitest';

import {
  collectMouseEntropy,
  collectTextEntropy,
  combineEntropy,
  entropyToHex,
  getEntropyBits,
} from './entropy-generator';

describe('entropy collectors', () => {
  it('text entropy is SHA-256 of the UTF-8 text', async () => {
    const entropy = await collectTextEntropy('abc');
    expect(entropyToHex(entropy)).toBe(
      'ba7816bf8f01cfea414140de5dae2223b00361a396177a9cb410ff61f20015ad'
    );
  });

  it('rejects blank text', async () => {
    await expect(collectTextEntropy('   ')).rejects.toThrow();
  });

  it('mouse entropy is 32 bytes and depends on the positions', async () => {
    const a = await collectMouseEntropy([{ x: 1, y: 2, timestamp: 3 }]);
    const b = await collectMouseEntropy([{ x: 1, y: 3, timestamp: 3 }]);
    expect(a).toHaveLength(32);
    expect(entropyToHex(a)).not.toBe(entropyToHex(b));
  });

  it('rejects empty mouse data', async () => {
    await expect(collectMouseEntropy([])).rejects.toThrow();
  });
});

describe('combineEntropy', () => {
  const source = fc.uint8Array({ minLength: 32, maxLength: 32 });

  it('returns a single source unchanged', async () => {
    await fc.assert(
      fc.asyncProperty(source, async (bytes) => {
        expect(await combineEntropy([bytes])).toBe(bytes);
      })
    );
  });

  it('is order independent and outputs 32 bytes', async () => {
    await fc.assert(
      fc.asyncProperty(source, source, source, async (a, b, c) => {
        const forward = await combineEntropy([a, b, c]);
        const reversed = await combineEntropy([c, b, a]);
        expect(forward).toHaveLength(32);
        expect(entropyToHex(forward)).toBe(entropyToHex(reversed));
      }),
      { numRuns: 50 }
    );
  });

  it('a fresh source changes the result (no source is ignored)', async () => {
    await fc.assert(
      fc.asyncProperty(source, source, source, async (a, b, c) => {
        fc.pre(entropyToHex(b) !== entropyToHex(c));
        const withB = await combineEntropy([a, b]);
        const withC = await combineEntropy([a, c]);
        expect(entropyToHex(withB)).not.toBe(entropyToHex(withC));
      }),
      { numRuns: 50 }
    );
  });

  it('rejects empty input and non-32-byte sources', async () => {
    await expect(combineEntropy([])).rejects.toThrow();
    await expect(
      combineEntropy([new Uint8Array(32), new Uint8Array(16)])
    ).rejects.toThrow();
  });

  it('reports bits as 8 per byte', () => {
    expect(getEntropyBits(new Uint8Array(32))).toBe(256);
  });
});
