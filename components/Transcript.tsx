"use client";

import { useEffect, useRef } from "react";

export interface Line {
  role: "user" | "assistant";
  text: string;
}

export default function Transcript({ lines, partial }: { lines: Line[]; partial: Line | null }) {
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth", block: "nearest" });
  }, [lines, partial]);

  const all = partial ? [...lines, { ...partial, live: true }] : lines;

  return (
    <section aria-labelledby="transcript-title" className="rounded-3xl border border-slate-200 bg-white p-4 shadow-sm">
      <h2 id="transcript-title" className="mb-3 flex items-center gap-2 text-lg font-semibold text-navy">
        <span aria-hidden>🗣️</span> Mazungumzo · Transcript
      </h2>
      <div role="log" aria-live="polite" aria-label="Live transcript" className="flex max-h-[28rem] flex-col gap-3 overflow-y-auto pr-1">
        {all.length === 0 && <p className="text-slate-600">Sema will greet you in a moment…</p>}
        {all.map((l, i) => {
          const isSema = l.role === "assistant";
          const live = "live" in l && l.live;
          return (
            <div key={i} className={`sema-in flex ${isSema ? "justify-start" : "justify-end"}`}>
              <div
                className={`max-w-[85%] rounded-2xl px-4 py-2.5 text-base leading-relaxed ${
                  isSema ? "rounded-bl-sm bg-navy text-white" : "rounded-br-sm bg-sky-light text-slate-900"
                } ${live ? "opacity-70" : ""}`}
              >
                <span className="sr-only">{isSema ? "Sema: " : "You: "}</span>
                {l.text}
              </div>
            </div>
          );
        })}
        <div ref={endRef} />
      </div>
    </section>
  );
}
