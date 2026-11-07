export interface PasswordConfig {
  length: number;
  includeUppercase: boolean;
  includeLowercase: boolean;
  includeNumbers: boolean;
  includeSymbols: boolean;
  /** Exclude look-alike characters: i, l, 1, L, o, 0, O. */
  excludeSimilar: boolean;
  /** Exclude characters that are easy to mistype: { } [ ] ( ) / \ ' " ` ~ , ; : . < > */
  excludeAmbiguous: boolean;
}

export const MIN_PASSWORD_LENGTH = 4;
export const MAX_PASSWORD_LENGTH = 128;

export const DEFAULT_PASSWORD_CONFIG: PasswordConfig = {
  length: 16,
  includeUppercase: true,
  includeLowercase: true,
  includeNumbers: true,
  includeSymbols: true,
  excludeSimilar: false,
  excludeAmbiguous: false,
};
