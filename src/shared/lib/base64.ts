/**
 * Base64 encoding/decoding utility class
 * Supports both standard and URL-safe base64 encoding
 */
export class Base64 {
  /**
   * Convert standard base64 to URL-safe base64
   * Replaces: + -> -, / -> _, removes trailing padding =
   */
  static toUrlSafe(base64: string): string {
    return base64.replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
  }

  /**
   * Convert URL-safe base64 to standard base64
   * Replaces: - -> +, _ -> /, adds padding if needed
   */
  static fromUrlSafe(urlSafe: string): string {
    const base64 = urlSafe.replace(/-/g, '+').replace(/_/g, '/');
    const padding = (4 - (base64.length % 4)) % 4;
    return base64 + '='.repeat(padding);
  }

  /**
   * Encode a string to standard base64
   * Handles Unicode by converting to UTF-8 bytes first
   */
  static encode(text: string): string {
    // Convert string to UTF-8 bytes, then encode
    const bytes = new TextEncoder().encode(text);
    return this.encodeBuffer(bytes.buffer);
  }

  /**
   * Encode a string to URL-safe base64
   * Handles Unicode by converting to UTF-8 bytes first
   */
  static encodeUrlSafe(text: string): string {
    // Convert string to UTF-8 bytes, then encode
    const bytes = new TextEncoder().encode(text);
    return this.encodeBufferUrlSafe(bytes.buffer);
  }

  /**
   * Encode an ArrayBuffer to standard base64
   */
  static encodeBuffer(buffer: ArrayBuffer): string {
    const bytes = new Uint8Array(buffer);
    let binary = '';
    for (let i = 0; i < bytes.byteLength; i++) {
      binary += String.fromCharCode(bytes[i]);
    }
    return btoa(binary);
  }

  /**
   * Encode an ArrayBuffer to URL-safe base64
   */
  static encodeBufferUrlSafe(buffer: ArrayBuffer): string {
    return this.toUrlSafe(this.encodeBuffer(buffer));
  }

  /**
   * Decode a base64 string to text
   * Automatically handles both standard and URL-safe base64
   * Decodes UTF-8 bytes back to text
   */
  static decode(base64: string): string {
    const buffer = this.decodeToBuffer(base64);
    return new TextDecoder().decode(buffer);
  }

  /**
   * Decode a base64 string to ArrayBuffer
   * Automatically handles both standard and URL-safe base64
   */
  static decodeToBuffer(base64: string): ArrayBuffer {
    const trimmed = base64.trim();

    // Check if input contains URL-safe characters (- or _)
    const hasUrlSafeChars = trimmed.includes('-') || trimmed.includes('_');

    // Try decoding: if it has URL-safe chars, try URL-safe first, otherwise try standard first
    let binary: string | null = null;
    let lastError: Error | null = null;

    if (hasUrlSafeChars) {
      // Try URL-safe base64 first
      try {
        const standardBase64 = this.fromUrlSafe(trimmed);
        binary = atob(standardBase64);
      } catch (err) {
        lastError =
          err instanceof Error ? err : new Error('URL-safe decode failed');
        // Fallback to trying as standard base64 (in case it's a mix)
        try {
          binary = atob(trimmed);
        } catch {
          // Both failed, will use lastError
        }
      }
    } else {
      // Try standard base64 first
      try {
        binary = atob(trimmed);
      } catch (err) {
        lastError =
          err instanceof Error ? err : new Error('Standard decode failed');
        // Fallback to trying as URL-safe (in case padding is missing)
        try {
          const standardBase64 = this.fromUrlSafe(trimmed);
          binary = atob(standardBase64);
        } catch {
          // Both failed, will use lastError
        }
      }
    }

    if (binary === null) {
      throw new Error(
        lastError?.message || 'Decoding failed. Invalid base64 string.'
      );
    }

    const bytes = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i++) {
      bytes[i] = binary.charCodeAt(i);
    }
    return bytes.buffer;
  }
}
