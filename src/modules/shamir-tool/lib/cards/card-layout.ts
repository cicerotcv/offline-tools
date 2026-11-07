/*
 * How a share's text is laid out on an ID-1 card (paper or engraved plate).
 * A v3 share is 75 fixed bytes plus the secret, base64url (4 characters per
 * 3 bytes), so its length depends on the secret. Three densities keep the text
 * legible; anything longer does not fit a card and must be kept as text.
 */

/** Bytes a v3 share adds to the secret: header 9, key 32, nonce 12, length 2, tag 16, checksum 4. */
export const V3_OVERHEAD_BYTES = 75;

export interface CardDensity {
  name: 'regular' | 'compact' | 'dense';
  groupsPerRow: number;
  maxRows: number;
}

export const CARD_DENSITIES: readonly CardDensity[] = [
  { name: 'regular', groupsPerRow: 6, maxRows: 7 },
  { name: 'compact', groupsPerRow: 8, maxRows: 10 },
  // Covers any 24-word English BIP39 phrase (at most 215 bytes).
  { name: 'dense', groupsPerRow: 9, maxRows: 11 },
];

const GROUP = 4;

/** Characters of a v3 share (unpadded base64url) for a secret of `bytes`. */
export function shareLength(secretBytes: number): number {
  return Math.ceil(((V3_OVERHEAD_BYTES + secretBytes) * 4) / 3);
}

/** The densest layout still needed for `length` characters, or null if none fits. */
export function cardDensityFor(length: number): CardDensity | null {
  return (
    CARD_DENSITIES.find(
      ({ groupsPerRow, maxRows }) => length <= groupsPerRow * maxRows * GROUP
    ) ?? null
  );
}

/** Largest secret, in UTF-8 bytes, whose shares still fit a card. */
export const MAX_CARD_SECRET_BYTES = (() => {
  const last = CARD_DENSITIES[CARD_DENSITIES.length - 1];
  const chars = last.groupsPerRow * last.maxRows * GROUP;
  return Math.floor((chars * 3) / 4) - V3_OVERHEAD_BYTES;
})();

/** Rows of four-character groups for a card. */
export function shareRows(share: string, groupsPerRow: number): string[][] {
  const groups = share.match(/.{1,4}/g) ?? [share];
  const rows: string[][] = [];
  for (let i = 0; i < groups.length; i += groupsPerRow) {
    rows.push(groups.slice(i, i + groupsPerRow));
  }
  return rows;
}
