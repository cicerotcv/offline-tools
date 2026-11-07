import {
  CheckCircle2,
  Grid3x3,
  Hash,
  Key,
  KeyRound,
  Lock,
  type LucideIcon,
  QrCode,
  RotateCcw,
  Share2,
  Wallet,
} from 'lucide-react';

import type {
  Sensitivity,
  ToolCategoryId,
  ToolId,
  ToolPath,
} from '@/shared/domain/tools';

/**
 * Single source of truth for every tool: sidebar, catalog, landing index,
 * related-tool cards and the smoke tests read from here.
 */
export interface Tool {
  id: ToolId;
  category: ToolCategoryId;
  path: ToolPath;
  icon: LucideIcon;
  title: string;
  /** One line for related-tool cards. */
  summary: string;
  /** Page H1. */
  heading: string;
  /** <title> without the site suffix (30 to 50 characters). */
  seoTitle: string;
  /** Meta description (about 120 to 160 characters). */
  seoDescription: string;
  /** Opening paragraph shown on the page and in the static HTML. */
  intro: string;
  howTo: readonly string[];
  limits: readonly string[];
  /** Two sentences for the catalog. */
  description: string;
  sensitivity: Sensitivity;
  related: readonly ToolId[];
}

export interface ToolCategory {
  id: ToolCategoryId;
  title: string;
  description: string;
  tools: Tool[];
}

export const TOOLS: readonly Tool[] = [
  {
    id: 'hash',
    category: 'cryptography',
    path: '/tools/hash',
    icon: Hash,
    title: 'Hash Tool',
    summary: 'Verify a download against its checksum',
    heading: 'Hash Tool: SHA-256, SHA-512 and MD5',
    seoTitle: 'SHA-256, SHA-512 & MD5 Hash Checker',
    seoDescription:
      'Compute or verify SHA-256, SHA-512 and MD5 checksums for text, files or camera captures. Check file integrity before moving it to an offline machine.',
    intro:
      'Compute or verify SHA-256, SHA-512 and MD5 digests of text, files or camera captures. Use it to check a download against its published checksum before you move it to an offline machine.',
    howTo: [
      'Pick an algorithm. SHA-256 is the usual choice for downloads.',
      'Paste text, drop a file or capture an image with the camera.',
      'Switch to Verify and paste the published checksum to compare.',
    ],
    limits: [
      'MD5 is broken for security; use it only to match old checksums.',
      'Text is hashed as UTF-8 bytes, so a trailing space or line break changes the digest.',
    ],
    description:
      'Compute or verify SHA-256, SHA-512 and MD5 digests for text, files or camera captures. Check file integrity before moving it to an offline machine.',
    sensitivity: 'public',
    related: ['encryption', 'qr-code', 'seed-validation'],
  },
  {
    id: 'encryption',
    category: 'cryptography',
    path: '/tools/encryption',
    icon: Lock,
    title: 'Encryption Tool',
    summary: 'Encrypt files and text with OpenPGP',
    heading: 'OpenPGP Encryption with a Password',
    seoTitle: 'OpenPGP Password Encryption for Files & Text',
    seoDescription:
      'Encrypt and decrypt text or files with an OpenPGP password, offline in your browser. The armored output opens in GnuPG or any OpenPGP tool.',
    intro:
      'Encrypt and decrypt text or files with a password using OpenPGP. The result is a standard armored message that GnuPG and other OpenPGP tools can read.',
    howTo: [
      'Choose Encrypt or Decrypt, then text or file.',
      'Enter a strong password. Anyone who has it can decrypt.',
      'Copy the armored message or download the encrypted file.',
    ],
    limits: [
      'There is no password recovery: a lost password means lost data.',
      'Only password-based encryption is supported, not public keys.',
      'Keep the encrypted data and the password in separate places.',
    ],
    description:
      'Encrypt and decrypt text or files with an OpenPGP password. The output is a standard armored message any OpenPGP tool can read.',
    sensitivity: 'secret',
    related: ['shamir', 'password-generator', 'hash'],
  },
  {
    id: 'shamir',
    category: 'cryptography',
    path: '/tools/shamir',
    icon: Share2,
    title: "Shamir's Secret Sharing",
    summary: 'Split a secret into M-of-N shares',
    heading: "Shamir's Secret Sharing",
    seoTitle: "Shamir's Secret Sharing: Split a Secret",
    seoDescription:
      'Split a secret into N shares so that any M of them rebuild it, offline in your browser. Fewer than M shares reveal nothing about the secret.',
    intro:
      'Split a secret into N shares so that any M of them reconstruct it. The secret is sealed with AES-256-GCM under a random key and only the key is split, so fewer than M shares reveal nothing and a damaged share can never yield a wrong secret.',
    howTo: [
      'Enter the secret and choose the number of shares (N) and how many recover it (M).',
      'Give each share, as text, a printed card or a laser-engraved plate (SVG export), to a different person or place.',
      'To recover, paste or type at least M shares; each line is checked as you go.',
    ],
    limits: [
      "New shares use this tool's authenticated format (v3, AES-256-GCM) and older v2 shares still open; neither works with ssss or SLIP-39.",
      'Every share carries the encrypted secret: up to 16 KB as text, up to 222 bytes on a card or plate (any 24-word BIP39 phrase fits).',
      'If more than N minus M shares are lost, the secret cannot be recovered.',
    ],
    description:
      'Split a secret into N shares so that any M of them reconstruct it. Fewer shares reveal nothing about the secret.',
    sensitivity: 'secret',
    related: ['seed-generation', 'encryption', 'qr-code'],
  },
  {
    id: 'password-generator',
    category: 'cryptography',
    path: '/tools/password-generator',
    icon: KeyRound,
    title: 'Password Generator',
    summary: 'Generate a strong random password',
    heading: 'Random Password Generator',
    seoTitle: 'Strong Random Password Generator',
    seoDescription:
      "Generate strong random passwords from your browser's CSPRNG, offline. Pick the length (4 to 128) and character sets, and optionally mix in mouse movement.",
    intro:
      "Generate random passwords from the browser's cryptographic random generator, with a length from 4 to 128 characters and the character sets you choose.",
    howTo: [
      'A password is ready as soon as the page opens.',
      'Adjust the length and the character sets; it regenerates as you change them.',
      'Copy it, or open Advanced options to exclude characters or mix in mouse movement.',
    ],
    limits: [
      'Mouse movement is mixed in, never used instead of the random generator.',
      'The strength estimate assumes a random password, not one chosen by a person.',
    ],
    description:
      'Generate random passwords from the browser CSPRNG with configurable character sets. Optionally mix in mouse movement.',
    sensitivity: 'secret',
    related: ['encryption', 'paper-wallet', 'seed-generation'],
  },
  {
    id: 'seed-generation',
    category: 'bitcoin',
    path: '/tools/seed-generation',
    icon: Key,
    title: 'Seed Generation',
    summary: 'Create a new BIP39 seed phrase',
    heading: 'BIP39 Seed Phrase Generator',
    seoTitle: 'BIP39 Seed Phrase Generator, Offline',
    seoDescription:
      'Generate a 12 to 24 word BIP39 seed phrase from secure random bytes or your own entropy, offline. Back it up and verify the backup before use.',
    intro:
      'Generate a BIP39 seed phrase of 12 to 24 words from secure random bytes, or from your own entropy such as dice rolls, then back it up and verify the backup.',
    howTo: [
      'Choose random generation or custom entropy and the number of words.',
      'Write the words down in order, on paper or metal.',
      'Re-type the requested words to prove the backup before you use the seed.',
    ],
    limits: [
      'In custom entropy mode the seed is exactly as random as your input; the browser generator is not used.',
      'Collected sources (text, file, mouse, camera) are each hashed with SHA-256 and mixed; prefer several independent ones.',
      'Anyone who sees the words controls the funds. Never photograph them or type them on an online device.',
    ],
    description:
      'Generate a BIP39 seed phrase from secure random bytes or your own entropy, back it up and verify the backup.',
    sensitivity: 'secret',
    related: ['seed-validation', 'paper-wallet', 'tiny-seed'],
  },
  {
    id: 'seed-validation',
    category: 'bitcoin',
    path: '/tools/seed-validation',
    icon: CheckCircle2,
    title: 'Seed Validation',
    summary: 'Check a phrase and its checksum',
    heading: 'BIP39 Seed Phrase Validator',
    seoTitle: 'BIP39 Seed Phrase Checksum Validator',
    seoDescription:
      'Check that a BIP39 seed phrase uses valid wordlist words and has a correct checksum. Runs offline in your browser; nothing is sent anywhere.',
    intro:
      'Check that a BIP39 seed phrase uses words from the English wordlist and has a valid checksum, to catch typos in a written backup.',
    howTo: [
      'Type or paste the phrase; words autocomplete from the wordlist.',
      'The verdict updates as you type: unknown word, wrong length or wrong checksum.',
      'Fix the flagged words until the phrase shows as valid.',
    ],
    limits: [
      'A valid checksum means the phrase is well formed, not that it opens the wallet you expect.',
      'Only the English BIP39 wordlist is supported.',
    ],
    description:
      'Check that a BIP39 seed phrase uses valid words and has a correct checksum.',
    sensitivity: 'secret',
    related: ['seed-generation', 'wallet-recovery', 'tiny-seed'],
  },
  {
    id: 'wallet-recovery',
    category: 'bitcoin',
    path: '/tools/wallet-recovery',
    icon: RotateCcw,
    title: 'Wallet Recovery',
    summary: 'Derive addresses and keys from a seed',
    heading: 'BIP39 Wallet Recovery',
    seoTitle: 'BIP39 Wallet Recovery: Derive Addresses',
    seoDescription:
      'Derive Bitcoin addresses and keys from a BIP39 phrase, master seed or xpub/xprv, with passphrase and BIP44, BIP49 and BIP84 paths. Offline.',
    intro:
      'Derive Bitcoin addresses and keys from a BIP39 phrase, a master seed or an extended key, with an optional passphrase and BIP44, BIP49 or BIP84 paths.',
    howTo: [
      'Enter the phrase, the master seed in hex, or an xpub or xprv.',
      'Add the passphrase if the wallet uses one, then pick the network and path.',
      'Compare the derived addresses with the ones your wallet shows.',
    ],
    limits: [
      'A wrong passphrase still produces valid-looking addresses, so check that they match.',
      "Testnet and regtest use coin type 1', as BIP44 requires.",
    ],
    description:
      'Recover addresses and keys from a BIP39 phrase, a master seed or an extended key. Supports passphrases and BIP44, BIP49 and BIP84.',
    sensitivity: 'secret',
    related: ['seed-validation', 'paper-wallet', 'seed-generation'],
  },
  {
    id: 'paper-wallet',
    category: 'bitcoin',
    path: '/tools/paper-wallet',
    icon: Wallet,
    title: 'Paper Wallet Generator',
    summary: 'Print a BIP38-encrypted paper wallet',
    heading: 'Bitcoin Paper Wallet Generator',
    seoTitle: 'BIP38 Bitcoin Paper Wallet Generator',
    seoDescription:
      'Generate a printable single-address Bitcoin paper wallet with a BIP38-encrypted private key, in Legacy, SegWit or Native SegWit. Offline.',
    intro:
      'Generate a printable single-address Bitcoin paper wallet. The private key can be encrypted with BIP38, and the printed key is checked against the address before it is shown.',
    howTo: [
      'Choose the address type and set the BIP38 passphrase that encrypts the key.',
      'Print the wallet on a printer that is not connected to a network.',
      'Send a small test amount first, then keep the paper and the passphrase in separate places.',
    ],
    limits: [
      'A paper wallet holds one address; spend the whole balance at once.',
      'BIP38 encryption takes a few seconds; that slowness is what protects the key.',
    ],
    description:
      'Generate a single-address paper wallet with a BIP38-encrypted private key, in Legacy, SegWit or Native SegWit, ready to print.',
    sensitivity: 'secret',
    related: ['seed-generation', 'wallet-recovery', 'seed-validation'],
  },
  {
    id: 'tiny-seed',
    category: 'bitcoin',
    path: '/tools/tiny-seed',
    icon: Grid3x3,
    title: 'Tiny Seed Tool',
    summary: 'Convert words to a punchable bit grid',
    heading: 'Tiny Seed: BIP39 Words to Bit Grid',
    seoTitle: 'Tiny Seed: BIP39 Words to Bit Grid',
    seoDescription:
      'Convert BIP39 words to 11-bit grids for punched metal backups and back again, validating the checksum of complete phrases. Runs offline.',
    intro:
      'Convert BIP39 words to the 11-bit binary grid used by punched metal backups, and back again, validating the checksum once the phrase is complete.',
    howTo: [
      'Enter the words, or mark the bits of each row.',
      'Copy the grid onto the metal plate.',
      'Read the plate back into words to confirm it matches.',
    ],
    limits: [
      'Bits must be punched exactly; one wrong bit changes the word.',
      'Checksum validation only applies to complete phrases.',
    ],
    description:
      'Convert BIP39 words to 11-bit grids for metal backups and back, validating the checksum of complete phrases.',
    sensitivity: 'secret',
    related: ['seed-validation', 'seed-generation', 'wallet-recovery'],
  },
  {
    id: 'qr-code',
    category: 'utilities',
    path: '/tools/qr-code',
    icon: QrCode,
    title: 'QR Code Generator',
    summary: 'Move data across the air gap',
    heading: 'QR Code Generator and Scanner',
    seoTitle: 'Offline QR Code Generator & Scanner',
    seoDescription:
      'Generate and scan QR codes to carry addresses, public keys or checksums between machines across an air gap, without a network.',
    intro:
      'Generate and scan QR codes to move addresses, public keys or checksums between machines without a network connection.',
    howTo: [
      'Type the text to encode and adjust the size and error correction.',
      'Download the image or show it on screen.',
      'To read a code, scan it with the camera or load an image.',
    ],
    limits: [
      'Never put a seed phrase or private key in a QR code that leaves your control.',
      'Very long text produces dense codes that are hard to scan.',
    ],
    description:
      'Generate and scan QR codes to carry addresses, public keys or checksums between machines without a network.',
    sensitivity: 'public',
    related: ['hash', 'wallet-recovery', 'shamir'],
  },
];

const CATEGORY_COPY: Record<
  ToolCategoryId,
  Pick<ToolCategory, 'title' | 'description'>
> = {
  cryptography: {
    title: 'Cryptography',
    description: 'Hashing, encryption and secret sharing',
  },
  bitcoin: {
    title: 'Bitcoin',
    description: 'BIP39 seed phrases, key derivation and paper wallets',
  },
  utilities: {
    title: 'Utilities',
    description: 'Move data across the air gap with QR codes',
  },
};

export const toolCategories: ToolCategory[] = (
  Object.keys(CATEGORY_COPY) as ToolCategoryId[]
).map((id) => ({
  id,
  ...CATEGORY_COPY[id],
  tools: TOOLS.filter((tool) => tool.category === id),
}));

const TOOLS_BY_ID = new Map(TOOLS.map((tool) => [tool.id, tool]));

export function getTool(id: ToolId): Tool {
  const tool = TOOLS_BY_ID.get(id);
  if (!tool) throw new Error(`Unknown tool: ${id}`);
  return tool;
}
