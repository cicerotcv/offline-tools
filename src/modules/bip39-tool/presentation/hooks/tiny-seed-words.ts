import { useMemo } from 'react';

import {
  analyzeMnemonicWords,
  type MnemonicAnalysis,
  parseMnemonicInput,
} from '../../lib/mnemonic';

export type {
  ChecksumStatus,
  MnemonicAnalysis as TinySeedAnalysis,
  WordCountStatus,
} from '../../lib/mnemonic';
export { analyzeMnemonicWords as analyzeTinySeedWords } from '../../lib/mnemonic';

export function useTinySeedWords(input: string): MnemonicAnalysis {
  return useMemo(
    () => analyzeMnemonicWords(parseMnemonicInput(input)),
    [input]
  );
}
