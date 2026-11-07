import * as bitcoin from 'bitcoinjs-lib';

import type { BitcoinNetwork, NetworkId } from '../../domain/bitcoin/network';

export interface NetworkOption {
  id: NetworkId;
  name: string;
  network: BitcoinNetwork;
  description: string;
}

export const NETWORKS: NetworkOption[] = [
  {
    id: 'mainnet',
    name: 'Bitcoin Mainnet',
    network: bitcoin.networks.bitcoin,
    description: 'Production Bitcoin network for real transactions',
  },
  {
    id: 'testnet',
    name: 'Bitcoin Testnet',
    network: bitcoin.networks.testnet,
    description: 'Test network for development and testing',
  },
  {
    id: 'regtest',
    name: 'Bitcoin Regtest',
    network: bitcoin.networks.regtest,
    description: 'Local regression test network for development',
  },
];

export const DEFAULT_NETWORK = NETWORKS[0]; // Mainnet

export function getNetwork(id: NetworkId): BitcoinNetwork {
  return NETWORKS.find((option) => option.id === id)!.network;
}

/** Identifies a network by its address/WIF parameters (object identity is not reliable). */
export function getNetworkId(network: BitcoinNetwork): NetworkId {
  if (network.bech32 === bitcoin.networks.bitcoin.bech32) return 'mainnet';
  if (network.bech32 === bitcoin.networks.regtest.bech32) return 'regtest';
  return 'testnet';
}
