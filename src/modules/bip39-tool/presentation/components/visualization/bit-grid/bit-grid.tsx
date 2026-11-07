import { useState } from 'react';

import { BitGridControls } from './bit-grid-controls';
import { BitGridHeader } from './bit-grid-header';
import { WordRow } from './word-row';

interface BitGridProps {
  words: string[];
  indexes: (number | null)[];
}

export function BitGrid({ words, indexes }: BitGridProps) {
  const [showWords, setShowWords] = useState(true);
  const [showIndexes, setShowIndexes] = useState(true);

  const numBits = 11; // BIP39 indices go from 0 to 2047, so we need 11 bits (2^11 = 2048, but max index is 2047)
  const cellSize = 32;
  const padding = 16;
  const cellGap = 4;
  // Calculate width for 8 characters in monospace font (text-sm = 14px, ~8.5px per char)
  // 8 chars × 8.5px + 4px padding = 72px
  const wordColWidth = showWords ? 72 : 0;
  const indexColWidth = showIndexes ? 80 : 0;
  const bitColWidth = cellSize + cellGap;
  const rowHeight = cellSize + cellGap;
  const headerHeight = 80; // Increased to fit rotated power of 2 values (2048 is longest)

  const gridWidth =
    wordColWidth +
    (showWords ? cellGap : 0) +
    numBits * bitColWidth -
    cellGap +
    (showIndexes ? cellGap : 0) +
    indexColWidth +
    padding * 2;

  const gridHeight =
    headerHeight + words.length * rowHeight - cellGap + padding * 2;

  return (
    <div className="space-y-4">
      <BitGridControls
        showWords={showWords}
        showIndexes={showIndexes}
        onToggleWords={() => setShowWords(!showWords)}
        onToggleIndexes={() => setShowIndexes(!showIndexes)}
      />

      <div
        className="flex w-full max-w-4xl items-center justify-center
          overflow-x-auto rounded-lg border border-border bg-card"
      >
        <svg
          width={gridWidth}
          height={gridHeight}
          className="block [&_rect[data-invalid='true']]:fill-destructive/12
            [&_rect[data-invalid='true']]:stroke-destructive/40
            [&_rect[data-painted='false']]:fill-card
            [&_rect[data-painted='false']]:stroke-border
            [&_rect[data-painted='true']]:fill-primary
            [&_rect[data-painted='true']]:stroke-primary
            [&_text[data-invalid='true']]:fill-destructive
            [&_text[data-type='header']]:fill-muted-foreground
            [&_text[data-type='index']]:fill-muted-foreground
            [&_text[data-type='word']]:fill-foreground/80"
          viewBox={`0 0 ${gridWidth} ${gridHeight}`}
          preserveAspectRatio="xMinYMin meet"
          style={{ maxWidth: '100%', height: 'auto' }}
          paintOrder="stroke fill"
        >
          <BitGridHeader
            numBits={numBits}
            padding={padding}
            headerHeight={headerHeight}
            wordColWidth={wordColWidth}
            showWords={showWords}
            cellGap={cellGap}
            bitColWidth={bitColWidth}
            cellSize={cellSize}
          />

          {words.map((word, wordIdx) => {
            const y =
              padding + headerHeight + wordIdx * rowHeight + rowHeight / 2;

            return (
              <WordRow
                key={wordIdx}
                word={word}
                index={indexes[wordIdx] ?? null}
                wordIdx={wordIdx}
                y={y}
                padding={padding}
                headerHeight={headerHeight}
                rowHeight={rowHeight}
                wordColWidth={wordColWidth}
                showWords={showWords}
                cellGap={cellGap}
                bitColWidth={bitColWidth}
                cellSize={cellSize}
                numBits={numBits}
                showIndexes={showIndexes}
                indexColWidth={indexColWidth}
              />
            );
          })}
        </svg>
      </div>
    </div>
  );
}
