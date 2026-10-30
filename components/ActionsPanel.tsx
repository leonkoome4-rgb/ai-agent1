import { TOOL_META, type ActionItem, type Verdict } from "@/lib/actions";
import type { Lang, Strings } from "@/lib/i18n";
import Icon from "./Icon";
import SmsPreview from "./SmsPreview";

const VERDICT_STYLE: Record<Verdict, string> = {
  TRUE: "bg-green-100 text-green-900",
  FALSE: "bg-red-100 text-red-900",
  UNPROVEN: "bg-amber-100 text-amber-900",
  SCAM: "bg-red-700 text-white",
};

export default function ActionsPanel({ t, lang, actions }: { t: Strings; lang: Lang; actions: ActionItem[] }) {
  return (
    <section aria-labelledby="actions-title" className="rounded-xl border border-line bg-surface">
      <h2 id="actions-title" className="border-b border-line px-5 py-4 text-lg font-bold">
        {t.actions}
      </h2>
      <ul aria-live="polite" className="divide-y divide-line">
        {actions.length === 0 && <li className="px-5 py-4 text-lg text-muted">{t.actionsEmpty}</li>}
        {actions.map((a) => (
          <li key={a.id} className="sema-in px-5 py-4">
            <ActionRow action={a} t={t} lang={lang} />
          </li>
        ))}
      </ul>
    </section>
  );
}

function ActionRow({ action, t, lang }: { action: ActionItem; t: Strings; lang: Lang }) {
  const meta = TOOL_META[action.name] ?? { sw: action.name, en: action.name };
  const r = action.result;
  const args = action.args as Record<string, string | undefined>;

  // The SMS text: from the result if we have it, else from the tool arguments.
  const smsText =
    action.name === "send_sms" || action.name === "set_reminder" ? r?.message ?? args.message : undefined;

  return (
    <article>
      <header className="flex items-start gap-3">
        <span className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-paper text-navy">
          <Icon name={action.name} />
        </span>
        <div className="min-w-0 flex-1">
          <h3 className="font-bold">{meta[lang]}</h3>
          {/* SMS text is shown in full below, so do not repeat it here. */}
          {(r?.summary ?? (smsText ? "" : describeArgs(action))) && (
            <p className="text-base text-muted">{r?.summary ?? describeArgs(action)}</p>
          )}
        </div>
        <Status status={action.status} t={t} />
      </header>

      <div className="pl-12">
        {action.name === "check_claim" && r?.verdict && (
          <div className="mt-3">
            <p className="flex flex-wrap items-center gap-2">
              <span className={`rounded px-2 py-0.5 text-sm font-bold ${VERDICT_STYLE[r.verdict]}`}>{r.verdict}</span>
              {typeof r.confidence === "number" && (
                <span className="text-base text-muted">
                  {Math.round(r.confidence)}% {t.sure}
                </span>
              )}
            </p>
            {r.reason && <p className="mt-2 text-lg">{r.reason}</p>}
            {r.sources && r.sources.length > 0 && (
              <p className="mt-1 text-base text-muted">
                {t.sources}: {r.sources.join(", ")}
              </p>
            )}
          </div>
        )}

        {action.name === "create_guide" && r?.url && (
          <p className="mt-2">
            <a href={r.url} target="_blank" rel="noreferrer" className="font-bold text-navy underline underline-offset-4">
              {t.openGuide}: {r.title ?? r.url}
            </a>
          </p>
        )}

        {action.name === "send_email" && (r?.subject ?? args.subject) && (
          <p className="mt-2 text-base text-muted">
            {t.subject}: {r?.subject ?? args.subject}
          </p>
        )}

        {smsText && (
          <div className="mt-3">
            <SmsPreview t={t} to={r?.to ?? args.to} message={smsText} delivered={r ? r.delivered : undefined} />
          </div>
        )}

        {r?.error && <p className="mt-2 text-base text-red-800">{r.error}</p>}
      </div>
    </article>
  );
}

function Status({ status, t }: { status: ActionItem["status"]; t: Strings }) {
  if (status === "running") {
    return (
      <span className="flex shrink-0 items-center gap-2 text-sm font-bold text-muted">
        <span aria-hidden className="sema-spin h-3.5 w-3.5 rounded-full border-2 border-line border-t-navy" />
        {t.working}
      </span>
    );
  }
  if (status === "failed") {
    return <span className="shrink-0 text-sm font-bold text-red-800">{t.failed}</span>;
  }
  return <span className="shrink-0 text-sm font-bold text-green-800">{t.done}</span>;
}

function describeArgs(a: ActionItem): string {
  const v = a.args as Record<string, unknown>;
  return String(v.claim ?? v.query ?? v.title ?? v.subject ?? v.message ?? v.name ?? "");
}
