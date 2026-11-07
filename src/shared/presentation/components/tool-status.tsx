import { Cpu, ShieldAlert, ShieldCheck, Wifi, WifiOff } from 'lucide-react';

import { useOnlineStatus } from '@/shared/presentation/hooks/online-status';

import { Badge } from '$/components/ui/badge';

import type { SelfTestState } from './self-test-gate';

interface ToolStatusProps {
  selfTest: SelfTestState;
  /** Tools that handle secrets warn when the machine is online. */
  sensitive: boolean;
}

/**
 * One line of trust facts under the tool title: self-test result, network
 * state and local processing. Replaces per-screen privacy banners.
 */
export function ToolStatus({ selfTest, sensitive }: ToolStatusProps) {
  const online = useOnlineStatus();

  return (
    <div className="mt-5 space-y-3">
      <ul aria-label="Tool status" className="flex flex-wrap gap-2">
        {selfTest.status === 'running' && (
          <li>
            <Badge variant="outline" role="status">
              <ShieldCheck aria-hidden className="animate-pulse" />
              Running self-test
            </Badge>
          </li>
        )}
        {selfTest.status === 'passed' && (
          <li>
            <Badge variant="success" role="status">
              <ShieldCheck aria-hidden />
              Self-test passed
            </Badge>
          </li>
        )}
        {selfTest.status === 'failed' && (
          <li>
            <Badge variant="destructive" role="status">
              <ShieldAlert aria-hidden />
              Self-test failed
            </Badge>
          </li>
        )}
        <li>
          <Badge variant="outline">
            <Cpu aria-hidden />
            Runs locally
          </Badge>
        </li>
        <li>
          {online ? (
            <Badge variant={sensitive ? 'warning' : 'outline'}>
              <Wifi aria-hidden />
              Online
            </Badge>
          ) : (
            <Badge variant="success">
              <WifiOff aria-hidden />
              Offline
            </Badge>
          )}
        </li>
      </ul>
      {online && sensitive && (
        <p role="note" className="max-w-[65ch] text-sm text-muted-foreground">
          <span className="font-medium text-foreground">
            This computer is online.
          </span>{' '}
          The app sends nothing, but for real seeds and keys use it on a machine
          with no network connection.
        </p>
      )}
    </div>
  );
}
