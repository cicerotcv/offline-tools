import { useState } from 'react';

import type { DerivationPath } from '../../domain/bitcoin/config';
import type { BitcoinNetwork as Network } from '../../domain/bitcoin/network';
import { DEFAULT_NETWORK } from '../../lib/networks';

interface UseDerivationConfigReturn {
  network: Network;
  derivationPath: DerivationPath;
  addressCount: number;
  setNetwork: (network: Network) => void;
  setDerivationPath: (path: DerivationPath) => void;
  setAddressCount: (count: number) => void;
}

export function useDerivationConfig(): UseDerivationConfigReturn {
  const [network, setNetwork] = useState<Network>(DEFAULT_NETWORK.network);
  const [derivationPath, setDerivationPath] = useState<DerivationPath>('bip84');
  const [addressCount, setAddressCount] = useState(5);

  return {
    network,
    derivationPath,
    addressCount,
    setNetwork,
    setDerivationPath,
    setAddressCount,
  };
}
