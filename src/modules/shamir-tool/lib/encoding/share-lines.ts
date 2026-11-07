import {
  type AnyShare,
  DamagedShareError,
  decodeShare,
  formatSetId,
} from './share-encoding';

export type ShareLineStatus =
  | 'ok'
  | 'legacy'
  | 'duplicate'
  | 'damaged'
  | 'conflict'
  | 'other-set'
  | 'invalid';

export interface ShareLine {
  /** 1-based line number among the non-empty lines. */
  line: number;
  status: ShareLineStatus;
  /** Share number and total, when the line could be read. */
  x?: number;
  total?: number;
  setId?: string;
  message?: string;
  /** The normalized share text (spaces removed). */
  value: string;
}

export interface ShareLinesAnalysis {
  lines: ShareLine[];
  /** Taken from the first readable share; the set the others must match. */
  threshold?: number;
  setId?: string;
  version?: 2 | 3;
  /** Distinct usable shares of that set. */
  have: number;
  ready: boolean;
  /** What stays sealed until enough shares are in (shown as noise). */
  locked?: Uint8Array;
}

/**
 * Classifies each pasted line as it is typed: usable, duplicate, damaged
 * (checksum), conflicting, from another set or unreadable, and counts the
 * distinct usable shares against the threshold.
 */
export function analyzeShareLines(text: string): ShareLinesAnalysis {
  const raw = text
    .split('\n')
    .map((line) => line.replace(/\s+/g, ''))
    .filter((line) => line.length > 0);

  // First pass: decode each distinct line.
  const seen = new Set<string>();
  const decoded = raw.map((value) => {
    if (seen.has(value)) return { value, duplicate: true as const };
    seen.add(value);
    try {
      return { value, share: decodeShare(value) };
    } catch (error) {
      return { value, error };
    }
  });

  // The reference set is the one most lines belong to, so a stray line from
  // another split does not hide the shares that do belong together.
  const groups = new Map<string, { share: AnyShare; count: number }>();
  for (const entry of decoded) {
    if (!('share' in entry) || !entry.share) continue;
    const id = groupId(entry.share);
    const group = groups.get(id);
    if (group) group.count++;
    else groups.set(id, { share: entry.share, count: 1 });
  }
  const reference = [...groups.values()].sort((a, b) => b.count - a.count)[0]
    ?.share;

  const byNumber = new Set<number>();
  const lines: ShareLine[] = decoded.map((entry, index) => {
    const line = index + 1;
    const { value } = entry;
    if ('duplicate' in entry) {
      return {
        line,
        value,
        status: 'duplicate',
        message: 'Same as an earlier line',
      };
    }
    if ('error' in entry) {
      const error = entry.error;
      return {
        line,
        value,
        status: error instanceof DamagedShareError ? 'damaged' : 'invalid',
        message: error instanceof Error ? error.message : String(error),
      };
    }
    const share = entry.share!;
    const info = {
      line,
      value,
      x: share.x,
      total: share.totalShares,
      setId: share.version === 3 ? formatSetId(share.setId) : undefined,
    };
    if (groupId(share) !== groupId(reference!)) {
      return { ...info, status: 'other-set', message: 'From a different set' };
    }
    if (byNumber.has(share.x)) {
      return {
        ...info,
        status: 'conflict',
        message: `Another line is also share ${share.x}; one of them is damaged`,
      };
    }
    byNumber.add(share.x);
    return { ...info, status: share.version === 3 ? 'ok' : 'legacy' };
  });

  const have = byNumber.size;
  const threshold = reference?.threshold;
  return {
    lines,
    threshold,
    setId: reference?.version === 3 ? formatSetId(reference.setId) : undefined,
    version: reference?.version,
    have,
    ready: threshold !== undefined && have >= threshold,
    locked:
      reference === undefined
        ? undefined
        : reference.version === 3
          ? reference.sealed
          : reference.ciphertext,
  };
}

/** Version, threshold and split identity (set id, or the v2 nonce). */
function groupId(share: AnyShare): string {
  const key = share.version === 3 ? share.setId : share.nonce;
  return `${share.version}:${share.threshold}:${Array.from(key).join(',')}`;
}
