import { describe, expect, it } from 'vitest';

import { SELF_TESTS } from './self-tests';

describe('tool self-tests', () => {
  it.each(Object.entries(SELF_TESTS))(
    '%s passes in a healthy runtime',
    async (_id, selfTest) => {
      await expect(selfTest!.run()).resolves.toBeUndefined();
    },
    60_000
  );
});
