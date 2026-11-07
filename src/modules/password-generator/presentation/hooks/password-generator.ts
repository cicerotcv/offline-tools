import { useCallback, useEffect, useMemo, useState } from 'react';

import { makeGeneratePasswordUseCase } from '../../application/password-generator.factory';
import {
  DEFAULT_PASSWORD_CONFIG,
  type PasswordConfig,
} from '../../domain/password/password-config';

/**
 * Screen state for the password generator. A password is generated on open
 * and again whenever the settings or the mouse entropy change.
 */
export function usePasswordGenerator() {
  const generatePasswordUseCase = useMemo(
    () => makeGeneratePasswordUseCase(),
    []
  );
  const [config, setConfig] = useState<PasswordConfig>(DEFAULT_PASSWORD_CONFIG);
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [mouseEntropy, setMouseEntropy] = useState<Uint8Array>(
    () => new Uint8Array(0)
  );

  const generate = useCallback(() => {
    try {
      setPassword(generatePasswordUseCase.execute({ config, mouseEntropy }));
      setError(null);
    } catch (err) {
      // Never show an error message in the password field.
      setPassword('');
      setError(
        err instanceof Error ? err.message : 'Could not generate a password.'
      );
    }
  }, [generatePasswordUseCase, config, mouseEntropy]);

  useEffect(() => {
    generate();
  }, [generate]);

  return {
    config,
    setConfig,
    password,
    error,
    setMouseEntropy,
    generate,
  };
}
