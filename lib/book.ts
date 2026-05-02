let cachedWords: string[] | null = null;

export async function loadBook(): Promise<string[]> {
  if (cachedWords) return cachedWords;

  const res = await fetch("/books/jekyll-and-hyde.txt");
  const text = await res.text();
  cachedWords = text.split(/\s+/).filter((w) => w.length > 0);
  return cachedWords;
}
