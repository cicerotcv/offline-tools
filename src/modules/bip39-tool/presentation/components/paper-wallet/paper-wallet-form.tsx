import { Stepper } from '$/components/ui/stepper';

import { usePaperWallet } from '../../hooks/paper-wallet';
import { PaperWalletConfigCard } from './paper-wallet-config-card';
import { PaperWalletResult } from './paper-wallet-result';

type PaperWalletStep = 'configure' | 'print';

const PAPER_WALLET_STEPS = [
  { id: 'configure', label: 'Configure' },
  { id: 'print', label: 'Print' },
] as const;

export function PaperWalletForm() {
  const { wallet, isGenerating, error, generateWallet, clearWallet } =
    usePaperWallet();

  const currentStep: PaperWalletStep = wallet ? 'print' : 'configure';

  const handleGenerateNew = () => {
    clearWallet();
  };

  return (
    <div className="space-y-6">
      <Stepper
        steps={PAPER_WALLET_STEPS}
        current={currentStep}
        label="Paper wallet progress"
      />

      {!wallet ? (
        <PaperWalletConfigCard
          onGenerate={generateWallet}
          isGenerating={isGenerating}
          error={error}
        />
      ) : (
        <PaperWalletResult wallet={wallet} onGenerateNew={handleGenerateNew} />
      )}
    </div>
  );
}
