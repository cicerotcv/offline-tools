/**
 * Configuration constants for Shamir's Secret Sharing
 */

export const MIN_SHARES = 2;
export const MAX_SHARES = 255;
export const MIN_THRESHOLD = 2;
export const MAX_THRESHOLD = 255;
export const DEFAULT_SHARES = 5;
export const DEFAULT_THRESHOLD = 3;

/** Every share carries the whole ciphertext, so secrets stay small. */
export const MAX_SECRET_BYTES = 16 * 1024;
