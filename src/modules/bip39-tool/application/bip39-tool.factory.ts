import { webCryptoDigest } from '@/shared/infra/crypto/digest.web-crypto';
import { webCryptoRandom } from '@/shared/infra/crypto/random.web-crypto';

import { CreatePaperWalletUseCase } from './create-paper-wallet.use-case';
import { GenerateMnemonicUseCase } from './generate-mnemonic.use-case';
import { MnemonicFromEntropyUseCase } from './mnemonic-from-entropy.use-case';
import { PickVerificationWordsUseCase } from './pick-verification-words.use-case';
import { RunBip39SelfTestUseCase } from './run-self-test.use-case';

export function makeGenerateMnemonicUseCase() {
  return new GenerateMnemonicUseCase(webCryptoRandom, webCryptoDigest);
}

export function makeMnemonicFromEntropyUseCase() {
  return new MnemonicFromEntropyUseCase(webCryptoDigest);
}

export function makeCreatePaperWalletUseCase() {
  return new CreatePaperWalletUseCase(webCryptoRandom);
}

export function makePickVerificationWordsUseCase() {
  return new PickVerificationWordsUseCase(webCryptoRandom);
}

export function makeRunBip39SelfTestUseCase() {
  return new RunBip39SelfTestUseCase(webCryptoDigest);
}
