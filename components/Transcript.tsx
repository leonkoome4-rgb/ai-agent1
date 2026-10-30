"use client";

import { useEffect, useRef } from "react";
import type { Strings } from "@/lib/i18n";

export interface Line {
  role: "user" | "assistant";
  text: string;
}

/** Live captions in large text, for deaf and hard-of-hearing callers. */
export default function Transcript({ t, lines, partial }: { t: Strings; lines: Line[]; partial: Line | null }) {
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth", block: "nearest" });
  }, [lines, partial]);

  return (
    <section aria-labelledby="captions-title" className="glass sema-in rounded-3xl p-5">
      <h2 id="captions-title" className="mb-4 flex items-center gap-2 text-xl font-semibold">
        <span aria-hidden>💬</span> {t.captions}
      </h2>
      <div className="flex max-h-[30rem] flex-col gap-4 overflow-y-auto pr-1">
        {lines.length === 0 && !partial && <p className="text-xl text-white/70">{t.captionsEmpty}</p>}

        {/* Finished lines are announced by screen readers; the live line is not, to avoid noise. */}
        <div role="log" aria-live="polite" className="flex flex-col gap-4">
          {lines.map((l, i) => (
            <Bubble key={i} line={l} t={t} />
          ))}
        </div>
        {partial && (
          <div aria-hidden>
            <Bubble line={partial} t={t} live />
          </div>
        )}
        <div ref={endRef} />
      </div>
    </section>
  );
}

function Bubble({ line, t, live }: { line: Line; t: Strings; live?: boolean }) {
  const isSema = line.role === "assistant";
  return (
    <div className={`sema-in flex flex-col ${isSema ? "items-start" : "items-end"}`}>
      <span className="mb-1 px-1 text-base font-semibold text-white/70">{isSema ? t.sema : t.you}</span>
      <p
        className={`max-w-[90%] rounded-2xl px-4 py-3 text-xl leading-relaxed sm:text-2xl ${
          isSema
            ? "rounded-tl-sm bg-gradient-to-br from-navy to-[#2c4f96] text-white shadow-lg shadow-navy/40"
            : "rounded-tr-sm border border-white/15 bg-white/10 text-white"
        } ${live ? "italic" : ""}`}
      >
        {line.text}
      </p>
    </div>
  );
}
