interface PowerOfTwoHeaderProps {
  bitNum: number;
  x: number;
  y: number;
}

export function PowerOfTwoHeader({ bitNum, x, y }: PowerOfTwoHeaderProps) {
  const powerOfTwo = Math.pow(2, bitNum);

  return (
    <text
      x={x}
      y={y}
      textAnchor="start"
      dominantBaseline="middle"
      data-type="header"
      className="text-xs font-medium"
      transform={`rotate(-90 ${x} ${y})`}
    >
      {powerOfTwo}
    </text>
  );
}
