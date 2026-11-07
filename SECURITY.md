# Security policy

Offline Tools generates and handles secrets (seed phrases, private keys, passwords, encrypted files). The worst failures are not remote attacks on a server, since there is none, but a tool that **produces wrong cryptographic output without warning** or **leaks a secret locally**.

## Reporting a vulnerability

Report privately through a [GitHub security advisory](https://github.com/cicerotcv/offline-tools/security/advisories/new). Please do not open a public issue for a vulnerability.

Include the tool, the browser and build (hosted or single-file), steps to reproduce and, for wrong output, the expected value with its source (BIP test vector, another implementation). Never send real seeds, keys or passwords: use test vectors or throwaway values.

## In scope

- Wrong output from any tool: BIP39 mnemonics and seeds, BIP32/44/49/84 derivation, addresses, WIF, BIP38, Shamir shares, OpenPGP, hashes, passwords
- Weak or predictable randomness
- Secrets persisted (storage, cache, history) or kept after leaving a tool
- Any network request from the page, or a way around its Content-Security-Policy
- A self-test that passes while the tool is broken
- Tampering paths in the release and checksum process

## Out of scope

- Attacks that require a compromised operating system, browser or extension
- Using the hosted version on an online machine with real funds; the app warns against it
- Missing headers on third-party mirrors

## Official builds

Only files attached to a GitHub release of this repository are official. Before using one, check it against the release's `SHA256SUMS` and verify its provenance with `gh attestation verify <file> --repo cicerotcv/offline-tools`. Builds are reproducible from the tag.

## Supported versions

Only the latest release is supported.
