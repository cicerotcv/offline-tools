import * as openpgp from 'openpgp';
import { describe, expect, it } from 'vitest';

import { EncryptionTool } from './message-cipher.openpgp';

describe('EncryptionTool (OpenPGP)', () => {
  const password = 'secure-password-123';

  describe('encrypt and decrypt', () => {
    it('should encrypt and decrypt a text string', async () => {
      const originalText = 'Hello, World! This is a secret message.';

      const encrypted = await EncryptionTool.encrypt(originalText, password);

      // Check for PGP Armor header
      expect(encrypted).toContain('-----BEGIN PGP MESSAGE-----');

      const { data, filename } = await EncryptionTool.decrypt(
        encrypted,
        password
      );

      const decoder = new TextDecoder();
      const decodedText =
        typeof data === 'string' ? data : decoder.decode(data);

      expect(decodedText).toBe(originalText);
      expect(filename).toBeUndefined();
    });

    it('should encrypt and decrypt binary data', async () => {
      const originalData = new Uint8Array([1, 2, 3, 4, 255, 0, 128]);

      const encrypted = await EncryptionTool.encrypt(originalData, password);
      expect(encrypted).toContain('-----BEGIN PGP MESSAGE-----');

      const { data } = await EncryptionTool.decrypt(encrypted, password);

      expect(data).toBeInstanceOf(Uint8Array);
      expect(data).toEqual(originalData);
    });

    it('should preserve filename when encrypting files', async () => {
      const fileData = new Uint8Array([10, 20, 30]);
      const name = 'secret-file.txt';

      const encrypted = await EncryptionTool.encrypt(fileData, password, name);
      const { data, filename } = await EncryptionTool.decrypt(
        encrypted,
        password
      );

      expect(filename).toBe(name);
      expect(data).toEqual(fileData);
    });

    it('should fail to decrypt with wrong password', async () => {
      const originalText = 'Secret';
      const encrypted = await EncryptionTool.encrypt(originalText, password);
      const wrongPassword = 'wrong-password';

      await expect(
        EncryptionTool.decrypt(encrypted, wrongPassword)
      ).rejects.toThrow(/Decryption failed/);
    });

    it('should fail to decrypt invalid data', async () => {
      const invalidData = 'Not a PGP message';

      await expect(
        EncryptionTool.decrypt(invalidData, password)
      ).rejects.toThrow();
    });
  });

  describe('Interoperability', () => {
    it('should decrypt a known standard PGP message', async () => {
      // Create a standard message using standard openpgp (simulating external tool)
      const text = 'Interoperability Test';
      const msg = await openpgp.createMessage({ text });
      const encryptedExternal = await openpgp.encrypt({
        message: msg,
        passwords: [password],
        format: 'armored',
      });

      const { data } = await EncryptionTool.decrypt(
        encryptedExternal as string,
        password
      );
      const decoder = new TextDecoder();
      const decodedText =
        typeof data === 'string' ? data : decoder.decode(data);

      expect(decodedText).toBe(text);
    });
  });
});
