import { Card } from '@/shared/presentation/components/card';
import { PageContainer } from '@/shared/presentation/layouts/page';

import { HashToolForm } from '../components/hash/hash-tool-form';

export function HashToolScreen() {
  return (
    <PageContainer className="pt-0 sm:pt-0">
      <Card>
        <HashToolForm />
      </Card>
    </PageContainer>
  );
}
