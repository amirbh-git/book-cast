"use client";

import { useEffect, useRef, useState } from "react";
import { loadBook, type BookBlock, type BookSegment } from "@/lib/book";
import { BOOKS, getPlaylistState, formatCountdown } from "@/lib/playlist";
import { useReaderCount } from "@/hooks/useReaderCount";
import { useWakeLock } from "@/hooks/useWakeLock";

interface BookState {
  blocks: BookBlock[];
  wordCounts: number[];
  bookIndex: number;
}

export default function BookCast() {
  const readerCount = useReaderCount();
  useWakeLock();
  const [bookState, setBookState] = useState<BookState | null>(null);
  const [progress, setProgress] = useState(0);
  const [countdown, setCountdown] = useState("");
  const [visibleBookIndex, setVisibleBookIndex] = useState(0);
  const scrollRef = useRef<HTMLDivElement>(null);
  const textRef = useRef<HTMLDivElement>(null);
  const rafRef = useRef<number>(0);
  const textHeightRef = useRef<number>(0);

  // Load all books upfront to get their word counts, then load current book's segments
  useEffect(() => {
    (async () => {
      // Load all books to get word counts
      const allLoaded = await Promise.all(BOOKS.map((b) => loadBook(b.file)));
      const wordCounts = allLoaded.map((b) => b.wordCount);

      // Determine which book is current right now
      const state = getPlaylistState(wordCounts);
      const currentBook = allLoaded[state.bookIndex];

      setBookState({
        blocks: currentBook.blocks,
        wordCounts,
        bookIndex: state.bookIndex,
      });
      setVisibleBookIndex(state.bookIndex);
    })();
  }, []);

  useEffect(() => {
    if (!bookState || !scrollRef.current || !textRef.current) return;

    const measure = () => {
      if (textRef.current) {
        textHeightRef.current = textRef.current.scrollHeight;
      }
    };

    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(textRef.current);

    let lastUpdate = 0;

    const loop = () => {
      const state = getPlaylistState(bookState.wordCounts);
      const totalH = textHeightRef.current;

      if (totalH > 0 && scrollRef.current) {
        const offset = state.progress * totalH;
        scrollRef.current.style.transform = `translateY(-${offset}px)`;
      }

      const now = Date.now();
      if (now - lastUpdate > 500) {
        lastUpdate = now;
        setProgress(state.progress);
        setCountdown(formatCountdown(state.msRemainingInBook));

        // If the book changed mid-session, reload
        if (state.bookIndex !== bookState.bookIndex) {
          loadBook(BOOKS[state.bookIndex].file).then((loaded) => {
            setBookState((prev) =>
              prev
                ? { ...prev, blocks: loaded.blocks, bookIndex: state.bookIndex }
                : null
            );
            setVisibleBookIndex(state.bookIndex);
            textHeightRef.current = 0;
          });
        }
      }

      rafRef.current = requestAnimationFrame(loop);
    };

    rafRef.current = requestAnimationFrame(loop);
    return () => {
      cancelAnimationFrame(rafRef.current);
      ro.disconnect();
    };
  }, [bookState]);

  if (!bookState) {
    return (
      <div className="flex items-center justify-center min-h-screen min-h-dvh">
        <p className="text-[#8a7a6a] text-lg italic">Opening the book...</p>
      </div>
    );
  }

  const currentBook = BOOKS[visibleBookIndex];
  const nextBook = BOOKS[(visibleBookIndex + 1) % BOOKS.length];
  const progressPct = Math.round(progress * 100);
  const fullTitle = `${currentBook.titleLine1} ${currentBook.titleLine2}`.trim();

  const renderSegments = (segments: BookSegment[]) =>
    segments.map((seg, i) =>
      seg.italic ? <em key={i}>{seg.text}</em> : <span key={i}>{seg.text}</span>
    );

  return (
    <div className="flex flex-col min-h-screen min-h-dvh">
      <header className="pt-6 sm:pt-10 pb-3 text-center shrink-0 z-10">
        <p className="text-[10px] sm:text-xs tracking-[0.3em] uppercase text-[#8a7a6a] mb-3">
          {readerCount === null
            ? "Now reading:"
            : readerCount === 1
              ? "1 person now reading:"
              : `${readerCount} people now reading:`}
        </p>
        <h1 className="text-sm sm:text-base tracking-[0.15em] uppercase text-[#6a5a4a] mb-0.5">
          {fullTitle}
        </h1>
        <p className="text-[10px] sm:text-xs tracking-[0.2em] text-[#8a7a6a] mt-1">
          by {currentBook.author}
        </p>
      </header>

      <div
        className="flex-1 relative overflow-hidden"
        style={{
          maskImage:
            "linear-gradient(to bottom, transparent 0%, black 18%, black 82%, transparent 100%)",
          WebkitMaskImage:
            "linear-gradient(to bottom, transparent 0%, black 18%, black 82%, transparent 100%)",
        }}
      >
        <div className="absolute inset-0 flex justify-center overflow-hidden">
          <div
            ref={scrollRef}
            className="max-w-[500px] w-full px-6 sm:px-8 will-change-transform"
          >
            <div style={{ height: "100vh" }} aria-hidden="true" />
            <div
              ref={textRef}
              className="text-lg sm:text-xl text-center tracking-[0.01em]"
            >
              {bookState.blocks.map((block, i) =>
                block.type === "heading" ? (
                  <h3
                    key={i}
                    className="mt-8 mb-4 text-[0.9em] tracking-[0.12em] uppercase text-[#6a5a4a]"
                  >
                    {renderSegments(block.segments)}
                  </h3>
                ) : (
                  <p key={i} className="mb-5 leading-[2] sm:leading-[2.2]">
                    {renderSegments(block.segments)}
                  </p>
                )
              )}
            </div>
            <div style={{ height: "100vh" }} aria-hidden="true" />
          </div>
        </div>
      </div>

      <footer className="pb-8 sm:pb-12 pt-3 text-center text-[10px] sm:text-xs text-[#b0a090] tracking-wider shrink-0 z-10">
        <p>{progressPct}% through</p>
        {countdown && (
          <p className="mt-0.5">
            {countdown} until{" "}
            <span className="italic">{nextBook.titleLine1}</span>{" "}
            by {nextBook.author} begins
          </p>
        )}
        <p className="mt-2">
          Designed by{" "}
          <a
            href="https://www.amirbh.com/"
            target="_blank"
            rel="noopener noreferrer"
            className="text-[#c0b0a0] hover:text-[#8a7a6a] transition-colors underline underline-offset-2"
          >
            Amir Ben-Harosh
          </a>
        </p>
      </footer>
    </div>
  );
}
