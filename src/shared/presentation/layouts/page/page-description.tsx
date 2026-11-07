import { cn } from '$/lib/utils';

interface PageDescriptionProps {
  children: React.ReactNode;
  className?: string;
  centered?: boolean;
}

export function PageDescription({
  children,
  className,
  centered = false,
}: PageDescriptionProps) {
  return (
    <p
      className={cn(
        `mt-3 max-w-[65ch] text-base leading-relaxed text-muted-foreground
        sm:text-lg`,
        centered && 'mx-auto text-center',
        className
      )}
    >
      {children}
    </p>
  );
}
