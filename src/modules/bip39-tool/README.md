# BIP39 Seed Phrase Tools

width: 100%
name: bip39-tool

## Overview

The BIP39 Tool module provides a comprehensive suite of utilities for generating, validating, and managing BIP39 seed phrases. It is designed for advanced users who need to create secure wallets, derive keys, and manage their cryptographic assets offline.

## Features

- **Seed Phrase Generator**: Generate BIP39 compliant mnemonic phrases (12, 15, 18, 21, or 24 words).
- **Custom entropy** (inside the Seed Phrase Generator): mix in entropy from several sources:
  - **Text Input**: Manual text entry.
  - **File Input**: Upload files to use their binary data as entropy.
  - **Mouse Movements**: Capture cursor movements for randomness.
  - **Camera**: Use video feed noise as an entropy source.
- **Seed Validation**: Verify if a given seed phrase is valid and check its checksum.
- **Wallet Recovery**: Recover wallet details from an existing seed phrase.
- **Paper Wallet**: Generate a single-address Bitcoin paper wallet with BIP38-encrypted private keys. Supports Legacy (BIP44), P2SH-SegWit (BIP49), and Native SegWit (BIP84) on mainnet, testnet, or regtest. Printable layout with QR codes; root seed available in advanced section.
- **Key Derivation**: Derive keys and addresses for various standards:
  - **BIP44**: Legacy (P2PKH).
  - **BIP49**: Nested SegWit (P2SH-P2WPKH).
  - **BIP84**: Native SegWit (bech32).
- **Tiny Seed**: Convert BIP39 words to 11-bit binary grids and back. Validates checksums on complete phrases (12/15/18/21/24 words). Useful for recovering seeds from physical bit-grid backups.
- **Local Processing**: All sensitive operations, including seed generation and key derivation, are performed client-side. No private data is ever sent to a server.

## Security

This tool is designed for offline use. It is recommended to run this on a secure, air-gapped machine when generating real wallets for significant value.

- **Verified against official vectors**: BIP39 (trezor/python-mnemonic, 24 vectors), BIP32 vector 1, BIP84 and BIP49 published vectors and BIP38 vectors run in the test suite; a subset runs as a self-test before the tools open and disables them on failure.
- **Test networks** derive with coin type `1'` (BIP44 / SLIP-44): `m/84'/1'/0'` on testnet and regtest.
- **Paper wallets** are verified before display: the WIF, and the BIP38 key decrypted with the passphrase, must control the printed address.
- **Custom entropy** is used as the only source in that mode (the browser CSPRNG is not mixed in). The UI says so and flags obviously weak input.
- Secret fields disable spellcheck, autofill and password-manager capture; copied secrets are cleared from the clipboard after 30 seconds.
