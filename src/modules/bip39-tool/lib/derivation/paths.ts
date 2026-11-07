import * as bitcoin from 'bitcoinjs-lib';

import type { DerivationPath } from '../../domain/bitcoin/config';

/**
 * Manages derivation paths for BIP44, BIP49, and BIP84:
 * m / purpose' / coin_type' / account' / change / index
 * coin_type is 0' on mainnet and 1' on every test network (SLIP-44).
 */
export class DerivationPathManager {
  private static readonly PURPOSE = {
    bip44: 44,
    bip49: 49,
    bip84: 84,
  } as const;

  static getCoinType(network: { bech32?: string }): 0 | 1 {
    return network.bech32 === bitcoin.networks.bitcoin.bech32 ? 0 : 1;
  }

  static getAccountPath(
    path: DerivationPath,
    network: { bech32?: string }
  ): string {
    return `m/${this.PURPOSE[path]}'/${this.getCoinType(network)}'/0'`;
  }

  static getReceivingPath(
    path: DerivationPath,
    network: { bech32?: string },
    index: number
  ): string {
    return `${this.getAccountPath(path, network)}/0/${index}`;
  }

  static getChangePath(
    path: DerivationPath,
    network: { bech32?: string },
    index: number
  ): string {
    return `${this.getAccountPath(path, network)}/1/${index}`;
  }
}

/**
 * Account-level path for a derivation scheme on a network, e.g. m/84'/0'/0'
 * on mainnet or m/84'/1'/0' on testnet/regtest.
 */
export function getAccountPath(
  derivationPath: DerivationPath,
  network: { bech32?: string }
): string {
  return DerivationPathManager.getAccountPath(derivationPath, network);
}

/**
 * Describes an account-level path such as m/49'/1'/0': which scheme it uses
 * and whether it belongs to mainnet (coin type 0') or a test network (1').
 */
export function describeAccountPath(accountPath: string): {
  scheme: 'BIP44' | 'BIP49' | 'BIP84';
  networkLabel: 'Bitcoin Mainnet' | 'Bitcoin Testnet / Regtest';
} {
  const [, purpose, coinType] = /^m\/(\d+)'\/(\d+)'/.exec(accountPath) ?? [];
  const scheme =
    purpose === '44' ? 'BIP44' : purpose === '49' ? 'BIP49' : 'BIP84';
  return {
    scheme,
    networkLabel:
      coinType === '0' ? 'Bitcoin Mainnet' : 'Bitcoin Testnet / Regtest',
  };
}
