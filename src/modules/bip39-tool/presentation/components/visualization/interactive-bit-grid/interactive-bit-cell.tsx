interface InteractiveBitCellProps {
  x: number;
  y: number;
  cellSize: number;
  isPainted: boolean;
  onClick: () => void;
}

export function InteractiveBitCell({
  x,
  y,
  cellSize,
  isPainted,
  onClick,
}: InteractiveBitCellProps) {
  return (
    <rect
      x={x - cellSize / 2}
      y={y - cellSize / 2}
      width={cellSize}
      height={cellSize}
      rx={4}
      strokeWidth={2}
      data-painted={isPainted}
      data-interactive="true"
      onClick={onClick}
      onMouseEnter={(e) => {
        e.currentTarget.style.opacity = '0.8';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.opacity = '1';
      }}
    />
  );
}
