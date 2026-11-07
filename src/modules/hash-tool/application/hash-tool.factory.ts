import { webCryptoDigest } from '@/shared/infra/crypto/digest.web-crypto';

import { ComputeDigestUseCase } from './compute-digest.use-case';
import { RunHashSelfTestUseCase } from './run-self-test.use-case';

export function makeComputeDigestUseCase(): ComputeDigestUseCase {
  return new ComputeDigestUseCase(webCryptoDigest);
}

export function makeRunHashSelfTestUseCase(): RunHashSelfTestUseCase {
  return new RunHashSelfTestUseCase(webCryptoDigest);
}
