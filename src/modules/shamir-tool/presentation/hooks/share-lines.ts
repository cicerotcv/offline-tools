import { useMemo } from 'react';

import { analyzeShareLines } from '../../lib/encoding';

/** Live classification of the pasted share lines. */
export function useShareLines(text: string) {
  return useMemo(() => analyzeShareLines(text), [text]);
}
