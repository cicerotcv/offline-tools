import type { BIP32Interface } from 'bip32';
import type { Network } from 'bitcoinjs-lib';
import { Buffer } from 'buffer';

import { ECPair } from '../../infra/bitcoin/secp256k1';

/**
 * Converts private key to WIF (Wallet Import Format)
 * @param privateKey - Private key as Buffer or hex string
 * @param network - Bitcoin network
 * @returns WIF string
 */
export function privateKeyToWIF(
  privateKey: Buffer | string,
  network: Network
): string {
  const keyBuffer =
    typeof privateKey === 'string'
      ? Buffer.from(privateKey, 'hex')
      : privateKey;

  const keyPair = ECPair.fromPrivateKey(keyBuffer, { network });
  return keyPair.toWIF();
}

/**
 * Gets extended public key (xpub) from BIP32 node
 * @param node - BIP32 node
 * @returns xpub string (base58)
 */
export function getExtendedPublicKey(node: BIP32Interface): string {
  return node.neutered().toBase58();
}

/**
 * Gets extended private key (xprv) from BIP32 node
 * @param node - BIP32 node
 * @returns xprv string (base58)
 */
export function getExtendedPrivateKey(node: BIP32Interface): string {
  return node.toBase58();
}

/**
 * Formats a key according to the specified format
 * @param key - Key value (hex string)
 * @param format - Format type ('hex' | 'wif' | 'extended')
 * @param network - Bitcoin network (required for WIF)
 * @param node - BIP32 node (required for extended format)
 * @returns Formatted key string
 */
export function formatKey(
  key: string,
  format: 'hex' | 'wif' | 'extended',
  network?: Network,
  node?: BIP32Interface
): string {
  switch (format) {
    case 'hex':
      return key;
    case 'wif':
      if (!network) {
        throw new Error('Network required for WIF format');
      }
      return privateKeyToWIF(key, network);
    case 'extended':
      if (!node) {
        throw new Error('BIP32 node required for extended format');
      }
      return node.toBase58();
    default:
      return key;
  }
}
