import { indexToBinary } from '../../../../lib/wordlist';
import { BitCell } from './bit-cell';

interface WordRowProps {
  word: string;
  index: number | null;
  wordIdx: number;
  y: number;
  padding: number;
  headerHeight: number;
  rowHeight: number;
  wordColWidth: number;
  showWords: boolean;
  cellGap: number;
  bitColWidth: number;
  cellSize: number;
  numBits: number;
  showIndexes: boolean;
  indexColWidth: number;
}

export function WordRow({
  word,
  index,
  // wordIdx: _wordIdx,
  y,
  padding,
  // headerHeight: _headerHeight,
  // rowHeight: _rowHeight,
  wordColWidth,
  showWords,
  cellGap,
  bitColWidth,
  cellSize,
  numBits,
  showIndexes,
  // indexColWidth: _indexColWidth,
}: WordRowProps) {
  let bits: (boolean | null)[] = Array(numBits).fill(null);
  let binary = '';

  if (index !== null && index !== undefined && typeof index === 'number') {
    binary = indexToBinary(index, numBits);
    bits = binary.split('').map((bit) => bit === '1');
  }

  return (
    <g>
      {/* Word text */}
      {showWords && (
        <text
          x={padding + wordColWidth - 4}
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
          wordColWidth +
          (showWords ? cellGap : 0) +
          bitIdx * bitColWidth +
          cellSize / 2;
        const isPainted = bit === true;
        const isInvalid = bit === null;

        return (
          <BitCell
            key={bitIdx}
            x={x}
            y={y}
            cellSize={cellSize}
            isPainted={isPainted}
            isInvalid={isInvalid}
          />
        );
      })}

      {/* Index text */}
      {showIndexes && (
        <text
          x={
            padding +
            wordColWidth +
            (showWords ? cellGap : 0) +
            numBits * bitColWidth -
            cellGap +
            cellGap +
            8
          }
          y={y}
          textAnchor="start"
          dominantBaseline="middle"
          data-type="index"
          data-invalid={index === null || index === undefined}
          className="font-mono text-sm"
        >
          {index === null || index === undefined ? 'INVALID' : index.toString()}
        </text>
      )}
    </g>
  );
}
