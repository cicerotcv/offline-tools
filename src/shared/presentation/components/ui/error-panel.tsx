import type { ReactNode } from 'react';

import { cn } from '../../lib/utils';

interface ErrorPanelProps {
  /** Short code shown in mono, e.g. "404" or "Error". */
  code: string;
  title: string;
  description: string;
  /** Primary recovery (retry) and secondary escape (link to a stable page). */
  actions?: ReactNode;
  /** Technical detail; render only in development. */
  detail?: string;
  className?: string;
}

/** One visual language for route errors, 404 and disabled tools. */
export function ErrorPanel({
  code,
  title,
  description,
  actions,
  detail,
  className,
}: ErrorPanelProps) {
  return (
    <section
      role="alert"
      className={cn(
        'mx-auto flex max-w-xl flex-col gap-4 px-4 py-20 sm:px-6',
        className
      )}
    >
      <span className="font-mono text-sm font-medium text-accent-strong">
        {code}
      </span>
      <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">
        {title}
      </h1>
      <p className="max-w-[60ch] text-muted-foreground">{description}</p>
      {actions && <div className="mt-2 flex flex-wrap gap-3">{actions}</div>}
      {detail && (
        <pre
          className="mt-4 overflow-x-auto rounded-md border bg-muted/60 p-3
            text-xs text-muted-foreground"
        >
          {detail}
        </pre>
      )}
    </section>
  );
}
