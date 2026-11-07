import { useState } from 'react';

import { RefreshCw } from 'lucide-react';

import { Card } from '@/shared/presentation/components/card';

import { Alert } from '$/components/ui/alert';
import { Button } from '$/components/ui/button';
import { Disclosure } from '$/components/ui/disclosure';
import { Stepper } from '$/components/ui/stepper';

import { useDerivationConfig } from '../../hooks/derivation-config';
import { useMnemonicDerivations } from '../../hooks/mnemonic-derivations';
import {
  type GenerateParams,
  useMnemonicGeneration,
} from '../../hooks/mnemonic-generation';
import { useSeedGenerationFlow } from '../../hooks/seed-generation-flow';
import { DerivationPanel } from '../addresses-from-seed/derivation-panel';
import { RegenerateSeedDialog } from './regenerate-seed-dialog';
import { SeedBackupVerifyStep } from './seed-backup-verify-step';
import { SeedBackupView } from './seed-backup-view';
import { SeedDetailsSection } from './seed-details-section';
import { SeedGenerationConfigCard } from './seed-generation-config-card';

const SEED_GENERATION_STEPS = [
  { id: 'configure', label: 'Configure' },
  { id: 'backup', label: 'Backup' },
  { id: 'verify', label: 'Verify' },
  { id: 'complete', label: 'Complete' },
] as const;

export function SeedGenerationForm() {
  const [regenerateOpen, setRegenerateOpen] = useState(false);

  const {
    step,
    verificationIndices,
    goToBackup,
    goToVerify,
    goToComplete,
    resetFlow,
    initVerification,
  } = useSeedGenerationFlow();

  const derivationConfig = useDerivationConfig();
  const {
    network,
    derivationPath,
    addressCount,
    setNetwork,
    setDerivationPath,
    setAddressCount,
  } = derivationConfig;

  const {
    generationMode,
    wordCount,
    customEntropy,
    passphrase,
    mnemonic,
    isGenerating: isGeneratingMnemonic,
    error: generationError,
    generateWithParams,
    clearMnemonic,
  } = useMnemonicGeneration();

  const {
    seed,
    entropy,
    keys,
    isLoading: isComputingDerivations,
  } = useMnemonicDerivations({
    mnemonic,
    passphrase,
    network,
    derivationPath,
    addressCount,
  });

  const isGenerating = isGeneratingMnemonic || isComputingDerivations;

  const handleGenerate = async (params: GenerateParams): Promise<boolean> => {
    const success = await generateWithParams(params);
    if (success) {
      initVerification(params.wordCount);
      goToBackup();
    }
    return success;
  };

  const handleRegenerate = async () => {
    setRegenerateOpen(false);
    const success = await generateWithParams({
      generationMode,
      wordCount,
      customEntropy,
      passphrase,
    });
    if (success) {
      initVerification(wordCount);
      goToBackup();
    }
  };

  const handleStartOver = () => {
    clearMnemonic();
    resetFlow();
  };

  return (
    <div className="space-y-6">
      <Stepper
        steps={SEED_GENERATION_STEPS}
        current={step}
        label="Seed generation progress"
      />

      {step === 'configure' && (
        <SeedGenerationConfigCard
          onGenerate={handleGenerate}
          isGenerating={isGeneratingMnemonic}
          error={generationError}
        />
      )}

      {step === 'backup' && mnemonic && (
        <Card className="space-y-6">
          <SeedBackupView
            mnemonic={mnemonic}
            passphrase={passphrase}
            wordCount={wordCount}
          />
          <Button
            type="button"
            onClick={goToVerify}
            className="w-full"
            size="lg"
          >
            I wrote it down, check my backup
          </Button>
        </Card>
      )}

      {step === 'verify' && mnemonic && (
        <Card>
          <SeedBackupVerifyStep
            mnemonic={mnemonic}
            indices={verificationIndices}
            onVerified={goToComplete}
            onStartOver={handleStartOver}
          />
        </Card>
      )}

      {step === 'complete' && mnemonic && (
        <Card className="space-y-6">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <Alert variant="success" title="Backup verified" className="flex-1">
              Keep the paper offline. Send a small test amount before real
              funds.
            </Alert>
            <Button
              type="button"
              variant="outline"
              onClick={() => setRegenerateOpen(true)}
            >
              <RefreshCw aria-hidden className="h-4 w-4" />
              New phrase
            </Button>
          </div>

          <div className="divide-y divide-border border-y">
            <Disclosure title="Seed phrase" className="py-3">
              <SeedBackupView
                mnemonic={mnemonic}
                passphrase={passphrase}
                wordCount={wordCount}
              />
            </Disclosure>
            <Disclosure title="Addresses and keys" className="py-3">
              <DerivationPanel
                network={network}
                derivationPath={derivationPath}
                addressCount={addressCount}
                keys={keys}
                isLoading={isGenerating}
                onNetworkChange={setNetwork}
                onPathChange={setDerivationPath}
                onCountChange={setAddressCount}
              />
            </Disclosure>
            <Disclosure title="Technical details" className="py-3">
              <SeedDetailsSection
                mnemonic={mnemonic}
                seed={seed}
                entropy={entropy}
                wordCount={wordCount}
                passphrase={passphrase}
              />
            </Disclosure>
          </div>
        </Card>
      )}

      <RegenerateSeedDialog
        open={regenerateOpen}
        onOpenChange={setRegenerateOpen}
        onConfirm={handleRegenerate}
      />
    </div>
  );
}
