import * as React from 'react';

import * as TabsPrimitive from '@radix-ui/react-tabs';

import { cn } from '$/lib/utils';

function Tabs({
  className,
  ...props
}: React.ComponentProps<typeof TabsPrimitive.Root>) {
  return (
    <TabsPrimitive.Root
      data-slot="tabs"
      className={cn('flex flex-col gap-2', className)}
      {...props}
    />
  );
}

function TabsList({
  className,
  ...props
}: React.ComponentProps<typeof TabsPrimitive.List>) {
  return (
    <TabsPrimitive.List
      data-slot="tabs-list"
      className={cn(
        `inline-flex h-10 w-fit items-center justify-center gap-0.5 rounded-lg
        border border-border p-[3px] text-muted-foreground`,
        className
      )}
      {...props}
    />
  );
}

/**
 * Flat segmented trigger. The active segment gets a tonal fill (no shadow) and is
 * marked with a lit "pixel" (the bit-grid motif) instead of an underline.
 */
function TabsTrigger({
  className,
  ...props
}: React.ComponentProps<typeof TabsPrimitive.Trigger>) {
  return (
    <TabsPrimitive.Trigger
      data-slot="tabs-trigger"
      className={cn(
        `inline-flex h-full flex-1 cursor-pointer items-center justify-center
        gap-2 rounded-md px-3 text-sm font-medium whitespace-nowrap
        transition-[color,background-color,box-shadow] duration-200 outline-none
        disabled:pointer-events-none disabled:opacity-50
        [&_svg]:pointer-events-none [&_svg]:shrink-0
        [&_svg:not([class*='size-'])]:size-4`,
        'hover:bg-muted/50 hover:text-foreground',
        `before:size-1.5 before:shrink-0 before:rounded-[1.5px]
        before:bg-primary before:transition-[opacity,transform]
        before:duration-200 before:content-['']
        not-data-[state=active]:before:scale-50
        not-data-[state=active]:before:opacity-0`,
        `data-[state=active]:bg-secondary data-[state=active]:text-foreground
        data-[state=active]:ring-1 data-[state=active]:ring-border-accent
        data-[state=active]:ring-inset`,
        'focus-visible:ring-[3px] focus-visible:ring-ring/40',
        className
      )}
      {...props}
    />
  );
}

function TabsContent({
  className,
  ...props
}: React.ComponentProps<typeof TabsPrimitive.Content>) {
  return (
    <TabsPrimitive.Content
      data-slot="tabs-content"
      className={cn('flex-1 outline-none', className)}
      {...props}
    />
  );
}

export { Tabs, TabsList, TabsTrigger, TabsContent };
