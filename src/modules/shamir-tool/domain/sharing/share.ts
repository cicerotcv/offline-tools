/** One share of an encrypt-then-Shamir split: a key share plus the shared ciphertext. */
export interface ShamirShare {
  x: number;
  y: Uint8Array;
  nonce: Uint8Array;
  ciphertext: Uint8Array;
}

/** Fewer than M shares never fail loudly: they yield illegible opaque bytes. */
export type ReconstructResult =
  | { isValid: true; secret: Uint8Array }
  | { isValid: false; opaque: Uint8Array };
