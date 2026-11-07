import { useMemo } from 'react';

import {
  makeReconstructSecretUseCase,
  makeSplitSecretUseCase,
} from '../../application/shamir-tool.factory';

export function useSecretSharing() {
  return useMemo(
    () => ({
      splitSecret: makeSplitSecretUseCase(),
      reconstructSecret: makeReconstructSecretUseCase(),
    }),
    []
  );
}
