import { Fragment, useMemo, useState } from 'react';

import { ChevronRight } from 'lucide-react';

import { CopyButton } from '$/components/ui/copy-button';
import { FormSection } from '$/components/ui/form-section';
import { QRCodeButton } from '$/components/ui/qr-code-button';
import { SecretDownloadButton } from '$/components/ui/secret-download-button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '$/components/ui/tabs';

import type { DerivedKey } from '../../../domain/bitcoin/config';

interface KeyDisplayTableProps {
  keys: DerivedKey[];
}

interface KeyFieldProps {
  label: string;
  value: string;
  /** Private key material: clipboard cleared, saving asks first. */
  secret?: boolean;
  qr?: boolean;
  download?: { filename: () => string; content: () => string };
}

function KeyField({ label, value, secret, qr, download }: KeyFieldProps) {
  return (
    <div className="space-y-1">
      <div className="flex items-center justify-between gap-2">
        <dt
          className={`text-label
            ${secret ? 'text-warning' : 'text-muted-foreground'}`}
        >
          {label}
        </dt>
        <dd className="flex items-center">
          <CopyButton
            value={value}
            secret={secret}
            variant="ghost"
            size="icon-sm"
            showLabel={false}
          />
          {qr && (
            <QRCodeButton
              value={value}
              variant="ghost"
              size="icon-sm"
              showLabel={false}
              qrLabel={label}
            />
          )}
          {download && (
            <SecretDownloadButton
              filename={download.filename}
              content={download.content}
              subject="this private key"
              size="icon-sm"
              showLabel={false}
            />
          )}
        </dd>
      </div>
      <dd className="rounded-md bg-card px-2.5 py-2 font-mono text-xs break-all">
        {value}
      </dd>
    </div>
  );
}

function AddressTable({ keys }: { keys: DerivedKey[] }) {
  const [expanded, setExpanded] = useState<Set<number>>(new Set());

  const toggleRow = (index: number) => {
    const next = new Set(expanded);
    if (next.has(index)) next.delete(index);
    else next.add(index);
    setExpanded(next);
  };

  return (
    <div className="overflow-x-auto">
      <table className="w-full border-collapse text-left">
        <thead>
          <tr className="border-b">
            <th className="h-9 px-2 text-label text-muted-foreground">Path</th>
            <th className="h-9 px-2 text-label text-muted-foreground">
              Address
            </th>
          </tr>
        </thead>
        <tbody>
          {keys.map((key, index) => {
            const open = expanded.has(index);
            return (
              <Fragment key={key.path}>
                <tr className="hover:bg-muted/40">
                  <td className="h-11 px-2 align-middle">
                    <button
                      type="button"
                      onClick={() => toggleRow(index)}
                      aria-expanded={open}
                      aria-label={`${open ? 'Hide' : 'Show'} keys for ${key.path}`}
                      className="flex items-center gap-1 rounded-sm font-mono
                        text-xs text-muted-foreground hover:text-foreground
                        focus-visible:outline-2 focus-visible:outline-ring"
                    >
                      <ChevronRight
                        aria-hidden
                        className={`h-3.5 w-3.5 transition-transform
                        ${open ? 'rotate-90' : ''}`}
                      />
                      {key.path}
                    </button>
                  </td>
                  <td className="h-11 px-2 align-middle">
                    <div className="flex items-center gap-1">
                      <span className="font-mono text-xs">{key.address}</span>
                      <CopyButton
                        value={key.address}
                        variant="ghost"
                        size="icon-sm"
                        showLabel={false}
                      />
                      <QRCodeButton
                        value={key.address}
                        variant="ghost"
                        size="icon-sm"
                        showLabel={false}
                        qrLabel="Bitcoin address"
                      />
                    </div>
                  </td>
                </tr>
                {open && (
                  <tr>
                    <td colSpan={2} className="px-2 pb-3">
                      <dl className="grid gap-3 rounded-lg bg-surface-inset p-3">
                        <KeyField
                          label="Public key (hex)"
                          value={key.publicKey}
                        />
                        <KeyField
                          label="Private key (WIF)"
                          value={key.privateKeyWIF}
                          secret
                          qr
                          download={{
                            filename: () =>
                              `wif-${key.address.slice(0, 10)}-${Date.now()}.txt`,
                            content: () => `Bitcoin private key (WIF)
Path: ${key.path}
Address: ${key.address}

${key.privateKeyWIF}

Anyone who has this key can spend the funds of this address.
Saved: ${new Date().toISOString()}
`,
                          }}
                        />
                        <KeyField
                          label="Private key (hex)"
                          value={key.privateKey}
                          secret
                        />
                      </dl>
                    </td>
                  </tr>
                )}
              </Fragment>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

export function KeyDisplayTable({ keys }: KeyDisplayTableProps) {
  const { receivingKeys, changeKeys } = useMemo(() => {
    const receiving: DerivedKey[] = [];
    const change: DerivedKey[] = [];
    // m/…/0/i is receiving, m/…/1/i is change.
    keys.forEach((key) => {
      if (/\/1\/\d+$/.test(key.path)) change.push(key);
      else receiving.push(key);
    });
    return { receivingKeys: receiving, changeKeys: change };
  }, [keys]);

  if (keys.length === 0) return null;

  return (
    <FormSection
      title="Addresses"
      description="Expand a row to see its keys. Receiving addresses take payments; change addresses take the change of your own transactions."
    >
      <Tabs defaultValue="receiving">
        <TabsList aria-label="Address chain">
          <TabsTrigger value="receiving" className="px-4">
            Receiving
            <span className="font-mono text-xs text-muted-foreground">
              {receivingKeys.length}
            </span>
          </TabsTrigger>
          <TabsTrigger value="change" className="px-4">
            Change
            <span className="font-mono text-xs text-muted-foreground">
              {changeKeys.length}
            </span>
          </TabsTrigger>
        </TabsList>
        <TabsContent value="receiving" className="mt-3">
          <AddressTable keys={receivingKeys} />
        </TabsContent>
        <TabsContent value="change" className="mt-3">
          <AddressTable keys={changeKeys} />
        </TabsContent>
      </Tabs>
    </FormSection>
  );
}
