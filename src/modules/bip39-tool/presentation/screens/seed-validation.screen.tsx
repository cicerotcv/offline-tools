import { PageContainer } from '@/shared/presentation/layouts/page';

import { SeedValidationForm } from '../components/seed-validation/seed-validation-form';

export function SeedValidationScreen() {
  return (
    <PageContainer className="pt-0 sm:pt-0">
      <SeedValidationForm />
    </PageContainer>
  );
}
