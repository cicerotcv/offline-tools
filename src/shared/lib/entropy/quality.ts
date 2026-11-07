export interface HexEntropyQuality {
  distinctSymbols: number;
  longestRun: number;
  /** Shortest repeating period, if the whole string is a repetition. */
  period: number | null;
  /** Obviously weak: few symbols, long runs or a repeated pattern. */
  looksWeak: boolean;
}

/**
 * Cheap sanity checks for user-typed hex entropy. It cannot prove the input
 * is random; it only flags inputs that are clearly not (0000..., abab...,
 * 0123...0123...).
 */
export function assessHexEntropy(hex: string): HexEntropyQuality {
  const text = hex.trim().toLowerCase();
  const distinctSymbols = new Set(text).size;

  let longestRun = text.length > 0 ? 1 : 0;
  for (let i = 1, run = 1; i < text.length; i++) {
    run = text[i] === text[i - 1] ? run + 1 : 1;
    longestRun = Math.max(longestRun, run);
  }

  let period: number | null = null;
  for (let p = 1; p <= text.length / 2; p++) {
    if (text.length % p === 0 && text.slice(p) === text.slice(0, -p)) {
      period = p;
      break;
    }
  }

  const looksWeak =
    text.length >= 8 &&
    (distinctSymbols < 8 ||
      longestRun >= 8 ||
      (period !== null && period <= 16));

  return { distinctSymbols, longestRun, period, looksWeak };
}
