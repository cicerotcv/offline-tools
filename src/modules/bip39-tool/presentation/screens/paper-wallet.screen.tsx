import { Card } from '@/shared/presentation/components/card';
import { PageContainer } from '@/shared/presentation/layouts/page';

import { PaperWalletForm } from '../components/paper-wallet/paper-wallet-form';

export function PaperWalletScreen() {
  return (
    <PageContainer className="pt-0 sm:pt-0">
      <Card>
        <PaperWalletForm />
      </Card>
    </PageContainer>
  );
}
