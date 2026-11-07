import { PageContainer } from '@/shared/presentation/layouts/page';

import { SeedGenerationForm } from '../components/seed-generation/seed-generation-form';

export function SeedGenerationScreen() {
  return (
    <PageContainer className="pt-0 sm:pt-0">
      <SeedGenerationForm />
    </PageContainer>
  );
}
