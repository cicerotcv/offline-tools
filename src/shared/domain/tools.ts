/** Every tool the app ships, as a closed set (registry key and route owner). */
export const TOOL_IDS = [
  'hash',
  'encryption',
  'shamir',
  'password-generator',
  'seed-generation',
  'seed-validation',
  'wallet-recovery',
  'paper-wallet',
  'tiny-seed',
  'qr-code',
] as const;
export type ToolId = (typeof TOOL_IDS)[number];

/** Route of a tool; ids double as route segments under /tools. */
export type ToolPath = `/tools/${ToolId}`;

export const TOOL_CATEGORY_IDS = [
  'cryptography',
  'bitcoin',
  'utilities',
] as const;
export type ToolCategoryId = (typeof TOOL_CATEGORY_IDS)[number];

/**
 * `secret`: the tool handles seeds, keys, passwords or shares, so it gets the
 * privacy notice, secret-field hygiene and the sensitive-mode treatment.
 */
export const SENSITIVITY = ['public', 'secret'] as const;
export type Sensitivity = (typeof SENSITIVITY)[number];
