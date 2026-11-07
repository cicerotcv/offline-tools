import { useEffect, useRef, useState } from 'react';

interface UseAsyncMemoOptions<T> {
  /**
   * Async function to compute the value
   */
  fn: () => Promise<T>;
  /**
   * Dependencies array (similar to useMemo/useEffect)
   */
  deps: React.DependencyList;
  /**
   * Initial value while loading
   */
  initialValue?: T | null;
  /**
   * Whether to skip the computation if dependencies haven't changed
   */
  enabled?: boolean;
}

interface UseAsyncMemoReturn<T> {
  /**
   * The computed value (null while loading or on error)
   */
  value: T | null;
  /**
   * Whether the async operation is in progress
   */
  isLoading: boolean;
  /**
   * Error if the async operation failed
   */
  error: Error | null;
}

/**
 * Custom hook that memoizes async computations
 * Similar to useMemo but for async operations
 *
 * @example
 * const { value: seedBytes, isLoading, error } = useAsyncMemo({
 *   fn: () => getSeedFromMnemonic(mnemonic, passphrase),
 *   deps: [mnemonic, passphrase],
 *   initialValue: null,
 * });
 */
export function useAsyncMemo<T>({
  fn,
  deps,
  initialValue = null,
  enabled = true,
}: UseAsyncMemoOptions<T>): UseAsyncMemoReturn<T> {
  const [value, setValue] = useState<T | null>(initialValue);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);
  const fnRef = useRef(fn);

  // Store the latest function in a ref so we always call the latest version
  useEffect(() => {
    fnRef.current = fn;
  }, [fn]);

  useEffect(() => {
    if (!enabled) {
      return;
    }

    // Cancel previous request if dependencies changed
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    // Create new abort controller for this request
    const abortController = new AbortController();
    abortControllerRef.current = abortController;

    // Set loading state synchronously to provide immediate feedback for async operations
    setIsLoading(true);
    setError(null);

    // Use the ref to get the latest function
    fnRef
      .current()
      .then((result) => {
        // Only update if this request wasn't aborted
        if (!abortController.signal.aborted) {
          setValue(result);
          setIsLoading(false);
        }
      })
      .catch((err) => {
        // Only update if this request wasn't aborted
        if (!abortController.signal.aborted) {
          setError(err instanceof Error ? err : new Error(String(err)));
          setIsLoading(false);
          setValue(null);
        }
      });

    return () => {
      abortController.abort();
    };
  }, [enabled, ...deps]); // eslint-disable-line react-hooks/exhaustive-deps

  return { value, isLoading, error };
}
