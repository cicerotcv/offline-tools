import md5 from 'md5';

import type { DigestPort } from '@/shared/domain/crypto/port';
import { webCryptoDigest } from '@/shared/infra/crypto/digest.web-crypto';
import { bytesToHex } from '@/shared/lib/bytes';

import { type Algorithm } from '../../domain/hash/algorithm';

/**
 * Hex digest of `data`. SHA-2 goes through the injected DigestPort; MD5 is
 * computed in JS (Web Crypto has no MD5) over the raw bytes.
 */
export async function digestHex(
  data: Uint8Array,
  algorithm: Algorithm,
  digest: Pick<DigestPort, 'digest'> = webCryptoDigest
): Promise<string> {
  switch (algorithm) {
    case 'sha256':
      return bytesToHex(await digest.digest('SHA-256', data));
    case 'sha512':
      return bytesToHex(await digest.digest('SHA-512', data));
    case 'md5':
      return md5(data);
    default:
      throw new Error(`Unsupported algorithm: ${algorithm satisfies never}`);
  }
}

export class HashTool {
  /**
   * Computes SHA-256 hash of the input data
   * @param data - ArrayBuffer containing the data to hash
   * @returns Promise resolving to hexadecimal hash string
   */
  static async sha256(data: ArrayBuffer): Promise<string> {
    return bytesToHex(
      await webCryptoDigest.digest('SHA-256', new Uint8Array(data))
    );
  }

  /**
   * Computes SHA-512 hash of the input data
   * @param data - ArrayBuffer containing the data to hash
   * @returns Promise resolving to hexadecimal hash string
   */
  static async sha512(data: ArrayBuffer): Promise<string> {
    return bytesToHex(
      await webCryptoDigest.digest('SHA-512', new Uint8Array(data))
    );
  }

  /**
   * Computes MD5 hash of the input data
   * @param data - ArrayBuffer containing the data to hash
   * @returns Promise resolving to hexadecimal hash string
   */
  static async md5(data: ArrayBuffer): Promise<string> {
    // Pass raw bytes: given a string, the md5 package UTF-8 encodes it, which
    // corrupts every byte >= 0x80 and yields a wrong digest for binary data.
    return md5(new Uint8Array(data));
  }

  /**
   * Computes hash using the specified algorithm
   * @param data - ArrayBuffer containing the data to hash
   * @param algorithm - The hash algorithm to use
   * @returns Promise resolving to hexadecimal hash string
   */
  static async hash(data: ArrayBuffer, algorithm: Algorithm): Promise<string> {
    switch (algorithm) {
      case 'sha256':
        return this.sha256(data);
      case 'sha512':
        return this.sha512(data);
      case 'md5':
        return this.md5(data);
      default:
        throw new Error(`Unsupported algorithm: ${algorithm}`);
    }
  }
}
