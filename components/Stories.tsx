"use client";

import Image from "next/image";
import { useEffect, useRef } from "react";
import type { Lang, Strings } from "@/lib/i18n";
import { STORIES, STORY_STRINGS, type Story } from "@/lib/stories";

/** Example stories with real photos, two sourced facts, and a way back to the call button. */
export default function Stories({ lang, t }: { lang: Lang; t: Strings }) {
  const s = STORY_STRINGS[lang];

  return (
    <section aria-labelledby="stories-title" className="border-t border-line bg-surface">
      <div className="mx-auto max-w-6xl px-5 py-16 sm:py-24">
        <div className="max-w-2xl">
          <h2 id="stories-title" className="text-3xl font-bold tracking-tight sm:text-4xl">
            {s.title}
          </h2>
          <p className="mt-3 text-lg leading-relaxed text-muted">{s.intro}</p>
        </div>

        <ol className="mt-14 flex flex-col gap-20 sm:gap-28">
          {STORIES.map((story, i) => (
            <StoryRow key={story.id} story={story} lang={lang} flip={i % 2 === 1} />
          ))}
        </ol>

        <Facts lang={lang} />

        <InView className="on-dark mt-20 flex flex-col items-start gap-5 rounded-xl bg-navy px-6 py-10 text-white sm:flex-row sm:items-center sm:justify-between sm:px-10">
          <p className="up text-2xl font-bold sm:text-3xl">{s.ctaTitle}</p>
          <a
            href="#call"
            className="up flex min-h-14 shrink-0 items-center rounded-xl bg-white px-7 text-lg font-bold text-navy transition hover:bg-paper active:scale-[0.98]"
          >
            {t.talk}
          </a>
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
    <InView as="li" className="grid items-center gap-8 lg:grid-cols-2 lg:gap-16">
      <figure className={flip ? "lg:order-2" : ""}>
        <div className="photo overflow-hidden rounded-xl bg-paper">
          <Image
            src={p.src}
            alt={p.alt[lang]}
            placeholder="blur"
            sizes="(min-width: 1024px) 540px, 100vw"
            className="aspect-[4/3] w-full object-cover"
            style={{ objectPosition: p.position }}
          />
        </div>
        <figcaption className="mt-2 text-sm text-muted">
          {s.photo}:{" "}
          <a href={p.page} target="_blank" rel="noreferrer" className="underline underline-offset-2 hover:text-ink">
            {p.author}
          </a>
          , {p.license}, Wikimedia Commons
        </figcaption>
      </figure>

      <div>
        <p className="up text-sm font-bold text-navy">
          {x.topic} · <span className="font-normal text-muted">{x.who}</span>
        </p>
        <h3 className="up mt-3 text-2xl font-bold leading-snug sm:text-3xl">{x.quote}</h3>

        <p className="up mt-6 text-sm font-bold text-muted">{s.problem}</p>
        <p className="up mt-1 text-lg leading-relaxed">{x.problem}</p>

        <p className="up mt-6 text-sm font-bold text-muted">{s.helps}</p>
        <ol className="mt-2 flex flex-col gap-3">
          {x.steps.map((step, i) => (
            <li key={i} className="up flex gap-3 text-lg leading-relaxed">
              <span
                aria-hidden
                className="mt-1 flex h-6 w-6 shrink-0 items-center justify-center rounded-md bg-paper text-sm font-bold text-navy"
              >
                {i + 1}
              </span>
              {step}
            </li>
          ))}
        </ol>

        <p className="up mt-6 border-l-4 border-navy pl-4 text-lg font-bold">{x.outcome}</p>
      </div>
    </InView>
  );
}

function Facts({ lang }: { lang: Lang }) {
  const s = STORY_STRINGS[lang];
  return (
    <InView className="mt-24 border-t border-line pt-12">
      <h3 className="up text-2xl font-bold">{s.factsTitle}</h3>
      <dl className="mt-8 grid gap-10 sm:grid-cols-2">
        {s.facts.map((f) => (
          <div key={f.source} className="up">
            <dt className="text-5xl font-bold tracking-tight text-navy sm:text-6xl">
              <CountUp to={f.value} format={f.format} />
            </dt>
            <dd className="mt-2 max-w-sm text-lg">{f.text}</dd>
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
