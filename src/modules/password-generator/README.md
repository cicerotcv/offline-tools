# Password Generator Tool

width: 100%
name: password-generator

## Overview

The Password Generator Tool is designed to create strong, cryptographically secure passwords locally in your browser. It offers advanced customization options and an optional entropy collection feature to ensure maximum randomness and security.

## Features

- **Secure Generation**: Uses the Web Crypto API for cryptographically secure random number generation.
- **Customizable Logic**:
  - **Length**: Set password length from 4 to 128 characters.
  - **Character Sets**: Toggle uppercase, lowercase, numbers, and symbols.
  - **Readability**: Options to exclude similar characters (e.g., i, l, 1, L, o, 0, O) and ambiguous characters (symbols that are hard to distinguish).
- **Mouse Entropy**: Increase randomness by capturing mouse movements to seed the generator, providing true user-derived entropy.
- **Strength Indicator**: Visual feedback on the strength of your generated passwords (implied feature).
- **Local Privacy**: All operations happen on your device. No passwords are generated on or sent to any server.

## Security Advice

- **Use Long Passwords**: We recommend at least 16 characters used with a password manager.
- **Mix Character Types**: Including symbols and numbers significantly increases entropy.
- **Do Not Reuse**: Always generate unique passwords for every service.
