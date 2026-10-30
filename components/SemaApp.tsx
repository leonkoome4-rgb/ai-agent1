"use client";

import { useEffect, useState } from "react";
import { STRINGS, type Lang, type Strings } from "@/lib/i18n";
import CallExperience from "./CallExperience";
import Stories from "./Stories";

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
        className="sr-only z-50 rounded-md bg-clay px-4 py-2 font-bold text-white focus:not-sr-only focus:absolute focus:left-3 focus:top-3"
      >
        {t.talk}
      </a>

      <header className="on-dark bg-earth text-sand">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-5 py-3">
          <p className="flex items-center gap-2.5">
            <Logo />
            <span className="font-marker text-2xl tracking-wide">Sema</span>
          </p>
          <div role="group" aria-label={t.langGroup} className="flex rounded-full border border-sand/25 p-1">
            {LANGS.map((l) => (
              <button
                key={l.id}
                type="button"
                lang={l.id}
                aria-pressed={lang === l.id}
                onClick={() => setLang(l.id)}
                className={`min-h-11 rounded-full px-3 text-sm font-bold transition-colors sm:px-4 sm:text-base ${
                  lang === l.id ? "bg-gold text-earth" : "text-sand/90 hover:text-sand"
                }`}
              >
                {l.label}
              </button>
            ))}
          </div>
        </div>
      </header>

      <main id="main" className="flex-1">
        <Hero t={t} />
        <div className="mx-auto w-full max-w-6xl px-5 py-10 sm:py-14">
          <CallExperience t={t} lang={lang} phone={phone} assistantId={assistantId} />
        </div>
        <Stories lang={lang} t={t} />
      </main>

      <footer className="on-dark bg-earth text-sand">
        <div aria-hidden className="kitenge h-4" />
        <div className="mx-auto flex max-w-6xl flex-col gap-2 px-5 py-8 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="font-bold">{t.footerAi}</p>
            <p className="mt-1 text-sand/85">{t.footerEmergency}</p>
          </div>
          <p className="-rotate-3 font-hand text-3xl text-gold">{t.thanks}</p>
        </div>
      </footer>
    </>
  );
}

/** Dark sky, a rising sun, hills and acacia trees. The words sit in the dark part, for contrast. */
function Hero({ t }: { t: Strings }) {
  return (
    <section className="on-dark sunset relative overflow-hidden text-sand">
      <div className="relative z-10 mx-auto max-w-6xl px-5 pb-4 pt-10 sm:pb-6 sm:pt-16">
        <h1 className="drop max-w-3xl font-marker text-4xl leading-tight sm:text-6xl">
          <span className="relative inline-block">
            {t.tagline}
            <svg
              aria-hidden
              className="draw-now absolute -bottom-3 left-0 h-4 w-full"
              viewBox="0 0 300 12"
              preserveAspectRatio="none"
            >
              <path
                d="M3 8 C 60 2, 120 11, 180 6 S 270 3, 297 7"
                pathLength={1}
                fill="none"
                stroke="#E2A43A"
                strokeWidth="4"
                strokeLinecap="round"
              />
            </svg>
          </span>
        </h1>
        <p className="rise mt-6 max-w-xl text-lg leading-relaxed text-sand/90" style={{ animationDelay: "0.3s" }}>
          {t.intro}
        </p>
        <p
          className="pop mt-4 inline-block font-hand text-3xl text-gold"
          style={{ ["--tilt" as string]: "-3deg", animationDelay: "0.9s", animationFillMode: "both" }}
        >
          {t.heroNote} <span aria-hidden>↓</span>
        </p>
      </div>
      <Savanna />
      <div aria-hidden className="kitenge h-4" />
    </section>
  );
}

function Savanna() {
  const tree = "M-3 0 L-2 -38 L-20 -60 L-16 -62 L0 -44 L14 -66 L18 -63 L3 -40 L4 0z";
  return (
    <svg
      aria-hidden
      className="-mt-6 block h-32 w-full sm:-mt-10 sm:h-48"
      viewBox="0 0 1200 200"
      preserveAspectRatio="xMidYMax slice"
    >
      <defs>
        <radialGradient id="sun" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#F6C66B" />
          <stop offset="70%" stopColor="#E2A43A" />
          <stop offset="100%" stopColor="#D9822F" />
        </radialGradient>
      </defs>
      <g className="sun">
        <circle cx="880" cy="200" r="120" fill="url(#sun)" />
      </g>
      <path d="M0 160 C 200 120, 380 150, 560 132 S 900 110, 1200 140 V200 H0z" fill="#4a2010" />
      <path d="M0 182 C 260 160, 520 186, 760 168 S 1050 160, 1200 176 V200 H0z" fill="#24130C" />
      <g fill="#24130C">
        <g transform="translate(250 178) scale(1.3)">
          <path d={tree} />
          <ellipse cx="-14" cy="-64" rx="40" ry="8" />
          <ellipse cx="18" cy="-67" rx="34" ry="7" />
          <ellipse cx="0" cy="-71" rx="46" ry="7" />
        </g>
        <g transform="translate(1010 176) scale(0.9)">
          <path d={tree} />
          <ellipse cx="-14" cy="-64" rx="40" ry="8" />
          <ellipse cx="18" cy="-67" rx="34" ry="7" />
          <ellipse cx="0" cy="-71" rx="46" ry="7" />
        </g>
        <g transform="translate(640 172) scale(0.55)">
          <path d={tree} />
          <ellipse cx="-14" cy="-64" rx="40" ry="8" />
          <ellipse cx="0" cy="-71" rx="46" ry="7" />
        </g>
      </g>
    </svg>
  );
}

/** A gold circle with three sound bars. */
function Logo() {
  return (
    <svg aria-hidden width="30" height="30" viewBox="0 0 30 30">
      <circle cx="15" cy="15" r="15" fill="#E2A43A" />
      <path d="M10 12v6M15 8v14M20 12v6" stroke="#24130C" strokeWidth="2.6" strokeLinecap="round" />
    </svg>
  );
}
