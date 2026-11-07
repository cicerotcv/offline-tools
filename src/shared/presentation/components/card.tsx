import { cva, type VariantProps } from 'class-variance-authority';

import { cn } from '$/lib/utils';

const cardVariants = cva('rounded-xl p-6', {
  variants: {
    variant: {
      /** The one raised surface of a page section. */
      default: 'border border-card-edge bg-card shadow-card',
      /** A recessed well for secondary groups inside or beside a card. */
      inset: 'bg-surface-inset',
      /** A card that is a link or a button. */
      interactive: `border border-card-edge bg-card shadow-card
      transition-colors hover:border-border-accent`,
    },
  },
  defaultVariants: { variant: 'default' },
});

interface CardProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof cardVariants> {
  children: React.ReactNode;
}

export function Card({ children, className, variant, ...props }: CardProps) {
  return (
    <div className={cn(cardVariants({ variant }), className)} {...props}>
      {children}
    </div>
  );
}

export { cardVariants };
