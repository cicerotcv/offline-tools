import { Label } from '$/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '$/components/ui/select';

import type { BitcoinNetwork as Network } from '../../../domain/bitcoin/network';
import { NETWORKS } from '../../../lib/networks';

interface NetworkSelectorProps {
  network: Network;
  onNetworkChange: (network: Network) => void;
  disabled?: boolean;
}

export function NetworkSelector({
  network,
  onNetworkChange,
  disabled = false,
}: NetworkSelectorProps) {
  const selectedNetwork =
    NETWORKS.find((n) => n.network === network) || NETWORKS[0];

  return (
    <div className="space-y-2">
      <Label htmlFor="network-select" className="text-sm font-medium">
        Network
      </Label>
      <Select
        value={selectedNetwork.name}
        onValueChange={(value) => {
          if (disabled) return;
          const selected = NETWORKS.find((n) => n.name === value);
          if (selected) {
            onNetworkChange(selected.network);
          }
        }}
        disabled={disabled}
      >
        <SelectTrigger id="network-select" className="w-full">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {NETWORKS.map((net) => (
            <SelectItem key={net.name} value={net.name}>
              {net.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      <p className="text-xs text-muted-foreground">
        {selectedNetwork.description}
      </p>
    </div>
  );
}
