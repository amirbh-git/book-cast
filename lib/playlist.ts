import { MS_PER_WORD, EPOCH } from "./timing";

export interface BookMeta {
  slug: string;
  file: string;
  titleLine1: string;
  titleLine2: string;
  author: string;
  year: string;
}

export const BOOKS: BookMeta[] = [
  {
    slug: "jekyll-and-hyde",
    file: "/books/jekyll-and-hyde.txt",
    titleLine1: "The Strange Case of",
    titleLine2: "Dr. Jekyll & Mr. Hyde",
    author: "Robert Louis Stevenson",
    year: "1886",
  },
  {
    slug: "frankenstein",
    file: "/books/frankenstein.txt",
    titleLine1: "Frankenstein",
    titleLine2: "or, The Modern Prometheus",
    author: "Mary Shelley",
    year: "1818",
  },
  {
    slug: "picture-of-dorian-gray",
    file: "/books/picture-of-dorian-gray.txt",
    titleLine1: "The Picture of Dorian Gray",
    titleLine2: "",
    author: "Oscar Wilde",
    year: "1890",
  },
  {
    slug: "dracula",
    file: "/books/dracula.txt",
    titleLine1: "Dracula",
    titleLine2: "",
    author: "Bram Stoker",
    year: "1897",
  },
  {
    slug: "age-of-innocence",
    file: "/books/age-of-innocence.txt",
    titleLine1: "The Age of Innocence",
    titleLine2: "",
    author: "Edith Wharton",
    year: "1920",
  },
  {
    slug: "great-gatsby",
    file: "/books/great-gatsby.txt",
    titleLine1: "The Great Gatsby",
    titleLine2: "",
    author: "F. Scott Fitzgerald",
    year: "1925",
  },
  {
    slug: "madame-bovary",
    file: "/books/madame-bovary.txt",
    titleLine1: "Madame Bovary",
    titleLine2: "",
    author: "Gustave Flaubert",
    year: "1856",
  },
  {
    slug: "alices-adventures-in-wonderland",
    file: "/books/alices-adventures-in-wonderland.txt",
    titleLine1: "Alice's Adventures in Wonderland",
    titleLine2: "",
    author: "Lewis Carroll",
    year: "1865",
  },
  {
    slug: "pride-and-prejudice",
    file: "/books/pride-and-prejudice.txt",
    titleLine1: "Pride and Prejudice",
    titleLine2: "",
    author: "Jane Austen",
    year: "1813",
  },
  {
    slug: "wonderful-wizard-of-oz",
    file: "/books/wonderful-wizard-of-oz.txt",
    titleLine1: "The Wonderful Wizard of Oz",
    titleLine2: "",
    author: "L. Frank Baum",
    year: "1900",
  },
  {
    slug: "peter-pan",
    file: "/books/peter-pan.txt",
    titleLine1: "Peter Pan",
    titleLine2: "",
    author: "J. M. Barrie",
    year: "1911",
  },
  {
    slug: "call-of-the-wild",
    file: "/books/call-of-the-wild.txt",
    titleLine1: "The Call of the Wild",
    titleLine2: "",
    author: "Jack London",
    year: "1903",
  },
  {
    slug: "war-of-the-worlds",
    file: "/books/war-of-the-worlds.txt",
    titleLine1: "The War of the Worlds",
    titleLine2: "",
    author: "H. G. Wells",
    year: "1898",
  },
  {
    slug: "wuthering-heights",
    file: "/books/wuthering-heights.txt",
    titleLine1: "Wuthering Heights",
    titleLine2: "",
    author: "Emily Bronte",
    year: "1847",
  },
  {
    slug: "sound-and-the-fury",
    file: "/books/sound-and-the-fury.txt",
    titleLine1: "The Sound and the Fury",
    titleLine2: "",
    author: "William Faulkner",
    year: "1929",
  },
  {
    slug: "notes-from-the-underground",
    file: "/books/notes-from-the-underground.txt",
    titleLine1: "Notes from the Underground",
    titleLine2: "",
    author: "Fyodor Dostoevsky (trans. Constance Garnett)",
    year: "1864",
  },
  {
    slug: "a-tale-of-two-cities",
    file: "/books/a-tale-of-two-cities.txt",
    titleLine1: "A Tale of Two Cities",
    titleLine2: "",
    author: "Charles Dickens",
    year: "1859",
  },
  {
    slug: "little-women",
    file: "/books/little-women.txt",
    titleLine1: "Little Women",
    titleLine2: "",
    author: "Louisa May Alcott",
    year: "1868",
  },
];

export interface PlaylistState {
  bookIndex: number;
  progress: number;       // 0–1 through the current book
  msRemainingInBook: number;
  nextBookIndex: number;
}

/**
 * Given the word counts for each book (in playlist order), compute which book
 * is currently playing and how far through it we are — all from wall-clock time.
 */
export function getPlaylistState(
  wordCounts: number[],
  now: number = Date.now()
): PlaylistState {
  const elapsed = now - EPOCH;
  const durations = wordCounts.map((wc) => wc * MS_PER_WORD);
  const totalDuration = durations.reduce((a, b) => a + b, 0);

  const posInCycle = elapsed % totalDuration;

  let cumulative = 0;
  for (let i = 0; i < durations.length; i++) {
    const bookDuration = durations[i];
    if (posInCycle < cumulative + bookDuration) {
      const posInBook = posInCycle - cumulative;
      const progress = posInBook / bookDuration;
      const msRemainingInBook = bookDuration - posInBook;
      const nextBookIndex = (i + 1) % BOOKS.length;
      return { bookIndex: i, progress, msRemainingInBook, nextBookIndex };
    }
    cumulative += bookDuration;
  }

  // Fallback (should never reach here)
  return { bookIndex: 0, progress: 0, msRemainingInBook: durations[0], nextBookIndex: 1 };
}

export function formatCountdown(ms: number): string {
  const totalSeconds = Math.floor(ms / 1000);
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);

  if (hours > 0 && minutes > 0) {
    return `${hours} hr ${minutes} min`;
  } else if (hours > 0) {
    return `${hours} hr`;
  } else if (minutes > 0) {
    return `${minutes} min`;
  } else {
    return "less than a minute";
  }
}
