import type { BIP32Interface } from 'bip32';
import type { Network } from 'bitcoinjs-lib';
import { Buffer } from 'buffer';

import type { DerivationPath, DerivedKey } from '../../domain/bitcoin/config';
import { bip32 } from '../../infra/bitcoin/secp256k1';
import { KeyDeriver } from './account';
import { ExtendedKeyParser } from './extended-key-parser';

/**
 * Derives BIP32 root key from seed
 * @param seed - Seed as Uint8Array (64 bytes)
 * @param network - Bitcoin network
 * @returns BIP32 root node
 */
export function deriveBIP32Root(
  seed: Uint8Array,
  network: Network
): BIP32Interface {
  const seedBuffer = Buffer.from(seed);
  return bip32.fromSeed(seedBuffer, network);
}

/**
 * Derives keys for the specified derivation path
 * @param root - BIP32 root node
 * @param network - Bitcoin network
 * @param path - Derivation path (bip44, bip49, or bip84)
 * @param count - Number of addresses to generate
 * @returns Array of derived keys
 */
export function deriveKeys(
  root: BIP32Interface,
  network: Network,
  path: DerivationPath,
  count: number
): DerivedKey[] {
  return KeyDeriver.deriveKeysFromRoot(root, path, network, count);
}

/**
 * Generates a Native SegWit (BIP84) keypair for a single address
 * @param root - BIP32 root node
 * @param network - Bitcoin network
 * @param index - Derivation index (default: 0)
 * @returns Object containing path, address, and privateKeyWIF
 */
export function deriveBIP84Key(
  root: BIP32Interface,
  network: Network,
  index: number = 0
): { path: string; address: string; privateKeyWIF: string } {
  return KeyDeriver.deriveSingleKey(root, 'bip84', network, index);
}

/**
 * Generates a SegWit (BIP49) keypair for a single address
 * @param root - BIP32 root node
 * @param network - Bitcoin network
 * @param index - Derivation index (default: 0)
 * @returns Object containing path, address, and privateKeyWIF
 */
export function deriveBIP49Key(
  root: BIP32Interface,
  network: Network,
  index: number = 0
): { path: string; address: string; privateKeyWIF: string } {
  return KeyDeriver.deriveSingleKey(root, 'bip49', network, index);
}

/**
 * Generates a Legacy (BIP44) keypair for a single address
 * @param root - BIP32 root node
 * @param network - Bitcoin network
 * @param index - Derivation index (default: 0)
 * @returns Object containing path, address, and privateKeyWIF
 */
export function deriveBIP44Key(
  root: BIP32Interface,
  network: Network,
  index: number = 0
): { path: string; address: string; privateKeyWIF: string } {
  return KeyDeriver.deriveSingleKey(root, 'bip44', network, index);
}

/**
 * Parses an extended private key (xprv/yprv/zprv) and returns the account-level node
 * @param extendedKey - Extended private key in base58 format (xprv/yprv/zprv)
 * @param network - Bitcoin network
 * @param derivationPath - Derivation path to determine which account level to use
 * @returns Account-level BIP32 node
 */
export function parseExtendedPrivateKey(
  extendedKey: string,
  network: Network,
  derivationPath: DerivationPath
): BIP32Interface {
  return ExtendedKeyParser.parsePrivateKey(
    extendedKey,
    network,
    derivationPath
  );
}

/**
 * Parses an extended public key (xpub/ypub/zpub) and returns the account-level node
 * Note: This creates a watch-only wallet (cannot derive private keys)
 * @param extendedKey - Extended public key in base58 format (xpub/ypub/zpub)
 * @param network - Bitcoin network (used as fallback, but network is auto-detected from key)
 * @param derivationPath - Derivation path to determine which account level to use
 * @returns Account-level BIP32 node (neutered/public only)
 */
/**
 * Detects the network from an extended key format
 * @param extendedKey - Extended key (xpub/ypub/zpub/xprv/tpub/upub/vpub/tprv)
 * @returns Detected network or null if cannot be determined
 */
export function detectNetworkFromExtendedKey(
  extendedKey: string
): Network | null {
  return ExtendedKeyParser.detectNetwork(extendedKey);
}

/**
 * Detects the derivation path from an extended public key format
 * @param extendedKey - Extended public key (xpub/ypub/zpub/tpub/upub/vpub)
 * @returns Detected derivation path or null if cannot be determined
 */
export function detectDerivationPathFromExtendedKey(
  extendedKey: string
): DerivationPath | null {
  return ExtendedKeyParser.detectDerivationPath(extendedKey);
}

export function parseExtendedPublicKey(
  extendedKey: string,
  network: Network,
  derivationPath: DerivationPath
): BIP32Interface {
  return ExtendedKeyParser.parsePublicKey(extendedKey, network, derivationPath);
}

/**
 * Derives keys from an extended private key (xprv/yprv/zprv)
 * @param extendedKey - Extended private key in base58 format
 * @param network - Bitcoin network
 * @param derivationPath - Derivation path (bip44, bip49, or bip84)
 * @param count - Number of addresses to generate
 * @returns Array of derived keys
 */
export function deriveKeysFromExtendedPrivateKey(
  extendedKey: string,
  network: Network,
  derivationPath: DerivationPath,
  count: number
): DerivedKey[] {
  return KeyDeriver.deriveKeysFromExtendedPrivateKey(
    extendedKey,
    network,
    derivationPath,
    count
  );
}

/**
 * Derives addresses from an extended public key (xpub/ypub/zpub) - watch-only
 * Note: Private keys cannot be derived from public keys
 * @param extendedKey - Extended public key in base58 format
 * @param network - Bitcoin network
 * @param derivationPath - Derivation path (bip44, bip49, or bip84)
 * @param count - Number of addresses to generate
 * @returns Array of derived keys (without private keys)
 */
export function deriveKeysFromExtendedPublicKey(
  extendedKey: string,
  network: Network,
  derivationPath: DerivationPath,
  count: number
): DerivedKey[] {
  return KeyDeriver.deriveKeysFromExtendedPublicKey(
    extendedKey,
    network,
    derivationPath,
    count
  );
}

export { describeAccountPath, getAccountPath } from './paths';
export { ExtendedKeyParser } from './extended-key-parser';
export { KeyDeriver } from './account';
