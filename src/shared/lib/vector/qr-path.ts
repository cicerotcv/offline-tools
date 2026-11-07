import type { QrMatrix } from '@/shared/domain/qr/port';

type Point = readonly [number, number];
const key = ([x, y]: Point) => `${x},${y}`;

/**
 * Outlines the dark cells of a grid as closed polygons (in grid units):
 * edges shared by two dark cells cancel, the remaining boundary edges are
 * chained into loops and collinear points are dropped. Filled with the
 * even-odd rule, the loops cover exactly the dark cells, with no seams
 * between modules (a laser would otherwise burn shared edges twice).
 */
export function traceContours(matrix: QrMatrix): Point[][] {
  const { size, dark } = matrix;
  const isDark = (x: number, y: number) =>
    x >= 0 && y >= 0 && x < size && y < size && dark[y * size + x];

  // Directed boundary edges, clockwise around each dark region.
  const edges = new Map<string, Point[]>();
  const add = (from: Point, to: Point) => {
    const list = edges.get(key(from)) ?? [];
    list.push(to);
    edges.set(key(from), list);
  };
  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      if (!isDark(x, y)) continue;
      if (!isDark(x, y - 1)) add([x, y], [x + 1, y]);
      if (!isDark(x + 1, y)) add([x + 1, y], [x + 1, y + 1]);
      if (!isDark(x, y + 1)) add([x + 1, y + 1], [x, y + 1]);
      if (!isDark(x - 1, y)) add([x, y + 1], [x, y]);
    }
  }

  const loops: Point[][] = [];
  for (const [startKey, targets] of edges) {
    while (targets.length > 0) {
      const [sx, sy] = startKey.split(',').map(Number);
      const loop: Point[] = [[sx, sy]];
      let next = targets.pop()!;
      while (key(next) !== startKey) {
        loop.push(next);
        next = edges.get(key(next))!.pop()!;
      }
      loops.push(simplify(loop));
    }
  }
  return loops;
}

/** Drops points that lie on a straight line between their neighbours. */
function simplify(loop: Point[]): Point[] {
  return loop.filter((point, i) => {
    const prev = loop[(i - 1 + loop.length) % loop.length];
    const next = loop[(i + 1) % loop.length];
    return !(
      (prev[0] === point[0] && point[0] === next[0]) ||
      (prev[1] === point[1] && point[1] === next[1])
    );
  });
}

const mm = (value: number) => Number(value.toFixed(3));

/** SVG path data for the dark modules, placed at (x, y) in mm. */
export function qrMatrixToPath(
  matrix: QrMatrix,
  { x, y, module }: { x: number; y: number; module: number }
): string {
  return traceContours(matrix)
    .map(
      (loop) =>
        loop
          .map(
            ([px, py], i) =>
              `${i === 0 ? 'M' : 'L'}${mm(x + px * module)} ${mm(y + py * module)}`
          )
          .join('') + 'Z'
    )
    .join('');
}
