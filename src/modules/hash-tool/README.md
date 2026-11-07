# Hash Tool

## Overview

The Hash Tool computes cryptographic digests for text, files, and camera captures. It supports SHA-256, SHA-512, and MD5, with real-time updates as you type or select input. All processing runs locally in the browser.

## Features

- **Input sources**
  - **Text**: Type or paste a string; hash updates automatically (debounced).
  - **File**: Upload any file to verify downloads or compare release checksums.
  - **Camera**: Capture a photo and hash its PNG bytes for offline fingerprinting.
- **Algorithms**
  - **SHA-256**: Recommended default for integrity checks.
  - **SHA-512**: Longer, stronger digest.
  - **MD5**: Legacy support only — not suitable for security-sensitive use.
- **Output**
  - Lowercase or uppercase hex display and copy.
  - Download digest as a `.txt` file.
  - Input metadata (size, filename) shown alongside the result.
- **Verify mode**
  - Paste an expected hash and compare against computed digest automatically.
  - Accepts `sha256sum` lines, `0x` prefix, and algorithm labels.
  - Side-by-side display when digests differ.
- **Related tools**: Quick links to HMAC, Base64, and JSON formatter.

## Security

- No data is sent to external servers.
- SHA-256 and SHA-512 use the Web Crypto API; MD5 uses a local JS library over the raw bytes (verified for all 256 byte values and non-ASCII text).
- NIST (SHA-2) and RFC 1321 (MD5) vectors run in the test suite and as a self-test before the tool opens.
- MD5 is flagged in the UI as legacy — prefer SHA-256 or SHA-512 for security.

## Usage

1. Choose a hash algorithm (SHA-256 recommended).
2. **Compute**: select input source, provide content, copy or download the digest.
3. **Verify**: provide the same input, paste the expected hash from release notes or `sha256sum`, and confirm the match result.
4. Toggle uppercase hex in Compute mode if your checksum reference uses capitals.
