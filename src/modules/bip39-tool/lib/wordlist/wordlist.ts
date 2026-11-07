import { BIP39_WORDS } from '../../domain/mnemonic/wordlist';

/**
 * BIP39 wordlist contains exactly 2048 words (indices 0-2047)
 */
export const BIP39_WORDLIST_SIZE = 2048;
export const BIP39_MAX_INDEX = BIP39_WORDLIST_SIZE - 1;

/**
 * Default number of bits for binary representation (12 bits for TripleNibble)
 */
export const DEFAULT_BINARY_BITS = 12;

/**
 * Gets the index of a BIP39 word in the wordlist.
 * @param word - The BIP39 word to find
 * @returns The index (0-2047) if found, -1 if not found
 */
export function getWordIndex(word: string): number {
  if (!word || typeof word !== 'string') {
    return -1;
  }

  const normalizedWord = word.toLowerCase().trim();
  const index = BIP39_WORDS.indexOf(normalizedWord);
  return index;
}

/**
 * Gets a BIP39 word by its index.
 * @param index - The index (0-2047)
 * @returns The word if index is valid, undefined otherwise
 */
export function getWordByIndex(index: number): string | undefined {
  if (
    typeof index !== 'number' ||
    !Number.isInteger(index) ||
    index < 0 ||
    index > BIP39_MAX_INDEX
  ) {
    return undefined;
  }

  return BIP39_WORDS[index];
}

/**
 * Converts a BIP39 index to binary representation.
 * @param index - The index (0-2047)
 * @param bits - Number of bits for the binary representation (default: 12)
 * @returns Binary string padded to the specified number of bits
 * @throws Error if index is invalid
 */
export function indexToBinary(
  index: number,
  bits: number = DEFAULT_BINARY_BITS
): string {
  if (
    typeof index !== 'number' ||
    !Number.isInteger(index) ||
    index < 0 ||
    index > BIP39_MAX_INDEX
  ) {
    throw new Error(
      `Invalid BIP39 index: ${index}. Must be an integer between 0 and ${BIP39_MAX_INDEX}`
    );
  }

  if (typeof bits !== 'number' || !Number.isInteger(bits) || bits < 1) {
    throw new Error(
      `Invalid bits parameter: ${bits}. Must be a positive integer`
    );
  }

  // Calculate minimum bits needed
  const minBits = Math.ceil(Math.log2(BIP39_WORDLIST_SIZE));
  if (bits < minBits) {
    throw new Error(
      `Bits parameter (${bits}) is too small. Minimum ${minBits} bits required for BIP39 indices`
    );
  }

  return index.toString(2).padStart(bits, '0');
}

/**
 * Converts a binary string to a BIP39 index.
 * @param binary - Binary string (e.g., "010011100000")
 * @returns The index (0-2047)
 * @throws Error if binary is invalid or result is out of range
 */
export function binaryToIndex(binary: string): number {
  if (!binary || typeof binary !== 'string') {
    throw new Error('Invalid binary string');
  }

  // Validate binary string contains only 0s and 1s
  if (!/^[01]+$/.test(binary)) {
    throw new Error(
      `Invalid binary string: ${binary}. Must contain only 0s and 1s`
    );
  }

  const index = parseInt(binary, 2);

  if (index < 0 || index > BIP39_MAX_INDEX) {
    throw new Error(
      `Binary ${binary} converts to index ${index}, which is out of BIP39 range (0-${BIP39_MAX_INDEX})`
    );
  }

  return index;
}

/**
 * Converts a BIP39 word to binary representation.
 * @param word - The BIP39 word
 * @param bits - Number of bits for the binary representation (default: 12)
 * @returns Binary string padded to the specified number of bits
 * @throws Error if word is not found in BIP39 wordlist
 */
export function wordToBinary(
  word: string,
  bits: number = DEFAULT_BINARY_BITS
): string {
  const index = getWordIndex(word);

  if (index === -1) {
    throw new Error(`Word "${word}" not found in BIP39 wordlist`);
  }

  return indexToBinary(index, bits);
}

/**
 * Converts a binary string to a BIP39 word.
 * @param binary - Binary string (e.g., "010011100000")
 * @returns The BIP39 word, or undefined if index is invalid
 * @throws Error if binary is invalid
 */
export function binaryToWord(binary: string): string | undefined {
  const index = binaryToIndex(binary);
  return getWordByIndex(index);
}

/**
 * Validates if a word exists in the BIP39 wordlist.
 * @param word - The word to validate
 * @returns true if word exists, false otherwise
 */
export function isValidBIP39Word(word: string): boolean {
  return getWordIndex(word) !== -1;
}

/**
 * Validates if an index is within the valid BIP39 range.
 * @param index - The index to validate
 * @returns true if index is valid, false otherwise
 */
export function isValidBIP39Index(index: number): boolean {
  return (
    typeof index === 'number' &&
    Number.isInteger(index) &&
    index >= 0 &&
    index <= BIP39_MAX_INDEX
  );
}

/**
 * Validates if a binary string represents a valid BIP39 index.
 * @param binary - Binary string to validate
 * @returns true if binary is valid and within range, false otherwise
 */
export function isValidBIP39Binary(binary: string): boolean {
  try {
    binaryToIndex(binary);
    return true;
  } catch {
    return false;
  }
}

/**
 * Gets all BIP39 words (read-only access to the wordlist).
 * @returns Array of all BIP39 words
 */
export function getAllBIP39Words(): readonly string[] {
  return BIP39_WORDS;
}
