export interface DecryptedMessage {
  data: Uint8Array;
  filename?: string;
}

/** Password-based message encryption (OpenPGP in production). */
export interface MessageCipherPort {
  /** Returns an ASCII-armored message. */
  encrypt(
    data: string | Uint8Array,
    password: string,
    filename?: string
  ): Promise<string>;
  /** Throws when the password is wrong or the message was tampered with. */
  decrypt(armoredMessage: string, password: string): Promise<DecryptedMessage>;
}
