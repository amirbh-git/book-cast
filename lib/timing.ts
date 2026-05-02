export const EPOCH = new Date("2026-01-01T00:00:00Z").getTime();
export const TICK_MS = 500;
export const WINDOW_SIZE = 40;
export const FADE_WORDS = 4;

export function getWordIndex(totalWords: number, now: number = Date.now()): number {
  const elapsed = now - EPOCH;
  return Math.floor(elapsed / TICK_MS) % totalWords;
}

export function getVisibleWindow(
  words: string[],
  wordIndex: number
): string[] {
  const total = words.length;
  const result: string[] = [];
  for (let i = 0; i < WINDOW_SIZE; i++) {
    result.push(words[(wordIndex + i) % total]);
  }
  return result;
}
