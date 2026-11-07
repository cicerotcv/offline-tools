import type { Tool } from '@/shared/presentation/tools/tool-registry';

import { ToolCard } from './tool-card';

interface ToolGroupProps {
  title: string;
  description?: string;
  tools: Tool[];
}

export function ToolGroup({ title, description, tools }: ToolGroupProps) {
  if (tools.length === 0) {
    return null;
  }

  return (
    <section className="grid gap-6 lg:grid-cols-[14rem_1fr] lg:gap-10">
      <div className="lg:sticky lg:top-20 lg:self-start">
        <h2 className="text-lg font-semibold tracking-tight">{title}</h2>
        {description && (
          <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">
            {description}
          </p>
        )}
        <p className="mt-3 font-mono text-xs text-muted-foreground">
          {tools.length} {tools.length === 1 ? 'tool' : 'tools'}
        </p>
      </div>
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
        {tools.map((tool) => (
          <ToolCard key={tool.id} {...tool} to={tool.path} />
        ))}
      </div>
    </section>
  );
}
