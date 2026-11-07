import { describe, expect, it } from 'vitest';

import { qrMatrix } from '@/shared/lib/qr';

import { qrMatrixToPath, traceContours } from './qr-path';

/** Even-odd point-in-polygon test over all loops. */
function inside(
  loops: (readonly [number, number])[][],
  px: number,
  py: number
) {
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

function polygonArea(loop: (readonly [number, number])[]) {
  let sum = 0;
  for (let i = 0; i < loop.length; i++) {
    const [x1, y1] = loop[i];
    const [x2, y2] = loop[(i + 1) % loop.length];
    sum += x1 * y2 - x2 * y1;
  }
  return sum / 2;
}

describe('traceContours', () => {
  const matrix = qrMatrix(
    'AAMDBQKp8juExE6--Agyn8Fxi-sNTYradLQFbkhYz2-xOltbXbB6qj89hs8YYarzPIXOF2AALKyiUJi7DhlkYrHruYdCq9H7UUKux32rgabZKw0ED_xSpmNWyYr_jbM2cuigGl0FBQ',
    'H'
  );
  const loops = traceContours(matrix);

  it('fills exactly the dark modules (checked at every cell centre)', () => {
    for (let y = 0; y < matrix.size; y++) {
      for (let x = 0; x < matrix.size; x++) {
        expect(inside(loops, x + 0.5, y + 0.5)).toBe(
          matrix.dark[y * matrix.size + x]
        );
      }
    }
  });

  it('covers an area equal to the number of dark modules', () => {
    const area = Math.abs(
      loops.reduce((sum, loop) => sum + polygonArea(loop), 0)
    );
    expect(area).toBe(matrix.dark.filter(Boolean).length);
  });

  it('merges modules into far fewer loops than cells', () => {
    expect(loops.length).toBeLessThan(matrix.dark.filter(Boolean).length / 3);
    expect(loops.every((loop) => loop.length >= 4)).toBe(true);
  });

  it('writes the path in mm at the given origin and module size', () => {
    const d = qrMatrixToPath(
      { size: 1, dark: [true] },
      { x: 10, y: 5, module: 0.5 }
    );
    expect(d).toBe('M10 5L10.5 5L10.5 5.5L10 5.5Z');
  });
});
