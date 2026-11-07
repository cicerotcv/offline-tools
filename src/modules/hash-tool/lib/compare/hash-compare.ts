import {
  type Algorithm,
  ALGORITHM_HEX_LENGTH,
  ALGORITHM_LABELS,
} from '../../domain/hash/algorithm';

export type HashCompareStatus =
  | 'idle'
  | 'invalid-expected'
  | 'waiting-input'
  | 'match'
  | 'mismatch';

export interface HashCompareResult {
  status: HashCompareStatus;
  message?: string;
  computed?: string;
  expected?: string;
}

export function parseExpectedHash(input: string): string {
  const trimmed = input.trim();
  if (!trimmed) return '';

  let value = trimmed;

  const firstToken = value.split(/\s+/)[0] ?? '';
  if (
    value.includes(' ') &&
    /^[0-9a-fA-Fx]+$/i.test(firstToken.replace(/^0x/i, ''))
  ) {
    value = firstToken;
  }

  value = value.replace(/^(SHA-?256|SHA-?512|MD5):\s*/i, '');
  value = value.replace(/^0x/i, '');
  value = value.replace(/\s+/g, '');

  return value.toLowerCase();
}

export function validateExpectedHash(
  normalized: string,
  algorithm: Algorithm
): string | null {
  if (!normalized) {
    return 'Enter an expected hash to compare against.';
  }

  if (!/^[0-9a-f]+$/.test(normalized)) {
    return 'Expected hash must contain only hexadecimal characters (0-9, a-f).';
  }

  const expectedLength = ALGORITHM_HEX_LENGTH[algorithm];
  if (normalized.length !== expectedLength) {
    return `${ALGORITHM_LABELS[algorithm]} hashes are ${expectedLength} hex characters, got ${normalized.length}.`;
  }

  return null;
}

export function compareHashes(
  computed: string,
  expectedRaw: string,
  algorithm: Algorithm
): HashCompareResult {
  if (!expectedRaw.trim()) {
    return { status: 'idle' };
  }

  const expected = parseExpectedHash(expectedRaw);
  const validationError = validateExpectedHash(expected, algorithm);

  if (validationError) {
    return { status: 'invalid-expected', message: validationError };
  }

  if (!computed) {
    return { status: 'waiting-input' };
  }

  const normalizedComputed = computed.toLowerCase();

  if (normalizedComputed === expected) {
    return {
      status: 'match',
      computed: normalizedComputed,
      expected,
    };
  }

  return {
    status: 'mismatch',
    computed: normalizedComputed,
    expected,
  };
}
