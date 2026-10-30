// Vapi tool: search_web(query) -> one short spoken answer from a Tavily web search.
// Vapi format:   https://docs.vapi.ai/tools/custom-tools
// Tavily format: https://docs.tavily.com/documentation/api-reference/endpoint/search

import { isAuthorized, oneLine, readToolCalls } from "@/lib/vapi";
import { cleanForSpeech, websiteName } from "@/lib/speech";

export const maxDuration = 15;

const TIMEOUT_MS = 8000;
const SORRY = "Samahani, sikupata habari hiyo sasa hivi.";

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
        search_depth: "basic",
        max_results: 3,
        include_answer: true,
      }),
      signal: AbortSignal.timeout(TIMEOUT_MS),
    });
    if (!res.ok) {
      console.error("search_web: Tavily", res.status, (await res.text()).slice(0, 300));
      return SORRY;
    }

    const data: { answer?: string; results?: { url?: string }[] } = await res.json();
    const answer = cleanForSpeech(data.answer ?? "");
    if (!answer) return SORRY;

    const source = websiteName(data.results?.[0]?.url);
    return oneLine(source ? `${answer} Kulingana na ${source}.` : answer);
  } catch (e) {
    console.error("search_web:", e instanceof Error ? e.name : e);
    return SORRY;
  }
}

// Other countries (English and Kiswahili names). If none is named, we search about Kenya.
const OTHER_COUNTRIES =
  /\b(tanzania|uganda|rwanda|burundi|ethiopia|somalia|sudan|nigeria|ghana|south africa|afrika kusini|egypt|misri|congo|drc|zambia|malawi|mozambique|zimbabwe|usa|america|united states|marekani|uk|britain|england|uingereza|china|uchina|india|uhindi|japan|japani|germany|ujerumani|france|ufaransa|russia|urusi|ukraine|israel|iran|saudi|uae|dubai|qatar|canada|australia|brazil)\b/i;

/** Add "Kenya" unless the query already says Kenya or names another country. */
function withKenya(query: string): string {
  if (/\bkenya\b/i.test(query) || OTHER_COUNTRIES.test(query)) return query;
  return `${query} Kenya`;
}
