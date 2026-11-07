import { describe, expect, it } from 'vitest';

import {
  compareHashes,
  parseExpectedHash,
  validateExpectedHash,
} from './hash-compare';

const SHA256_SAMPLE =
  'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855';

describe('parseExpectedHash', () => {
  it('normalizes uppercase hex', () => {
    expect(parseExpectedHash('ABCD1234')).toBe('abcd1234');
  });

  it('strips 0x prefix', () => {
    expect(parseExpectedHash('0xABCD1234')).toBe('abcd1234');
  });

  it('strips algorithm prefix', () => {
    expect(parseExpectedHash(`SHA256: ${SHA256_SAMPLE}`)).toBe(SHA256_SAMPLE);
  });

  it('extracts hash from sha256sum line format', () => {
    expect(parseExpectedHash(`${SHA256_SAMPLE}  release.tar.gz`)).toBe(
      SHA256_SAMPLE
    );
    expect(parseExpectedHash(`${SHA256_SAMPLE} *release.tar.gz`)).toBe(
      SHA256_SAMPLE
    );
  });
});

describe('validateExpectedHash', () => {
  it('accepts valid sha256 length', () => {
    expect(validateExpectedHash(SHA256_SAMPLE, 'sha256')).toBeNull();
  });

  it('rejects wrong length for algorithm', () => {
    expect(validateExpectedHash('abcd', 'sha256')).toMatch(/64 hex/);
  });

  it('rejects non-hex characters', () => {
    expect(validateExpectedHash('ghij', 'md5')).toMatch(/hexadecimal/);
  });
});

describe('compareHashes', () => {
  it('returns idle when expected is empty', () => {
    expect(compareHashes(SHA256_SAMPLE, '', 'sha256')).toEqual({
      status: 'idle',
    });
  });

  it('returns match for case-insensitive comparison', () => {
    expect(
      compareHashes(SHA256_SAMPLE, SHA256_SAMPLE.toUpperCase(), 'sha256').status
    ).toBe('match');
  });

  it('returns mismatch when digests differ', () => {
    const result = compareHashes(SHA256_SAMPLE, 'a'.repeat(64), 'sha256');
    expect(result.status).toBe('mismatch');
    expect(result.computed).toBe(SHA256_SAMPLE);
    expect(result.expected).toBe('a'.repeat(64));
  });

  it('returns invalid-expected for malformed input', () => {
    expect(compareHashes(SHA256_SAMPLE, 'not-a-hash', 'sha256').status).toBe(
      'invalid-expected'
    );
  });

  it('returns waiting-input when computed hash is empty', () => {
    expect(compareHashes('', SHA256_SAMPLE, 'sha256').status).toBe(
      'waiting-input'
    );
  });
});
