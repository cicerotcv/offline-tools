import { useEffect, useState } from 'react';

/**
 * Custom hook that combines useState with debouncing
 * Returns the immediate value, setter, and debounced value
 * @param initialValue - The initial value
 * @param delay - The debounce delay in milliseconds
 * @returns A tuple containing [value, setValue, debouncedValue]
 */
export function useDebounceState<T>(
  initialValue: T,
  delay: number
): [T, (value: T | ((prev: T) => T)) => void, T] {
  const [value, setValue] = useState<T>(initialValue);
  const [debouncedValue, setDebouncedValue] = useState<T>(initialValue);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return [value, setValue, debouncedValue];
}
