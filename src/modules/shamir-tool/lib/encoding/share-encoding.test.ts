import { describe, expect, it } from 'vitest';

import {
  ENCRYPTION_KEY_LENGTH,
  NONCE_LENGTH,
  reconstructSecret,
  splitSecret,
} from '../shamir/shamir';
import {
  decodeShare,
  decodeShares,
  encodeShare,
  encodeShares,
  SHARE_VERSION,
  sharesToText,
} from './share-encoding';

describe('Share Encoding v2', () => {
  const secret = new TextEncoder().encode('Hello, World!');
  const m = 3;
  const n = 5;

  function createShares() {
    return splitSecret(secret, n, m);
  }

  describe('encodeShare', () => {
    it('should encode a share to URL-safe base64 string', () => {
      const shares = createShares();
      const encoded = encodeShare(shares[0], { m, n });

      expect(typeof encoded).toBe('string');
      expect(encoded).not.toContain('+');
      expect(encoded).not.toContain('/');
      expect(encoded).not.toContain('=');
      expect(encoded).toMatch(/^[A-Za-z0-9\-_]*$/);
    });

    it('should throw when share index is invalid', () => {
      const shares = createShares();
      expect(() => encodeShare({ ...shares[0], x: 0 }, { m, n })).toThrow(
        'Share index must be between 1 and 255'
      );
    });

    it('should throw when m/n options are invalid', () => {
      const shares = createShares();
      expect(() => encodeShare(shares[0], { m: 1, n: 5 })).toThrow(
        'Invalid threshold (M) or total shares (N)'
      );
    });
  });

  describe('decodeShare', () => {
    it('should round-trip encode and decode', () => {
      const shares = createShares();
      const encoded = encodeShare(shares[0], { m, n });
      const decoded = decodeShare(encoded);

      expect(decoded.version).toBe(SHARE_VERSION);
      expect(decoded.threshold).toBe(m);
      expect(decoded.totalShares).toBe(n);
      expect(decoded.x).toBe(shares[0].x);
      expect(decoded.y).toEqual(shares[0].y);
      expect(decoded.nonce).toEqual(shares[0].nonce);
      expect(decoded.ciphertext).toEqual(shares[0].ciphertext);
    });

    it('should decode index-prefixed format', () => {
      const shares = createShares();
      const encoded = encodeShare(shares[0], { m, n });
      const prefixed = `${shares[0].x}:${encoded}`;
      const decoded = decodeShare(prefixed);

      expect(decoded.x).toBe(shares[0].x);
      expect(decoded.y).toEqual(shares[0].y);
    });

    it('should reject legacy v1 format', () => {
      const legacyShare = btoa(String.fromCharCode(1, 72, 101, 108, 108, 111));
      expect(() => decodeShare(legacyShare)).toThrow(
        'Legacy share format is no longer supported'
      );
    });

    it('should reject legacy x:base64 format', () => {
      expect(() => decodeShare('1:SGVsbG8=')).toThrow(
        'Legacy share format is no longer supported'
      );
    });

    it('should throw on invalid base64', () => {
      expect(() => decodeShare('not-valid-base64!!!')).toThrow(
        'Invalid share format'
      );
    });
  });

  describe('encodeShares / decodeShares', () => {
    it('should encode and decode multiple shares', () => {
      const shares = createShares();
      const encoded = encodeShares(shares, { m, n });
      const decoded = decodeShares(encoded);

      expect(decoded).toHaveLength(n);
      decoded.forEach((share, i) => {
        expect(share.x).toBe(shares[i].x);
        expect(share.y).toEqual(shares[i].y);
        expect(share.threshold).toBe(m);
        expect(share.totalShares).toBe(n);
      });
    });

    it('should throw when shares have inconsistent metadata', () => {
      const shares1 = splitSecret(new TextEncoder().encode('A'), 5, 3);
      const shares2 = splitSecret(new TextEncoder().encode('B'), 5, 3);

      const encoded1 = encodeShare(shares1[0], { m: 3, n: 5 });
      const encoded2 = encodeShare(shares2[1], { m: 3, n: 5 });

      expect(() => decodeShares([encoded1, encoded2])).toThrow('mismatch');
    });
  });

  describe('integration with split/reconstruct', () => {
    it('should reconstruct secret from encoded shares', () => {
      const shares = createShares();
      const encoded = encodeShares(shares, { m, n });
      const decoded = decodeShares(encoded.slice(0, m));
      const result = reconstructSecret(decoded);

      expect(result.isValid).toBe(true);
      if (result.isValid) {
        expect(result.secret).toEqual(secret);
      }
    });

    it('should produce illegible output from insufficient encoded shares', () => {
      const shares = createShares();
      const encoded = encodeShares(shares, { m, n });
      const decoded = decodeShares(encoded.slice(0, m - 1));
      const result = reconstructSecret(decoded);

      expect(result.isValid).toBe(false);
    });
  });

  describe('wire format', () => {
    it('should use fixed key and nonce lengths in payload', () => {
      const shares = createShares();
      const decoded = decodeShare(encodeShare(shares[0], { m, n }));

      expect(decoded.y.length).toBe(ENCRYPTION_KEY_LENGTH);
      expect(decoded.nonce.length).toBe(NONCE_LENGTH);
    });
  });

  describe('sharesToText', () => {
    it('writes one share per line that decodes back to the same shares', () => {
      const shares = createShares();
      const text = sharesToText(shares, { m, n });
      const lines = text.split('\n');
      expect(lines).toHaveLength(n);
      const decoded = decodeShares(lines);
      expect(decoded.map((share) => share.x)).toEqual(shares.map((s) => s.x));
      expect(reconstructSecret(decoded.slice(0, m)).secret).toEqual(secret);
    });
  });
});
