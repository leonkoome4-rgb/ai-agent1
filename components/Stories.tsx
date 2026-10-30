"use client";

import Image from "next/image";
import { useEffect, useRef } from "react";
import type { Lang, Strings } from "@/lib/i18n";
import { STORIES, STORY_STRINGS, type Story } from "@/lib/stories";

/** Example stories with real photos, two sourced facts, and a way back to the call button. */
export default function Stories({ lang, t }: { lang: Lang; t: Strings }) {
  const s = STORY_STRINGS[lang];

  return (
    <section aria-labelledby="stories-title" className="bg-surface">
      <div aria-hidden className="kitenge h-4" />
      <div className="mx-auto max-w-6xl px-5 py-16 sm:py-24">
        <InView className="max-w-2xl">
          <h2 id="stories-title" className="up font-marker text-4xl leading-tight sm:text-5xl">
            {s.title}
          </h2>
          <p className="up mt-4 text-lg leading-relaxed text-muted">{s.intro}</p>
        </InView>

        <ol className="mt-16 flex flex-col gap-24 sm:gap-32">
          {STORIES.map((story, i) => (
            <StoryRow key={story.id} story={story} lang={lang} flip={i % 2 === 1} />
          ))}
        </ol>

        <Facts lang={lang} />

        <InView className="on-dark mt-24 overflow-hidden rounded-2xl bg-clay text-white">
          <div aria-hidden className="kitenge h-4" />
          <div className="flex flex-col items-start gap-6 px-6 py-10 sm:flex-row sm:items-center sm:justify-between sm:px-10">
            <p className="up font-marker text-3xl leading-tight sm:text-4xl">{s.ctaTitle}</p>
            <a
              href="#call"
              className="up flex min-h-14 shrink-0 items-center rounded-full bg-sand px-8 text-lg font-bold text-earth transition hover:bg-white active:scale-[0.97]"
            >
              {t.talk}
            </a>
          </div>
          <div aria-hidden className="kitenge h-4" />
        </InView>
      </div>
    </section>
  );
}

function StoryRow({ story, lang, flip }: { story: Story; lang: Lang; flip: boolean }) {
  const s = STORY_STRINGS[lang];
  const x = story.text[lang];
  const p = story.photo;

  return (
    <InView as="li" className="grid items-center gap-10 lg:grid-cols-2 lg:gap-16">
      <figure className={`mx-auto w-full max-w-lg ${flip ? "lg:order-2" : ""}`}>
        {/* A polaroid taped to the wall, slightly tilted. */}
        <div
          className="polaroid bg-white p-3 pb-4 shadow-[0_18px_40px_-18px_rgba(36,19,12,0.45)] sm:p-4"
          style={{ ["--tilt" as string]: flip ? "2deg" : "-2deg" }}
        >
          <Image
            src={p.src}
            alt={p.alt[lang]}
            placeholder="blur"
            sizes="(min-width: 1024px) 480px, 100vw"
            className="aspect-[4/3] w-full object-cover"
            style={{ objectPosition: p.position }}
          />
          <p aria-hidden className="mt-3 text-center font-hand text-3xl text-earth">
            {x.topic}
          </p>
        </div>
        <figcaption className="mt-4 text-center text-sm text-muted">
          {s.photo}:{" "}
          <a href={p.page} target="_blank" rel="noreferrer" className="underline underline-offset-2 hover:text-ink">
            {p.author}
          </a>
          , {p.license}, Wikimedia Commons
        </figcaption>
      </figure>

      <div>
        <p className="up font-hand text-2xl text-clay-ink">
          <span className="sr-only">{x.topic}: </span>
          {x.who}
        </p>
        <h3 className="up mt-2 text-2xl font-bold leading-snug sm:text-3xl">{x.quote}</h3>

        <p className="up mt-6 font-hand text-2xl text-muted">{s.problem}</p>
        <p className="up text-lg leading-relaxed">{x.problem}</p>

        <p className="up mt-6 font-hand text-2xl text-muted">{s.helps}</p>
        <ol className="mt-2 flex flex-col gap-3">
          {x.steps.map((step, i) => (
            <li key={i} className="up flex gap-3 text-lg leading-relaxed">
              <span
                aria-hidden
                className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-gold text-sm font-bold text-earth"
              >
                {i + 1}
              </span>
              {step}
            </li>
          ))}
        </ol>

        <p className="up mt-6 rounded-r-lg border-l-4 border-clay bg-gold-light px-4 py-3 text-lg font-bold">
          {x.outcome}
        </p>
      </div>
    </InView>
  );
}

function Facts({ lang }: { lang: Lang }) {
  const s = STORY_STRINGS[lang];
  return (
    <InView className="mt-28">
      <h3 className="up font-marker text-3xl sm:text-4xl">{s.factsTitle}</h3>
      <dl className="mt-10 grid gap-12 sm:grid-cols-2">
        {s.facts.map((f, i) => (
          <div key={f.source} className="up">
            <dt className="relative inline-block font-marker text-6xl text-clay-ink sm:text-7xl">
              <CountUp to={f.value} format={f.format} />
              {/* Hand-drawn mark: a circle round the first number, an underline under the second. */}
              <svg
                aria-hidden
                className={`draw pointer-events-none absolute ${i === 0 ? "-inset-x-6 -inset-y-4" : "-bottom-3 left-0 h-4 w-full"}`}
                viewBox={i === 0 ? "0 0 200 100" : "0 0 200 12"}
                preserveAspectRatio="none"
              >
                <path
                  d={i === 0 ? "M120 8 C 40 2, 4 30, 10 56 C 18 92, 150 98, 186 62 C 204 38, 170 6, 96 12" : "M3 8 C 50 2, 110 11, 197 5"}
                  pathLength={1}
                  fill="none"
                  stroke="#E2A43A"
                  strokeWidth={i === 0 ? 3 : 5}
                  strokeLinecap="round"
                />
              </svg>
            </dt>
            <dd className="mt-5 max-w-sm text-lg">{f.text}</dd>
            <dd className="mt-2 text-sm text-muted">
              <a href={f.url} target="_blank" rel="noreferrer" className="underline underline-offset-2 hover:text-ink">
                {f.source}
              </a>
            </dd>
          </div>
        ))}
      </dl>
    </InView>
  );
}

/** Adds "is-in" once the element scrolls into view; CSS does the animation. */
function InView({
  as: Tag = "div",
  className = "",
  children,
}: {
  as?: "div" | "li";
  className?: string;
  children: React.ReactNode;
}) {
  const ref = useRef<HTMLElement>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting) {
          el.classList.add("is-in");
          io.disconnect();
        }
      },
      { rootMargin: "0px 0px -15% 0px" }
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);
  return (
    <Tag ref={ref as never} className={`in-view ${className}`}>
      {children}
    </Tag>
  );
}

/** Counts up to a number when it scrolls into view. Screen readers get the final value. */
function CountUp({ to, format }: { to: number; format: string }) {
  const ref = useRef<HTMLSpanElement>(null);
  const decimals = Number.isInteger(to) ? 0 : 1;
  const show = (n: number) => format.replace("{n}", n.toFixed(decimals));

  useEffect(() => {
    const el = ref.current;
    if (!el || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const write = (n: number) => (el.textContent = format.replace("{n}", n.toFixed(decimals)));
    write(0);
    let frame = 0;
    const io = new IntersectionObserver(([e]) => {
      if (!e.isIntersecting) return;
      io.disconnect();
      const start = performance.now();
      const tick = (now: number) => {
        const k = Math.min(1, (now - start) / 1400);
        write(to * (1 - Math.pow(1 - k, 3))); // ease-out
        if (k < 1) frame = requestAnimationFrame(tick);
      };
      frame = requestAnimationFrame(tick);
    });
    io.observe(el);
    return () => {
      io.disconnect();
      cancelAnimationFrame(frame);
    };
  }, [to, format, decimals]);

  return (
    <>
      <span ref={ref} aria-hidden>
        {show(to)}
      </span>
      <span className="sr-only">{show(to)}</span>
    </>
  );
}
