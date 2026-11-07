import { Link } from '@tanstack/react-router';
import { ArrowUpRight, LucideIcon } from 'lucide-react';

interface ToolCardProps {
  icon: LucideIcon;
  title: string;
  description: string;
  to: string;
}

export function ToolCard({
  icon: Icon,
  title,
  description,
  to,
}: ToolCardProps) {
  return (
    <Link
      to={to}
      className="group relative flex h-full flex-col rounded-lg border bg-card
        p-5 transition-[border-color,box-shadow,transform] duration-200
        hover:border-border-accent hover:shadow-sm hover:shadow-primary/10
        active:translate-y-px"
    >
      <div className="mb-4 flex items-center justify-between">
        <span
          className="flex h-9 w-9 items-center justify-center rounded-md
            bg-secondary text-accent-strong transition-colors
            group-hover:bg-primary group-hover:text-primary-foreground"
        >
          <Icon className="h-4 w-4" />
        </span>
        <ArrowUpRight
          aria-hidden
          className="h-4 w-4 text-muted-foreground opacity-0 transition-all
            duration-200 group-hover:translate-x-0.5
            group-hover:-translate-y-0.5 group-hover:opacity-100"
        />
      </div>
      <h3 className="mb-1.5 text-base font-semibold tracking-tight">{title}</h3>
      <p className="flex-1 text-sm leading-relaxed text-muted-foreground">
        {description}
      </p>
    </Link>
  );
}
