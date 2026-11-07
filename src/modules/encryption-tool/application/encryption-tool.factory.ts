import { openPgpMessageCipher } from '../infra/openpgp/message-cipher.openpgp';
import { DecryptMessageUseCase } from './decrypt-message.use-case';
import { EncryptMessageUseCase } from './encrypt-message.use-case';
import { RunEncryptionSelfTestUseCase } from './run-self-test.use-case';

export function makeEncryptMessageUseCase(): EncryptMessageUseCase {
  return new EncryptMessageUseCase(openPgpMessageCipher);
}

export function makeDecryptMessageUseCase(): DecryptMessageUseCase {
  return new DecryptMessageUseCase(openPgpMessageCipher);
}

export function makeRunEncryptionSelfTestUseCase(): RunEncryptionSelfTestUseCase {
  return new RunEncryptionSelfTestUseCase(openPgpMessageCipher);
}
