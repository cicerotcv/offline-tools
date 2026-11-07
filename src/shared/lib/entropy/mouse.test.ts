import { describe, expect, it } from 'vitest';

import { mouseEntropyFromSamples } from './mouse';

describe('mouseEntropyFromSamples', () => {
  it('hashes samples to 32 bytes', async () => {
    const entropy = await mouseEntropyFromSamples([
      { x: 10, y: 20, timestamp: 1_730_900_000_123 },
    ]);
    expect(entropy).toHaveLength(32);
  });

  it('keeps millisecond timestamp precision (Float64, not Float32)', async () => {
    const base = { x: 10, y: 20 };
    const a = await mouseEntropyFromSamples([
      { ...base, timestamp: 1_730_900_000_123 },
    ]);
    const b = await mouseEntropyFromSamples([
      { ...base, timestamp: 1_730_900_000_124 },
    ]);
    expect(Array.from(a)).not.toEqual(Array.from(b));
  });

  it('rejects empty input', async () => {
    await expect(mouseEntropyFromSamples([])).rejects.toThrow();
  });
});
