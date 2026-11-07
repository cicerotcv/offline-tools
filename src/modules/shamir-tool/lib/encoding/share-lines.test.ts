import { describe, expect, it } from 'vitest';

import { Base64 } from '@/shared/lib/base64';

import { SHAMIR_V2_VECTOR } from '../../domain/vectors/v2-vectors';
import { SHAMIR_V3_VECTOR } from '../../domain/vectors/v3-vectors';
import { analyzeShareLines } from './share-lines';

const v3 = SHAMIR_V3_VECTOR.shares;
const v2 = SHAMIR_V2_VECTOR.shares;

function flipBit(share: string): string {
  const bytes = new Uint8Array(Base64.decodeToBuffer(share));
  bytes[20] ^= 1;
  return Base64.encodeBufferUrlSafe(bytes.buffer);
}

describe('analyzeShareLines', () => {
  it('counts distinct shares of one set against the threshold', () => {
    const two = analyzeShareLines([v3[0], v3[2]].join('\n'));
    expect(two).toMatchObject({
      have: 2,
      threshold: 3,
      ready: false,
      setId: 'A9F2-3B84',
      version: 3,
    });
    expect(two.lines.map((l) => [l.status, l.x, l.total])).toEqual([
      ['ok', 1, 5],
      ['ok', 3, 5],
    ]);
    expect(two.locked?.length).toBeGreaterThan(16);
    expect(analyzeShareLines([v3[0], v3[2], v3[4]].join('\n')).ready).toBe(
      true
    );
  });

  it('marks duplicates, damaged copies and unreadable lines', () => {
    const result = analyzeShareLines(
      [v3[0], v3[0], flipBit(v3[1]), 'not a share', '', v3[3]].join('\n')
    );
    expect(result.lines.map((l) => l.status)).toEqual([
      'ok',
      'duplicate',
      'damaged',
      'invalid',
      'ok',
    ]);
    expect(result.have).toBe(2);
  });

  it('separates shares from another split and old v2 shares', () => {
    const result = analyzeShareLines([v3[0], v2[1]].join('\n'));
    expect(result.lines.map((l) => l.status)).toEqual(['ok', 'other-set']);
    const legacy = analyzeShareLines([v2[0], v2[1], v2[2]].join('\n'));
    expect(legacy).toMatchObject({ version: 2, ready: true, have: 3 });
    expect(legacy.lines.every((l) => l.status === 'legacy')).toBe(true);
  });

  it('takes the set most lines belong to as the reference', () => {
    const result = analyzeShareLines([v2[0], v3[0], v3[1], v3[2]].join('\n'));
    expect(result).toMatchObject({ version: 3, have: 3, ready: true });
    expect(result.lines[0].status).toBe('other-set');
  });

  it('is empty and not ready for blank input', () => {
    expect(analyzeShareLines(' \n ')).toMatchObject({
      lines: [],
      have: 0,
      ready: false,
    });
  });
});
