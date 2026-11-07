import type { ToolId } from '@/shared/domain/tools';
import {
  OFFLINE_STEPS,
  RELEASES_URL,
} from '@/shared/presentation/seo/site-config';
import { getTool } from '@/shared/presentation/tools/tool-registry';

import { RelatedTools } from './related-tools';

interface ToolGuideProps {
  id: ToolId;
}

function GuideSection({
  title,
  items,
  ordered = false,
}: {
  title: string;
  items: readonly React.ReactNode[];
  ordered?: boolean;
}) {
  const List = ordered ? 'ol' : 'ul';
  return (
    <section className="space-y-3">
      <h2 className="text-heading">{title}</h2>
      <List
        className={`space-y-1.5 pl-5 text-sm leading-relaxed
          text-muted-foreground ${ordered ? 'list-decimal' : 'list-disc'}`}
      >
        {items.map((item, index) => (
          <li key={index}>{item}</li>
        ))}
      </List>
    </section>
  );
}

/**
 * How to use, limits and offline use of a tool, fed by the registry, plus
 * related tools. Rendered once by the tools layout below every tool.
 */
export function ToolGuide({ id }: ToolGuideProps) {
  const tool = getTool(id);
  const [download, ...rest] = OFFLINE_STEPS;

  return (
    <div className="space-y-12 border-t pt-10">
      <div className="grid gap-8 lg:grid-cols-3">
        <GuideSection title="How to use" items={tool.howTo} ordered />
        <GuideSection title="Limits" items={tool.limits} />
        <GuideSection
          title="Use it offline"
          ordered
          items={[
            <>
              {download}{' '}
              <a
                href={RELEASES_URL}
                className="font-medium text-accent-strong underline-offset-4
                  hover:underline"
              >
                Releases
              </a>
            </>,
            ...rest,
          ]}
        />
      </div>
      <RelatedTools from={id} />
    </div>
  );
}
