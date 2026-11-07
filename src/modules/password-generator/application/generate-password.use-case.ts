import { UseCase } from '@/shared/application/use-case';
import type { RandomPort } from '@/shared/domain/crypto/port';

import type { PasswordConfig } from '../domain/password/password-config';
import { generatePassword } from '../lib/password';

export interface GeneratePasswordCommand {
  config: PasswordConfig;
  /** Optional pointer entropy, mixed into the CSPRNG output. */
  mouseEntropy?: Uint8Array;
}

export class GeneratePasswordUseCase extends UseCase<
  GeneratePasswordCommand,
  string
> {
  constructor(
    private readonly randomSource: Pick<RandomPort, 'getRandomValues'>
  ) {
    super();
  }

  execute({ config, mouseEntropy }: GeneratePasswordCommand): string {
    return generatePassword(
      config,
      mouseEntropy && mouseEntropy.length > 0 ? mouseEntropy : undefined,
      this.randomSource
    );
  }
}
