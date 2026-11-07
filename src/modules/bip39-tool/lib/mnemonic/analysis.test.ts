import { describe, expect, it } from 'vitest';

import { BIP39_VECTORS } from '../../domain/vectors/official-vectors';
import { analyzeMnemonicWords, parseMnemonicInput } from './analysis';

const analyze = (text: string) =>
  analyzeMnemonicWords(parseMnemonicInput(text));

describe('analyzeMnemonicWords', () => {
  it('accepts an official vector, whatever the spacing and case', () => {
    const phrase = BIP39_VECTORS[0].mnemonic;
    const result = analyze(`  ${phrase.toUpperCase().split(' ').join('\n ')} `);
    expect(result.invalidWords).toEqual([]);
    expect(result.wordCountStatus).toBe('valid-length');
    expect(result.checksumStatus).toBe('valid');
    expect(result.mnemonic).toBe(phrase);
  });

  it('flags a word that is not in the wordlist, without a checksum verdict', () => {
    const words = BIP39_VECTORS[0].mnemonic.split(' ');
    words[3] = 'bitcoinz';
    const result = analyze(words.join(' '));
    expect(result.invalidWords).toEqual(['bitcoinz']);
    expect(result.checksumStatus).toBeNull();
  });

  it('reports a wrong checksum when every word is valid', () => {
    const words = BIP39_VECTORS[0].mnemonic.split(' ');
    words[11] = words[11] === 'about' ? 'above' : 'about';
    const result = analyze(words.join(' '));
    expect(result.invalidWords).toEqual([]);
    expect(result.checksumStatus).toBe('invalid');
  });

  it('waits for a BIP39 length before judging the checksum', () => {
    const result = analyze('abandon abandon abandon');
    expect(result.wordCountStatus).toBe('invalid-length');
    expect(result.checksumStatus).toBeNull();
  });

  it('is empty for blank input', () => {
    expect(analyze('   ').wordCountStatus).toBe('empty');
  });
});
