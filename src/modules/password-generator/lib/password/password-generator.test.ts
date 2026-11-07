import fc from 'fast-check';
import { describe, expect, it } from 'vitest';

import {
  calculatePasswordEntropy,
  calculateTimeToCrack,
  formatTimeToCrack,
  generatePassword,
  getPasswordStrengthLabel,
  type PasswordConfig,
} from './password-generator';

const LOWER = 'abcdefghijklmnopqrstuvwxyz';
const UPPER = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
const DIGITS = '0123456789';
const SYMBOLS = '!@#$%^&*()_+-=[]{}|;:,.<>?';
const SIMILAR = 'il1Lo0O';
const AMBIGUOUS = '{}[]()/\\\'"`~,;:.<>';

const BASE: PasswordConfig = {
  length: 16,
  includeUppercase: true,
  includeLowercase: true,
  includeNumbers: true,
  includeSymbols: true,
  excludeSimilar: false,
  excludeAmbiguous: false,
};

const charsetFor = (config: PasswordConfig) => {
  let charset =
    (config.includeLowercase ? LOWER : '') +
    (config.includeUppercase ? UPPER : '') +
    (config.includeNumbers ? DIGITS : '') +
    (config.includeSymbols ? SYMBOLS : '');
  if (config.excludeSimilar)
    charset = [...charset].filter((c) => !SIMILAR.includes(c)).join('');
  if (config.excludeAmbiguous)
    charset = [...charset].filter((c) => !AMBIGUOUS.includes(c)).join('');
  return charset;
};

const configArb: fc.Arbitrary<PasswordConfig> = fc
  .record({
    length: fc.integer({ min: 4, max: 128 }),
    includeUppercase: fc.boolean(),
    includeLowercase: fc.boolean(),
    includeNumbers: fc.boolean(),
    includeSymbols: fc.boolean(),
    excludeSimilar: fc.boolean(),
    excludeAmbiguous: fc.boolean(),
  })
  .filter((config) => charsetFor(config).length > 0);

describe('generatePassword', () => {
  it('has the requested length and only uses the configured charset', () => {
    fc.assert(
      fc.property(
        configArb,
        fc.option(fc.uint8Array({ minLength: 1, maxLength: 64 }), {
          nil: undefined,
        }),
        (config, mouseEntropy) => {
          const password = generatePassword(config, mouseEntropy);
          const charset = charsetFor(config);
          expect(password).toHaveLength(config.length);
          for (const char of password) {
            expect(charset).toContain(char);
          }
        }
      ),
      { numRuns: 500 }
    );
  });

  it('throws when no character class is selected', () => {
    expect(() =>
      generatePassword({
        ...BASE,
        includeUppercase: false,
        includeLowercase: false,
        includeNumbers: false,
        includeSymbols: false,
      })
    ).toThrow();
  });

  it('spreads characters roughly uniformly (no index bias)', () => {
    const config: PasswordConfig = {
      ...BASE,
      length: 128,
      includeUppercase: false,
      includeSymbols: false,
    };
    const charset = charsetFor(config); // 36 chars
    const counts = new Map<string, number>();
    const rounds = 300;
    for (let i = 0; i < rounds; i++) {
      for (const char of generatePassword(config)) {
        counts.set(char, (counts.get(char) ?? 0) + 1);
      }
    }
    const expected = (rounds * config.length) / charset.length; // ~1067
    expect(counts.size).toBe(charset.length);
    for (const count of counts.values()) {
      // ±25% is ~8 standard deviations: catches gross bias, never flaky.
      expect(count).toBeGreaterThan(expected * 0.75);
      expect(count).toBeLessThan(expected * 1.25);
    }
  });
});

describe('password metrics', () => {
  it('entropy is length * log2(charset size)', () => {
    const password = 'a'.repeat(20);
    const config = { ...BASE, includeUppercase: false, includeSymbols: false };
    expect(calculatePasswordEntropy(password, config)).toBeCloseTo(
      20 * Math.log2(36),
      6
    );
  });

  it('time to crack is half the keyspace over the guess rate', () => {
    expect(calculateTimeToCrack(0)).toBe(0);
    expect(calculateTimeToCrack(11, 1000)).toBe(1.024);
  });

  it('maps strength to labels at the documented thresholds', () => {
    expect(getPasswordStrengthLabel(10).label).toBe('Very Weak');
    expect(getPasswordStrengthLabel(30).label).toBe('Weak');
    expect(getPasswordStrengthLabel(50).label).toBe('Medium');
    expect(getPasswordStrengthLabel(70).label).toBe('Strong');
    expect(getPasswordStrengthLabel(90).label).toBe('Very Strong');
  });

  it('formats short durations in natural units', () => {
    expect(formatTimeToCrack(0.5)).toBe('Less than a second');
    expect(formatTimeToCrack(1)).toBe('1 second');
    expect(formatTimeToCrack(120)).toBe('2 minutes');
    expect(formatTimeToCrack(7200)).toBe('2 hours');
    expect(formatTimeToCrack(86400 * 3)).toBe('3 days');
    expect(formatTimeToCrack(31536000 * 5)).toBe('5 years');
  });

  it('labels thousands, millions and billions of years correctly', () => {
    const year = 31536000;
    expect(formatTimeToCrack(year * 10_000)).not.toMatch(/^0\.0/);
    expect(formatTimeToCrack(year * 1_000_000)).not.toMatch(/billion/);
    expect(formatTimeToCrack(year * 2e9)).toMatch(/2\.0 billion years/);
    expect(formatTimeToCrack(year * 5_000)).toBe('5 thousand years');
    expect(formatTimeToCrack(year * 2.5e6)).toBe('2.5 million years');
    expect(formatTimeToCrack(year * 2e10)).toBe(
      'Longer than the age of the universe'
    );
  });
});
