import type { BitcoinNetwork as Network } from './network';

export type WordCount = 12 | 15 | 18 | 21 | 24;
export type GenerationMode = 'random' | 'custom';
export type DerivationPath = 'bip44' | 'bip49' | 'bip84';

export interface DerivedKey {
  path: string;
  address: string;
  publicKey: string; // Hex
  privateKey: string; // Hex
  privateKeyWIF: string; // WIF format
  xpub?: string; // Extended public key
  xprv?: string; // Extended private key
}

export interface BIP39Config {
  wordCount: WordCount;
  generationMode: GenerationMode;
  entropy?: string; // Hex string for custom entropy
  network: Network;
  derivationPath: DerivationPath;
  addressCount: number;
}

export interface SeedInfo {
  mnemonic: string;
  seed: string; // Hex
  entropy: string; // Hex
  checksum: string; // Binary string of checksum bits
}
