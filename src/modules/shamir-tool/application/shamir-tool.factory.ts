import { webCryptoAead } from '@/shared/infra/crypto/aead.web-crypto';
import { webCryptoRandom } from '@/shared/infra/crypto/random.web-crypto';

import { ReconstructSecretUseCase } from './reconstruct-secret.use-case';
import { RunShamirSelfTestUseCase } from './run-self-test.use-case';
import { SplitSecretUseCase } from './split-secret.use-case';

const deps = { random: webCryptoRandom, aead: webCryptoAead };

export function makeSplitSecretUseCase(): SplitSecretUseCase {
  return new SplitSecretUseCase(deps);
}

export function makeReconstructSecretUseCase(): ReconstructSecretUseCase {
  return new ReconstructSecretUseCase(webCryptoAead);
}

export function makeRunShamirSelfTestUseCase(): RunShamirSelfTestUseCase {
  return new RunShamirSelfTestUseCase(deps);
}
