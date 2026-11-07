import { PageContainer } from '@/shared/presentation/layouts/page';

import { WalletRecoveryForm } from '../components/wallet-recovery/wallet-recovery-form';

export function WalletRecoveryScreen() {
  return (
    <PageContainer className="pt-0 sm:pt-0">
      <WalletRecoveryForm />
    </PageContainer>
  );
}
