import { ReactNode } from 'react';

import { cn } from '$/lib/utils';

interface SectionContainerProps {
  id?: string;
  className?: string;
  containerClassName?: string;
  labelledBy?: string;
  children: ReactNode;
}

export function SectionContainer({
  id,
  className,
  containerClassName,
  labelledBy,
  children,
}: SectionContainerProps) {
  return (
    <section
      id={id}
      aria-labelledby={labelledBy}
      className={cn(
        'px-4 pt-20 pb-24 sm:px-6 sm:pt-24 sm:pb-28 lg:px-8',
        className
      )}
    >
      <div className={cn('mx-auto max-w-7xl', containerClassName)}>
        {children}
      </div>
    </section>
  );
}
