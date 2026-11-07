import { cva, type VariantProps } from 'class-variance-authority';

import { cn } from '$/lib/utils';

const pageContainerVariants = cva(
  'mx-auto w-full px-4 pt-6 pb-20 sm:px-6 sm:pt-10 lg:px-8',
  {
    variants: {
      size: {
        default: 'container',
        narrow: 'max-w-4xl',
        wide: 'max-w-7xl',
      },
    },
    defaultVariants: {
      size: 'wide',
    },
  }
);

interface PageContainerProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof pageContainerVariants> {
  children: React.ReactNode;
}

export function PageContainer({
  children,
  className,
  size,
  ...props
}: PageContainerProps) {
  return (
    <div className={cn(pageContainerVariants({ size }), className)} {...props}>
      {children}
    </div>
  );
}
