import fc from 'fast-check';
import { describe, expect, it } from 'vitest';

import { Base64 } from './base64';

describe('Base64 properties', () => {
  it('decode(encode(text)) is the identity for any Unicode string', () => {
    fc.assert(
      fc.property(fc.string({ unit: 'grapheme' }), (text) => {
        expect(Base64.decode(Base64.encode(text))).toBe(text);
      })
    );
  });

  it('url-safe round trip and alphabet', () => {
    fc.assert(
      fc.property(fc.string({ unit: 'grapheme' }), (text) => {
        const urlSafe = Base64.encodeUrlSafe(text);
        expect(urlSafe).toMatch(/^[A-Za-z0-9_-]*$/);
        expect(Base64.decode(Base64.fromUrlSafe(urlSafe))).toBe(text);
      })
    );
  });

  it('decodeToBuffer(encodeBuffer(bytes)) preserves every byte', () => {
    fc.assert(
      fc.property(fc.uint8Array({ maxLength: 256 }), (bytes) => {
        const encoded = Base64.encodeBuffer(bytes.slice().buffer);
        const decoded = new Uint8Array(Base64.decodeToBuffer(encoded));
        expect(Array.from(decoded)).toEqual(Array.from(bytes));
      })
    );
  });
});
