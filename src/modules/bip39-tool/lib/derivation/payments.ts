import * as bitcoin from 'bitcoinjs-lib';
import type { Network } from 'bitcoinjs-lib';
import { Buffer } from 'buffer';

import type { DerivationPath } from '../../domain/bitcoin/config';

/**
 * Factory for creating payment objects based on derivation path
 */
export class PaymentFactory {
  static createPayment(
    derivationPath: DerivationPath,
    pubkey: Buffer | Uint8Array,
    network: Network
  ): bitcoin.Payment {
    const pubkeyBuffer = Buffer.isBuffer(pubkey) ? pubkey : Buffer.from(pubkey);
    switch (derivationPath) {
      case 'bip44':
        return bitcoin.payments.p2pkh({
          pubkey: pubkeyBuffer,
          network: network as bitcoin.Network,
        });
      case 'bip49':
        return bitcoin.payments.p2sh({
          redeem: bitcoin.payments.p2wpkh({
            pubkey: pubkeyBuffer,
            network: network as bitcoin.Network,
          }),
          network: network as bitcoin.Network,
        });
      case 'bip84':
        return bitcoin.payments.p2wpkh({
          pubkey: pubkeyBuffer,
          network: network as bitcoin.Network,
        });
      default:
        throw new Error(`Unknown derivation path: ${derivationPath}`);
    }
  }
}
