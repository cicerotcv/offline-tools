import { useMemo } from 'react';

import {
  makeDecryptMessageUseCase,
  makeEncryptMessageUseCase,
} from '../../application/encryption-tool.factory';

/** Encrypt / decrypt use cases for the encryption screen. */
export function useMessageCipher() {
  return useMemo(
    () => ({
      encryptMessage: makeEncryptMessageUseCase(),
      decryptMessage: makeDecryptMessageUseCase(),
    }),
    []
  );
}
