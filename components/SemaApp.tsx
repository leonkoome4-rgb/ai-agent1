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
        className="sr-only z-50 rounded-md bg-navy px-4 py-2 font-bold text-white focus:not-sr-only focus:absolute focus:left-3 focus:top-3"
      >
        {t.talk}
      </a>

      <header className="border-b border-line bg-surface">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-5 py-3">
          <p className="flex items-center gap-2 text-lg font-bold tracking-tight">
            <Logo />
            Sema
          </p>
          <div role="group" aria-label={t.langGroup} className="flex rounded-lg border border-line bg-paper p-1">
            {LANGS.map((l) => (
              <button
                key={l.id}
                type="button"
                lang={l.id}
                aria-pressed={lang === l.id}
                onClick={() => setLang(l.id)}
                className={`min-h-11 rounded-md px-3 text-sm font-bold transition-colors sm:px-4 sm:text-base ${
                  lang === l.id ? "bg-navy text-white" : "text-muted hover:text-ink"
                }`}
              >
                {l.label}
              </button>
            ))}
          </div>
        </div>
      </header>

      <main id="main" className="mx-auto w-full max-w-6xl flex-1 px-5 py-8 sm:py-12">
        <CallExperience t={t} lang={lang} phone={phone} assistantId={assistantId} />
      </main>

      <footer className="border-t border-line bg-surface">
        <div className="mx-auto flex max-w-6xl flex-col gap-1 px-5 py-6 text-base sm:flex-row sm:justify-between sm:gap-6">
          <p className="font-bold">{t.footerAi}</p>
          <p className="text-muted">{t.footerEmergency}</p>
        </div>
      </footer>
    </>
  );
}

/** A navy square with three sound bars. */
function Logo() {
  return (
    <svg aria-hidden width="28" height="28" viewBox="0 0 28 28">
      <rect width="28" height="28" rx="7" fill="#393680" />
      <path d="M9 11v6M14 8v12M19 11v6" stroke="#fff" strokeWidth="2.5" strokeLinecap="round" />
    </svg>
  );
}
