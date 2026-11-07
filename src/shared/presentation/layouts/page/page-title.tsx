import { cn } from '$/lib/utils';

interface PageTitleProps {
  children: React.ReactNode;
  className?: string;
  centered?: boolean;
}

export function PageTitle({
  children,
  className,
  centered = false,
}: PageTitleProps) {
  return (
    <h1
      className={cn(
        'font-heading text-title text-foreground',
        centered && 'text-center',
        className
      )}
    >
      {children}
    </h1>
  );
}
