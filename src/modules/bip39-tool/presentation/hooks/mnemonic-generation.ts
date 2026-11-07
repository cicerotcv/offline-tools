import { useCallback, useMemo, useRef, useState } from 'react';

import {
  makeGenerateMnemonicUseCase,
  makeMnemonicFromEntropyUseCase,
} from '../../application/bip39-tool.factory';
import type { GenerationMode, WordCount } from '../../domain/bitcoin/config';
import { getWordCountConfig } from '../../domain/mnemonic/word-counts';
import { parseHexEntropy, validateEntropyLength } from '../../lib/mnemonic';

export interface GenerateParams {
  generationMode: GenerationMode;
  wordCount: WordCount;
  customEntropy: string;
  passphrase: string;
  mouseEntropy?: Uint8Array;
}

interface UseMnemonicGenerationReturn {
  generationMode: GenerationMode;
  wordCount: WordCount;
  customEntropy: string;
  passphrase: string;
  mnemonic: string;
  isGenerating: boolean;
  error: string;
  setGenerationMode: (mode: GenerationMode) => void;
  setWordCount: (count: WordCount) => void;
  setCustomEntropy: (entropy: string) => void;
  setPassphrase: (passphrase: string) => void;
  handleGenerate: (mouseEntropy?: Uint8Array) => Promise<boolean>;
  generateWithParams: (params: GenerateParams) => Promise<boolean>;
  clearMnemonic: () => void;
}

export function useMnemonicGeneration(): UseMnemonicGenerationReturn {
  const generateMnemonicUseCase = useMemo(
    () => makeGenerateMnemonicUseCase(),
    []
  );
  const mnemonicFromEntropyUseCase = useMemo(
    () => makeMnemonicFromEntropyUseCase(),
    []
  );
  const [generationMode, setGenerationMode] =
    useState<GenerationMode>('random');
  const [wordCount, setWordCount] = useState<WordCount>(12);
  const [customEntropy, setCustomEntropy] = useState('');
  const [passphrase, setPassphrase] = useState('');
  const [mnemonic, setMnemonic] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState('');
  const isGeneratingRef = useRef(false);

  const generateWithParams = useCallback(
    async (params: GenerateParams): Promise<boolean> => {
      setGenerationMode(params.generationMode);
      setWordCount(params.wordCount);
      setCustomEntropy(params.customEntropy);
      setPassphrase(params.passphrase);

      setIsGenerating(true);
      isGeneratingRef.current = true;
      setError('');

      try {
        let newMnemonic: string;
        const config = getWordCountConfig(params.wordCount);

        if (params.generationMode === 'random') {
          newMnemonic = await generateMnemonicUseCase.execute({
            wordCount: params.wordCount,
            extraEntropy: params.mouseEntropy,
          });
        } else {
          if (!params.customEntropy.trim()) {
            setError('Please enter entropy');
            return false;
          }

          try {
            const parsedEntropy = parseHexEntropy(params.customEntropy);
            if (!validateEntropyLength(parsedEntropy, params.wordCount)) {
              setError(
                `Invalid entropy length. Need at least ${config.entropyHexLength} hex characters (${config.entropyBits} bits), got ${parsedEntropy.length * 2} characters.`
              );
              return false;
            }
            newMnemonic = await mnemonicFromEntropyUseCase.execute({
              entropy: parsedEntropy,
              wordCount: params.wordCount,
            });
          } catch (err) {
            setError(
              err instanceof Error ? err.message : 'Invalid entropy format'
            );
            return false;
          }
        }

        setMnemonic(newMnemonic);
        return true;
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Generation failed');
        return false;
      } finally {
        setIsGenerating(false);
        isGeneratingRef.current = false;
      }
    },
    [generateMnemonicUseCase, mnemonicFromEntropyUseCase]
  );

  const handleGenerate = useCallback(
    async (mouseEntropy?: Uint8Array): Promise<boolean> => {
      return generateWithParams({
        generationMode,
        wordCount,
        customEntropy,
        passphrase,
        mouseEntropy,
      });
    },
    [generationMode, wordCount, customEntropy, passphrase, generateWithParams]
  );

  const clearMnemonic = useCallback(() => {
    setMnemonic('');
    setError('');
  }, []);

  return {
    generationMode,
    wordCount,
    customEntropy,
    passphrase,
    mnemonic,
    isGenerating,
    error,
    setGenerationMode,
    setWordCount,
    setCustomEntropy,
    setPassphrase,
    handleGenerate,
    generateWithParams,
    clearMnemonic,
  };
}
