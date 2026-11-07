import type { BIP32Interface } from 'bip32';
import * as bitcoin from 'bitcoinjs-lib';
import type { Network } from 'bitcoinjs-lib';
import bs58 from 'bs58';
import { Buffer } from 'buffer';

import type { DerivationPath } from '../../domain/bitcoin/config';
import { bip32 } from '../../infra/bitcoin/secp256k1';
import { ExtendedKeyConverter } from './extended-key-converter';
import { DerivationPathManager } from './paths';

/**
 * Handles parsing, detection, and inspection of extended keys
 */
export class ExtendedKeyParser {
  static inspectExtendedKey(extendedKey: string): {
    version: number;
    versionHex: string;
    isValidLength: boolean;
    knownVersions: string[];
  } {
    try {
      const decoded = bs58.decode(extendedKey);
      const buffer = Buffer.from(decoded);

      if (buffer.length < 4) {
        return {
          version: 0,
          versionHex: 'N/A',
          isValidLength: false,
          knownVersions: [],
        };
      }

      const version = buffer.readUInt32BE(0);
      const versionHex = `0x${version.toString(16).padStart(8, '0')}`;

      // Known version bytes
      const knownVersions: Record<number, string> = {
        0x0488b21e: 'xpub (mainnet)',
        0x0488ade4: 'xprv (mainnet)',
        0x049d7cb2: 'ypub (mainnet)',
        0x04b24746: 'zpub (mainnet)',
        0x043587cf: 'tpub (testnet)',
        0x04358394: 'tprv (testnet)',
        0x044a5262: 'upub (testnet)',
        0x045f1cf6: 'vpub (testnet)',
      };

      return {
        version,
        versionHex,
        isValidLength: buffer.length === 82, // Extended keys should be 82 bytes
        knownVersions: knownVersions[version] ? [knownVersions[version]] : [],
      };
    } catch {
      return {
        version: 0,
        versionHex: 'N/A',
        isValidLength: false,
        knownVersions: [],
      };
    }
  }

  static detectNetwork(extendedKey: string): Network | null {
    const normalizedKey = extendedKey.trim();
    if (!normalizedKey) return null;

    // Check prefix first (faster)
    if (
      normalizedKey.startsWith('xpub') ||
      normalizedKey.startsWith('ypub') ||
      normalizedKey.startsWith('zpub') ||
      normalizedKey.startsWith('xprv') ||
      normalizedKey.startsWith('yprv') ||
      normalizedKey.startsWith('zprv')
    ) {
      return bitcoin.networks.bitcoin; // Mainnet
    }
    if (
      normalizedKey.startsWith('tpub') ||
      normalizedKey.startsWith('upub') ||
      normalizedKey.startsWith('vpub') ||
      normalizedKey.startsWith('tprv') ||
      normalizedKey.startsWith('uprv') ||
      normalizedKey.startsWith('vprv')
    ) {
      return bitcoin.networks.testnet; // Testnet
    }

    // If prefix doesn't match, try inspecting version bytes
    try {
      const keyInfo = this.inspectExtendedKey(normalizedKey);
      const version = keyInfo.version;

      // Mainnet keys
      if (
        version === 0x0488b21e || // xpub
        version === 0x049d7cb2 || // ypub
        version === 0x04b24746 || // zpub
        version === 0x0488ade4 // xprv
      ) {
        return bitcoin.networks.bitcoin;
      }

      // Testnet keys
      if (
        version === 0x043587cf || // tpub
        version === 0x044a5262 || // upub
        version === 0x045f1cf6 || // vpub
        version === 0x04358394 // tprv
      ) {
        return bitcoin.networks.testnet;
      }

      return null;
    } catch {
      return null;
    }
  }

  static detectDerivationPath(extendedKey: string): DerivationPath | null {
    const normalizedKey = extendedKey.trim();
    if (!normalizedKey) return null;

    // Check prefix first (faster)
    if (normalizedKey.startsWith('xpub') || normalizedKey.startsWith('tpub')) {
      return 'bip44';
    }
    if (normalizedKey.startsWith('ypub') || normalizedKey.startsWith('upub')) {
      return 'bip49';
    }
    if (normalizedKey.startsWith('zpub') || normalizedKey.startsWith('vpub')) {
      return 'bip84';
    }

    // If prefix doesn't match, try inspecting version bytes
    try {
      const keyInfo = this.inspectExtendedKey(normalizedKey);
      const version = keyInfo.version;

      // Mainnet public keys
      if (version === 0x0488b21e) return 'bip44'; // xpub
      if (version === 0x049d7cb2) return 'bip49'; // ypub
      if (version === 0x04b24746) return 'bip84'; // zpub

      // Testnet public keys
      if (version === 0x043587cf) return 'bip44'; // tpub
      if (version === 0x044a5262) return 'bip49'; // upub
      if (version === 0x045f1cf6) return 'bip84'; // vpub

      return null;
    } catch {
      return null;
    }
  }

  static parsePrivateKey(
    extendedKey: string,
    _network: Network, // Network is auto-detected from key, but kept for API consistency
    derivationPath: DerivationPath
  ): BIP32Interface {
    // Normalize the key (trim whitespace, remove newlines)
    const normalizedKey = extendedKey.trim().replace(/\s+/g, '');

    if (!normalizedKey) {
      throw new Error('Extended private key cannot be empty');
    }

    // Inspect the key first to understand what we're dealing with
    const keyInfo = this.inspectExtendedKey(normalizedKey);

    // Try both networks - the key's version bytes will determine which one works
    let node: BIP32Interface | null = null;
    let lastError: Error | null = null;

    // Try mainnet first
    try {
      node = bip32.fromBase58(normalizedKey, bitcoin.networks.bitcoin);
    } catch (err) {
      lastError = err instanceof Error ? err : new Error('Unknown error');
      // Try testnet
      try {
        node = bip32.fromBase58(normalizedKey, bitcoin.networks.testnet);
      } catch (err2) {
        lastError = err2 instanceof Error ? err2 : new Error('Unknown error');

        // Provide detailed error message
        const keyType =
          keyInfo.knownVersions.length > 0
            ? keyInfo.knownVersions[0]
            : `Unknown version ${keyInfo.versionHex}`;

        let errorMessage = `Failed to parse extended private key.\n`;
        errorMessage += `Key version: ${keyType}\n`;

        if (!keyInfo.isValidLength) {
          errorMessage += `Invalid key length (expected 82 bytes)\n`;
        }

        // Check if it's a public key being used as private
        if (
          keyInfo.version === 0x0488b21e ||
          keyInfo.version === 0x049d7cb2 ||
          keyInfo.version === 0x04b24746 ||
          keyInfo.version === 0x043587cf ||
          keyInfo.version === 0x044a5262 ||
          keyInfo.version === 0x045f1cf6
        ) {
          errorMessage += `This appears to be a public key (xpub/ypub/zpub/tpub/upub/vpub), not a private key. Please use the extended public key input instead.\n`;
        }

        errorMessage += `Tried both mainnet and testnet.\n`;
        errorMessage += `Error: ${lastError.message}`;

        // Both failed
        throw new Error(errorMessage);
      }
    }

    if (!node) {
      throw new Error('Failed to parse extended private key: Unknown error');
    }

    try {
      // Verify it's a private key (not public)
      if (!node.privateKey) {
        throw new Error('Extended key is not a private key');
      }

      // Determine the account path based on derivation path
      // Extended keys are typically at account level (m/44'/0'/0', m/49'/0'/0', or m/84'/0'/0')
      // But we need to check the depth and derive to account level if needed
      const accountPath = DerivationPathManager.getAccountPath(
        derivationPath,
        node.network
      );

      // If the node is already at account level, return it
      // Otherwise, derive to account level
      // Note: We assume the extended key is at account level or root level
      if (node.depth === 3) {
        // Already at account level (m/44'/0'/0')
        return node;
      } else if (node.depth === 0) {
        // Root level, derive to account level
        return node.derivePath(accountPath);
      } else {
        // Some intermediate level, try to derive to account level
        // This is a best-effort approach
        return node.derivePath(accountPath);
      }
    } catch (err) {
      throw new Error(
        `Failed to parse extended private key: ${
          err instanceof Error ? err.message : 'Invalid format'
        }`
      );
    }
  }

  static parsePublicKey(
    extendedKey: string,
    _network: Network, // Network is auto-detected from key, but kept for API consistency
    derivationPath: DerivationPath
  ): BIP32Interface {
    // Normalize the key (trim whitespace, remove newlines)
    const normalizedKey = extendedKey.trim().replace(/\s+/g, '');

    if (!normalizedKey) {
      throw new Error('Extended public key cannot be empty');
    }

    // Inspect the key first to understand what we're dealing with
    const keyInfo = this.inspectExtendedKey(normalizedKey);

    // Try both networks - the key's version bytes will determine which one works
    let node: BIP32Interface | null = null;
    let lastError: Error | null = null;

    // Try mainnet first
    try {
      // Convert ypub/zpub to xpub format if needed
      const convertedKey = ExtendedKeyConverter.convertToXpubFormat(
        normalizedKey,
        bitcoin.networks.bitcoin
      );
      node = bip32.fromBase58(convertedKey, bitcoin.networks.bitcoin);
    } catch (err) {
      lastError = err instanceof Error ? err : new Error('Unknown error');
      // Try testnet
      try {
        // Convert upub/vpub to tpub format if needed
        const convertedKey = ExtendedKeyConverter.convertToXpubFormat(
          normalizedKey,
          bitcoin.networks.testnet
        );
        node = bip32.fromBase58(convertedKey, bitcoin.networks.testnet);
      } catch (err2) {
        lastError = err2 instanceof Error ? err2 : new Error('Unknown error');

        // Provide detailed error message
        const keyType =
          keyInfo.knownVersions.length > 0
            ? keyInfo.knownVersions[0]
            : `Unknown version ${keyInfo.versionHex}`;

        let errorMessage = `Failed to parse extended public key.\n`;
        errorMessage += `Key version: ${keyType}\n`;

        if (!keyInfo.isValidLength) {
          errorMessage += `Invalid key length (expected 82 bytes, got ${keyInfo.isValidLength ? '82' : 'other'})\n`;
        }

        // Check if it's a private key being used as public
        if (keyInfo.version === 0x0488ade4 || keyInfo.version === 0x04358394) {
          errorMessage += `This appears to be a private key (xprv/tprv), not a public key. Please use the extended private key input instead.\n`;
        }

        errorMessage += `Tried both mainnet and testnet.\n`;
        errorMessage += `Error: ${lastError.message}`;

        // Both failed
        throw new Error(errorMessage);
      }
    }

    if (!node) {
      throw new Error('Failed to parse extended public key: Unknown error');
    }

    try {
      // Verify it's a public key (neutered)
      if (node.privateKey) {
        throw new Error('Extended key is a private key, not a public key');
      }

      // Extended keys are typically at account level (depth 3)
      // If it's already at account level, use it directly
      if (node.depth === 3) {
        return node;
      } else if (node.depth === 0) {
        // Root level, derive to account level based on requested path
        const accountPath = DerivationPathManager.getAccountPath(
          derivationPath,
          node.network
        );
        return node.derivePath(accountPath);
      } else {
        // Intermediate level - try to use it as-is
        return node;
      }
    } catch (err) {
      throw new Error(
        `Failed to parse extended public key: ${
          err instanceof Error ? err.message : 'Invalid format'
        }`
      );
    }
  }
}
