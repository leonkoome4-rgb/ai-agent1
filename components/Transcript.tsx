"use client";

import { useEffect, useRef } from "react";
import type { Strings } from "@/lib/i18n";

export interface Line {
  role: "user" | "assistant";
  text: string;
}

/** Live captions in large text, for deaf and hard-of-hearing callers. */
export default function Transcript({ t, lines, partial }: { t: Strings; lines: Line[]; partial: Line | null }) {
  const scrollRef = useRef<HTMLDivElement>(null);

  // Keep the newest words in view, without scrolling the whole page.
  useEffect(() => {
    const el = scrollRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [lines, partial]);

  return (
    <section aria-labelledby="captions-title" className="rounded-xl border border-line bg-surface">
      <h2 id="captions-title" className="border-b border-line px-5 py-4 text-lg font-bold">
        {t.captions}
      </h2>
      <div ref={scrollRef} className="max-h-[28rem] overflow-y-auto px-5 py-2">
        {lines.length === 0 && !partial && <p className="py-3 text-lg text-muted">{t.captionsEmpty}</p>}

        {/* Finished lines are announced by screen readers; the live line is not, to avoid noise. */}
        <div role="log" aria-live="polite" className="divide-y divide-line">
          {lines.map((l, i) => (
            <Row key={i} line={l} t={t} />
          ))}
        </div>
        {partial && (
          <div aria-hidden className={lines.length ? "border-t border-line" : ""}>
            <Row line={partial} t={t} live />
          </div>
        )}
      </div>
    </section>
  );
}

function Row({ line, t, live }: { line: Line; t: Strings; live?: boolean }) {
  const isSema = line.role === "assistant";
  return (
    <div className="sema-in py-3">
      <p className={`text-sm font-bold ${isSema ? "text-navy" : "text-muted"}`}>{isSema ? t.sema : t.you}</p>
      <p className={`mt-0.5 text-xl leading-relaxed sm:text-2xl ${live ? "text-muted" : ""}`}>{line.text}</p>
    </div>
  );
}
