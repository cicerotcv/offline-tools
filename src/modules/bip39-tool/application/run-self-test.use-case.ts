import { UseCase } from '@/shared/application/use-case';
import type { DigestPort } from '@/shared/domain/crypto/port';
import { bytesToHex, hexToBytes } from '@/shared/lib/bytes';

import type { WordCount } from '../domain/bitcoin/config';
import {
  BIP39_PASSPHRASE,
  BIP39_VECTORS,
  BIP84_VECTOR,
} from '../domain/vectors/official-vectors';
import { deriveBIP32Root, deriveKeys } from '../lib/derivation';
import {
  generateMnemonicFromEntropy,
  getEntropyFromMnemonic,
  getSeedFromMnemonic,
} from '../lib/mnemonic';
import { getNetwork } from '../lib/networks';

/** First 12-word and first 24-word official vectors. */
const SELF_TEST_VECTORS = [BIP39_VECTORS[0], BIP39_VECTORS[8]];

/**
 * Known-answer checks over the exact code paths the tools use: entropy to
 * mnemonic, mnemonic to seed (PBKDF2), BIP32 root and a BIP84 address.
 */
export class RunBip39SelfTestUseCase extends UseCase<void, Promise<void>> {
  constructor(private readonly digestPort: Pick<DigestPort, 'digest'>) {
    super();
  }

  async execute(): Promise<void> {
    const mainnet = getNetwork('mainnet');
    for (const vector of SELF_TEST_VECTORS) {
      const wordCount = vector.mnemonic.split(' ').length as WordCount;
      const mnemonic = await generateMnemonicFromEntropy(
        hexToBytes(vector.entropy),
        wordCount,
        this.digestPort
      );
      check(mnemonic === vector.mnemonic, 'BIP39 entropy to mnemonic');
      check(
        bytesToHex(getEntropyFromMnemonic(mnemonic)) === vector.entropy,
        'BIP39 mnemonic to entropy'
      );
      const seed = await getSeedFromMnemonic(mnemonic, BIP39_PASSPHRASE);
      check(bytesToHex(seed) === vector.seed, 'BIP39 seed (PBKDF2)');
      check(
        deriveBIP32Root(seed, mainnet).toBase58() === vector.rootXprv,
        'BIP32 root key'
      );
    }

    const seed = await getSeedFromMnemonic(BIP84_VECTOR.mnemonic);
    const [first] = deriveKeys(
      deriveBIP32Root(seed, mainnet),
      mainnet,
      'bip84',
      1
    );
    check(
      first.address === BIP84_VECTOR.receive[0].address,
      'BIP84 first address'
    );
  }
}

function check(ok: boolean, label: string): void {
  if (!ok) throw new Error(`Self-test failed: ${label}`);
}
