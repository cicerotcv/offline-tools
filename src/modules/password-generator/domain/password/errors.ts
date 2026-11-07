/** No character class selected, or exclusions removed every character. */
export class EmptyCharsetError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'EmptyCharsetError';
  }
}
