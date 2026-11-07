import { type ReactNode } from 'react';

import { cn } from '$/lib/utils';

interface HighlightProps {
  children: ReactNode;
  className?: string;
}

/** Solid brand-color block behind a short phrase inside body text. */
export function Highlight({ children, className }: HighlightProps) {
  return <mark className={cn('marker', className)}>{children}</mark>;
}
