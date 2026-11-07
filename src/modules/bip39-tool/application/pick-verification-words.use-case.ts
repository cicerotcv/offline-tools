import { UseCase } from '@/shared/application/use-case';
import type { RandomPort } from '@/shared/domain/crypto/port';

import { pickVerificationIndices } from '../lib/backup-verify';

export interface PickVerificationWordsCommand {
  wordCount: number;
  count: number;
}

/** Random word positions the user must re-type to prove the backup. */
export class PickVerificationWordsUseCase extends UseCase<
  PickVerificationWordsCommand,
  number[]
> {
  constructor(
    private readonly randomSource: Pick<RandomPort, 'getRandomValues'>
  ) {
    super();
  }

  execute({ wordCount, count }: PickVerificationWordsCommand) {
    return pickVerificationIndices(wordCount, count, this.randomSource);
  }
}
