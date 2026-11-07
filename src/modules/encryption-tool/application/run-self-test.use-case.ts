import { UseCase } from '@/shared/application/use-case';

import type { MessageCipherPort } from '../domain/cipher/port';

/** Fixed OpenPGP (SEIPD, password-based) message; decrypting it exercises the KDF and cipher. */
const SELF_TEST_MESSAGE = `-----BEGIN PGP MESSAGE-----

wy4ECQMISuL0jwHPHIPgKsRph1N4y2qYG3IwB+OsvIG2BzmDI3qGdpZ17uXm
1BlJ0kgBK2ccpDmtNyIQ1zDAFaKpVw/4SOHK5YJUEqLrUlMB8pTC2tVnHZ7i
WkaZ+fpoVTfDfRQfEnragVs+2QEUXGmatcKlh9IdNQk=
=9jNd
-----END PGP MESSAGE-----`;
const SELF_TEST_PASSWORD = 'self-test-passphrase';
const SELF_TEST_PLAINTEXT = 'offline-tools self-test';

export class RunEncryptionSelfTestUseCase extends UseCase<void, Promise<void>> {
  constructor(
    private readonly messageCipher: Pick<MessageCipherPort, 'decrypt'>
  ) {
    super();
  }

  async execute(): Promise<void> {
    const { data } = await this.messageCipher.decrypt(
      SELF_TEST_MESSAGE,
      SELF_TEST_PASSWORD
    );
    if (new TextDecoder().decode(data) !== SELF_TEST_PLAINTEXT) {
      throw new Error('Self-test failed: OpenPGP decryption');
    }
  }
}
