import CallExperience from "@/components/CallExperience";

const FEATURES = [
  { icon: "💬", sw: "Hatua kwa SMS", en: "Steps by SMS" },
  { icon: "🖼️", sw: "Picha za mwongozo", en: "Picture guides" },
  { icon: "🔎", sw: "Kweli au uongo?", en: "Rumour check" },
  { icon: "⏰", sw: "Vikumbusho", en: "Reminders" },
];

const LANGS = ["Kiswahili", "English", "Sheng"];

export default function Home() {
  return (
    <>
      <header className="bg-navy text-white">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-5 py-4">
          <p className="flex items-center gap-2 text-xl font-bold">
            <span aria-hidden className="flex h-9 w-9 items-center justify-center rounded-full bg-sky text-lg">S</span>
            Sema AI
          </p>
          <ul aria-label="Languages" className="hidden gap-2 sm:flex">
            {LANGS.map((l) => (
              <li key={l} className="rounded-full bg-white/15 px-3 py-1 text-sm">
                {l}
              </li>
            ))}
          </ul>
        </div>
      </header>

      <main className="mx-auto w-full max-w-5xl flex-1 px-5 pb-12">
        <section className="pt-8 text-center">
          <h1 className="text-4xl font-bold text-navy sm:text-5xl">Sema AI</h1>
          <p className="mt-2 text-xl text-slate-800 sm:text-2xl">
            Msaidizi wako wa AI. Simu moja tu.
            <br />
            <span className="text-slate-600">Your AI helper. One call away.</span>
          </p>
        </section>

        <CallExperience
          phone={process.env.NEXT_PUBLIC_SEMA_PHONE}
          assistantId={process.env.VAPI_ASSISTANT_ID}
        />

        <section aria-label="What Sema can do" className="mt-10">
          <ul className="grid grid-cols-2 gap-4 sm:grid-cols-4">
            {FEATURES.map((f) => (
              <li key={f.en} className="flex flex-col items-center gap-2 rounded-3xl bg-sky-light p-5 text-center">
                <span aria-hidden className="text-4xl">
                  {f.icon}
                </span>
                <span className="font-semibold text-navy">{f.sw}</span>
                <span className="text-sm text-slate-700">{f.en}</span>
              </li>
            ))}
          </ul>
          <p className="mt-6 text-center text-slate-700">
            📵 Hakuna smartphone? Hakuna shida. Works on any phone — no internet, no reading needed.
          </p>
        </section>
      </main>

      <footer className="bg-navy px-5 py-5 text-center text-sm text-white/90">
        Sema is an AI, not a doctor or vet. In an emergency call <strong>999</strong> or <strong>112</strong>.
      </footer>
    </>
  );
}
