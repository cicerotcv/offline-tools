import { Link } from '@tanstack/react-router';

import type { ToolId } from '@/shared/domain/tools';
import { getTool } from '@/shared/presentation/tools/tool-registry';

import { cn } from '$/lib/utils';

import { cardVariants } from './card';

interface RelatedToolsProps {
  /** Defaults to the `related` list of `from` in the registry. */
  ids?: readonly ToolId[];
  from?: ToolId;
}

/** Cards linking to related tools, fed by the tool registry. */
export function RelatedTools({ ids, from }: RelatedToolsProps) {
  const toolIds = ids ?? (from ? getTool(from).related : []);
  if (toolIds.length === 0) return null;

  return (
    <section aria-labelledby="related-tools" className="space-y-4">
      <h2 id="related-tools" className="text-heading">
        Related tools
      </h2>
      <div className="grid gap-3 sm:grid-cols-3">
        {toolIds.map((id) => {
          const tool = getTool(id);
          return (
            <Link
              key={tool.id}
              to={tool.path}
              className={cn(cardVariants({ variant: 'interactive' }), 'p-4')}
            >
              <tool.icon
                aria-hidden
                className="mb-3 h-4 w-4 text-accent-strong"
              />
              <p className="text-sm font-medium">{tool.title}</p>
              <p className="mt-1 text-xs text-muted-foreground">
                {tool.summary}
              </p>
            </Link>
          );
        })}
      </div>
    </section>
  );
}
