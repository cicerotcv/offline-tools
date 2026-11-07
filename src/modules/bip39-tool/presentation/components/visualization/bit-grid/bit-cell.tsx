interface BitCellProps {
  x: number;
  y: number;
  cellSize: number;
  isPainted: boolean;
  isInvalid: boolean;
}

export function BitCell({
  x,
  y,
  cellSize,
  isPainted,
  isInvalid,
}: BitCellProps) {
  return (
    <rect
      x={x - cellSize / 2}
      y={y - cellSize / 2}
      width={cellSize}
      height={cellSize}
      rx={4}
      strokeWidth={2}
      data-painted={isPainted}
      data-invalid={isInvalid}
    />
  );
}
