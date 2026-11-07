import bip38 from 'bip38';
import type { Network } from 'bitcoinjs-lib';
import { Buffer } from 'buffer';

import { ECPair } from '../../infra/bitcoin/secp256k1';

/**
 * Encrypts a private key using BIP38 encryption
 * @param privateKeyWIF - Private key in WIF format
 * @param passphrase - Passphrase to encrypt with
 * @param network - Bitcoin network
 * @returns BIP38 encrypted private key string
 */
export async function encryptPrivateKeyBIP38(
  privateKeyWIF: string,
  passphrase: string,
  network: Network
): Promise<string> {
  // Convert WIF to private key buffer
  const keyPair = ECPair.fromWIF(privateKeyWIF, network);
  const privateKey = keyPair.privateKey;

  if (!privateKey) {
    throw new Error('Invalid private key');
  }

  // Check if the key is compressed
  // The keyPair should have a compressed property, but we can also check the WIF format
  // Compressed WIF keys start with 'K' or 'L' (mainnet) or 'c' (testnet)
  // Uncompressed WIF keys start with '5' (mainnet) or '9' (testnet)
  const isCompressed =
    (keyPair as { compressed?: boolean }).compressed ??
    (privateKeyWIF[0] === 'K' ||
      privateKeyWIF[0] === 'L' ||
      privateKeyWIF[0] === 'c');

  // BIP38 encryption
  // The bip38 library expects the private key as a Buffer
  // compressed: false for uncompressed, true for compressed
  // Note: BIP38 format encodes network information in the encrypted key itself
  const encrypted = await bip38.encryptAsync(
    Buffer.from(privateKey),
    isCompressed, // Use the actual compression status of the key
    passphrase,
    undefined, // progress callback
    undefined, // scrypt params (optional)
    undefined // promise interval (optional)
  );

  return encrypted;
}

/**
 * Decrypts a BIP38 encrypted private key
 * @param encryptedKey - BIP38 encrypted private key string
 * @param passphrase - Passphrase used for encryption
 * @param network - Bitcoin network
 * @returns Private key in WIF format
 */
export async function decryptPrivateKeyBIP38(
  encryptedKey: string,
  passphrase: string,
  network: Network
): Promise<string> {
  const result = await bip38.decryptAsync(encryptedKey, passphrase, undefined);

  // Convert decrypted private key to WIF
  // The BIP38 result includes the compression flag, so we use it when creating the keyPair
  const keyPair = ECPair.fromPrivateKey(result.privateKey, {
    network,
    compressed: result.compressed ?? true, // Use compression from BIP38 result, default to compressed
  });

  return keyPair.toWIF();
}

/**
 * Validates a BIP38 encrypted private key format
 * @param encryptedKey - BIP38 encrypted private key string
 * @returns true if valid BIP38 format
 */
export function isValidBIP38(encryptedKey: string): boolean {
  // BIP38 encrypted keys start with '6P' (mainnet) or '6Pf' (testnet)
  return /^6P[1-9A-HJ-NP-Za-km-z]{56}$/.test(encryptedKey);
}
