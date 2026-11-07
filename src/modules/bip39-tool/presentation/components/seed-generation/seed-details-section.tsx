import { useState } from 'react';

import { CopyButton } from '$/components/ui/copy-button';
import { RevealToggle } from '$/components/ui/reveal-toggle';

import type { WordCount } from '../../../domain/bitcoin/config';
import { getWordCountConfig } from '../../../domain/mnemonic/word-counts';

interface SeedDetailsSectionProps {
  mnemonic: string;
  seed: string; // Hex
  entropy: string; // Hex
  wordCount: WordCount;
  passphrase: string;
}

function SecretValue({ label, value }: { label: string; value: string }) {
  const [revealed, setRevealed] = useState(false);
  return (
    <div className="space-y-1.5 py-3">
      <div className="flex items-center justify-between gap-2">
        <dt className="text-sm text-muted-foreground">{label}</dt>
        <div className="flex gap-1.5">
          <RevealToggle
            revealed={revealed}
            onToggle={() => setRevealed(!revealed)}
            subject={label.toLowerCase()}
          />
          <CopyButton secret value={value} size="sm" variant="outline" />
        </div>
      </div>
      <dd className="font-mono text-xs break-all">
        {revealed ? value : '•'.repeat(32)}
      </dd>
    </div>
  );
}

/** Bit sizes and the derived entropy and master seed, masked by default. */
export function SeedDetailsSection({
  seed,
  entropy,
  wordCount,
  passphrase,
}: SeedDetailsSectionProps) {
  const config = getWordCountConfig(wordCount);
  const facts = [
    ['Words', `${wordCount}`],
    ['Entropy', `${config.entropyBits} bits`],
    ['Checksum', `${config.checksumBits} bits`],
    ['Passphrase', passphrase ? 'Set' : 'None'],
  ] as const;

  return (
    <div className="space-y-4">
      <dl className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {facts.map(([term, value]) => (
          <div key={term} className="rounded-lg bg-surface-inset px-3 py-2.5">
            <dt className="text-label text-muted-foreground">{term}</dt>
            <dd className="mt-0.5 font-mono text-sm">{value}</dd>
          </div>
        ))}
      </dl>
      <dl className="divide-y divide-border">
        <SecretValue label="Entropy (hex)" value={entropy} />
        <SecretValue label="Master seed (hex)" value={seed} />
      </dl>
      <p className="text-xs text-muted-foreground">
        Standard BIP39: any BIP39 wallet restores this phrase. The passphrase
        works in Electrum, BlueWallet, Ledger, Trezor and most hardware wallets.
      </p>
    </div>
  );
}
