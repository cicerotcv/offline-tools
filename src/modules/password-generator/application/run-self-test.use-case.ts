import { UseCase } from '@/shared/application/use-case';
import type { RandomPort } from '@/shared/domain/crypto/port';

import { DEFAULT_PASSWORD_CONFIG } from '../domain/password/password-config';
import { generatePassword } from '../lib/password';

const CHARSET =
  'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*()_+-=[]{}|;:,.<>?';

/** The CSPRNG answers and output respects length and charset. */
export class RunPasswordSelfTestUseCase extends UseCase<void, Promise<void>> {
  constructor(
    private readonly randomSource: Pick<RandomPort, 'getRandomValues'>
  ) {
    super();
  }

  async execute(): Promise<void> {
    const a = generatePassword(
      DEFAULT_PASSWORD_CONFIG,
      undefined,
      this.randomSource
    );
    const b = generatePassword(
      DEFAULT_PASSWORD_CONFIG,
      undefined,
      this.randomSource
    );
    const valid = (p: string) =>
      p.length === DEFAULT_PASSWORD_CONFIG.length &&
      [...p].every((c) => CHARSET.includes(c));
    if (!valid(a) || !valid(b) || a === b) {
      throw new Error('Self-test failed: password generation');
    }
  }
}
