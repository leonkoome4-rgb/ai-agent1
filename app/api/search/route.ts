// Vapi tool: search_web(query) -> one short spoken answer, grounded with Google Search via Gemini.
// Gemini docs: https://ai.google.dev/gemini-api/docs/google-search

import { isAuthorized, oneLine, readToolCalls } from "@/lib/vapi";
import { cleanForSpeech, sourceName } from "@/lib/speech";

export const maxDuration = 15;

const MODEL = process.env.SEARCH_MODEL ?? "gemini-3.5-flash-lite";
const TIMEOUT_MS = 8000;
const SORRY = "Samahani, sikupata habari hiyo sasa hivi.";

const INSTRUCTIONS = `You answer questions for a phone voice assistant in Kenya.
Use Google Search. Assume a Kenyan context (prices in KES, Kenyan news, places, weather and services) unless the question clearly says otherwise.
Reply in the same language as the question (Kiswahili, English or Sheng).
Give ONE short answer: at most 2 sentences and under 28 words.
Plain spoken words only: no links, no lists, no markdown, no brackets, no symbols. Write "shilingi" or "KES" before amounts.
If the search does not give a clear answer, say you are not sure. Never make up numbers.`;

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
  const key = process.env.GEMINI_API_KEY;
  if (!key) return SORRY;

  try {
    const res = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${MODEL}:generateContent`,
      {
        method: "POST",
        headers: { "x-goog-api-key": key, "Content-Type": "application/json" },
        body: JSON.stringify({
          systemInstruction: { parts: [{ text: INSTRUCTIONS }] },
          contents: [{ role: "user", parts: [{ text: query }] }],
          tools: [{ google_search: {} }],
        }),
        signal: AbortSignal.timeout(TIMEOUT_MS),
      }
    );
    if (!res.ok) {
      console.error("search_web: Gemini", res.status, (await res.text()).slice(0, 300));
      return SORRY;
    }

    const data = await res.json();
    const candidate = data.candidates?.[0];
    const text: string = (candidate?.content?.parts ?? [])
      .map((p: { text?: string }) => p.text ?? "")
      .join(" ");
    const chunks: { web?: { title?: string; uri?: string } }[] = candidate?.groundingMetadata?.groundingChunks ?? [];

    const answer = cleanForSpeech(text);
    if (!answer) return SORRY;

    const source = chunks.map((c) => sourceName(c.web?.title)).find(Boolean);
    return oneLine(source ? `${answer} Kulingana na ${source}.` : answer);
  } catch (e) {
    console.error("search_web:", e instanceof Error ? e.name : e);
    return SORRY;
  }
}
