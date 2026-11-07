import { webCryptoRandom } from '@/shared/infra/crypto/random.web-crypto';

import { GeneratePasswordUseCase } from './generate-password.use-case';
import { RunPasswordSelfTestUseCase } from './run-self-test.use-case';

export function makeGeneratePasswordUseCase(): GeneratePasswordUseCase {
  return new GeneratePasswordUseCase(webCryptoRandom);
}

export function makeRunPasswordSelfTestUseCase(): RunPasswordSelfTestUseCase {
  return new RunPasswordSelfTestUseCase(webCryptoRandom);
}
