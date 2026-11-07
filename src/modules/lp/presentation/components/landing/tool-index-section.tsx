import { Link } from '@tanstack/react-router';

import { Highlight } from '@/shared/presentation/components/highlight';
import { toolCategories } from '@/shared/presentation/tools/tool-registry';

import { SectionContainer } from './section-container';

const toolCount = toolCategories.reduce(
  (total, category) => total + category.tools.length,
  0
);

export function ToolIndexSection() {
  return (
    <SectionContainer labelledBy="tool-index-title">
      <h2
        id="tool-index-title"
        className="max-w-2xl text-3xl font-semibold tracking-tight sm:text-4xl"
      >
        {toolCount} tools.{' '}
        <span className="text-emphasis">All of them offline.</span>
      </h2>
      <p className="mt-4 max-w-[60ch] text-muted-foreground">
        From SHA-256 checksums to BIP39 paper wallets. Each one is a{' '}
        <Highlight>separate page you can open directly</Highlight>.
      </p>

      <div className="mt-14 grid gap-12 md:grid-cols-3 md:gap-8">
        {toolCategories.map((category) => (
          <div key={category.id}>
            <div
              className="flex items-baseline justify-between border-b
                border-rule pb-3"
            >
              <h3 className="font-semibold">{category.title}</h3>
              <span className="font-mono text-xs text-numeral">
                {category.tools.length}
              </span>
            </div>
            <ul className="mt-2">
              {category.tools.map((tool) => (
                <li key={tool.id}>
                  <Link
                    to={tool.path}
                    className="group -mx-2 flex items-center gap-3 rounded-md
                      px-2 py-2 text-sm text-foreground/80 transition-colors
                      hover:bg-accent hover:text-foreground"
                  >
                    <tool.icon
                      aria-hidden
                      className="h-4 w-4 shrink-0 text-muted-foreground
                        transition-colors group-hover:text-accent-strong"
                    />
                    {tool.title}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </SectionContainer>
  );
}
