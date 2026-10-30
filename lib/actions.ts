// Shared shape for tool results. The /api/vapi route (M3) returns these as a
// JSON string, and the web client parses them to fill the Actions panel.

export type ToolName =
  | "send_sms"
  | "create_guide"
  | "send_email"
  | "check_claim"
  | "set_reminder"
  | "remember_caller";

export type Verdict = "TRUE" | "FALSE" | "UNPROVEN" | "SCAM";

export interface ToolResult {
  ok: boolean;
  /** Short human summary, e.g. "SMS sent to +2547…". */
  summary?: string;
  // send_sms / set_reminder
  to?: string;
  message?: string;
  delivered?: boolean;
  // create_guide
  title?: string;
  url?: string;
  // send_email
  subject?: string;
  // check_claim
  claim?: string;
  verdict?: Verdict;
  reason?: string;
  confidence?: number;
  sources?: string[];
  // set_reminder
  dueAt?: string;
  error?: string;
}

export interface ActionItem {
  id: string; // toolCallId
  name: string;
  args: Record<string, unknown>;
  status: "running" | "done" | "failed";
  result?: ToolResult;
  at: number;
}

export const TOOL_META: Record<string, { sw: string; en: string }> = {
  send_sms: { sw: "SMS", en: "SMS" },
  create_guide: { sw: "Mwongozo wa picha", en: "Picture guide" },
  send_email: { sw: "Barua pepe", en: "Email" },
  check_claim: { sw: "Kuangalia ukweli", en: "Rumour check" },
  set_reminder: { sw: "Kikumbusho", en: "Reminder" },
  search_web: { sw: "Kutafuta mtandaoni", en: "Web search" },
  remember_caller: { sw: "Kumkumbuka mpigaji", en: "Remembered caller" },
};

export function parseArgs(raw: unknown): Record<string, unknown> {
  if (raw && typeof raw === "object") return raw as Record<string, unknown>;
  if (typeof raw === "string") {
    try {
      const v = JSON.parse(raw);
      return v && typeof v === "object" ? v : {};
    } catch {
      return {};
    }
  }
  return {};
}

export function parseResult(raw: unknown): ToolResult {
  if (raw && typeof raw === "object") return raw as ToolResult;
  if (typeof raw === "string") {
    try {
      const v = JSON.parse(raw);
      if (v && typeof v === "object") return v as ToolResult;
    } catch {
      // Not JSON: show the plain text.
    }
    return { ok: true, summary: raw };
  }
  return { ok: false, error: "No result" };
}

interface RawToolCall {
  id?: string;
  function?: { name?: string; arguments?: unknown };
}

/**
 * Turn one Vapi client message into action updates.
 * Vapi does not always send "tool-calls" to the web client, so we read three
 * message types and merge by toolCallId:
 *  - "tool-calls"          -> new actions (running)
 *  - "tool-calls-result"   -> results
 *  - "conversation-update" -> full history with tool_calls + tool_call_result
 */
export function actionsFromMessage(msg: {
  type?: string;
  [k: string]: unknown;
}): Partial<ActionItem>[] {
  const out: Partial<ActionItem>[] = [];
  const now = Date.now();

  const pushCall = (tc: RawToolCall) => {
    if (!tc?.id || !tc.function?.name) return;
    out.push({
      id: tc.id,
      name: tc.function.name,
      args: parseArgs(tc.function.arguments),
      status: "running",
      at: now,
    });
  };

  if (msg.type === "tool-calls") {
    const list = (msg.toolCallList as RawToolCall[] | undefined) ?? [];
    list.forEach(pushCall);
  }

  if (msg.type === "tool-calls-result") {
    const r = msg.toolCallResult as
      | { toolCallId?: string; name?: string; result?: unknown }
      | undefined;
    if (r?.toolCallId) {
      const result = parseResult(r.result);
      out.push({
        id: r.toolCallId,
        name: r.name,
        result,
        status: result.ok === false ? "failed" : "done",
      });
    }
  }

  if (msg.type === "conversation-update") {
    const history = (msg.messages as Record<string, unknown>[] | undefined) ?? [];
    for (const m of history) {
      if (m.role === "tool_calls") {
        ((m.toolCalls as RawToolCall[] | undefined) ?? []).forEach(pushCall);
      }
      if (m.role === "tool_call_result" && typeof m.toolCallId === "string") {
        const result = parseResult(m.result);
        out.push({
          id: m.toolCallId,
          name: m.name as string | undefined,
          result,
          status: result.ok === false ? "failed" : "done",
        });
      }
    }
  }

  return out;
}

/** Merge updates into the list. Keeps order of first appearance. */
export function mergeActions(
  list: ActionItem[],
  updates: Partial<ActionItem>[]
): ActionItem[] {
  if (updates.length === 0) return list;
  const next = [...list];
  for (const u of updates) {
    if (!u.id) continue;
    const i = next.findIndex((a) => a.id === u.id);
    if (i === -1) {
      next.push({
        id: u.id,
        name: u.name ?? "tool",
        args: u.args ?? {},
        status: u.status ?? "running",
        result: u.result,
        at: u.at ?? Date.now(),
      });
    } else {
      const cur = next[i];
      // Never move a finished action back to "running".
      const status =
        cur.status !== "running" && u.status === "running" ? cur.status : u.status ?? cur.status;
      next[i] = {
        ...cur,
        name: u.name ?? cur.name,
        args: Object.keys(cur.args).length ? cur.args : u.args ?? cur.args,
        result: u.result ?? cur.result,
        status,
      };
    }
  }
  return next;
}
