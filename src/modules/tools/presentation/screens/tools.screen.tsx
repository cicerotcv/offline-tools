import { Highlight } from '@/shared/presentation/components/highlight';
import {
  PageContainer,
  PageDescription,
  PageTitle,
} from '@/shared/presentation/layouts/page';
import { toolCategories } from '@/shared/presentation/tools/tool-registry';

import { ToolGroup } from '../components/catalog/tool-group';

export function ToolsScreen() {
  return (
    <PageContainer>
      <PageTitle>Tools</PageTitle>
      <PageDescription>
        Every tool runs in this tab,{' '}
        <Highlight>with no network access</Highlight>. Pick one to start.
      </PageDescription>

      <div className="mt-12 space-y-14 border-t pt-10">
        {toolCategories.map((category) => (
          <ToolGroup
            key={category.id}
            title={category.title}
            description={category.description}
            tools={category.tools}
          />
        ))}
      </div>
    </PageContainer>
  );
}
