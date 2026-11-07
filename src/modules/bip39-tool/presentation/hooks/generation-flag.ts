import { useEffect, useState } from 'react';

interface UseGenerationFlagOptions {
  dependencies: React.DependencyList;
  enabled?: boolean; // Whether the flag should be enabled
}

interface UseGenerationFlagReturn {
  isGenerated: boolean;
  setGenerated: (value: boolean) => void;
}

/**
 * Manages a generation/recovery flag that resets when dependencies change
 * Useful for tracking if a generation/recovery operation has been performed
 */
export function useGenerationFlag({
  dependencies,
  enabled = true,
}: UseGenerationFlagOptions): UseGenerationFlagReturn {
  const [isGenerated, setIsGenerated] = useState(false);

  // Reset flag when dependencies change
  useEffect(() => {
    if (enabled) {
      setIsGenerated(false);
    }
  }, dependencies); // eslint-disable-line react-hooks/exhaustive-deps

  return {
    isGenerated,
    setGenerated: setIsGenerated,
  };
}
