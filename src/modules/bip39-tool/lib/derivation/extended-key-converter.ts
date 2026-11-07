import { sha256 } from '@noble/hashes/sha2.js';
import type { BIP32Interface } from 'bip32';
import * as bitcoin from 'bitcoinjs-lib';
import type { Network } from 'bitcoinjs-lib';
import bs58 from 'bs58';
import { Buffer } from 'buffer';

import type { DerivationPath } from '../../domain/bitcoin/config';

/**
 * Recalculates the checksum for an extended public key after modifying version bytes
 * Extended key format: 78 bytes data + 4 bytes checksum = 82 bytes total
 * Checksum is first 4 bytes of double SHA256 of the 78-byte data
 * @param dataWithoutChecksum - Extended key data without checksum (78 bytes)
 * @returns 4-byte checksum
 */
export function recalculateChecksum(dataWithoutChecksum: Buffer): Buffer {
  // Double SHA256
  const hash1 = sha256(dataWithoutChecksum);
  const hash2 = sha256(hash1);
  // Return first 4 bytes as checksum
  return Buffer.from(hash2.slice(0, 4));
}

/**
 * Handles conversion and version byte management for extended keys (xpub/ypub/zpub)
 */
export class ExtendedKeyConverter {
  private static readonly VERSION_BYTES = {
    bip44: { mainnet: 0x0488b21e, testnet: 0x043587cf }, // xpub/tpub
    bip49: { mainnet: 0x049d7cb2, testnet: 0x044a5262 }, // ypub/upub
    bip84: { mainnet: 0x04b24746, testnet: 0x045f1cf6 }, // zpub/vpub
  } as const;

  static getVersionByte(
    derivationPath: DerivationPath,
    network: Network
  ): number {
    const isMainnet = network === bitcoin.networks.bitcoin;
    return isMainnet
      ? this.VERSION_BYTES[derivationPath].mainnet
      : this.VERSION_BYTES[derivationPath].testnet;
  }

  static convertToExtendedPublicKey(
    accountPublic: BIP32Interface,
    derivationPath: DerivationPath,
    network: Network
  ): string {
    const xpubBase58 = accountPublic.toBase58();
    const decoded = bs58.decode(xpubBase58);
    const buffer = Buffer.from(decoded);

    // Extended key format: 78 bytes data + 4 bytes checksum = 82 bytes total
    const dataWithoutChecksum = buffer.slice(0, 78);
    const versionByte = this.getVersionByte(derivationPath, network);

    // Replace version bytes (first 4 bytes)
    dataWithoutChecksum.writeUInt32BE(versionByte, 0);

    // Recalculate checksum
    const checksum = recalculateChecksum(dataWithoutChecksum);
    const newBuffer = Buffer.concat([dataWithoutChecksum, checksum]);

    return bs58.encode(newBuffer);
  }

  static convertToXpubFormat(extendedKey: string, network: Network): string {
    try {
      const decoded = bs58.decode(extendedKey);
      const buffer = Buffer.from(decoded);

      if (buffer.length !== 82) {
        return extendedKey; // Invalid length, return as-is
      }

      const version = buffer.readUInt32BE(0);

      // Check if it's already xpub/tpub format
      const isMainnet = network === bitcoin.networks.bitcoin;
      const expectedVersion = isMainnet ? 0x0488b21e : 0x043587cf;

      if (version === expectedVersion) {
        return extendedKey; // Already in correct format
      }

      // Check if it's ypub/zpub/upub/vpub that needs conversion
      const needsConversion =
        version === 0x049d7cb2 || // ypub
        version === 0x04b24746 || // zpub
        version === 0x044a5262 || // upub
        version === 0x045f1cf6; // vpub

      if (!needsConversion) {
        return extendedKey; // Unknown format, return as-is
      }

      // Convert to xpub/tpub format
      const dataWithoutChecksum = buffer.slice(0, 78);
      const targetVersion = isMainnet ? 0x0488b21e : 0x043587cf;

      // Replace version bytes
      dataWithoutChecksum.writeUInt32BE(targetVersion, 0);

      // Recalculate checksum
      const checksum = recalculateChecksum(dataWithoutChecksum);
      const newBuffer = Buffer.concat([dataWithoutChecksum, checksum]);

      return bs58.encode(newBuffer);
    } catch {
      return extendedKey; // Conversion failed, return as-is
    }
  }
}
