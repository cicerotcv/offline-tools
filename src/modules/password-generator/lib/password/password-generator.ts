import type { RandomPort } from '@/shared/domain/crypto/port';
import { webCryptoRandom } from '@/shared/infra/crypto/random.web-crypto';

import { EmptyCharsetError } from '../../domain/password/errors';
import type { PasswordConfig } from '../../domain/password/password-config';

export type { PasswordConfig };

const LOWERCASE = 'abcdefghijklmnopqrstuvwxyz';
const UPPERCASE = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
const NUMBERS = '0123456789';
const SYMBOLS = '!@#$%^&*()_+-=[]{}|;:,.<>?';
const SIMILAR_CHARS = 'il1Lo0O';
const AMBIGUOUS_CHARS = '{}[]()/\\\'"`~,;:.<>';

/**
 * Generate a secure random number using crypto.getRandomValues
 * Optionally mixes in user-provided entropy
 */
function secureRandom(
  random: RandomPort,
  entropy?: Uint8Array,
  additionalEntropy?: number
): number {
  const randomBytes = new Uint8Array(4);
  random.getRandomValues(randomBytes);

  let randomValue =
    (randomBytes[0] << 24) |
    (randomBytes[1] << 16) |
    (randomBytes[2] << 8) |
    randomBytes[3];

  // Mix in user-provided entropy if available
  if (entropy && entropy.length > 0) {
    for (let i = 0; i < Math.min(entropy.length, 4); i++) {
      randomValue ^= entropy[i] << (i * 8);
    }
  }

  // Mix in additional entropy (e.g., from mouse movements)
  if (additionalEntropy !== undefined) {
    randomValue ^= additionalEntropy;
  }

  // Ensure positive number
  return Math.abs(randomValue >>> 0);
}

/**
 * Generate a password based on the configuration
 */
export function generatePassword(
  config: PasswordConfig,
  mouseEntropy?: Uint8Array,
  random: RandomPort = webCryptoRandom
): string {
  // Build character set based on configuration
  let charset = '';

  if (config.includeLowercase) {
    charset += LOWERCASE;
  }
  if (config.includeUppercase) {
    charset += UPPERCASE;
  }
  if (config.includeNumbers) {
    charset += NUMBERS;
  }
  if (config.includeSymbols) {
    charset += SYMBOLS;
  }

  if (charset.length === 0) {
    throw new EmptyCharsetError(
      'At least one character type must be selected (uppercase, lowercase, numbers, or symbols)'
    );
  }

  // Remove similar characters if requested
  if (config.excludeSimilar) {
    charset = charset
      .split('')
      .filter((char) => !SIMILAR_CHARS.includes(char))
      .join('');
  }

  // Remove ambiguous characters if requested
  if (config.excludeAmbiguous) {
    charset = charset
      .split('')
      .filter((char) => !AMBIGUOUS_CHARS.includes(char))
      .join('');
  }

  if (charset.length === 0) {
    throw new EmptyCharsetError(
      'Character set is empty after applying exclusions. Please adjust your settings.'
    );
  }

  // Generate password
  const password: string[] = [];
  let entropyIndex = 0;

  for (let i = 0; i < config.length; i++) {
    // Get entropy for this character
    let entropy: number | undefined;
    if (mouseEntropy && mouseEntropy.length > 0) {
      entropy = mouseEntropy[entropyIndex % mouseEntropy.length];
      entropyIndex++;
    }

    // Generate random index
    const randomValue = secureRandom(random, mouseEntropy, entropy);
    const charIndex = randomValue % charset.length;

    password.push(charset[charIndex]);
  }

  return password.join('');
}

/**
 * Calculate password strength (0-100)
 */
export function calculatePasswordStrength(
  password: string,
  config: PasswordConfig
): number {
  let strength = 0;

  // Length factor (max 40 points)
  const lengthScore = Math.min((password.length / 20) * 40, 40);
  strength += lengthScore;

  // Character variety (max 30 points)
  let varietyScore = 0;
  if (config.includeLowercase) varietyScore += 7.5;
  if (config.includeUppercase) varietyScore += 7.5;
  if (config.includeNumbers) varietyScore += 7.5;
  if (config.includeSymbols) varietyScore += 7.5;
  strength += varietyScore;

  // Entropy estimate (max 30 points)
  const charsetSize =
    (config.includeLowercase ? 26 : 0) +
    (config.includeUppercase ? 26 : 0) +
    (config.includeNumbers ? 10 : 0) +
    (config.includeSymbols ? SYMBOLS.length : 0);
  const entropy = password.length * Math.log2(charsetSize);
  const entropyScore = Math.min((entropy / 100) * 30, 30);
  strength += entropyScore;

  return Math.round(Math.min(strength, 100));
}

/**
 * Get password strength label
 */
export function getPasswordStrengthLabel(strength: number): {
  label: string;
  color: string;
} {
  if (strength < 30) {
    return { label: 'Very Weak', color: 'text-destructive' };
  }
  if (strength < 50) {
    return { label: 'Weak', color: 'text-warning' };
  }
  if (strength < 70) {
    return { label: 'Medium', color: 'text-warning' };
  }
  if (strength < 90) {
    return { label: 'Strong', color: 'text-success' };
  }
  return { label: 'Very Strong', color: 'text-success' };
}

/**
 * Calculate password entropy in bits
 */
export function calculatePasswordEntropy(
  password: string,
  config: PasswordConfig
): number {
  // Build charset the same way as in generatePassword
  let charset = '';

  if (config.includeLowercase) {
    charset += LOWERCASE;
  }
  if (config.includeUppercase) {
    charset += UPPERCASE;
  }
  if (config.includeNumbers) {
    charset += NUMBERS;
  }
  if (config.includeSymbols) {
    charset += SYMBOLS;
  }

  if (charset.length === 0) return 0;

  // Remove similar characters if requested
  if (config.excludeSimilar) {
    charset = charset
      .split('')
      .filter((char) => !SIMILAR_CHARS.includes(char))
      .join('');
  }

  // Remove ambiguous characters if requested
  if (config.excludeAmbiguous) {
    charset = charset
      .split('')
      .filter((char) => !AMBIGUOUS_CHARS.includes(char))
      .join('');
  }

  if (charset.length === 0) return 0;

  // Entropy = length * log2(charset_size)
  return password.length * Math.log2(charset.length);
}

/**
 * Calculate time to crack password (in seconds)
 * Uses conservative estimates for online attacks
 */
export function calculateTimeToCrack(
  entropy: number,
  guessesPerSecond: number = 1000
): number {
  if (entropy <= 0) return 0;
  // Average case: need to try 2^(entropy-1) guesses
  const averageGuesses = Math.pow(2, entropy - 1);
  return averageGuesses / guessesPerSecond;
}

/**
 * Get time to crack estimates for different attack scenarios
 */
export function getTimeToCrackEstimates(entropy: number): {
  online: { seconds: number; formatted: string };
  offline: { seconds: number; formatted: string };
} {
  // Online attack: 1,000 guesses/second (with rate limiting)
  const onlineSeconds = calculateTimeToCrack(entropy, 1000);

  // Offline attack: 1 billion guesses/second (modern hardware, no rate limiting)
  const offlineSeconds = calculateTimeToCrack(entropy, 1_000_000_000);

  return {
    online: {
      seconds: onlineSeconds,
      formatted: formatTimeToCrack(onlineSeconds),
    },
    offline: {
      seconds: offlineSeconds,
      formatted: formatTimeToCrack(offlineSeconds),
    },
  };
}

/**
 * Format time to crack in human-readable format
 */
const SECONDS_PER_YEAR = 31_536_000;
const AGE_OF_UNIVERSE_YEARS = 13.8e9;

export function formatTimeToCrack(seconds: number): string {
  if (seconds < 1) {
    return 'Less than a second';
  }
  if (seconds < 60) {
    return `${Math.round(seconds)} second${Math.round(seconds) !== 1 ? 's' : ''}`;
  }
  if (seconds < 3600) {
    const minutes = Math.round(seconds / 60);
    return `${minutes} minute${minutes !== 1 ? 's' : ''}`;
  }
  if (seconds < 86400) {
    const hours = Math.round(seconds / 3600);
    return `${hours} hour${hours !== 1 ? 's' : ''}`;
  }
  if (seconds < 31536000) {
    const days = Math.round(seconds / 86400);
    return `${days} day${days !== 1 ? 's' : ''}`;
  }
  const years = seconds / SECONDS_PER_YEAR;
  if (years < 1_000) {
    const rounded = Math.round(years);
    return `${rounded} year${rounded !== 1 ? 's' : ''}`;
  }
  if (years < 1e6) {
    return `${Math.round(years / 1_000)} thousand years`;
  }
  if (years < 1e9) {
    return `${(years / 1e6).toFixed(1)} million years`;
  }
  if (years < AGE_OF_UNIVERSE_YEARS) {
    return `${(years / 1e9).toFixed(1)} billion years`;
  }
  return 'Longer than the age of the universe';
}
