import { useCallback, useState } from 'react';

import {
  collectCameraEntropy,
  collectFileEntropy,
  collectTextEntropy,
  combineEntropy,
} from '../../lib/entropy';

export type EntropySource = 'text' | 'file' | 'mouse' | 'camera';

interface EntropySourceData {
  name: string;
  entropy: Uint8Array | null;
}

interface UseEntropyCollectorOptions {
  autoCombine?: boolean;
}

interface UseEntropyCollectorReturn {
  // State
  textEntropy: Uint8Array | null;
  fileEntropy: Uint8Array | null;
  mouseEntropy: Uint8Array | null;
  cameraEntropy: Uint8Array | null;
  combinedEntropy: Uint8Array | null;
  isProcessing: boolean;
  error: string;

  // Entropy sources array
  sources: EntropySourceData[];

  // Actions
  collectTextEntropy: (text: string) => Promise<void>;
  collectFileEntropy: (file: File) => Promise<void>;
  collectMouseEntropy: (entropy: Uint8Array) => Promise<void>;
  collectCameraEntropy: (blob: Blob) => Promise<void>;
  combineAllEntropy: () => Promise<void>;
  clearAll: () => void;
  clearSource: (source: EntropySource) => void;
  getCombinedEntropy: () => Promise<Uint8Array | null>;
}

/**
 * Reusable hook for collecting and combining entropy from multiple sources
 * Can be used in entropy generation, seed generation, or any module that needs entropy
 *
 * @param options - Configuration options
 * @param options.autoCombine - Automatically combine entropy when sources are collected (default: false)
 * @returns Object with entropy state and collection methods
 */
export function useEntropyCollector(
  options: UseEntropyCollectorOptions = {}
): UseEntropyCollectorReturn {
  const { autoCombine = false } = options;

  const [textEntropy, setTextEntropy] = useState<Uint8Array | null>(null);
  const [fileEntropy, setFileEntropy] = useState<Uint8Array | null>(null);
  const [mouseEntropy, setMouseEntropy] = useState<Uint8Array | null>(null);
  const [cameraEntropy, setCameraEntropy] = useState<Uint8Array | null>(null);
  const [combinedEntropy, setCombinedEntropy] = useState<Uint8Array | null>(
    null
  );

  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState('');

  const sources: EntropySourceData[] = [
    { name: 'Text', entropy: textEntropy },
    { name: 'File', entropy: fileEntropy },
    { name: 'Mouse', entropy: mouseEntropy },
    { name: 'Camera', entropy: cameraEntropy },
  ];

  // Collect text entropy
  const handleCollectTextEntropy = useCallback(
    async (text: string) => {
      if (!text.trim()) {
        setError('Text input is required');
        return;
      }

      try {
        setIsProcessing(true);
        setError('');
        const entropy = await collectTextEntropy(text);
        setTextEntropy(entropy);
        setCombinedEntropy(null); // Clear combined entropy when new source is added

        // Auto-combine if enabled
        if (autoCombine) {
          const activeEntropies = [
            entropy,
            fileEntropy,
            mouseEntropy,
            cameraEntropy,
          ].filter((e): e is Uint8Array => e !== null);

          if (activeEntropies.length > 0) {
            const combined = await combineEntropy(activeEntropies);
            setCombinedEntropy(combined);
          }
        }
      } catch (err) {
        setError(
          err instanceof Error ? err.message : 'Failed to collect text entropy'
        );
      } finally {
        setIsProcessing(false);
      }
    },
    [autoCombine, fileEntropy, mouseEntropy, cameraEntropy]
  );

  // Collect file entropy
  const handleCollectFileEntropy = useCallback(
    async (file: File) => {
      try {
        setIsProcessing(true);
        setError('');
        const entropy = await collectFileEntropy(file);
        setFileEntropy(entropy);
        setCombinedEntropy(null); // Clear combined entropy when new source is added

        // Auto-combine if enabled
        if (autoCombine) {
          const activeEntropies = [
            textEntropy,
            entropy,
            mouseEntropy,
            cameraEntropy,
          ].filter((e): e is Uint8Array => e !== null);

          if (activeEntropies.length > 0) {
            const combined = await combineEntropy(activeEntropies);
            setCombinedEntropy(combined);
          }
        }
      } catch (err) {
        setError(
          err instanceof Error ? err.message : 'Failed to collect file entropy'
        );
      } finally {
        setIsProcessing(false);
      }
    },
    [autoCombine, textEntropy, mouseEntropy, cameraEntropy]
  );

  // Collect mouse entropy
  const handleCollectMouseEntropy = useCallback(
    async (entropy: Uint8Array) => {
      try {
        setIsProcessing(true);
        setError('');
        // Entropy is already collected and hashed by the component
        setMouseEntropy(entropy);
        setCombinedEntropy(null); // Clear combined entropy when new source is added

        // Auto-combine if enabled
        if (autoCombine) {
          const activeEntropies = [
            textEntropy,
            fileEntropy,
            entropy,
            cameraEntropy,
          ].filter((e): e is Uint8Array => e !== null);

          if (activeEntropies.length > 0) {
            const combined = await combineEntropy(activeEntropies);
            setCombinedEntropy(combined);
          }
        }
      } catch (err) {
        setError(
          err instanceof Error ? err.message : 'Failed to collect mouse entropy'
        );
      } finally {
        setIsProcessing(false);
      }
    },
    [autoCombine, textEntropy, fileEntropy, cameraEntropy]
  );

  // Collect camera entropy
  const handleCollectCameraEntropy = useCallback(
    async (blob: Blob) => {
      try {
        setIsProcessing(true);
        setError('');
        const entropy = await collectCameraEntropy(blob);
        setCameraEntropy(entropy);
        setCombinedEntropy(null); // Clear combined entropy when new source is added

        // Auto-combine if enabled
        if (autoCombine) {
          const activeEntropies = [
            textEntropy,
            fileEntropy,
            mouseEntropy,
            entropy,
          ].filter((e): e is Uint8Array => e !== null);

          if (activeEntropies.length > 0) {
            const combined = await combineEntropy(activeEntropies);
            setCombinedEntropy(combined);
          }
        }
      } catch (err) {
        setError(
          err instanceof Error
            ? err.message
            : 'Failed to collect camera entropy'
        );
      } finally {
        setIsProcessing(false);
      }
    },
    [autoCombine, textEntropy, fileEntropy, mouseEntropy]
  );

  // Combine all entropy sources
  const handleCombineAllEntropy = useCallback(async () => {
    const activeEntropies = [
      textEntropy,
      fileEntropy,
      mouseEntropy,
      cameraEntropy,
    ].filter((e): e is Uint8Array => e !== null);

    if (activeEntropies.length === 0) {
      setError('At least one entropy source is required');
      return;
    }

    try {
      setIsProcessing(true);
      setError('');
      const combined = await combineEntropy(activeEntropies);
      setCombinedEntropy(combined);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'Failed to combine entropy sources'
      );
    } finally {
      setIsProcessing(false);
    }
  }, [textEntropy, fileEntropy, mouseEntropy, cameraEntropy]);

  // Get combined entropy (combines if not already combined)
  const getCombinedEntropy =
    useCallback(async (): Promise<Uint8Array | null> => {
      if (combinedEntropy) {
        return combinedEntropy;
      }

      const activeEntropies = [
        textEntropy,
        fileEntropy,
        mouseEntropy,
        cameraEntropy,
      ].filter((e): e is Uint8Array => e !== null);

      if (activeEntropies.length === 0) {
        return null;
      }

      try {
        const combined = await combineEntropy(activeEntropies);
        setCombinedEntropy(combined);
        return combined;
      } catch (err) {
        setError(
          err instanceof Error
            ? err.message
            : 'Failed to combine entropy sources'
        );
        return null;
      }
    }, [
      combinedEntropy,
      textEntropy,
      fileEntropy,
      mouseEntropy,
      cameraEntropy,
    ]);

  // Clear all entropy
  const handleClearAll = useCallback(() => {
    setTextEntropy(null);
    setFileEntropy(null);
    setMouseEntropy(null);
    setCameraEntropy(null);
    setCombinedEntropy(null);
    setError('');
  }, []);

  // Clear specific source
  const handleClearSource = useCallback((source: EntropySource) => {
    switch (source) {
      case 'text':
        setTextEntropy(null);
        break;
      case 'file':
        setFileEntropy(null);
        break;
      case 'mouse':
        setMouseEntropy(null);
        break;
      case 'camera':
        setCameraEntropy(null);
        break;
    }
    setCombinedEntropy(null); // Clear combined when any source is cleared
  }, []);

  return {
    // State
    textEntropy,
    fileEntropy,
    mouseEntropy,
    cameraEntropy,
    combinedEntropy,
    isProcessing,
    error,
    sources,

    // Actions
    collectTextEntropy: handleCollectTextEntropy,
    collectFileEntropy: handleCollectFileEntropy,
    collectMouseEntropy: handleCollectMouseEntropy,
    collectCameraEntropy: handleCollectCameraEntropy,
    combineAllEntropy: handleCombineAllEntropy,
    clearAll: handleClearAll,
    clearSource: handleClearSource,
    getCombinedEntropy,
  };
}
