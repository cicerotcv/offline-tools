import { describe, expect, it } from 'vitest';

import { qrMatrix } from '@/shared/lib/qr';

import { SHAMIR_V3_VECTOR } from '../../domain/vectors/v3-vectors';
import { buildLaserPlate, MIN_QR_MODULE, PLATE_HEIGHT } from './plate-svg';

const input = {
  share: SHAMIR_V3_VECTOR.shares[1],
  index: 1,
  total: 5,
  threshold: 3,
  setId: SHAMIR_V3_VECTOR.setId,
};

/** Even-odd test over the loops of an "M..L..Z" path. */
function insidePath(d: string, px: number, py: number) {
  const loops = d
    .split('Z')
    .filter(Boolean)
    .map((loop) =>
      loop
        .replace(/^M/, '')
        .split('L')
        .map((pair) => pair.split(' ').map(Number) as [number, number])
    );
  let crossings = 0;
  for (const loop of loops) {
    for (let i = 0; i < loop.length; i++) {
      const [x1, y1] = loop[i];
      const [x2, y2] = loop[(i + 1) % loop.length];
      if (
        y1 > py !== y2 > py &&
        px < ((x2 - x1) * (py - y1)) / (y2 - y1) + x1
      ) {
        crossings++;
      }
    }
  }
  return crossings % 2 === 1;
}

describe('laser plate', () => {
  const plate = buildLaserPlate(input);

  it('is two ID-1 plates at 1:1 in millimetres', () => {
    expect(plate.svg).toContain('width="181.2mm"');
    expect(plate.svg).toContain(`height="${PLATE_HEIGHT}mm"`);
    expect(plate.svg).toContain('viewBox="0 0 181.2 53.98"');
    expect(plate.svg.match(/<rect /g)).toHaveLength(2);
  });

  it('uses only engrave black and cut red, and no live text', () => {
    const colours = new Set(plate.svg.match(/#[0-9A-Fa-f]{3,6}\b/g));
    expect([...colours].sort()).toEqual(['#000', '#FF0000']);
    expect(plate.svg).not.toMatch(/<text|font-family|opacity/);
  });

  it('does not carry the share as readable text', () => {
    expect(plate.svg).not.toContain(input.share);
    expect(plate.svg).not.toContain(input.share.slice(0, 12));
  });

  it('engraves a QR that reproduces the share matrix with a 4-module quiet zone', () => {
    const { level, size, module, x, y } = plate.qr;
    expect(level).toBe('H');
    expect(module).toBeGreaterThanOrEqual(MIN_QR_MODULE);
    const d = plate.svg.match(/id="front-qr"[^>]* d="([^"]+)"/)![1];
    const matrix = qrMatrix(input.share, level);
    expect(matrix.size).toBe(size);
    for (let r = 0; r < size; r++) {
      for (let c = 0; c < size; c++) {
        expect(
          insidePath(d, x + (c + 0.5) * module, y + (r + 0.5) * module)
        ).toBe(matrix.dark[r * size + c]);
      }
    }
    // Quiet zone: nothing dark within 4 modules around the code, and the
    // front text ends before it (the builder throws otherwise).
    expect(insidePath(d, x - 2 * module, y + 1)).toBe(false);
    expect(() =>
      buildLaserPlate({ ...input, total: 255, threshold: 255, index: 254 })
    ).not.toThrow();
  });

  it('switches to a denser layout and lower error correction for long shares', () => {
    const long = buildLaserPlate({ ...input, share: 'A'.repeat(396) });
    expect(long.density.name).toBe('dense');
    expect(long.qr.module).toBeGreaterThanOrEqual(MIN_QR_MODULE);
    expect(['Q', 'M']).toContain(long.qr.level);
    expect(() => buildLaserPlate({ ...input, share: 'A'.repeat(400) })).toThrow(
      /too long/
    );
  });
});
