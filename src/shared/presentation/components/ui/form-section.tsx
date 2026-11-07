import * as React from 'react';

import { cn } from '../../lib/utils';
import { Label } from './label';

interface FormSectionProps {
  title: string;
  /** Renders the title as the label of this control. */
  htmlFor?: string;
  description?: React.ReactNode;
  /** Small controls aligned with the title (clear, copy, case...). */
  action?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
}

/**
 * A titled group inside a tool card, without its own border: tools keep one
 * surface (the card) and separate groups by space, not by nested boxes.
 */
export function FormSection({
  title,
  htmlFor,
  description,
  action,
  children,
  className,
}: FormSectionProps) {
  return (
    <section className={cn('space-y-2.5', className)}>
      <div className="flex min-h-8 flex-wrap items-center justify-between gap-2">
        {htmlFor ? (
          <Label htmlFor={htmlFor} className="text-sm font-medium">
            {title}
          </Label>
        ) : (
          <h3 className="text-sm font-medium">{title}</h3>
        )}
        {action && (
          <div className="flex flex-wrap items-center gap-2">{action}</div>
        )}
      </div>
      {description && (
        <p className="text-sm text-muted-foreground">{description}</p>
      )}
      {children}
    </section>
  );
}
