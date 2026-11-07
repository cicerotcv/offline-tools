import * as React from 'react';

import { cn } from '../../lib/utils';

interface ProgressProps extends React.ComponentProps<'div'> {
  value: number;
  max?: number;
}

export function Progress({
  className,
  value,
  max = 100,
  ...props
}: ProgressProps) {
  const percentage = Math.min(Math.max((value / max) * 100, 0), 100);

  return (
    <div
      className={cn(
        `relative h-1.5 w-full overflow-hidden rounded-full bg-muted ring-1
        ring-border ring-inset`,
        className
      )}
      {...props}
    >
      <div
        className="h-full rounded-full bg-primary transition-all duration-300"
        style={{ width: `${percentage}%` }}
      />
    </div>
  );
}
