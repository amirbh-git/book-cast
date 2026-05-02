export interface BookSegment {
  text: string;
  italic: boolean;
}

export interface BookBlock {
  type: "heading" | "paragraph";
  segments: BookSegment[];
}

export interface LoadedBook {
  blocks: BookBlock[];
  wordCount: number;
}

const cache = new Map<string, LoadedBook>();

function parseSegments(normalized: string): BookSegment[] {
  const segments: BookSegment[] = [];
  const parts = normalized.split(/(_[^_]+_)/g);
  for (const part of parts) {
    if (!part) continue;
    if (part.startsWith("_") && part.endsWith("_") && part.length > 2) {
      segments.push({ text: part.slice(1, -1), italic: true });
    } else {
      segments.push({ text: part, italic: false });
    }
  }
  return segments;
}

function getBlockType(text: string): "heading" | "paragraph" {
  const compact = text.trim();
  const wordCount = compact.split(/\s+/).filter(Boolean).length;
  const upperLike = /^[A-Z0-9'’.,;:!?()\- ]+$/.test(compact);
  const chapterLike = /^(chapter|book|letter)\b/i.test(compact);

  if ((upperLike && wordCount <= 12) || chapterLike) {
    return "heading";
  }
  return "paragraph";
}

export async function loadBook(file: string): Promise<LoadedBook> {
  if (cache.has(file)) return cache.get(file)!;

  const res = await fetch(file);
  const raw = await res.text();
  const text = raw.replace(/\r\n/g, "\n").trim();
  const normalized = text.replace(/\s+/g, " ").trim();
  const wordCount = normalized.split(/\s+/).filter((w) => w.length > 0).length;

  const rawBlocks = text
    .split(/\n\s*\n+/)
    .map((b) => b.trim())
    .filter(Boolean);

  const blocks: BookBlock[] = rawBlocks.map((block) => {
    const cleaned = block.replace(/\s+/g, " ").trim();
    return {
      type: getBlockType(cleaned),
      segments: parseSegments(cleaned),
    };
  });

  const loaded: LoadedBook = { blocks, wordCount };
  cache.set(file, loaded);
  return loaded;
}
