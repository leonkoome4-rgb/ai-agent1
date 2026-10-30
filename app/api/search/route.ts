// Vapi tool: search_web(query) -> Tavily's short answer, trimmed for speech.
// Vapi format:   https://docs.vapi.ai/tools/custom-tools
// Tavily format: https://docs.tavily.com/documentation/api-reference/endpoint/search

import { connection } from "next/server";
import { isAuthorized, oneLine, readToolCalls } from "@/lib/vapi";

export const maxDuration = 10;

const TIMEOUT_MS = 5000;
const MAX_WORDS = 34; // "under 35 words"
const SORRY = "Samahani, sikupata habari hiyo sasa hivi.";

/** Warm-up: open this URL before the demo so the first real call is fast. */
export async function GET() {
  await connection(); // run on every request, never prerendered at build
  return new Response("ok");
}

export async function POST(req: Request) {
  if (!isAuthorized(req)) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json().catch(() => null);
  const calls = readToolCalls(body);

  const results = await Promise.all(
    calls.map(async (call) => {
      if (call.name !== "search_web") {
        return { toolCallId: call.id, error: `Unknown tool: ${call.name}` };
      }
      const query = String(call.args.query ?? "").trim();
      if (!query) return { toolCallId: call.id, result: SORRY };
      return { toolCallId: call.id, result: await searchWeb(query) };
    })
  );

  // Vapi ignores any status other than 200.
  return Response.json({ results });
}

async function searchWeb(query: string): Promise<string> {
  const key = process.env.TAVILY_API_KEY;
  if (!key) return SORRY;

  try {
    const res = await fetch("https://api.tavily.com/search", {
      method: "POST",
      headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        query: withKenya(query),
        search_depth: "ultra-fast",
        max_results: 2,
        include_answer: true,
      }),
      signal: AbortSignal.timeout(TIMEOUT_MS),
    });
    if (!res.ok) {
      console.error("search_web: Tavily", res.status, (await res.text()).slice(0, 300));
      return SORRY;
    }

    const data: { answer?: string } = await res.json();
    const answer = oneLine(data.answer ?? "");
    return answer ? trimWords(answer) : SORRY;
  } catch (e) {
    console.error("search_web:", e instanceof Error ? e.name : e);
    return SORRY;
  }
}

/** Keep under 35 words; end at the last full sentence that fits, if there is one. */
function trimWords(text: string): string {
  const words = text.split(" ");
  if (words.length <= MAX_WORDS) return text;
  const cut = words.slice(0, MAX_WORDS).join(" ");
  const lastStop = Math.max(cut.lastIndexOf(". "), cut.lastIndexOf("? "), cut.lastIndexOf("! "));
  return lastStop > 0 ? cut.slice(0, lastStop + 1) : `${cut}.`;
}

// Other countries (English and Kiswahili names). If none is named, we search about Kenya.
const OTHER_COUNTRIES =
  /\b(tanzania|uganda|rwanda|burundi|ethiopia|somalia|sudan|nigeria|ghana|south africa|afrika kusini|egypt|misri|congo|drc|zambia|malawi|mozambique|zimbabwe|usa|america|united states|marekani|uk|britain|england|uingereza|china|uchina|india|uhindi|japan|japani|germany|ujerumani|france|ufaransa|russia|urusi|ukraine|israel|iran|saudi|uae|dubai|qatar|canada|australia|brazil)\b/i;

/** Add "Kenya" unless the query already says Kenya or names another country. */
function withKenya(query: string): string {
  if (/\bkenya\b/i.test(query) || OTHER_COUNTRIES.test(query)) return query;
  return `${query} Kenya`;
}
