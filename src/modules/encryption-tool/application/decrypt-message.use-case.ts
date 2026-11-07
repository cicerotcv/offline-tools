import { UseCase } from '@/shared/application/use-case';

import type {
  DecryptedMessage,
  MessageCipherPort,
} from '../domain/cipher/port';

export interface DecryptMessageCommand {
  armoredMessage: string;
  password: string;
}

export class DecryptMessageUseCase extends UseCase<
  DecryptMessageCommand,
  Promise<DecryptedMessage>
> {
  constructor(
    private readonly messageCipher: Pick<MessageCipherPort, 'decrypt'>
  ) {
    super();
  }

  execute({ armoredMessage, password }: DecryptMessageCommand) {
    if (!password) {
      return Promise.reject(new Error('A password is required.'));
    }
    return this.messageCipher.decrypt(armoredMessage.trim(), password);
  }
}
