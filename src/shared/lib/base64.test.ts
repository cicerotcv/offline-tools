import { describe, expect, it } from 'vitest';

import { Base64 } from './base64';

describe('Base64', () => {
  describe('toUrlSafe', () => {
    it('should convert + to -', () => {
      // "Hello>" encoded to base64 is "SGVsbG8+"
      const standard = 'SGVsbG8+';
      const urlSafe = Base64.toUrlSafe(standard);
      expect(urlSafe).toBe('SGVsbG8-');
      expect(urlSafe).not.toContain('+');
    });

    it('should convert / to _', () => {
      const standard = 'SGVsbG8/';
      const urlSafe = Base64.toUrlSafe(standard);
      expect(urlSafe).toBe('SGVsbG8_');
      expect(urlSafe).not.toContain('/');
    });

    it('should remove trailing padding =', () => {
      expect(Base64.toUrlSafe('SGVsbG8=')).toBe('SGVsbG8');
      expect(Base64.toUrlSafe('SGVsbG8==')).toBe('SGVsbG8');
      expect(Base64.toUrlSafe('SGVsbG8===')).toBe('SGVsbG8');
    });

    it('should handle both + and / in same string', () => {
      const standard = 'SGVsbG8+/';
      const urlSafe = Base64.toUrlSafe(standard);
      expect(urlSafe).toBe('SGVsbG8-_');
      expect(urlSafe).not.toContain('+');
      expect(urlSafe).not.toContain('/');
      expect(urlSafe).not.toContain('=');
    });

    it('should handle string with padding and special chars', () => {
      const standard = 'SGVsbG8+/==';
      const urlSafe = Base64.toUrlSafe(standard);
      expect(urlSafe).toBe('SGVsbG8-_');
    });

    it('should handle empty string', () => {
      expect(Base64.toUrlSafe('')).toBe('');
    });

    it('should handle string without special chars or padding', () => {
      const standard = 'SGVsbG8h';
      const urlSafe = Base64.toUrlSafe(standard);
      expect(urlSafe).toBe(standard);
    });

    it('should handle multiple padding characters', () => {
      expect(Base64.toUrlSafe('AAAA==')).toBe('AAAA');
      expect(Base64.toUrlSafe('AAA=')).toBe('AAA');
    });
  });

  describe('fromUrlSafe', () => {
    it('should convert - to +', () => {
      // "Hello>" encoded to base64 is "SGVsbG8+", URL-safe is "SGVsbG8-"
      const urlSafe = 'SGVsbG8-';
      const standard = Base64.fromUrlSafe(urlSafe);
      expect(standard).toBe('SGVsbG8+');
    });

    it('should convert _ to /', () => {
      const urlSafe = 'SGVsbG8_';
      const standard = Base64.fromUrlSafe(urlSafe);
      expect(standard).toBe('SGVsbG8/');
    });

    it('should add padding when needed (1 char)', () => {
      const urlSafe = 'SGVsbG8';
      const standard = Base64.fromUrlSafe(urlSafe);
      // Length 7, needs 1 padding to make it 8 (multiple of 4)
      expect(standard).toBe('SGVsbG8=');
    });

    it('should add padding when needed (2 chars)', () => {
      const urlSafe = 'SGVsbG';
      const standard = Base64.fromUrlSafe(urlSafe);
      // Length 6, needs 2 padding to make it 8 (multiple of 4)
      expect(standard).toBe('SGVsbG==');
    });

    it('should not add padding when already correct length', () => {
      const urlSafe = 'SGVsbG8h';
      const standard = Base64.fromUrlSafe(urlSafe);
      // Length 8, already multiple of 4, no padding needed
      expect(standard).toBe('SGVsbG8h');
    });

    it('should handle both - and _ in same string', () => {
      // "SGVsbG8+/" has both + and /, URL-safe is "SGVsbG8-_"
      const urlSafe = 'SGVsbG8-_';
      const standard = Base64.fromUrlSafe(urlSafe);
      // After replace: 'SGVsbG8+/' (length 9)
      // Padding: (4 - (9 % 4)) % 4 = (4 - 1) % 4 = 3
      expect(standard).toBe('SGVsbG8+/===');
    });

    it('should handle empty string', () => {
      expect(Base64.fromUrlSafe('')).toBe('');
    });

    it('should handle string without special chars', () => {
      const urlSafe = 'SGVsbG8h';
      const standard = Base64.fromUrlSafe(urlSafe);
      // Length 8, already multiple of 4, so no padding needed
      expect(standard).toBe('SGVsbG8h');
    });

    it('should round-trip with toUrlSafe (padding is normalized)', () => {
      // Test with a base64 string that has +, /, and padding
      // Note: Padding is removed in URL-safe and re-added when converting back
      // The decoded value is the same, but the exact padding may differ
      const original = 'SGVsbG8+/==';
      const urlSafe = Base64.toUrlSafe(original);
      // URL-safe removes padding and converts + to -, / to _
      expect(urlSafe).toBe('SGVsbG8-_');
      const back = Base64.fromUrlSafe(urlSafe);
      // When converting back: 'SGVsbG8-_' -> 'SGVsbG8+/' (length 9)
      // Padding calculation: (4 - (9 % 4)) % 4 = (4 - 1) % 4 = 3
      // So result is 'SGVsbG8+/==='
      expect(back).toBe('SGVsbG8+/===');
      // Both decode to the same value, padding is just for formatting
    });
  });

  describe('encode', () => {
    it('should encode simple text', () => {
      const text = 'Hello';
      const encoded = Base64.encode(text);
      expect(encoded).toBe('SGVsbG8=');
    });

    it('should encode empty string', () => {
      const encoded = Base64.encode('');
      expect(encoded).toBe('');
    });

    it('should encode text with spaces', () => {
      const text = 'Hello World';
      const encoded = Base64.encode(text);
      expect(encoded).toBe('SGVsbG8gV29ybGQ=');
    });

    it('should encode text with special characters', () => {
      const text = 'Hello, World!';
      const encoded = Base64.encode(text);
      const decoded = Base64.decode(encoded);
      expect(decoded).toBe(text);
    });

    it('should encode simple text', () => {
      const text = 'Hello';
      const encoded = Base64.encode(text);
      const decoded = Base64.decode(encoded);
      expect(decoded).toBe(text);
    });

    it('should encode Unicode text', () => {
      const text = 'Hello, 世界!';
      const encoded = Base64.encode(text);
      const decoded = Base64.decode(encoded);
      expect(decoded).toBe(text);
    });

    it('should encode emojis', () => {
      const text = '🎉🎊🎈';
      const encoded = Base64.encode(text);
      const decoded = Base64.decode(encoded);
      expect(decoded).toBe(text);
    });

    it('should produce valid base64 output', () => {
      const text = 'Test';
      const encoded = Base64.encode(text);
      expect(encoded).toMatch(/^[A-Za-z0-9+/]*={0,2}$/);
    });

    it('should be deterministic', () => {
      const text = 'Hello';
      const encoded1 = Base64.encode(text);
      const encoded2 = Base64.encode(text);
      expect(encoded1).toBe(encoded2);
    });
  });

  describe('encodeUrlSafe', () => {
    it('should encode text to URL-safe base64', () => {
      const text = 'Hello';
      const encoded = Base64.encodeUrlSafe(text);
      expect(encoded).not.toContain('+');
      expect(encoded).not.toContain('/');
      expect(encoded).not.toContain('=');
    });

    it('should produce URL-safe output', () => {
      const text = 'Hello, World!';
      const encoded = Base64.encodeUrlSafe(text);
      expect(encoded).toMatch(/^[A-Za-z0-9\-_]*$/);
    });

    it('should round-trip with decode', () => {
      const text = 'Hello, World!';
      const encoded = Base64.encodeUrlSafe(text);
      const decoded = Base64.decode(encoded);
      expect(decoded).toBe(text);
    });

    it('should handle empty string', () => {
      const encoded = Base64.encodeUrlSafe('');
      expect(encoded).toBe('');
    });

    it('should handle Unicode text', () => {
      const text = 'Hello, 世界! 🎉';
      const encoded = Base64.encodeUrlSafe(text);
      const decoded = Base64.decode(encoded);
      expect(decoded).toBe(text);
    });
  });

  describe('encodeBuffer', () => {
    it('should encode ArrayBuffer to base64', () => {
      const text = 'Hello';
      const buffer = new TextEncoder().encode(text).buffer;
      const encoded = Base64.encodeBuffer(buffer);
      expect(encoded).toBe('SGVsbG8=');
    });

    it('should encode empty ArrayBuffer', () => {
      const buffer = new ArrayBuffer(0);
      const encoded = Base64.encodeBuffer(buffer);
      expect(encoded).toBe('');
    });

    it('should encode binary data', () => {
      const bytes = new Uint8Array([0, 1, 2, 255, 128, 64]);
      const encoded = Base64.encodeBuffer(bytes.buffer);
      const decoded = Base64.decodeToBuffer(encoded);
      expect(new Uint8Array(decoded)).toEqual(bytes);
    });

    it('should handle all byte values', () => {
      const bytes = new Uint8Array(256);
      for (let i = 0; i < 256; i++) {
        bytes[i] = i;
      }
      const encoded = Base64.encodeBuffer(bytes.buffer);
      const decoded = Base64.decodeToBuffer(encoded);
      expect(new Uint8Array(decoded)).toEqual(bytes);
    });

    it('should handle large ArrayBuffer', () => {
      const size = 10000;
      const bytes = new Uint8Array(size);
      for (let i = 0; i < size; i++) {
        bytes[i] = i % 256;
      }
      const encoded = Base64.encodeBuffer(bytes.buffer);
      const decoded = Base64.decodeToBuffer(encoded);
      expect(new Uint8Array(decoded)).toEqual(bytes);
    });

    it('should produce valid base64 output', () => {
      const bytes = new Uint8Array([72, 101, 108, 108, 111]);
      const encoded = Base64.encodeBuffer(bytes.buffer);
      expect(encoded).toMatch(/^[A-Za-z0-9+/]*={0,2}$/);
    });
  });

  describe('encodeBufferUrlSafe', () => {
    it('should encode ArrayBuffer to URL-safe base64', () => {
      const text = 'Hello';
      const buffer = new TextEncoder().encode(text).buffer;
      const encoded = Base64.encodeBufferUrlSafe(buffer);
      expect(encoded).not.toContain('+');
      expect(encoded).not.toContain('/');
      expect(encoded).not.toContain('=');
    });

    it('should round-trip with decodeToBuffer', () => {
      const bytes = new Uint8Array([0, 1, 2, 255, 128, 64]);
      const encoded = Base64.encodeBufferUrlSafe(bytes.buffer);
      const decoded = Base64.decodeToBuffer(encoded);
      expect(new Uint8Array(decoded)).toEqual(bytes);
    });

    it('should handle empty ArrayBuffer', () => {
      const buffer = new ArrayBuffer(0);
      const encoded = Base64.encodeBufferUrlSafe(buffer);
      expect(encoded).toBe('');
    });

    it('should produce URL-safe output', () => {
      const bytes = new Uint8Array([72, 101, 108, 108, 111]);
      const encoded = Base64.encodeBufferUrlSafe(bytes.buffer);
      expect(encoded).toMatch(/^[A-Za-z0-9\-_]*$/);
    });
  });

  describe('decode', () => {
    it('should decode standard base64 to text', () => {
      const encoded = 'SGVsbG8=';
      const decoded = Base64.decode(encoded);
      expect(decoded).toBe('Hello');
    });

    it('should decode URL-safe base64 to text', () => {
      // "Hello" encoded to base64 is "SGVsbG8=", URL-safe is "SGVsbG8" (no padding)
      const encoded = 'SGVsbG8';
      const decoded = Base64.decode(encoded);
      expect(decoded).toBe('Hello');
    });

    it('should decode empty string', () => {
      const decoded = Base64.decode('');
      expect(decoded).toBe('');
    });

    it('should handle whitespace', () => {
      const encoded = '  SGVsbG8=  ';
      const decoded = Base64.decode(encoded);
      expect(decoded).toBe('Hello');
    });

    it('should handle text with spaces', () => {
      const text = 'Hello World';
      const encoded = Base64.encode(text);
      const decoded = Base64.decode(encoded);
      expect(decoded).toBe(text);
    });

    it('should decode Unicode text', () => {
      const text = 'Hello, 世界!';
      const encoded = Base64.encode(text);
      const decoded = Base64.decode(encoded);
      expect(decoded).toBe(text);
    });

    it('should decode emojis', () => {
      const text = '🎉🎊🎈';
      const encoded = Base64.encode(text);
      const decoded = Base64.decode(encoded);
      expect(decoded).toBe(text);
    });

    it('should automatically detect URL-safe format', () => {
      const text = 'Hello';
      const urlSafe = Base64.encodeUrlSafe(text);
      const decoded = Base64.decode(urlSafe);
      expect(decoded).toBe(text);
    });

    it('should automatically detect standard format', () => {
      const text = 'Hello';
      const standard = Base64.encode(text);
      const decoded = Base64.decode(standard);
      expect(decoded).toBe(text);
    });

    it('should handle base64 with padding', () => {
      const encoded = 'SGVsbG8=';
      const decoded = Base64.decode(encoded);
      expect(decoded).toBe('Hello');
    });

    it('should handle base64 without padding', () => {
      const encoded = 'SGVsbG8';
      const decoded = Base64.decode(encoded);
      expect(decoded).toBe('Hello');
    });

    it('should handle URL-safe without padding', () => {
      // "Hello" encoded to base64 is "SGVsbG8=", URL-safe is "SGVsbG8" (no padding)
      const encoded = 'SGVsbG8';
      const decoded = Base64.decode(encoded);
      expect(decoded).toBe('Hello');
    });

    it('should throw error for invalid base64', () => {
      expect(() => Base64.decode('Invalid!@#')).toThrow();
    });

    it('should throw error for invalid characters', () => {
      expect(() => Base64.decode('SGVsbG8!')).toThrow();
    });

    it('should handle mixed standard and URL-safe (fallback)', () => {
      // This is an edge case - if URL-safe decode fails, it tries standard
      const encoded = 'SGVsbG8='; // Standard with padding
      const decoded = Base64.decode(encoded);
      expect(decoded).toBe('Hello');
    });

    it('should round-trip with encode', () => {
      const texts = [
        'Hello',
        'Hello, World!',
        'Test with special chars: !@#$%^&*()',
        'Unicode: 世界 🌍',
        '🎉🎊🎈',
      ];

      for (const text of texts) {
        const encoded = Base64.encode(text);
        const decoded = Base64.decode(encoded);
        expect(decoded).toBe(text);
      }
    });

    it('should round-trip with encodeUrlSafe', () => {
      const texts = [
        'Hello',
        'Hello, World!',
        'Test with special chars: !@#$%^&*()',
        'Unicode: 世界 🌍',
        '🎉🎊🎈',
      ];

      for (const text of texts) {
        const encoded = Base64.encodeUrlSafe(text);
        const decoded = Base64.decode(encoded);
        expect(decoded).toBe(text);
      }
    });
  });

  describe('decodeToBuffer', () => {
    it('should decode standard base64 to ArrayBuffer', () => {
      const encoded = 'SGVsbG8=';
      const decoded = Base64.decodeToBuffer(encoded);
      const text = new TextDecoder().decode(decoded);
      expect(text).toBe('Hello');
    });

    it('should decode URL-safe base64 to ArrayBuffer', () => {
      // "Hello" encoded to base64 is "SGVsbG8=", URL-safe is "SGVsbG8" (no padding)
      const encoded = 'SGVsbG8';
      const decoded = Base64.decodeToBuffer(encoded);
      const text = new TextDecoder().decode(decoded);
      expect(text).toBe('Hello');
    });

    it('should decode URL-safe base64 with - character to ArrayBuffer', () => {
      // "Hello>" encoded to base64 is "SGVsbG8+", URL-safe is "SGVsbG8-"
      const encoded = 'SGVsbG8-';
      const decoded = Base64.decodeToBuffer(encoded);
      const text = new TextDecoder().decode(decoded);
      expect(text).toBe('Hello>');
    });

    it('should decode empty string', () => {
      const decoded = Base64.decodeToBuffer('');
      expect(decoded.byteLength).toBe(0);
    });

    it('should handle whitespace', () => {
      const encoded = '  SGVsbG8=  ';
      const decoded = Base64.decodeToBuffer(encoded);
      const text = new TextDecoder().decode(decoded);
      expect(text).toBe('Hello');
    });

    it('should decode binary data', () => {
      const bytes = new Uint8Array([0, 1, 2, 255, 128, 64]);
      const encoded = Base64.encodeBuffer(bytes.buffer);
      const decoded = Base64.decodeToBuffer(encoded);
      expect(new Uint8Array(decoded)).toEqual(bytes);
    });

    it('should handle all byte values', () => {
      const bytes = new Uint8Array(256);
      for (let i = 0; i < 256; i++) {
        bytes[i] = i;
      }
      const encoded = Base64.encodeBuffer(bytes.buffer);
      const decoded = Base64.decodeToBuffer(encoded);
      expect(new Uint8Array(decoded)).toEqual(bytes);
    });

    it('should handle large data', () => {
      const size = 10000;
      const bytes = new Uint8Array(size);
      for (let i = 0; i < size; i++) {
        bytes[i] = i % 256;
      }
      const encoded = Base64.encodeBuffer(bytes.buffer);
      const decoded = Base64.decodeToBuffer(encoded);
      expect(new Uint8Array(decoded)).toEqual(bytes);
    });

    it('should automatically detect URL-safe format', () => {
      const bytes = new Uint8Array([72, 101, 108, 108, 111]);
      const urlSafe = Base64.encodeBufferUrlSafe(bytes.buffer);
      const decoded = Base64.decodeToBuffer(urlSafe);
      expect(new Uint8Array(decoded)).toEqual(bytes);
    });

    it('should automatically detect standard format', () => {
      const bytes = new Uint8Array([72, 101, 108, 108, 111]);
      const standard = Base64.encodeBuffer(bytes.buffer);
      const decoded = Base64.decodeToBuffer(standard);
      expect(new Uint8Array(decoded)).toEqual(bytes);
    });

    it('should handle base64 with padding', () => {
      const encoded = 'SGVsbG8=';
      const decoded = Base64.decodeToBuffer(encoded);
      expect(decoded.byteLength).toBe(5);
    });

    it('should handle base64 without padding', () => {
      const encoded = 'SGVsbG8';
      const decoded = Base64.decodeToBuffer(encoded);
      expect(decoded.byteLength).toBe(5);
    });

    it('should throw error for invalid base64', () => {
      expect(() => Base64.decodeToBuffer('Invalid!@#')).toThrow();
    });

    it('should throw error for invalid characters', () => {
      expect(() => Base64.decodeToBuffer('SGVsbG8!')).toThrow();
    });

    it('should round-trip with encodeBuffer', () => {
      const testCases = [
        new Uint8Array([72, 101, 108, 108, 111]), // "Hello"
        new Uint8Array([0, 1, 2, 255, 128, 64]),
        new Uint8Array(256).fill(0).map((_, i) => i),
      ];

      for (const bytes of testCases) {
        const encoded = Base64.encodeBuffer(bytes.buffer);
        const decoded = Base64.decodeToBuffer(encoded);
        expect(new Uint8Array(decoded)).toEqual(bytes);
      }
    });

    it('should round-trip with encodeBufferUrlSafe', () => {
      const testCases = [
        new Uint8Array([72, 101, 108, 108, 111]), // "Hello"
        new Uint8Array([0, 1, 2, 255, 128, 64]),
        new Uint8Array(256).fill(0).map((_, i) => i),
      ];

      for (const bytes of testCases) {
        const encoded = Base64.encodeBufferUrlSafe(bytes.buffer);
        const decoded = Base64.decodeToBuffer(encoded);
        expect(new Uint8Array(decoded)).toEqual(bytes);
      }
    });
  });

  describe('Integration tests', () => {
    it('should handle complete encode/decode cycle for text', () => {
      const original = 'Hello, World! This is a test. 🎉';
      const encoded = Base64.encode(original);
      const decoded = Base64.decode(encoded);
      expect(decoded).toBe(original);
    });

    it('should handle complete encode/decode cycle for binary data', () => {
      const original = new Uint8Array([0, 1, 2, 3, 255, 254, 253, 252]);
      const encoded = Base64.encodeBuffer(original.buffer);
      const decoded = Base64.decodeToBuffer(encoded);
      expect(new Uint8Array(decoded)).toEqual(original);
    });

    it('should handle URL-safe encode/decode cycle', () => {
      const original = 'Hello, World! This is a test. 🎉';
      const encoded = Base64.encodeUrlSafe(original);
      const decoded = Base64.decode(encoded);
      expect(decoded).toBe(original);
    });

    it('should handle URL-safe encode/decode cycle for binary', () => {
      const original = new Uint8Array([0, 1, 2, 3, 255, 254, 253, 252]);
      const encoded = Base64.encodeBufferUrlSafe(original.buffer);
      const decoded = Base64.decodeToBuffer(encoded);
      expect(new Uint8Array(decoded)).toEqual(original);
    });

    it('should handle conversion between standard and URL-safe', () => {
      const text = 'Hello, World!';
      const standard = Base64.encode(text);
      const urlSafe = Base64.toUrlSafe(standard);
      const backToStandard = Base64.fromUrlSafe(urlSafe);
      const decoded = Base64.decode(backToStandard);

      expect(decoded).toBe(text);
    });

    it('should handle various text encodings', () => {
      const texts = [
        'ASCII text',
        'Text with émojis 🚀',
        'Unicode: 世界 🌍',
        'Special chars: !@#$%^&*()',
        'Numbers: 1234567890',
        'Mixed: Hello, 世界! 🎉 123',
      ];

      for (const text of texts) {
        const encoded = Base64.encode(text);
        const decoded = Base64.decode(encoded);
        expect(decoded).toBe(text);
      }
    });

    it('should handle various binary patterns', () => {
      const patterns = [
        new Uint8Array([0, 0, 0, 0]), // All zeros
        new Uint8Array([255, 255, 255, 255]), // All ones
        new Uint8Array([0, 255, 0, 255]), // Alternating
        new Uint8Array([1, 2, 3, 4, 5, 6, 7, 8, 9, 10]), // Sequential
      ];

      for (const pattern of patterns) {
        const encoded = Base64.encodeBuffer(pattern.buffer);
        const decoded = Base64.decodeToBuffer(encoded);
        expect(new Uint8Array(decoded)).toEqual(pattern);
      }
    });
  });
});
