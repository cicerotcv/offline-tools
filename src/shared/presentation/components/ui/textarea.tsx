import * as React from 'react';

import { cn } from '$/lib/utils';

function Textarea({ className, ...props }: React.ComponentProps<'textarea'>) {
  return (
    <textarea
      data-slot="textarea"
      className={cn(
        `flex field-sizing-content min-h-16 w-full rounded-md border
        border-input bg-card px-3 py-2 text-base
        transition-[color,box-shadow,border-color] outline-none
        placeholder:text-muted-foreground hover:border-foreground/25
        focus-visible:border-ring focus-visible:bg-card focus-visible:ring-2
        focus-visible:ring-ring/25 disabled:cursor-not-allowed
        disabled:opacity-50 aria-invalid:border-destructive
        aria-invalid:ring-destructive/20 md:text-sm dark:bg-surface-inset
        dark:aria-invalid:ring-destructive/40`,
        className
      )}
      {...props}
    />
  );
}

export { Textarea };
