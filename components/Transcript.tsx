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
    <section aria-labelledby="captions-title" className="rounded-3xl border border-slate-200 bg-white p-4 shadow-sm">
      <h2 id="captions-title" className="mb-3 flex items-center gap-2 text-xl font-semibold text-navy">
        <span aria-hidden>💬</span> {t.captions}
      </h2>
      <div className="flex max-h-[30rem] flex-col gap-4 overflow-y-auto pr-1">
        {lines.length === 0 && !partial && <p className="text-xl text-slate-700">{t.captionsEmpty}</p>}

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
      <span className="mb-1 px-1 text-base font-semibold text-slate-700">{isSema ? t.sema : t.you}</span>
      <p
        className={`max-w-[90%] rounded-2xl px-4 py-3 text-xl leading-relaxed sm:text-2xl ${
          isSema ? "rounded-tl-sm bg-navy text-white" : "rounded-tr-sm bg-sky-light text-slate-900"
        } ${live ? "italic" : ""}`}
      >
        {line.text}
      </p>
    </div>
  );
}
