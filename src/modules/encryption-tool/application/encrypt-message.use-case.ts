import { UseCase } from '@/shared/application/use-case';

import type { MessageCipherPort } from '../domain/cipher/port';

export interface EncryptMessageCommand {
  data: string | Uint8Array;
  password: string;
  filename?: string;
}

export class EncryptMessageUseCase extends UseCase<
  EncryptMessageCommand,
  Promise<string>
> {
  constructor(
    private readonly messageCipher: Pick<MessageCipherPort, 'encrypt'>
  ) {
    super();
  }

  execute({ data, password, filename }: EncryptMessageCommand) {
    if (!password) {
      return Promise.reject(new Error('A password is required.'));
    }
    return this.messageCipher.encrypt(data, password, filename);
  }
}
