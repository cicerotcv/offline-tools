import { PowerOfTwoHeader } from './power-of-two-header';

interface BitGridHeaderProps {
  numBits: number;
  padding: number;
  headerHeight: number;
  wordColWidth: number;
  showWords: boolean;
  cellGap: number;
  bitColWidth: number;
  cellSize: number;
  indexColWidth?: number;
  showIndexes?: boolean;
  positionColWidth?: number;
}

export function BitGridHeader({
  numBits,
  padding,
  headerHeight,
  wordColWidth,
  showWords,
  cellGap,
  bitColWidth,
  cellSize,
  // indexColWidth: _indexColWidth = 0,
  // showIndexes: _showIndexes = false,
  positionColWidth = 0,
}: BitGridHeaderProps) {
  const y = padding + headerHeight - 8;

  return (
    <g>
      {Array.from({ length: numBits }).map((_, i) => {
        const bitNum = 10 - i; // Bits 10 down to 0 (powers: 1024, 512, ..., 2, 1)
        const x =
          padding +
          positionColWidth +
          cellGap +
          wordColWidth +
          (showWords ? cellGap : 0) +
          i * bitColWidth +
          cellSize / 2;

        return <PowerOfTwoHeader key={i} bitNum={bitNum} x={x} y={y} />;
      })}
    </g>
  );
}
