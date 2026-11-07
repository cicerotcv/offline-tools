interface UseCombinedAsyncStateOptions {
  localError: string;
  localLoading: boolean;
  asyncError: Error | null;
  asyncLoading: boolean;
}

interface UseCombinedAsyncStateReturn {
  error: string;
  isLoading: boolean;
}

/**
 * Combines local error/loading state with async operation error/loading state
 * Useful when you have both local state and async memoized computations
 */
export function useCombinedAsyncState({
  localError,
  localLoading,
  asyncError,
  asyncLoading,
}: UseCombinedAsyncStateOptions): UseCombinedAsyncStateReturn {
  const error = localError || (asyncError ? asyncError.message : '');
  const isLoading = localLoading || asyncLoading;

  return { error, isLoading };
}
