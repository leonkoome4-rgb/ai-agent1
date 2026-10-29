/** A small phone-style screen showing an SMS, so judges see it even if Twilio fails. */
export default function SmsPreview({
  to,
  message,
  delivered,
}: {
  to?: string;
  message: string;
  delivered?: boolean;
}) {
  return (
    <figure
      aria-label={`SMS preview${to ? ` to ${to}` : ""}`}
      className="mx-auto w-full max-w-[16rem] rounded-[2rem] border-[6px] border-slate-800 bg-slate-100 p-3 shadow-lg"
    >
      <div aria-hidden className="mx-auto mb-2 h-1.5 w-12 rounded-full bg-slate-800" />
      <p className="mb-2 text-center text-xs font-medium text-slate-600">
        SEMA AI{to ? ` → ${to}` : ""}
      </p>
      <blockquote className="whitespace-pre-wrap break-words rounded-2xl rounded-tl-sm bg-white px-3 py-2 text-sm leading-snug text-slate-900 shadow-sm">
        {linkify(message)}
      </blockquote>
      <figcaption className="mt-2 text-center text-xs font-medium">
        {delivered === false ? (
          <span className="text-amber-800">Preview only — not delivered</span>
        ) : delivered ? (
          <span className="text-green-800">✓ Delivered to phone</span>
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
