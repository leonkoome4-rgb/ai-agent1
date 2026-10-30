import type { Strings } from "@/lib/i18n";

/** The SMS as the person will get it, so judges see it even when it cannot be delivered. */
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
    <figure aria-label={`${t.smsPreview}${to ? ` → ${to}` : ""}`} className="max-w-sm">
      <p className="mb-1 text-sm text-muted">
        SMS{to ? ` → ${to}` : ""}
      </p>
      <blockquote className="whitespace-pre-wrap break-words rounded-lg border border-line bg-paper px-4 py-3 text-base leading-snug">
        {linkify(message)}
      </blockquote>
      {delivered !== undefined && (
        <figcaption className={`mt-1 text-sm font-bold ${delivered ? "text-green-800" : "text-amber-800"}`}>
          {delivered ? t.smsDelivered : t.smsPreviewOnly}
        </figcaption>
      )}
    </figure>
  );
}

function linkify(text: string) {
  const parts = text.split(/(https?:\/\/\S+)/g);
  return parts.map((p, i) =>
    /^https?:\/\//.test(p) ? (
      <a key={i} href={p} target="_blank" rel="noreferrer" className="font-bold text-navy underline">
        {p}
      </a>
    ) : (
      p
    )
  );
}
