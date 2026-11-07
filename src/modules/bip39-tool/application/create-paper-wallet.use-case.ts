import { UseCase } from '@/shared/application/use-case';
import type { RandomPort } from '@/shared/domain/crypto/port';

import type { BitcoinNetwork } from '../domain/bitcoin/network';
import { decryptPrivateKeyBIP38 } from '../lib/bip38';
import {
  addressFromWIF,
  type AddressType,
  generatePaperWallet,
  type PaperWalletResult,
} from '../lib/paper-wallet';

export interface CreatePaperWalletCommand {
  network: BitcoinNetwork;
  addressType: AddressType;
  passphrase: string;
}

export class CreatePaperWalletUseCase extends UseCase<
  CreatePaperWalletCommand,
  Promise<PaperWalletResult>
> {
  constructor(
    private readonly randomSource: Pick<RandomPort, 'getRandomValues'>
  ) {
    super();
  }

  /**
   * Generates the wallet, then proves what will be printed: the WIF (and,
   * when encrypted, the BIP38 key decrypted with the passphrase) must
   * control the printed address. Nothing is shown if the check fails.
   */
  async execute(command: CreatePaperWalletCommand): Promise<PaperWalletResult> {
    const wallet = await generatePaperWallet(command, {
      random: this.randomSource,
    });
    const { network, addressType, passphrase } = command;

    if (
      addressFromWIF(wallet.privateKeyWIF, network, addressType) !==
      wallet.address
    ) {
      throw new Error(
        'Verification failed: private key does not match the address'
      );
    }
    if (wallet.encryptedPrivateKey) {
      const decrypted = await decryptPrivateKeyBIP38(
        wallet.encryptedPrivateKey,
        passphrase,
        network
      );
      if (addressFromWIF(decrypted, network, addressType) !== wallet.address) {
        throw new Error(
          'Verification failed: the BIP38 key does not decrypt to the printed address'
        );
      }
    }
    return wallet;
  }
}
