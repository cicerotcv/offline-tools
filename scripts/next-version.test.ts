import { describe, expect, it } from 'vitest';

import { bump, isHigher } from './next-version.mjs';

describe('next-version', () => {
  it('bumps patch, minor and major', () => {
    expect(bump('1.2.3', 'patch')).toBe('1.2.4');
    expect(bump('1.2.3', 'minor')).toBe('1.3.0');
    expect(bump('1.2.3', 'major')).toBe('2.0.0');
    expect(() => bump('1.2', 'patch')).toThrow();
    expect(() => bump('1.2.3', 'huge')).toThrow();
  });

  it('treats only a strictly higher version as a release', () => {
    expect(isHigher('1.0.1', '1.0.0')).toBe(true);
    expect(isHigher('2.0.0', '1.9.9')).toBe(true);
    expect(isHigher('1.0.0', '1.0.0')).toBe(false);
    expect(isHigher('0.0.0', '1.0.0')).toBe(false);
    expect(isHigher('1.0.0', '')).toBe(true);
  });
});
