import { describe, expect, it } from 'vitest';

import { createSequentialRandom } from '@/shared/infra/crypto/random.sequential';

import { EmptyCharsetError } from '../domain/password/errors';
import { DEFAULT_PASSWORD_CONFIG } from '../domain/password/password-config';
import { GeneratePasswordUseCase } from './generate-password.use-case';

describe('GeneratePasswordUseCase', () => {
  it('is deterministic for a fixed random source', () => {
    const run = () =>
      new GeneratePasswordUseCase(createSequentialRandom([1, 2, 3, 4])).execute(
        { config: DEFAULT_PASSWORD_CONFIG }
      );
    expect(run()).toBe(run());
    expect(run()).toHaveLength(DEFAULT_PASSWORD_CONFIG.length);
  });

  it('ignores empty mouse entropy', () => {
    const random = () => createSequentialRandom([9, 8, 7]);
    const config = DEFAULT_PASSWORD_CONFIG;
    expect(
      new GeneratePasswordUseCase(random()).execute({
        config,
        mouseEntropy: new Uint8Array(0),
      })
    ).toBe(new GeneratePasswordUseCase(random()).execute({ config }));
  });

  it('raises a typed error when no character class is selected', () => {
    expect(() =>
      new GeneratePasswordUseCase(createSequentialRandom([0])).execute({
        config: {
          ...DEFAULT_PASSWORD_CONFIG,
          includeUppercase: false,
          includeLowercase: false,
          includeNumbers: false,
          includeSymbols: false,
        },
      })
    ).toThrow(EmptyCharsetError);
  });
});
