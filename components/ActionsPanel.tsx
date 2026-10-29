import { TOOL_META, type ActionItem, type Verdict } from "@/lib/actions";
import SmsPreview from "./SmsPreview";

const VERDICT_STYLE: Record<Verdict, string> = {
  TRUE: "bg-green-100 text-green-900",
  FALSE: "bg-red-100 text-red-900",
  UNPROVEN: "bg-amber-100 text-amber-900",
  SCAM: "bg-red-700 text-white",
};

export default function ActionsPanel({ actions }: { actions: ActionItem[] }) {
  return (
    <section aria-labelledby="actions-title" className="rounded-3xl border border-slate-200 bg-white p-4 shadow-sm">
      <h2 id="actions-title" className="mb-3 flex items-center gap-2 text-lg font-semibold text-navy">
        <span aria-hidden>⚡</span> Vitendo · Actions
      </h2>
      <ul aria-live="polite" className="flex flex-col gap-3">
        {actions.length === 0 && (
          <li className="text-slate-600">When Sema sends an SMS, checks a rumour or sets a reminder, it shows here.</li>
        )}
        {actions.map((a) => (
          <li key={a.id} className="sema-in">
            <ActionCard action={a} />
          </li>
        ))}
      </ul>
    </section>
  );
}

function ActionCard({ action }: { action: ActionItem }) {
  const meta = TOOL_META[action.name] ?? { icon: "🛠️", label: action.name };
  const r = action.result;
  const args = action.args as Record<string, string | undefined>;

  // The SMS text: from the result if we have it, else from the tool arguments.
  const smsText =
    action.name === "send_sms" || action.name === "set_reminder"
      ? r?.message ?? args.message
      : undefined;

  return (
    <article className="rounded-2xl bg-sky-light p-3">
      <header className="flex items-center gap-3">
        <span aria-hidden className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-white text-2xl shadow-sm">
          {meta.icon}
        </span>
        <div className="min-w-0 flex-1">
          <h3 className="font-semibold text-navy">{meta.label}</h3>
          <p className="truncate text-sm text-slate-700">{r?.summary ?? describeArgs(action)}</p>
        </div>
        <StatusBadge status={action.status} />
      </header>

      {action.name === "check_claim" && r?.verdict && (
        <div className="mt-3 rounded-xl bg-white p-3">
          <p className="flex flex-wrap items-center gap-2">
            <span className={`rounded-full px-3 py-1 text-sm font-bold ${VERDICT_STYLE[r.verdict]}`}>{r.verdict}</span>
            {typeof r.confidence === "number" && (
              <span className="text-sm text-slate-700">{Math.round(r.confidence)}% sure</span>
            )}
          </p>
          {r.reason && <p className="mt-2 text-slate-900">{r.reason}</p>}
          {r.sources && r.sources.length > 0 && (
            <p className="mt-1 text-sm text-slate-600">Sources: {r.sources.join(", ")}</p>
          )}
        </div>
      )}

      {action.name === "create_guide" && r?.url && (
        <p className="mt-2">
          <a href={r.url} target="_blank" rel="noreferrer" className="font-medium text-navy underline underline-offset-4">
            Open picture guide: {r.title ?? r.url}
          </a>
        </p>
      )}

      {action.name === "send_email" && (r?.subject ?? args.subject) && (
        <p className="mt-2 text-sm text-slate-700">Subject: {r?.subject ?? args.subject}</p>
      )}

      {smsText && (
        <div className="mt-3">
          <SmsPreview to={r?.to ?? args.to} message={smsText} delivered={r ? r.delivered : undefined} />
        </div>
      )}

      {r?.error && <p className="mt-2 text-sm text-red-800">{r.error}</p>}
    </article>
  );
}

function StatusBadge({ status }: { status: ActionItem["status"] }) {
  if (status === "running") {
    return <span className="rounded-full bg-white px-2 py-1 text-xs font-medium text-navy">Working…</span>;
  }
  if (status === "failed") {
    return <span className="rounded-full bg-red-100 px-2 py-1 text-xs font-medium text-red-900">Failed</span>;
  }
  return (
    <span className="rounded-full bg-green-100 px-2 py-1 text-xs font-medium text-green-900">
      <span aria-hidden>✓ </span>Done
    </span>
  );
}

function describeArgs(a: ActionItem): string {
  const v = a.args as Record<string, unknown>;
  return String(v.claim ?? v.title ?? v.subject ?? v.message ?? v.name ?? "");
}
