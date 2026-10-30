"use client";

import { useEffect, useRef } from "react";
import type { Strings } from "@/lib/i18n";

/** Shown when the browser blocks the microphone. Picture + 3 short steps. */
export default function MicHelp({ t, onRetry, onClose }: { t: Strings; onRetry: () => void; onClose: () => void }) {
  const titleRef = useRef<HTMLHeadingElement>(null);

  // Move focus here so keyboard and screen reader users find the help.
  useEffect(() => {
    titleRef.current?.focus();
  }, []);

  return (
    <section
      aria-labelledby="mic-help-title"
      className="on-light sema-in w-full max-w-md rounded-3xl border-2 border-sky bg-white p-5 text-slate-900 shadow-2xl shadow-sky/20"
    >
      <h2 id="mic-help-title" ref={titleRef} tabIndex={-1} className="flex items-center gap-2 text-2xl font-bold text-navy outline-none">
        <span aria-hidden>🎙️</span> {t.micTitle}
      </h2>
      <p className="mt-1 text-lg text-slate-800">{t.micIntro}</p>

      <MicPicture t={t} />

      <ol className="mt-4 flex flex-col gap-3">
        {t.micSteps.map((step, i) => (
          <li key={i} className="flex items-start gap-3 text-lg text-slate-900">
            <span aria-hidden className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-navy font-bold text-white">
              {i + 1}
            </span>
            <span>{step}</span>
          </li>
        ))}
      </ol>

      <div className="mt-5 flex flex-col gap-3 sm:flex-row">
        <button
          type="button"
          onClick={onRetry}
          className="min-h-14 flex-1 rounded-full bg-navy px-6 text-xl font-semibold text-white hover:bg-navy-dark"
        >
          {t.tryAgain}
        </button>
        <button
          type="button"
          onClick={onClose}
          className="min-h-14 rounded-full border-2 border-navy px-6 text-xl font-semibold text-navy hover:bg-sky-light"
        >
          {t.close}
        </button>
      </div>
    </section>
  );
}

/** A simple drawing of a phone browser: lock icon in the address bar, then the "Allow" switch. */
function MicPicture({ t }: { t: Strings }) {
  return (
    <div aria-hidden className="mx-auto mt-4 w-full max-w-[17rem] rounded-[1.75rem] border-[6px] border-slate-800 bg-slate-100 p-2">
      {/* Address bar */}
      <div className="flex items-center gap-2 rounded-full bg-white px-2 py-1.5 shadow-sm">
        <span className="relative flex h-8 w-8 items-center justify-center rounded-full bg-sky-light text-base">
          🔒
          <span className="absolute -inset-1 rounded-full border-[3px] border-red-700" />
        </span>
        <span className="truncate text-sm text-slate-700">sema-ai…vercel.app</span>
      </div>
      {/* Arrow */}
      <p className="py-1 pl-4 text-2xl leading-none text-red-700">↓</p>
      {/* Permission popup */}
      <div className="rounded-2xl bg-white p-3 shadow">
        <div className="flex items-center justify-between gap-2">
          <span className="flex items-center gap-2 text-base font-medium text-slate-900">
            <span className="text-xl">🎙️</span> {t.micLabel}
          </span>
          <span className="flex items-center gap-1.5 rounded-full border-[3px] border-red-700 px-1 py-0.5">
            <span className="text-sm font-bold text-green-800">{t.micAllow}</span>
            <span className="flex h-6 w-11 items-center justify-end rounded-full bg-green-700 p-0.5">
              <span className="h-5 w-5 rounded-full bg-white" />
            </span>
          </span>
        </div>
      </div>
    </div>
  );
}
