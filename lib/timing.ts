export const EPOCH = new Date("2026-01-01T00:00:00Z").getTime();

// Milliseconds per word — controls the pace. 450ms ≈ 2.2 words/sec ≈ 133 wpm
export const MS_PER_WORD = 450;

/**
 * Returns a value from 0 to 1 representing progress through the book.
 * Identical on every device since it only depends on Date.now() and totalWords.
 */
export function getProgress(totalWords: number, now: number = Date.now()): number {
  const elapsed = now - EPOCH;
  const wordPos = (elapsed / MS_PER_WORD) % totalWords;
  return wordPos / totalWords;
}
