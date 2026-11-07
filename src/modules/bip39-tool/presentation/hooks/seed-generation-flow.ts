import { useCallback, useState } from 'react';

import { makePickVerificationWordsUseCase } from '../../application/bip39-tool.factory';

export type SeedGenerationStep = 'configure' | 'backup' | 'verify' | 'complete';

interface UseSeedGenerationFlowReturn {
  step: SeedGenerationStep;
  verificationIndices: number[];
  goToBackup: () => void;
  goToVerify: () => void;
  goToComplete: () => void;
  resetFlow: () => void;
  initVerification: (wordCount: number) => void;
}

export function useSeedGenerationFlow(): UseSeedGenerationFlowReturn {
  const [step, setStep] = useState<SeedGenerationStep>('configure');
  const [verificationIndices, setVerificationIndices] = useState<number[]>([]);

  const goToBackup = useCallback(() => {
    setStep('backup');
  }, []);

  const goToVerify = useCallback(() => {
    setStep('verify');
  }, []);

  const goToComplete = useCallback(() => {
    setStep('complete');
  }, []);

  const resetFlow = useCallback(() => {
    setStep('configure');
    setVerificationIndices([]);
  }, []);

  const initVerification = useCallback((wordCount: number) => {
    setVerificationIndices(
      makePickVerificationWordsUseCase().execute({ wordCount, count: 3 })
    );
  }, []);

  return {
    step,
    verificationIndices,
    goToBackup,
    goToVerify,
    goToComplete,
    resetFlow,
    initVerification,
  };
}
