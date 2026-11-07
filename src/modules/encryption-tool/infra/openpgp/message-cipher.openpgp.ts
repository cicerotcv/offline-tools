import * as openpgp from 'openpgp';

import type {
  DecryptedMessage,
  MessageCipherPort,
} from '../../domain/cipher/port';

export class EncryptionTool {
  /**
   * Encrypts data using OpenPGP (password-based)
   * @param data - The data to encrypt (string or Uint8Array)
   * @param password - The password for encryption
   * @param filename - Optional filename to store in the message
   * @returns Promise resolving to the armored PGP message
   */
  static async encrypt(
    data: string | Uint8Array,
    password: string,
    filename?: string
  ): Promise<string> {
    try {
      const message =
        typeof data === 'string'
          ? await openpgp.createMessage({ text: data, filename })
          : await openpgp.createMessage({ binary: data, filename });

      const encrypted = await openpgp.encrypt({
        message,
        passwords: [password],
        format: 'armored',
        config: {
          // Use strong defaults for compatibility
          preferredCompressionAlgorithm: openpgp.enums.compression.zlib,
        },
      });

      return encrypted as string;
    } catch (error) {
      throw new Error(
        `Encryption failed: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }
  }

  /**
   * Decrypts an OpenPGP message
   * @param encryptedData - The armored PGP message
   * @param password - The password for decryption
   * @returns Promise resolving to the decrypted bytes and optional filename
   */
  static async decrypt(
    encryptedData: string,
    password: string
  ): Promise<DecryptedMessage> {
    try {
      const message = await openpgp.readMessage({
        armoredMessage: encryptedData,
      });

      const { data: decrypted, filename } = await openpgp.decrypt({
        message,
        passwords: [password],
        format: 'binary', // bytes for text and files alike; the UI decodes text
      });

      return {
        data: decrypted as Uint8Array,
        filename: filename || undefined,
      };
    } catch (error) {
      throw new Error(
        `Decryption failed: ${error instanceof Error ? error.message : 'Unknown error'}. Please check your password and input format.`
      );
    }
  }
}

/** MessageCipherPort backed by OpenPGP.js (symmetric, password-based). */
export const openPgpMessageCipher: MessageCipherPort = {
  encrypt: (data, password, filename) =>
    EncryptionTool.encrypt(data, password, filename),
  decrypt: (armoredMessage, password) =>
    EncryptionTool.decrypt(armoredMessage, password),
};
