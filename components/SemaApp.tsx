"use client";

import { useEffect, useState } from "react";
import { STRINGS, type Lang } from "@/lib/i18n";
import CallExperience from "./CallExperience";

const LANGS: { id: Lang; label: string }[] = [
  { id: "sw", label: "Kiswahili" },
  { id: "en", label: "English" },
];

export default function SemaApp({ phone, assistantId }: { phone?: string; assistantId?: string }) {
  const [lang, setLang] = useState<Lang>("sw");
  const t = STRINGS[lang];

  // Screen readers use this to pick the right voice.
  useEffect(() => {
    document.documentElement.lang = lang;
  }, [lang]);

  return (
    <>
      <a
        href="#call"
        className="sr-only z-50 rounded-lg bg-white px-4 py-2 font-semibold text-navy focus:not-sr-only focus:absolute focus:left-3 focus:top-3"
      >
        {t.talk}
      </a>

      <header className="bg-navy text-white">
        <div className="mx-auto flex max-w-5xl items-center justify-between gap-3 px-4 py-3">
          <p className="flex items-center gap-2 text-xl font-bold">
            <span aria-hidden className="flex h-9 w-9 items-center justify-center rounded-full bg-white text-lg text-navy">
              S
            </span>
            Sema AI
          </p>
          <div role="group" aria-label={t.langGroup} className="flex rounded-full bg-white/15 p-1">
            {LANGS.map((l) => (
              <button
                key={l.id}
                type="button"
                lang={l.id}
                aria-pressed={lang === l.id}
                onClick={() => setLang(l.id)}
                className={`min-h-11 rounded-full px-3 text-sm font-semibold transition-colors sm:px-4 sm:text-base ${
                  lang === l.id ? "bg-white text-navy" : "text-white hover:bg-white/10"
                }`}
              >
                {l.label}
              </button>
            ))}
          </div>
        </div>
      </header>

      <main id="main" className="mx-auto w-full max-w-5xl flex-1 px-4 pb-10">
        <section className="pt-7 text-center">
          <h1 className="text-4xl font-bold text-navy sm:text-5xl">Sema AI</h1>
          <p className="mt-2 text-xl text-slate-800 sm:text-2xl">{t.tagline}</p>
        </section>

        <CallExperience t={t} lang={lang} phone={phone} assistantId={assistantId} />

        <section aria-label={t.featuresLabel} className="mt-10">
          <ul className="grid grid-cols-2 gap-3 sm:grid-cols-4 sm:gap-4">
            {t.features.map((f) => (
              <li key={f.title} className="flex flex-col items-center gap-2 rounded-3xl bg-sky-light p-4 text-center sm:p-5">
                <span aria-hidden className="text-4xl">
                  {f.icon}
                </span>
                <span className="text-lg font-semibold text-navy">{f.title}</span>
              </li>
            ))}
          </ul>
          <p className="mt-6 text-center text-lg text-slate-700">
            <span aria-hidden>📵 </span>
            {t.anyPhone}
          </p>
        </section>
      </main>

      <footer className="bg-navy px-4 py-6 text-center text-white">
        <p className="text-lg font-semibold">
          <span aria-hidden>🔒 </span>
          {t.footerAi}
        </p>
        <p className="mt-1 text-base text-white/90">{t.footerEmergency}</p>
      </footer>
    </>
  );
}
