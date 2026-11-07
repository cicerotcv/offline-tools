import type {
  DerivationPath,
  DerivedKey,
} from '../../../domain/bitcoin/config';
import type { BitcoinNetwork as Network } from '../../../domain/bitcoin/network';
import { getAccountPath } from '../../../lib/derivation';
import { AddressCountInput } from './address-count-input';
import { DerivationPathsSection } from './derivation-paths-section';
import { KeyDisplayTable } from './key-display-table';
import { NetworkSelector } from './network-selector';
import { WalletPrivateKeyExport } from './wallet-private-key-export';
import { WalletPublicKeyExport } from './wallet-public-key-export';

interface DerivationPanelProps {
  network: Network;
  derivationPath: DerivationPath;
  addressCount: number;
  keys: DerivedKey[];
  isLoading: boolean;
  onNetworkChange: (network: Network) => void;
  onPathChange: (path: DerivationPath) => void;
  onCountChange: (count: number) => void;
  /** Shown when the network comes from the input and cannot change. */
  networkLockedReason?: string;
  /** Shown when the path comes from the input and cannot change. */
  pathLockedReason?: string;
}

/**
 * Network, path and count, then the extended keys and the address table.
 * Used by Seed Generation (after the backup) and by Wallet Recovery.
 */
export function DerivationPanel({
  network,
  derivationPath,
  addressCount,
  keys,
  isLoading,
  onNetworkChange,
  onPathChange,
  onCountChange,
  networkLockedReason,
  pathLockedReason,
}: DerivationPanelProps) {
  const accountPath = getAccountPath(derivationPath, network);

  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <NetworkSelector
            network={network}
            onNetworkChange={onNetworkChange}
            disabled={Boolean(networkLockedReason)}
          />
          {networkLockedReason && (
            <p className="text-xs text-muted-foreground">
              {networkLockedReason}
            </p>
          )}
        </div>
        <AddressCountInput count={addressCount} onCountChange={onCountChange} />
      </div>

      <DerivationPathsSection
        path={derivationPath}
        onPathChange={onPathChange}
        disabled={Boolean(pathLockedReason)}
        disabledReason={pathLockedReason}
      >
        {isLoading ? (
          <p
            role="status"
            className="rounded-lg bg-surface-inset p-8 text-center text-sm
              text-muted-foreground"
          >
            Deriving addresses…
          </p>
        ) : (
          <div className="space-y-6">
            {keys.length > 0 && (
              <>
                <WalletPrivateKeyExport
                  derivationPath={accountPath}
                  keys={keys}
                />
                <WalletPublicKeyExport
                  keys={keys}
                  derivationPath={accountPath}
                />
              </>
            )}
            <KeyDisplayTable keys={keys} />
          </div>
        )}
      </DerivationPathsSection>
    </div>
  );
}
