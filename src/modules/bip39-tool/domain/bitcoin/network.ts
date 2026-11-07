/**
 * Bitcoin network parameters. Structurally identical to bitcoinjs-lib's
 * Network, so domain and presentation code do not depend on the library.
 */
export interface BitcoinNetwork {
  messagePrefix: string;
  bech32: string;
  bip32: { public: number; private: number };
  pubKeyHash: number;
  scriptHash: number;
  wif: number;
}

export const NETWORK_IDS = ['mainnet', 'testnet', 'regtest'] as const;
export type NetworkId = (typeof NETWORK_IDS)[number];
