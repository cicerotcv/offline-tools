import * as React from 'react';

import { Slot } from '@radix-ui/react-slot';
import { cva, type VariantProps } from 'class-variance-authority';
import { Loader2 } from 'lucide-react';

import { cn } from '$/lib/utils';

const buttonVariants = cva(
  `inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md
  text-sm font-medium transition-all disabled:pointer-events-none
  disabled:opacity-50 [&_svg]:pointer-events-none cursor-pointer border
  border-transparent [&_svg:not([class*='size-'])]:size-4 shrink-0
  active:scale-[0.98] ease-[cubic-bezier(.2,.8,.2,1)] duration-150
  [&_svg]:shrink-0 outline-none focus-visible:border-ring
  focus-visible:ring-ring/50 focus-visible:ring-[3px]
  aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40
  aria-invalid:border-destructive`,
  {
    variants: {
      variant: {
        default: `bg-primary text-primary-foreground
        shadow-[inset_0_1px_0_oklch(1_0_0/30%),0_1px_2px_oklch(0.21_0.012_60/12%)]
        hover:bg-primary/90`,
        destructive: `bg-destructive text-white hover:bg-destructive/90
        focus-visible:ring-destructive/20 dark:focus-visible:ring-destructive/40
        dark:bg-destructive/60`,
        outline: `border-input bg-card shadow-card hover:bg-muted
        hover:text-foreground`,
        secondary: `bg-secondary text-secondary-foreground
        hover:bg-secondary/70`,
        ghost: 'text-muted-foreground hover:bg-muted hover:text-foreground',
        link: 'text-accent-strong underline-offset-4 hover:underline',
      },
      size: {
        default: 'h-9 px-4 py-2 has-[>svg]:px-3',
        sm: 'h-8 rounded-md gap-1.5 px-3 has-[>svg]:px-2.5',
        lg: 'h-10 rounded-md px-6 has-[>svg]:px-4',
        icon: 'size-9',
        'icon-sm': 'size-8',
        'icon-lg': 'size-10',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  }
);

/**
 * `loading`: disabled + aria-busy, spinner in the icon slot (replacing a
 * leading icon if there is one), label unchanged.
 */
function Button({
  className,
  variant,
  size,
  asChild = false,
  loading = false,
  disabled,
  children,
  ...props
}: React.ComponentProps<'button'> &
  VariantProps<typeof buttonVariants> & {
    asChild?: boolean;
    loading?: boolean;
  }) {
  const Comp = asChild ? Slot : 'button';

  if (asChild) {
    return (
      <Comp
        data-slot="button"
        className={cn(buttonVariants({ variant, size, className }))}
        {...props}
      >
        {children}
      </Comp>
    );
  }

  return (
    <Comp
      data-slot="button"
      className={cn(
        buttonVariants({ variant, size, className }),
        loading && '[&>svg:first-child:not([data-loading-indicator])]:hidden'
      )}
      disabled={disabled || loading}
      aria-busy={loading || undefined}
      {...props}
    >
      {children}
      {loading && (
        <Loader2
          aria-hidden
          data-loading-indicator
          className="order-first animate-spin"
        />
      )}
    </Comp>
  );
}

export { Button, buttonVariants };
