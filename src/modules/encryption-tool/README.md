# Encryption Tool

width: 100%
name: encryption-tool

## Overview

The Encryption Tool enables users to securely encrypt and decrypt text and files using advanced cryptographic standards. It is designed to run entirely in the browser, ensuring that user data never leaves the device.

## Features

- **File & Text Encryption**: Encrypt both plain text messages and files of any type.
- **Standardized Security**: Uses the **OpenPGP** standard (RFC 4880), ensuring strong, industry-proven security.
- **Interoperability**: Encrypted messages and files are compatible with other PGP tools (e.g., GnuPG, Kleopatra).
- **Secure Key Derivation**: Automatically uses OpenPGP's String-to-Key (S2K) mechanisms to securely derive keys from passwords.
- **Portability**: Text output uses ASCII Armor, making it easy to copy-paste or share via email/chat.
- **Metadata Handling**: Filenames are securely embedded within the encrypted message.
- **Local Processing**: All cryptographic operations occur client-side. No data or passwords are transmitted to any server.

## Security

- **No Backdoor**: If the password is lost, the data is unrecoverable.
- **Client-Side Only**: Does not rely on server-side processing, providing privacy and security.
- **Open Standards**: Built on the auditor-friendly `openpgp` library (password-based OpenPGP messages, readable by any OpenPGP tool).
- **Tamper detection**: altered ciphertext is rejected instead of decrypting to modified plaintext (covered by tests).
- **Self-test**: a fixed OpenPGP message is decrypted before the tool opens.

## Usage

1.  **Encrypt**: Select 'Encrypt' mode, input your text or file, set a strong password, and click encrypt. The result will be a standard PGP message (ASCII Armored).
2.  **Decrypt**: Select 'Decrypt' mode, paste the PGP message or upload the `.gpg`/`.asc` file, enter the original password, and click decrypt.
