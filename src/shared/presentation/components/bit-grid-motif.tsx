import { useMemo } from 'react';

import { cn } from '$/lib/utils';

interface BitGridMotifProps {
  /** Columns and rows of the grid. */
  cols?: number;
  rows?: number;
  /** Share of painted cells, 0..1. */
  density?: number;
  /** Deterministic seed so the pattern is stable across renders. */
  seed?: number;
  /** `primary` on light/neutral surfaces, `on-dark` inside the indigo band. */
  tone?: 'primary' | 'on-dark';
  /** Light up a few cells once (disabled under reduced motion). */
  animate?: boolean;
  className?: string;
}

const CELL = 24;
const GAP = 4;

/** Small deterministic PRNG (mulberry32). */
function createRandom(seed: number) {
  let state = seed >>> 0;
  return () => {
    state = (state + 0x6d2b79f5) >>> 0;
    let t = state;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/**
 * Decorative pixel grid, echoing the logo mark and the BIP39 bit grid.
 * Purely visual: hidden from assistive tech and pointer events.
 */
export function BitGridMotif({
  cols = 12,
  rows = 6,
  density = 0.3,
  seed = 7,
  tone = 'primary',
  animate = false,
  className,
}: BitGridMotifProps) {
  const cells = useMemo(() => {
    const random = createRandom(seed);
    const result: { x: number; y: number; strong: boolean; delay?: number }[] =
      [];
    for (let row = 0; row < rows; row++) {
      for (let col = 0; col < cols; col++) {
        if (random() >= density) continue;
        const strong = random() < 0.35;
        result.push({
          x: col * (CELL + GAP),
          y: row * (CELL + GAP),
          strong,
          delay: animate && strong ? Math.round(random() * 1600) : undefined,
        });
      }
    }
    return result;
  }, [cols, rows, density, seed, animate]);

  return (
    <svg
      aria-hidden
      focusable="false"
      viewBox={`0 0 ${cols * (CELL + GAP) - GAP} ${rows * (CELL + GAP) - GAP}`}
      className={cn(
        'pointer-events-none select-none',
        tone === 'primary' ? 'fill-primary' : 'fill-numeral-on-dark',
        className
      )}
    >
      {cells.map((cell) => (
        <rect
          key={`${cell.x}-${cell.y}`}
          x={cell.x}
          y={cell.y}
          width={CELL}
          height={CELL}
          rx={4}
          opacity={cell.strong ? 1 : 0.28}
          className={cell.delay !== undefined ? 'bit-pixel-on' : undefined}
          style={
            cell.delay !== undefined
              ? { animationDelay: `${cell.delay}ms` }
              : undefined
          }
        />
      ))}
    </svg>
  );
}
