# Shamir's Secret Sharing Tool

## Overview

Splits a text secret into `N` shares so that any `M` of them recover it, using **encrypt-then-Shamir**: the secret is sealed with **AES-256-GCM** under a random 256-bit key, and only the key is split with Shamir over GF(256) (AES polynomial). Fewer than `M` shares reveal nothing: the secret stays sealed and the tool shows it as locked noise.

## Security model (format v3)

1. **Split**: random key, nonce and set id → AES-256-GCM seal of the secret, with the share header (version, M, N, set id) as authenticated data → Shamir split of the key.
2. **Recover**: the key is rebuilt by Lagrange interpolation and the seal is opened. A result is valid **only if the 128-bit GCM tag verifies**, so too few, damaged or relabelled shares can never produce a wrong secret.
3. **Per-share checksum**: the last 4 bytes of each share are SHA-256 of the rest, so a mistyped or damaged copy is named before combining.
4. **Finding a bad share**: with more than `M` shares that do not open together, combinations of `M` are tried (up to 2,000) and the share left out of every working combination is reported.
5. **Verify after generate**: every split is decoded back; `M` shares must open it and `M-1` must not.
6. **Self-test** before the tool opens: a fresh round trip plus the frozen v2 and v3 vectors (`domain/vectors/`), which catch any change in the field arithmetic or the share layout.

## Share format

URL-safe base64 of:

```
v3: [0x00][0x03][M][N][x][set id ×4][key share ×32][nonce ×12][len u16][ciphertext + GCM tag][checksum ×4]
v2: [0x00][0x02][M][N][x][key share ×32][nonce ×12][len u16][ciphertext]   (read only)
```

The ciphertext is identical in every share of a split, so secrets are limited to 16 KB. v2 shares (SHA-256 counter-mode stream with a 1-byte marker, not authenticated) still open and are flagged as legacy; new splits always write v3. Neither format is compatible with `ssss` or SLIP-39.

## Usage

- **Split**: enter the secret, choose `N` and `M`, then copy, download or (optionally) print one card per share: share number, set id, QR, the share in groups of four and recovery steps.
- **Recover**: paste or type the shares, one per line, in any order. Spaces inside a line are ignored. Each line is checked as you type (ready, duplicate, damaged, other set, old v2) and an "x of M" counter enables Recover when enough are in.

## Cards and laser plates

Both use the ID-1 size (85.6 × 53.98 mm), front with the share number, set, threshold and QR, back with the share in numbered groups of four. The layout depends on the share length (`lib/cards`): 6 groups × 7 rows, 8 × 10 or 9 × 11, which fits secrets up to 222 bytes (any 24-word English BIP39 phrase). Longer secrets stay as text and both outputs are disabled.

- **Print cards**: as many cards per A4 page as fit; cut and fold the front and back.
- **Export for laser** (`lib/laser`): one SVG per share, front and back side by side at 1:1 in mm. Black = engrave: single-stroke font (`shared/lib/vector/stroke-font.ts`, slashed zero, tailed `l`, serifed `I`, wide `_`) and the QR as one even-odd path with merged modules (`qr-path.ts`). Red hairline = cut outline. The QR uses the strongest error correction (H, Q, M) that keeps modules at least 0.5 mm, inside a 4-module quiet zone. Whoever engraves sees the share: never send M shares to the same shop.

## Tests

- GF(256) against FIPS-197 examples and every inverse; field laws with fast-check.
- AES-GCM adapter against the GCM specification test case 16.
- Frozen v2 and v3 vectors: any `M` open, `M-1` never do.
- Properties: v3 `M-1` never opens and `M` always does; the v2 1-byte limit stays documented with `it.fails`.
- Tampering: forged checksum, relabelled threshold, mixed sets, damaged share among `M+1`.
