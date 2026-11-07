import { useCallback, useEffect, useMemo, useState } from 'react';

import { useDebounceState } from '@/shared/presentation/hooks/debounce-state';

import { makeComputeDigestUseCase } from '../../application/hash-tool.factory';
import { type Algorithm } from '../../domain/hash/algorithm';

export type HashContent = string | File | Blob | null;

interface UseHashContentOptions {
  content: HashContent;
  algorithm: Algorithm;
  debounceDelay?: number;
  enabled?: boolean;
}

interface UseHashContentReturn {
  hash: string;
  isProcessing: boolean;
  error: string | null;
}

/**
 * Custom hook that computes hash for various content types (text, file, blob)
 * @param content - The content to hash (string for text, File or Blob for binary)
 * @param algorithm - The hash algorithm to use
 * @param debounceDelay - Debounce delay for text input (default: 300ms)
 * @param enabled - Whether hash computation is enabled (default: true)
 * @returns Object containing hash output, processing state, and error
 */
export function useHashContent({
  content,
  algorithm,
  debounceDelay = 300,
  enabled = true,
}: UseHashContentOptions): UseHashContentReturn {
  const computeDigestUseCase = useMemo(() => makeComputeDigestUseCase(), []);
  const [hash, setHash] = useState<string>('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // For text content, use debounced value
  const isTextContent = typeof content === 'string';
  const [textInput, setTextInput, debouncedTextInput] = useDebounceState(
    isTextContent ? content : '',
    debounceDelay
  );

  // Update text input when content changes (for text mode)
  useEffect(() => {
    if (isTextContent && content !== textInput) {
      setTextInput(content);
    }
  }, [content, isTextContent, textInput, setTextInput]);

  // Compute hash function
  const computeHash = useCallback(
    async (data: ArrayBuffer, algo: Algorithm) => {
      try {
        setIsProcessing(true);
        setError(null);
        const hashHex = await computeDigestUseCase.execute({
          data: new Uint8Array(data),
          algorithm: algo,
        });
        setHash(hashHex);
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : 'Error computing hash';
        setError(errorMessage);
        setHash('');
      } finally {
        setIsProcessing(false);
      }
    },
    [computeDigestUseCase]
  );

  // Handle text content hashing with debounce
  useEffect(() => {
    if (!enabled || !isTextContent) return;

    let cancelled = false;

    const hashText = async () => {
      if (!debouncedTextInput.trim()) {
        if (!cancelled) {
          setHash('');
          setError(null);
        }
        return;
      }

      const encoder = new TextEncoder();
      const uint8Array = encoder.encode(debouncedTextInput);
      const data = uint8Array.buffer;
      await computeHash(data, algorithm);

      if (cancelled) {
        setIsProcessing(false);
      }
    };

    hashText();

    return () => {
      cancelled = true;
    };
  }, [debouncedTextInput, algorithm, enabled, isTextContent, computeHash]);

  // Handle file/blob content hashing
  useEffect(() => {
    if (!enabled || isTextContent || !content) {
      // Clear hash when disabled or content is cleared
      if (!enabled || !content) {
        setHash('');
        setError(null);
        setIsProcessing(false);
      }
      return;
    }

    let cancelled = false;

    const hashContent = async () => {
      try {
        let arrayBuffer: ArrayBuffer;

        if (content instanceof File || content instanceof Blob) {
          arrayBuffer = await content.arrayBuffer();
        } else {
          return;
        }

        if (!cancelled) {
          await computeHash(arrayBuffer, algorithm);
        }
      } catch (err) {
        if (!cancelled) {
          const errorMessage =
            err instanceof Error
              ? err.message
              : 'Error reading file or processing content';
          setError(errorMessage);
          setHash('');
          setIsProcessing(false);
        }
      }
    };

    hashContent();

    return () => {
      cancelled = true;
    };
  }, [content, algorithm, enabled, isTextContent, computeHash]);

  return {
    hash,
    isProcessing,
    error,
  };
}
