import * as React from 'react';

import { ChevronDown } from 'lucide-react';

import { cn } from '../../lib/utils';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from './collapsible';

interface DisclosureProps {
  title: string;
  children: React.ReactNode;
  defaultOpen?: boolean;
  className?: string;
}

/**
 * Quiet expandable section for secondary content: advanced options, format
 * details, compatibility notes. Same look everywhere it is used.
 */
export function Disclosure({
  title,
  children,
  defaultOpen,
  className,
}: DisclosureProps) {
  return (
    <Collapsible
      defaultOpen={defaultOpen}
      className={cn('group/disclosure', className)}
    >
      <CollapsibleTrigger
        className="flex w-full items-center gap-1.5 rounded-sm py-1 text-sm
          font-medium text-muted-foreground transition-colors
          hover:text-foreground focus-visible:outline-2
          focus-visible:outline-offset-2 focus-visible:outline-ring"
      >
        <ChevronDown
          aria-hidden
          className="h-4 w-4 transition-transform
            group-data-[state=open]/disclosure:rotate-180"
        />
        {title}
      </CollapsibleTrigger>
      <CollapsibleContent className="pt-4">{children}</CollapsibleContent>
    </Collapsible>
  );
}

/** Collapsed "Advanced options" block; keeps defaults visible and calm. */
export function AdvancedOptions({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <Disclosure title="Advanced options" className={className}>
      <div className="space-y-6">{children}</div>
    </Disclosure>
  );
}
