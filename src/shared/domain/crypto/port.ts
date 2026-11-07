/** Source of cryptographically secure random bytes. */
export interface RandomPort {
  getRandomValues(buffer: Uint8Array): void;
}

export const DIGEST_ALGORITHMS = ['SHA-256', 'SHA-512'] as const;
export type DigestAlgorithm = (typeof DIGEST_ALGORITHMS)[number];

/** Cryptographic hash functions. */
export interface DigestPort {
  digest(algorithm: DigestAlgorithm, data: Uint8Array): Promise<Uint8Array>;
}

/** Authenticated encryption (AES-256-GCM): sealed = ciphertext + 16-byte tag. */
export interface AeadPort {
  seal(
    key: Uint8Array,
    nonce: Uint8Array,
    plaintext: Uint8Array,
    aad: Uint8Array
  ): Promise<Uint8Array>;
  /** Returns null when the tag does not verify (wrong key, tampered data). */
  open(
    key: Uint8Array,
    nonce: Uint8Array,
    sealed: Uint8Array,
    aad: Uint8Array
  ): Promise<Uint8Array | null>;
}
