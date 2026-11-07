import { useMemo, useState } from 'react';

import { Checkbox } from '$/components/ui/checkbox';
import { Label } from '$/components/ui/label';

import { binaryToIndex, binaryToWord } from '../../../../lib/wordlist';
import { BitGridHeader } from '../bit-grid/bit-grid-header';
import { InteractiveWordRow } from './interactive-word-row';
import { WordsDisplay } from './words-display';

interface InteractiveBitGridProps {
  numWords: number;
  bits: boolean[][];
  onBitToggle: (wordIdx: number, bitIdx: number) => void;
}

export function InteractiveBitGrid({
  numWords,
  bits,
  onBitToggle,
}: InteractiveBitGridProps) {
  const [showGridIndex, setShowGridIndex] = useState(false);
  const [showWords, showIndexes] = [false, showGridIndex]; // Hide words, show indexes based on checkbox
  const numBits = 11;
  const cellSize = 32;
  const padding = 16;
  const cellGap = 4;
  const wordColWidth = 0; // No word column in interactive mode
  const positionColWidth = 40; // Position column (always visible)
  const indexColWidth = showIndexes ? 60 : 0; // Index column width when shown
  const bitColWidth = cellSize + cellGap;
  const rowHeight = cellSize + cellGap;
  const headerHeight = 80;

  const gridWidth =
    positionColWidth +
    cellGap +
    wordColWidth +
    (showWords ? cellGap : 0) +
    numBits * bitColWidth -
    cellGap +
    (showIndexes ? cellGap : 0) +
    indexColWidth +
    padding * 2;

  const gridHeight =
    headerHeight + numWords * rowHeight - cellGap + padding * 2;

  // Calculate words and indexes from bits
  const wordsAndIndexes = useMemo(() => {
    return bits.map((wordBits) => {
      const binary = wordBits.map((bit) => (bit ? '1' : '0')).join('');
      let index: number | null = null;
      let word: string | undefined = undefined;

      try {
        index = binaryToIndex(binary);
        word = binaryToWord(binary);
      } catch {
        // Invalid binary, leave as null
      }

      return { word: word || 'INVALID', index };
    });
  }, [bits]);

  // Prepare data for WordsDisplay
  const wordsData = useMemo(() => {
    return bits.map((wordBits, idx) => {
      const binary = wordBits.map((bit) => (bit ? '1' : '0')).join('');
      const { word, index } = wordsAndIndexes[idx];
      return { word, index, binary };
    });
  }, [bits, wordsAndIndexes]);

  return (
    <div className="container flex flex-col gap-4 @lg:flex-row @lg:items-start">
      <div className="flex-1 @lg:max-w-sm @lg:min-w-0 @xl:max-w-md">
        <WordsDisplay wordsData={wordsData} />
      </div>

      <div className="space-y-2 @lg:flex-1">
        <div className="flex items-center justify-end">
          <div className="flex items-center gap-2">
            <Checkbox
              id="show-grid-index"
              checked={showGridIndex}
              onCheckedChange={(checked) => setShowGridIndex(checked === true)}
            />
            <Label
              htmlFor="show-grid-index"
              className="cursor-pointer text-sm font-normal
                text-muted-foreground"
            >
              Show index
            </Label>
          </div>
        </div>
        <div
          className="flex w-full items-center justify-center overflow-x-auto
            rounded-lg border border-border bg-card"
        >
          <svg
            width={gridWidth}
            height={gridHeight}
            className="block [&_rect[data-interactive='true']]:cursor-pointer
              [&_rect[data-painted='false']]:fill-card
              [&_rect[data-painted='false']]:stroke-border
              [&_rect[data-painted='true']]:fill-primary
              [&_rect[data-painted='true']]:stroke-primary
              [&_text[data-type='header']]:fill-muted-foreground
              [&_text[data-type='index']]:fill-muted-foreground
              [&_text[data-type='position']]:fill-muted-foreground
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
              indexColWidth={indexColWidth}
              showIndexes={showIndexes}
              positionColWidth={positionColWidth}
            />

            {bits.map((wordBits, wordIdx) => {
              const y =
                padding + headerHeight + wordIdx * rowHeight + rowHeight / 2;
              const { word, index } = wordsAndIndexes[wordIdx];

              return (
                <InteractiveWordRow
                  key={wordIdx}
                  word={word}
                  index={index}
                  wordIdx={wordIdx}
                  y={y}
                  padding={padding}
                  wordColWidth={wordColWidth}
                  showWords={showWords}
                  cellGap={cellGap}
                  bitColWidth={bitColWidth}
                  cellSize={cellSize}
                  numBits={numBits}
                  showIndexes={showIndexes}
                  indexColWidth={indexColWidth}
                  positionColWidth={positionColWidth}
                  bits={wordBits}
                  onBitToggle={onBitToggle}
                />
              );
            })}
          </svg>
        </div>
      </div>
    </div>
  );
}
