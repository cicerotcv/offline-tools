import { type ReactNode } from 'react';

import { cva, type VariantProps } from 'class-variance-authority';
import { AlertTriangle, CheckCircle, Info, XCircle } from 'lucide-react';

import { cn } from '../../lib/utils';

const alertVariants = cva('rounded-lg border px-4 py-3', {
  variants: {
    variant: {
      warning: 'border-warning/25 bg-warning/8',
      error: 'border-destructive/25 bg-destructive/8',
      info: 'border-info/25 bg-info/8',
      success: 'border-success/25 bg-success/8',
    },
  },
  defaultVariants: {
    variant: 'warning',
  },
});

const alertIconVariants = cva('mt-0.5 shrink-0 [&_svg]:size-4', {
  variants: {
    variant: {
      warning: 'text-warning',
      error: 'text-destructive',
      info: 'text-info',
      success: 'text-success',
    },
  },
  defaultVariants: {
    variant: 'warning',
  },
});

const alertTitleVariants = cva('text-sm font-semibold text-foreground', {
  variants: {
    variant: {
      warning: '',
      error: '',
      info: '',
      success: '',
    },
  },
  defaultVariants: {
    variant: 'warning',
  },
});

const alertContentVariants = cva('text-sm text-foreground/80', {
  variants: {
    variant: {
      warning: '',
      error: '',
      info: '',
      success: '',
    },
  },
  defaultVariants: {
    variant: 'warning',
  },
});

const variantIcons = {
  warning: AlertTriangle,
  error: XCircle,
  info: Info,
  success: CheckCircle,
};

export interface AlertProps extends VariantProps<typeof alertVariants> {
  title?: string;
  children: ReactNode;
  className?: string;
  icon?: ReactNode;
  /** Level of the title heading; pick the one that fits the page outline. */
  headingLevel?: 'h2' | 'h3' | 'h4';
}

export function Alert({
  variant = 'warning',
  title,
  children,
  className,
  icon,
  headingLevel: Heading = 'h2',
}: AlertProps) {
  const DefaultIcon = variant ? variantIcons[variant] : AlertTriangle;

  return (
    <div className={cn(alertVariants({ variant }), className)}>
      <div className="flex items-start gap-3">
        <div className={cn(alertIconVariants({ variant }))}>
          {icon || <DefaultIcon aria-hidden />}
        </div>
        <div className="flex-1">
          {title && (
            <Heading className={cn(alertTitleVariants({ variant }))}>
              {title}
            </Heading>
          )}
          <div className={cn(alertContentVariants({ variant }))}>
            {children}
          </div>
        </div>
      </div>
    </div>
  );
}
