import type { WordCount } from '../domain/bitcoin/config';
import { validateMnemonic } from '../lib/mnemonic';

/** Verify-after-generate: right word count and a valid BIP39 checksum. */
export function assertValidMnemonic(mnemonic: string, wordCount: WordCount) {
  if (
    mnemonic.trim().split(/\s+/).length !== wordCount ||
    !validateMnemonic(mnemonic)
  ) {
    throw new Error('Verification failed: generated mnemonic is invalid');
  }
}
