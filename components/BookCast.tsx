"use client";

import { useEffect, useState, useCallback } from "react";
import { loadBook } from "@/lib/book";
import {
  getWordIndex,
  getVisibleWindow,
  TICK_MS,
  WINDOW_SIZE,
  FADE_WORDS,
} from "@/lib/timing";

function getOpacity(position: number): number {
  if (position < FADE_WORDS) {
    return (position + 1) / (FADE_WORDS + 1);
  }
  if (position >= WINDOW_SIZE - FADE_WORDS) {
    return (WINDOW_SIZE - position) / (FADE_WORDS + 1);
  }
  return 1;
}

export default function BookCast() {
  const [words, setWords] = useState<string[]>([]);
  const [visibleWords, setVisibleWords] = useState<string[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    loadBook().then(setWords);
  }, []);

  const tick = useCallback(() => {
    if (words.length === 0) return;
    const idx = getWordIndex(words.length);
    setCurrentIndex(idx);
    setVisibleWords(getVisibleWindow(words, idx));
  }, [words]);

  useEffect(() => {
    if (words.length === 0) return;
    tick();
    const interval = setInterval(tick, TICK_MS);
    return () => clearInterval(interval);
  }, [words, tick]);

  if (words.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-[#8a7a6a] text-lg italic">Opening the book...</p>
      </div>
    );
  }

  const progress = ((currentIndex / words.length) * 100).toFixed(1);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen px-6 py-12">
      <header className="mb-12 text-center">
        <h1 className="text-sm tracking-[0.3em] uppercase text-[#8a7a6a] mb-1">
          The Strange Case of
        </h1>
        <h2 className="text-lg tracking-[0.15em] uppercase text-[#6a5a4a]">
          Dr. Jekyll & Mr. Hyde
        </h2>
      </header>

      <div className="max-w-[600px] w-full leading-[2] text-xl text-center">
        {visibleWords.map((word, i) => (
          <span
            key={`${currentIndex}-${i}`}
            className="inline transition-opacity duration-500 ease-in-out"
            style={{ opacity: getOpacity(i) }}
          >
            {word}{" "}
          </span>
        ))}
      </div>

      <footer className="mt-16 text-center text-xs text-[#b0a090] tracking-wider">
        <p>{progress}% through the book</p>
        <p className="mt-1">Robert Louis Stevenson, 1886</p>
      </footer>
    </div>
  );
}
