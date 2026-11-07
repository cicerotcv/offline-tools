import { Card } from '@/shared/presentation/components/card';
import { PageContainer } from '@/shared/presentation/layouts/page';

import { TinySeedForm } from '../components/tiny-seed/tiny-seed-form';

export function TinySeedScreen() {
  return (
    <PageContainer className="pt-0 sm:pt-0">
      <Card>
        <TinySeedForm />
      </Card>
    </PageContainer>
  );
}
