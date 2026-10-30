"use client";

import { useEffect, useState } from "react";
import { STRINGS, type Lang } from "@/lib/i18n";
import CallExperience from "./CallExperience";
import Reveal from "./Reveal";

const LANGS: { id: Lang; label: string }[] = [
  { id: "sw", label: "Kiswahili" },
  { id: "en", label: "English" },
];

const GREETINGS = ["Habari", "Hello", "Niaje", "Sasa"];

// Real questions people ask, in the languages they use.
const EXAMPLES = [
  "Ng'ombe wangu ana homa, nifanye nini?",
  "Is hot lemon water a cure for malaria?",
  "Nikumbushe kunywa dawa baada ya saa moja",
  "Majani ya mahindi yanageuka manjano",
  "How do I cook pilau?",
  "Bei ya mbolea ya DAP ni ngapi?",
  "Niaje Sema, mvua itanyesha kesho?",
  "Nimetumiwa SMS nimeshinda pesa. Ni kweli?",
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
      <div aria-hidden className="aurora">
        <span className="a1" />
        <span className="a2" />
        <span className="a3" />
      </div>

      <a
        href="#call"
        className="sr-only z-50 rounded-lg bg-white px-4 py-2 font-semibold text-navy focus:not-sr-only focus:absolute focus:left-3 focus:top-3"
      >
        {t.talk}
      </a>

      <header className="sticky top-0 z-30 border-b border-white/10 bg-night/60 backdrop-blur-md">
        <div className="mx-auto flex max-w-5xl items-center justify-between gap-3 px-4 py-3">
          <p className="flex items-center gap-2.5 text-xl font-bold">
            <span
              aria-hidden
              className="orb flex h-9 w-9 items-center justify-center text-base font-bold text-white"
            >
              S
            </span>
            Sema AI
          </p>
          <div role="group" aria-label={t.langGroup} className="flex rounded-full border border-white/15 bg-white/5 p-1">
            {LANGS.map((l) => (
              <button
                key={l.id}
                type="button"
                lang={l.id}
                aria-pressed={lang === l.id}
                onClick={() => setLang(l.id)}
                className={`min-h-11 rounded-full px-3 text-sm font-semibold transition-colors sm:px-4 sm:text-base ${
                  lang === l.id ? "bg-white text-navy shadow" : "text-white hover:bg-white/10"
                }`}
              >
                {l.label}
              </button>
            ))}
          </div>
        </div>
      </header>

      <main id="main" className="mx-auto w-full max-w-5xl flex-1 px-4 pb-16">
        <section className="pt-10 text-center sm:pt-14">
          <p className="sema-in inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-4 py-1.5 text-base font-medium text-white/90">
            <span aria-hidden>👋</span>
            <span aria-hidden className="rotator font-semibold text-sky">
              <span>
                {[...GREETINGS, GREETINGS[0]].map((g, i) => (
                  <span key={i}>{g}</span>
                ))}
              </span>
            </span>
            <span className="sr-only">{GREETINGS.join(", ")}</span>
            <span aria-hidden className="text-white/40">
              ·
            </span>
            {t.langsPill}
          </p>
          <h1 className="shine-text mt-5 text-6xl font-bold tracking-tight sm:text-7xl">Sema AI</h1>
          <p className="mt-3 text-xl text-white/80 sm:text-2xl">{t.tagline}</p>
        </section>

        <CallExperience t={t} lang={lang} phone={phone} assistantId={assistantId} />

        <section aria-labelledby="ask-title" className="mt-10">
          <h2 id="ask-title" className="mb-4 text-center text-lg font-semibold text-white/80">
            {t.askAnything}
          </h2>
          <div className="marquee overflow-hidden">
            <div className="marquee-track">
              <ExampleList />
              <ExampleList copy />
            </div>
          </div>
        </section>

        <section aria-labelledby="how-title" className="mt-16">
          <Reveal>
            <h2 id="how-title" className="text-center text-3xl font-bold sm:text-4xl">
              {t.howTitle}
            </h2>
          </Reveal>
          <ol className="relative mt-8 grid gap-4 sm:grid-cols-3">
            <span
              aria-hidden
              className="absolute left-[16%] right-[16%] top-10 hidden h-px bg-gradient-to-r from-transparent via-sky/60 to-transparent sm:block"
            />
            {t.how.map((s, i) => (
              <Reveal as="li" key={s.title} delay={i * 120} className="glass glow-card rounded-3xl p-6 text-center">
                <span
                  aria-hidden
                  className="orb mx-auto flex h-16 w-16 items-center justify-center text-3xl"
                >
                  {s.icon}
                </span>
                <p className="mt-4 text-sm font-semibold uppercase tracking-widest text-sky">{i + 1}</p>
                <h3 className="mt-1 text-xl font-semibold">{s.title}</h3>
                <p className="mt-1 text-lg text-white/75">{s.text}</p>
              </Reveal>
            ))}
          </ol>
        </section>

        <section aria-labelledby="features-title" className="mt-16">
          <Reveal>
            <h2 id="features-title" className="text-center text-3xl font-bold sm:text-4xl">
              {t.featuresLabel}
            </h2>
          </Reveal>
          <ul className="mt-8 grid grid-cols-2 gap-3 sm:grid-cols-4 sm:gap-4">
            {t.features.map((f, i) => (
              <Reveal
                as="li"
                key={f.title}
                delay={i * 90}
                className="glass glow-card flex flex-col items-center gap-3 rounded-3xl p-5 text-center"
              >
                <span
                  aria-hidden
                  className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-sky/30 to-navy/60 text-4xl shadow-inner"
                >
                  {f.icon}
                </span>
                <span className="text-lg font-semibold">{f.title}</span>
              </Reveal>
            ))}
          </ul>
          <Reveal>
            <p className="mt-8 text-center text-lg text-white/80">
              <span aria-hidden>📵 </span>
              {t.anyPhone}
            </p>
          </Reveal>
        </section>
      </main>

      <footer className="border-t border-white/10 bg-night/70 px-4 py-8 text-center backdrop-blur-md">
        <p className="text-lg font-semibold">
          <span aria-hidden>🔒 </span>
          {t.footerAi}
        </p>
        <p className="mt-1 text-base text-white/80">
          <span aria-hidden>🚑 </span>
          {t.footerEmergency}
        </p>
      </footer>
    </>
  );
}

/** One row of example questions. The copy only makes the loop seamless, so it is hidden from screen readers. */
function ExampleList({ copy }: { copy?: boolean }) {
  return (
    <ul aria-hidden={copy || undefined} className={`flex shrink-0 gap-3 pr-3 ${copy ? "marquee-copy" : ""}`}>
      {EXAMPLES.map((q) => (
        <li
          key={q}
          className="glass whitespace-nowrap rounded-full px-5 py-2.5 text-base text-white/90"
        >
          <span aria-hidden className="mr-2 text-sky">
            “
          </span>
          {q}
        </li>
      ))}
    </ul>
  );
}
