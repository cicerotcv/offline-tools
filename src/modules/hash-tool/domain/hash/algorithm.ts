export type Algorithm = 'sha256' | 'sha512' | 'md5';

export const ALGORITHMS = {
  SHA256: 'sha256' as const,
  SHA512: 'sha512' as const,
  MD5: 'md5' as const,
} as const;

export const ALGORITHM_LABELS: Record<Algorithm, string> = {
  sha256: 'SHA-256',
  sha512: 'SHA-512',
  md5: 'MD5',
};

export const ALGORITHM_HEX_LENGTH: Record<Algorithm, number> = {
  sha256: 64,
  sha512: 128,
  md5: 32,
};

export type HashCase = 'lower' | 'upper';

export function formatHashHex(hash: string, hashCase: HashCase): string {
  return hashCase === 'upper' ? hash.toUpperCase() : hash.toLowerCase();
}
