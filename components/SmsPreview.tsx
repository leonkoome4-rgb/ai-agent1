import type { Strings } from "@/lib/i18n";

/** A small phone-style screen showing an SMS, so judges see it even if Twilio fails. */
export default function SmsPreview({
  t,
  to,
  message,
  delivered,
}: {
  t: Strings;
  to?: string;
  message: string;
  delivered?: boolean;
}) {
  return (
    <figure
      aria-label={`${t.smsPreview}${to ? ` → ${to}` : ""}`}
      className="on-light mx-auto w-full max-w-[16rem] rounded-[2rem] border-[6px] border-slate-950 bg-slate-100 p-3 shadow-2xl ring-1 ring-white/20"
    >
      <div aria-hidden className="mx-auto mb-2 h-1.5 w-12 rounded-full bg-slate-800" />
      <p className="mb-2 text-center text-sm font-medium text-slate-700">
        SEMA AI{to ? ` → ${to}` : ""}
      </p>
      <blockquote className="whitespace-pre-wrap break-words rounded-2xl rounded-tl-sm bg-white px-3 py-2 text-base leading-snug text-slate-900 shadow-sm">
        {linkify(message)}
      </blockquote>
      <figcaption className="mt-2 text-center text-sm font-medium">
        {delivered === false ? (
          <span className="text-amber-900">{t.smsPreviewOnly}</span>
        ) : delivered ? (
          <span className="text-green-900">✓ {t.smsDelivered}</span>
        ) : null}
      </figcaption>
    </figure>
  );
}

function linkify(text: string) {
  const parts = text.split(/(https?:\/\/\S+)/g);
  return parts.map((p, i) =>
    /^https?:\/\//.test(p) ? (
      <a key={i} href={p} target="_blank" rel="noreferrer" className="font-medium text-navy underline">
        {p}
      </a>
    ) : (
      p
    )
  );
}
