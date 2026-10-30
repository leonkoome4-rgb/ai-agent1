// Helpers for Vapi server requests (custom function tools).
// Request:  { message: { type: "tool-calls", toolCallList: [{ id, function: { name, arguments } }] } }
// Response: HTTP 200 with { results: [{ toolCallId, result }] } — result must be a single-line string.
// Docs: https://docs.vapi.ai/tools/custom-tools

import { timingSafeEqual } from "node:crypto";

export interface ToolCall {
  id: string;
  name: string;
  args: Record<string, unknown>;
}

/** True if the x-vapi-secret header equals VAPI_SERVER_SECRET. */
export function isAuthorized(req: Request): boolean {
  const secret = process.env.VAPI_SERVER_SECRET;
  if (!secret) return false;
  const given = req.headers.get("x-vapi-secret") ?? "";
  const a = Buffer.from(given);
  const b = Buffer.from(secret);
  return a.length === b.length && timingSafeEqual(a, b);
}

/** Pull the tool calls out of a Vapi "tool-calls" message. */
export function readToolCalls(body: unknown): ToolCall[] {
  const message = (body as { message?: Record<string, unknown> })?.message;
  if (!message || message.type !== "tool-calls") return [];

  type Raw = { id?: string; function?: { name?: string; arguments?: unknown } };
  let list = (message.toolCallList as Raw[] | undefined) ?? [];
  if (list.length === 0) {
    const withList = (message.toolWithToolCallList as { toolCall?: Raw }[] | undefined) ?? [];
    list = withList.map((t) => t.toolCall ?? {});
  }

  return list
    .filter((c) => c.id && c.function?.name)
    .map((c) => ({ id: c.id!, name: c.function!.name!, args: parseArgs(c.function!.arguments) }));
}

function parseArgs(raw: unknown): Record<string, unknown> {
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

/** Vapi wants results as single-line strings. */
export function oneLine(text: string): string {
  return text.replace(/\s+/g, " ").trim();
}
