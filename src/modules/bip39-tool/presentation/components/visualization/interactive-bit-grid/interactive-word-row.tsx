import { InteractiveBitCell } from './interactive-bit-cell';

interface InteractiveWordRowProps {
  word: string;
  index: number | null;
  wordIdx: number;
  y: number;
  padding: number;
  wordColWidth: number;
  showWords: boolean;
  cellGap: number;
  bitColWidth: number;
  cellSize: number;
  numBits: number;
  showIndexes: boolean;
  indexColWidth: number;
  positionColWidth: number;
  bits: boolean[];
  onBitToggle: (wordIdx: number, bitIdx: number) => void;
}

export function InteractiveWordRow({
  word,
  index,
  wordIdx,
  y,
  padding,
  wordColWidth,
  showWords,
  cellGap,
  bitColWidth,
  cellSize,
  numBits,
  showIndexes,
  // indexColWidth: _indexColWidth,
  positionColWidth,
  bits,
  onBitToggle,
}: InteractiveWordRowProps) {
  return (
    <g>
      {/* Position number (1, 2, 3, ...) - always visible */}
      <text
        x={padding + positionColWidth / 2}
        y={y}
        textAnchor="middle"
        dominantBaseline="middle"
        data-type="position"
        className="font-mono text-sm"
      >
        {wordIdx + 1}
      </text>

      {/* Word text */}
      {showWords && (
        <text
          x={padding + positionColWidth + cellGap + wordColWidth - 4}
          y={y}
          textAnchor="end"
          dominantBaseline="middle"
          data-type="word"
          className="font-mono text-sm font-medium"
        >
          {word}
        </text>
      )}

      {/* Bit boxes */}
      {bits.map((bit, bitIdx) => {
        const x =
          padding +
          positionColWidth +
          cellGap +
          bitIdx * bitColWidth +
          cellSize / 2;
        const isPainted = bit === true;

        return (
          <InteractiveBitCell
            key={bitIdx}
            x={x}
            y={y}
            cellSize={cellSize}
            isPainted={isPainted}
            onClick={() => onBitToggle(wordIdx, bitIdx)}
          />
        );
      })}

      {/* Index text - on the right side */}
      {showIndexes && (
        <text
          x={
            padding +
            positionColWidth +
            cellGap +
            numBits * bitColWidth -
            cellGap +
            cellGap +
            8
          }
          y={y}
          textAnchor="start"
          dominantBaseline="middle"
          data-type="index"
          className="font-mono text-sm"
        >
          {index === null ? 'INVALID' : index.toString()}
        </text>
      )}
    </g>
  );
}
